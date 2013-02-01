/**
 * @filedesc Controller sets up main models/views.
 * 
 * @author: wstyke@gmail.com - Wolfe Styke
 */
//TODO(wstyke): 'save' new-note text ~3 sec after keypress ends.

/**
 * New Note, Search View, statusMsg.
 */
var L = L || {};
L.set = L.set || {};
L.view = L.view || {};
L.views = L.views || {};
L.base = L.base || {};

var vent = _.extend({}, Backbone.Events);

L.isFF = function() {
  return navigator.userAgent.search('Firefox') !== -1;
};
L.base.oneLineHeight = L.isFF() ? '1.3em' : '1.3em';

function bgColor(h, s, l) {
  $('#entries-container').css('background-color', 'hsl('+h+','+s+'%,'+l+'%)')
}
function pinColor(h, s, l) {
  $('#entries-pin > div').css('background-color', 'hsl('+h+','+s+'%,'+l+'%)')
}
function normColor(h, s, l) {
  $('#entries > div').css('background-color', 'hsl('+h+','+s+'%,'+l+'%)')
}

/**
 * Resize note widths.  NewNote box minus 30px is always right.
 */
L.fixPageResize = _.debounce(function() {
  // Fix entries-container height to not take 100%;
  var listHeight = window.innerHeight - $('#controls-container').height();
  $('#entries-container').height(listHeight)

  // For firefox: fix note text width
  if (L.isFF()) { // Perform some magic!
    var noteContentWidth = $('#new-note').width() - 30 + 'px';
    $('.noteContents').css('width', noteContentWidth);
  }
}, 100);

/**
 * Set up views.
 */
