/**
 * Main Controller for updating model from sidebar/option views' requests.
 *  Ideally background's controller has all controllers here, such that the
 *  sidebar's controller and both messengers can be removed for website.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

/** Module Namespace */
var controller = controller || {};


// Part of Changing Default Open-Sidebar Shortcut
/**
 * Set open-sidebar hotkey.
 * @param {string} hotkey The hotkey to save.
 */
controller.setOpenHotkey = function(hotkey) {
  if (typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined') {
    var oldHotkey = localStorage.getItem('openHotkeyNew');
    if (oldHotkey === null) {
      oldHotkey = '';
    }
    localStorage.setItem('openHotkeyOld', oldHotkey);
    localStorage.setItem('openHotkeyNew', hotkey);
    try {
      chrome.tabs.executeScript(null, {file: 'background/shortcut.js'});
    } catch (err) {
      debug(err);
    }
    model.publishNewOpenHotkey({
      newOpenHotkey: hotkey,
      oldOpenHotkey: oldHotkey
    });
  }
};

/**
 * Returns the last used hotkey for opening sidebar.
 * @return {string} The previously used hotkey.
 */
controller.getOldHotkey = function() {
  return localStorage.getItem('openHotkeyOld');
};
/**
 * Returns the current hotkey for opening sidebar.
 * @return {string} The current sidebar opening hotkey.
 */
controller.getNewHotkey = function() {
  return localStorage.getItem('openHotkeyNew');
};

/**
 * Returns true if app is a chrome extension.
 * @return {boolean} True = app is a chrome extension.
 */
controller.isChromeExt = function() {
  if (window.location.origin) {
    return window.location.origin.search('chrome-extension://') === 0;
  } else if (window.location.href) {
    return window.location.href.search('chrome-extension://') === 0;
  }
  return false;
};

/**
 * Returns true if script in background page of chrome extension.
 * @param {string} url The url to check.
 * @return {boolean} True if chrome ext's background page.
 */
controller.isBackgroundPage = function(url) {
  var isChromeExt = controller.isChromeExt();
  var isBGPage = url.search('background.html') !== -1;
  return isChromeExt && isBGPage;
};



/**
 * The last focused url that wasn't a chrome extension.
 * @private
 */
controller.lastFocusTab_ = '';
/**
 * Returns the last focused url that wasn't a chrome extension.
 * @return {string} The last non-chrome-extension focused tab url.
 */
controller.getFocusedURL = function() {
  if (controller.lastFocusTab_) {
    return controller.lastFocusTab_.url;
  }
  return '';
};

/**
 * Returns location IP, City, Country.
 * Used for easier local server testing.
 * Useful for storing where people take notes for location-based retrieval.
 * @return {object} locInfo Location info for 'IP', 'City', and 'Country'.
 */
controller.getLocInfo = function() {
  return server.getLocInfo();
};

/**
 * Set up controller.
 */
controller.setup = function() {
  // Setup Model.
  model.setupModel();

  // Sync 1 second after loading to not slow loading speed.
  setTimeout(function() {
    // Start syncing Notes every 10 minutes.
    server.sync();
    // Start syncing ChromeLogs every 30 minutes.
    server.syncLogs();
  }, 1 * 1000);

  if (controller.isChromeExt()) {
    controller.addContextMenu();
  }
  // These two onChange listeners record what tab/url currently has focus.
  if (controller.isChromeExt() && typeof chrome === 'object') {
    // Handles tab selection change within a window:
    chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
      chrome.tabs.getSelected(selectInfo.windowId, function(tabInfo) {
        if (tabInfo.url.search('chrome-extension://') === -1) {
        controller.lastFocusTab_ = tabInfo;
      }
      });
    });
    // Handles window selection change (causing new tab focus):
    chrome.windows.onFocusChanged.addListener(
        function(windowId) {
          if (windowId > 0) {
            chrome.tabs.getSelected(windowId, function(tabInfo) {
              if (tabInfo.url.search('chrome-extension://') === -1) {
              controller.lastFocusTab_ = tabInfo;
            }
            });
          }
        });
    // Handles tab selection changing state:
    chrome.tabs.onUpdated.addListener(
        function(tabId, changeInfo, tab) {
          controller.lastFocusTab_ = tab;
        });
  }
};

/**
 * Set up background extension page.
 */
controller.setupExtBG = function() {
  // Setup Messenger to sidebars and options pages.
  sidebar.msg.setupSubscribers();
  sidebar.mgr.setup();
  options.setupSubscribers();
  chrome.extension.onRequest.addListener(
      function(request, sender, sendResponse) {
        switch (request['action']) {
          case 'activate':
            debug('activate request heard');
            sidebar.mgr.toggle(sender.tab);
            break;
          case 'getOpenHotkeyData':
            sendResponse({
              oldHotkey: controller.getOldHotkey(),
              newHotkey: controller.getNewHotkey()
            });
            break;
        }
      });
};