L.views.setup = function() {
  L.fixPageResize();
  window.onresize = L.fixPageResize;

  //TODO(wstyke:01-04-2013) Was moved from index.html
  //  (running before any scripts)...
  isChromeExt = function() {
    if (window.location.hasOwnProperty('origin')) {
      return window.location.origin.search('chrome-extension://') === 0;
    } else if (window.location.hasOwnProperty('href')) {
      return window.location.href.search('chrome-extension://') === 0;
    }
    return false;
  };

  // Handles tab selection change within a window:
  if (controller.isChromeExt() && typeof chrome === 'object') {
    // Handles tab selection change within a window:
    chrome.tabs.onSelectionChanged.addListener(
      function(tabId, selectInfo) {
	chrome.tabs.getSelected(selectInfo.windowId, function(tabInfo) {
	  if (tabInfo.url.search('chrome-extension://') === -1) {
	    controller.lastFocusTab_ = tabInfo;
	    vent.trigger('sys:tabFocused', tabInfo);
	    debug('sys:tabFocused selChange', tabInfo);
	  }
	});
      }
    );

    // Handles window selection change (causing new tab focus):
    chrome.windows.onFocusChanged.addListener(
      function(windowId) {
	if (windowId > 0) {
	  chrome.tabs.getSelected(windowId, function(tabInfo) {
	    if (typeof tabInfo !== 'undefined') {
	      if (tabInfo.url.search('chrome-extension://') === -1) {
		controller.lastFocusTab_ = tabInfo;
		vent.trigger('sys:tabFocused', tabInfo);
		debug('sys:tabFocused focusChange', tabInfo);
	      }
	    }
	  });
	}
      });
  }

  L.saveActivityLog({
    action: db.logs.LogType.SIDEBAR_OPEN,
    info: {}
  });
  $(window).unload(function() {
    L.saveActivityLog({
      action: db.logs.LogType.SIDEBAR_CLOSE,
      info: {}
    });  
  });

  // Detect whether page was opened as:
  // OPTIONS or LIST view.
  if (location.href.search('options_page') !== -1) {
    L.views.showOptions();
  }

  // Options Panel: Pin Icon
  $('#pin-option').live('click', function() {
    var currDisp = $('#entries-pin').css('display');
    $('#entries-pin').css(
      'display', 
      currDisp === 'none' ? '-webkit-box' : 'none')
  });
  
  /**
   * Adding each entries list.
   */
  L.set.noteset = new L.make.NoteCol();
  L.view.pinNotes = new L.make.NotesPinView({ collection: L.set.noteset });
  $('#entries-container').append(L.view.pinNotes.render('entries-pin'));
  L.view.normNotes = new L.make.NotesNormView({ collection: L.set.noteset });
  $('#entries-container').append(L.view.normNotes.render('entries'));
  
  // Make Notes Sortable w/ jQuery UI Sortable:
  $( "#entries, #entries-pin" ).sortable({
    connectWith: ".notelist", // Drag/drop within .notelist divs!
    handle: ".left", // Drag notes by their left div.
    placeholder: "ui-state-highlight", // Creates empty droppable space.
    cursorAt: { top: 10, left: 10 }, // Consistently upper-left on every drag.
    distance: 10, // Prevents clicks from activating drag.
    opacity: 0.3, // You know what you're dragging, easier to see behind it.
    tolerance: 'intersect', // 'pointer' doesn't work for 2+ line notes.
    scrollSensitivity: 40, // Distance from top/bottom before scroll starts.
    revert: true, // SO PRETTY.
    update: function(event, ui) {
      clearTimeout(L.openLinkTimer);

      var jid = ui.item[0].id;
      var changedLists = (ui.sender === null); // true if Note changed lists.

      L.views.saveNoteOrder();

      /* TODO: Save Note Re-order ActivityLog
	 1) Note moved up/down in pin/reg, or
	 2) Note switched lists

      L.saveActivityLog({
	action: db.logs.LogType.,
	info: {}
      });*/   
    }
  });


  // Set up account portal:
  accountmodel = new L.make.AccountModel();
  accountview = new L.make.AccountView({
    model: accountmodel
  });
  $('#options-login').append(accountview.render());
  
  setTimeout(function() {
    controller.publishLoginState();
  }, 100);

  // Shortcuts
  shortcut.add(localStorage.getItem('openHotkeyNew'), function(e) {
    window.close();
  });
  
  model.publisher.on(
    model.EventType.NEW_OPEN_HOTKEY,
    function(payload) {
      shortcut.remove(payload.oldOpenHotkey)
      shortcut.add(payload.newOpenHotkey, function(e) {
	window.close();
      });
    }
  );
    


  // Model Listeners
  model.publisher.on(
    model.EventType.SYNC_SUCCESS,
    function(payload) {
      // Show user sync success message through sync button.
      vent.trigger('showMsg', {
	msg: "Notes saved successfully.",
	duration: 2 * 1000});
    }
  );
  model.publisher.on(
    model.EventType.SYNC_FAILURE,
    function(payload) {
      // Show user sync failure message.
      vent.trigger('showMsg', {
	msg: "Failed to backup your notes, please log in (gears icon).",
	duration: 3 * 1000});
    }
  );

  // Make Notes Sortable
  //L.views.addSortable();

  $(document).live('keyup', function(e) {
    if  (e.altKey && e.keyCode === 37) {
      //controller.logEvent({});        
      // ALT & Left-Arrow: Show Random next note:
      var notes = gid('entries').childNodes;
      var note = notes[Math.round(Math.random() * notes.length)];
      note.scrollIntoView();
      gid('entries-container').scrollTop -= 2;
    }
  });

  vent.on('user:openSettingsPage', function() {
    if (controller.isChromeExt()) {
      controller.showOptionsPage();
    } else {
      L.views.showOptions();
    }
  });
  vent.on('user:viewTopNote', function(data) {
    L.views.scrollToTop();
  });
  
  // Set up view's subscriptions to model's publications:
  model.publisher.on(model.EventType.LOGOUT, function(msg) {
    L.views.logoutClear();
  }, this);

  // Ask for publishing of undeleted notes.
  if (!controller.isChromeExt()) {
    controller.publishUndeletedNotes();
  }
};
$(document).ready(L.views.setup);


/**
 * Saves activitylog.
 * @param {Object} activityLog The activity log to save.
 */
L.saveActivityLog = function(activityLog) {
  try {
    if (chrome && chrome.tabs) {
      chrome.tabs.getCurrent(function(tabInfo) {
	activityLog.tabid = tabInfo.id;
	L.saveActivityLog_(activityLog);
      });
    }
  } catch (err) {
    L.saveActivityLog_(activityLog);
  }
};
/**
 * Adds current time and last focused url to activity log before saving.
 * @param {object} activityLog 
 */