/**
 * Perform initialization tasks.
 */
$(document).ready(function() {
  var isChromeExt = controller.isChromeExt();
  var isBGPage = controller.isBackgroundPage(window.location.href);
  debug('Chrome Ext:', isChromeExt, ', BG Page:', isBGPage);
  if (!isChromeExt || isBGPage) {
    controller.setup();
    var openHotkey = localStorage.getItem('openHotkeyNew');
    if (openHotkey === null) {
      openHotkey = 'Ctrl+Shift+F';
      localStorage.setItem('openHotkeyNew', openHotkey);
    }
    controller.setOpenHotkey(openHotkey);
  }
  if (isChromeExt && isBGPage) {
    controller.setupExtBG();
  }
});

/**
 * Restarts server sync method.
 */
controller.sync = function() {
  server.sync();
};

/**
 * Calls controller method with given arguments.
 * @param {string} methodName The name of the method to call.
 * @param {Object} args List of method's parameters.
 */
controller.callControllerMethod = function(methodName, args) {
  if (methodName in controller &&
      typeof(controller[methodName]) === 'function') {
        controller[methodName].apply(controller, args);
      }
};

/**
 * Adds chrome extension's context menu for note creation.
 */
controller.addContextMenu = function() {
  controller.cmenu = chrome.contextMenus.create({
    type: 'normal',
    title: 'Save to Listit',
    contexts: ['selection', 'link'],
    onclick: function(event) {
      console.log(event);
      var currTime = Date.now();
      var note = {
        //TODO(wstyke): Possible Conflicting JID :(
        jid: Math.floor(1000000 + Math.random() * 10000000),
        version: 0,
        created: currTime,
        edited: currTime,
        deleted: 0,
        contents: event.selectionText + '\n\nFrom: ' + event.pageUrl,
        meta: JSON.stringify({
          'url': event.pageUrl
        }),
        modified: 1
      };

      controller.addNote({
        'note': note,
        'source': 'contextMenuChrome',
        'focusOnAdd': false
      });
    }
  });
};

/**
 * Asks model to publish undeleted notes.
 */
controller.publishUndeletedNotes = function() {
  model.publishUndeletedNotes();
};

/**
 * Asks model to add note and publish update.
 * @param {object} event Contains info about note-add.
 */
controller.addNote = function(event) {
  model.addNote(event);
};

/**
 * Asks model to save note and publish update.
 * @param {Object} note The note to save.
 */
controller.saveNote = function(note) {
  model.saveNote(note);
};

/**
 * Get the ordering of the notes from model.
 * @return {Object} The note order info.
 */
controller.getNoteOrder = function() {
  return model.getNoteOrder();
};

/**
 * Save the ordering of the notes to the model.
 * @param {Object} note The magical note with ordering info.
 */
controller.saveNoteOrder = function(note) {
  model.saveNoteOrder(note);
};

/**
 * Asks model to delete note and publish update.
 * @param {Object} note The note to delete.
 */
controller.deleteNote = function(note) {
  model.deleteNote(note);
};

/**
 * Opens options page for both Chrome Ext. and website.
 */
controller.showOptionsPage = function() {
  if (controller.isChromeExt()) {
    chrome.tabs.create({
      url: 'index.html#options_page'
    });
  } else { // Show Options
    gid('page-main').style.display = 'none';
    gid('page-options').style.display = '';
  }
};


// User Login Info

/**
 * Validates user email/password through server.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 */
controller.validateUserLogin = function(email, password) {
  server.validateUserLogin(
      email, password,
      function(status, result) {
        debug(status, result);
        if (status === 200) { // Valid User info
          model.setValidUserInfo(
            email, password,
            result.study1 || result.study2);
          // Restart server syncing.
          server.sync();
        } else if (status === 401) { // Invalid User info.
          model.publishInvalidUserInfo(email, password);
        } else { // Unreachable Server.
          model.publishServerDisconnect();
        }
      }
      );
};

/**
 * Asks model to publish user login state.
 */
controller.publishLoginState = function() {
  model.publishLoginState();
};

/**
 * Asks model to log user out of system.
 */
controller.logoutUser = function() {
  model.logoutUser();
};

/**
 * Attempts to sign up user with given info.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * @param {boolean} opt_couhes True if user consents to study.
 */
controller.userSignup = function(email, password, opt_couhes) {
  server.createUser(email, password, opt_couhes, function(success) {
    debug('server.createUser() success: ', success);
    if (success) { // Registration Worked.
      debug('registration success');
      model.setValidUserInfo(email, password, opt_couhes);
      server.sync();
      controller.addIntroNotes();
      /*
         model.publisher.trigger(model.EventType.REGISTER_SUCCESS, {
         email: email,
         couhes: opt_couhes
         });*/
    } else { // Registration Failed.
      debug('registration failed');
      model.publisher.trigger(model.EventType.REGISTER_FAILURE, {
        email: email
      });
    }
  });
};
/**
 * Asks model to log user out of system.
 */
controller.logoutUser = function() {
  model.logoutUser();
};

/**
 * Attempts to sign up user with given info.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * @param {boolean} opt_couhes True if user consents to study.
 */
controller.userSignup = function(email, password, opt_couhes) {
  server.createUser(email, password, opt_couhes, function(success) {
    debug('server.createUser() success: ', success);
    if (success) { // Registration Worked.
      debug('registration success');
      model.setValidUserInfo(email, password, opt_couhes);
      server.sync();
      controller.addIntroNotes();
      /*
         model.publisher.trigger(model.EventType.REGISTER_SUCCESS, {
         email: email,
         couhes: opt_couhes
         });*/
    } else { // Registration Failed.
      debug('registration failed');
      model.publisher.trigger(model.EventType.REGISTER_FAILURE, {
        email: email
      });
    }
  });
};

/**
 * Asks model to publish last sync attempt's success.
 */
controller.publishSyncSuccess = function() {
  model.publishSyncSuccess();
};

/**
 * Asks model to publish last sync attempt's success.
 */
controller.publishSyncSuccess = function() {
  model.publishSyncSuccess();
};

/**
 * Add introductory notes for new users.
 */
controller.addIntroNotes = function() {
  var introNotes = [];
  var introTexts = [
    '!! Welcome to List-it!',
    '!! List-it makes it easy to jot things down.',
    '!! To create a note:\ntype into the box at the top\n ' +
      'and click save or hold shift and press enter.',
    '!! Add (!!) to the beginning of your note to ' +
      'PIN the note to the top of your list.',
    'The top note entry box searches your notes instantly as you type.',
    'Click the icon with a < surrounded by a circle to expand your notes.' +
      '  Click it again to show only the first line of every note.',
    'Your notes are saved to our backup server every ' +
      '10 minutes while you are logged in.',
    'Logging in lets you view your notes on the go:\n' +
      'Just visit http://welist.it/app.',
    'We also have a firefox add-on, you can get it here:\n' +
      'https://addons.mozilla.org/en-US/firefox/addon/listit/?src=search',
    'To delete a note, click the X on the right side of the note -->',
    'To open the page a note was created at, ' +
      'click the dot/pin icon on the left side of the note. ' +
      '(only for notes made in the Chrome extension/Firefox add-on)',
    'When you visit a page you\'ve made notes at, ' +
      'these notes will float to the top of your list.',
    'If you find yourself with lots of long notes,\n\n' +
      'you can click the icon to the right of the save button,\n\n' +
      'the one with a down arrow in a circle\n\n' +
      'to quickly scan only the first line\n\nof each of your notes.'
      ];
  var currTime = Date.now();
  for (var i = introTexts.length - 1; i >= 0; i -= 1) {
    var note = {
      'jid': i,
      'created': currTime,
      'edited': currTime,
      'deleted': 0,
      'contents': introTexts[i],
      'meta': JSON.stringify({}),
      'version': 0,
      'modified': 1
    };
    model.addNote({
      note: note,
      'source': 'tutorial',
      'focusOnAdd': false
    });
  }
  setTimeout(function() {
    // Save tutorial notes to server in 10 seconds.
    controller.sync();
  }, 10 * 1000);
};

// Experimental: Text-to-Speech !!!
/**
 * Speak some text right now.
 * @param {string} textToSpeakNow The text to speak.
 */
controller.speakNow = function(textToSpeakNow) {
  chrome.tts.speak(textToSpeakNow);
};
/**
 * Queue text to speak after current queued text is spoken.
 * @param {string} textToSpeakNext The text to speak next.
 */
controller.speakNext = function(textToSpeakNext) {
  chrome.tts.speak(textToSpeakNext, {enqueue: true});
};

/**
 * Halt Speaking
 */
controller.speakStop = function() {
  chrome.tts.stop();
};

/**
 * Save activity log to model.
 * @param {object} activityLog Log of event to record.
 *   - Has Fields: action TEXT, noteid INT, info OBJ->STR
 *   - Adds Fields: when INT, tabid INT.
 */
controller.logEvent = function(activityLog) {
  model.addActivityLog(activityLog);
};