L.saveActivityLog_ = function(activityLog) {
  activityLog.time = Date.now();
  activityLog.url = controller.getFocusedURL();

  debug("L.saveActivityLog(", JSON.stringify(activityLog));
  activityLog.info = JSON.stringify(activityLog.info);
  controller.logEvent(activityLog);
};

/**
 * Show List-it Note View
 */
L.views.showListit = function() {
  if (L.isFirefoxAddon) {
    // reload page for firefox add-on.
    window.location = window.location;
  } else {
    gid('page-main').style.display = '';
    gid('page-options').style.display = 'none';
  }
};

/**
 * Show List-it Options View.
 */
L.views.showOptions = function() {
  gid('page-main').style.display = 'none';
  gid('page-options').style.display = '';
};

/**
 * Scroll note list view to show note at top.
 */
L.views.scrollToTop = function() {
  var pinnedEntries = $('#entries-pin');
  var visiblePinnedNotes = (pinnedEntries.children().length > 0 && 
			    pinnedEntries.css('display') !== 'none');
  var nonEmptyNotes = gid('entries').childNodes.length > 0;

  if (visiblePinnedNotes) {
    pinnedEntries.children()[0].scrollIntoView()
  } else if (nonEmptyNotes) {
    $('#entries').children()[0].scrollIntoView();
  }
};

/**
 * Clear note info due to user logout.
 */
L.views.logoutClear = function() {
  //L.views.noteMap = {};
  gid('entries').innerHTML = '';
  gid('entries-pin').innerHTML = '';
}

/**
 * Whether notes are full height or 1 line.
 */
L.views.fullSize = true;

/**
 * Make notes in list sortable/dragable.
 */
L.views.addSortable = function() {
  $('#entries').sortable({
    //placeholder: 'ui-state-highlight',
    handle: '.left',
    scroll: true,
    scrollSensitivity: 100,
    scrollSpeed: 10,
    tolerance: 'pointer',
    stop: function(event, ui) { 
      L.views.saveNoteOrder();
    },
    axis: 'y',
    containment: 'document' // Dragged item can't leave this.
  });
};




/**
 * Gets list of note jids in order.
 * @return {Object} noteOrder Object with pin, reg, & total note order.
 */
L.views.getNoteOrder = function() {
  var pinOrder = _.map($('.note', '#entries-pin'), 
		       function (n) { return parseInt(n.id, 10) });
  var regOrder = _.map($('.note', '#entries'), 
		       function (n) { return parseInt(n.id, 10) });
  var noteorder = pinOrder.concat(regOrder);

  var noteOrder = {
    pinorder: pinOrder,
    regorder: regOrder,
    noteorder: noteorder
  };
  return noteOrder;
};

/**
 * Renders notes in given display ordering.
 * @param {Object} noteOrder Keys: pinOrder, regOrder, and noteOrder.
 */
L.views.setNoteOrder = function(noteOrder) {
  // Replace all normal notes.
  var pinEntries = $('#entries-pin');
  var pinOrder = noteOrder.pinorder;
  for (var i = 0; i < pinorder.length; i++) {
    var note = $('#' + pinorder[i]).remove(); // Returns dom note.
    pinEntries.append(note);
  }

  // Replace all regular notes.
  var regEntries = $('#entries');
  var regOrder = noteorder.regOrder;
  for (var i = 0; i < regorder.length; i++) {
    var note = $('#'+ regorder[i] ).remove(); // Returns dom note.
    regEntries.append(note);
  }
};

/**
 * Called when notes have been reordered.
 */
L.views.saveNoteOrder = function() {
  var newOrder = L.views.getNoteOrder();

  var oldNoteOrder = controller.getNoteOrder();
  if (typeof oldNoteOrder === 'undefined') {
    var timeNow = Date.now();
    oldNoteOrder = {
      contents: JSON.stringify({}),
      created: timeNow,
      edited: timeNow,
      deleted: 1,
      jid: -1,
      version: 0
    }
  }
  
  // Contents are JSON string:
  oldNoteOrder.contents = JSON.parse(oldNoteOrder.contents);

  // Set new order info
  oldNoteOrder.contents = JSON.stringify(_.extend(
    oldNoteOrder.contents, newOrder
  ));

  // Save new ordering.
  controller.saveNoteOrder(oldNoteOrder);
};
