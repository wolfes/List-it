/**
 * @filedesc Provides connection to List-it server for note backup/sync.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var server = server || {};
var ajax = ajax || {};

/**
 * Whether to use local server.
 */
ajax.DEBUG_MODE = false; //true; //false;

/**
 * Holds timeout for starting next sync event.
 */
server.syncTimer_ = null;
server.syncLogTimer_ = null;

/**
 * Default time between sync events.
 */
server.syncTime_ = 10 * 60 * 1000; // 10 min
server.syncLogTime_ = 30 * 60 * 1000; // 30 min

/**
 * Begin periodic syncs with server.
 */
server.sync = function() {
  // Reset sync timeout.
  clearTimeout(server.syncTimer_);
  server.syncTimer_ = setTimeout(function() {
    server.sync();
  }, server.syncTime_);

  // Perform the Sync.
  try {
    server.performSync();
  } catch (e) {
    debug('Completely failed sync:', e);
  }
};

/**
 * Begin periodic ChromeLog syncs with server.
 */
server.syncLogs = function() {
  // Reset sync timeout.
  clearTimeout(server.syncLogTimer_);
  server.syncLogTimer_ = setTimeout(function() {
    server.syncLogs();
  }, server.syncLogTime_);

  // Perform the Sync.
  try {
    server.pushLogs();
  } catch (e) {
    debug(e);
  }
};


/**
 * Checks if user email + password is valid.
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 * @param {function} continuation Takes params: success, result.
 */
server.validateUserLogin = function(email, password, continuation) {
  var hashPass = util.makeHashpass(email, password);
  var url = 'login?HTTP_AUTHORIZATION=' + hashPass;
  debug('logging in:', hashPass);
  ajax.getAjax(url, continuation);
};


/**
 * Performs sync with server by first POST'ing all
 * client note/log knowledge and then updating from
 * the server's response.
 */
server.performSync = function() {
  debug('performSync()');
  model.getAllNotes(function(allNotes) {
    // Create dictionary of jid -> note.
    var allNoteDict = {};
    var numNotes = allNotes.length;
    for (var i = 0; i < numNotes; i++) {
      allNoteDict[allNotes[i].jid] = allNotes[i];
    }
    var notesPayload = server.bundleNoteData_(allNotes);
    //debug('payload notes:', notesPayload);
    ajax.post_json_get_updates(notesPayload, function(success, result) {
      //debug('server.js - Sync Success: ' + success);
      //debug('results:', result);
      if (!success) {
        debug('server.js - Sync failed.');
        model.publishSyncSuccess(false);
        return;
      } 


      // Update magic note w/ order:
      try {
        db.nstore.getMagicNote(function(oldMagicNote) {
          if (result.magicNote) {
            var newMagicNote = result.magicNote;
            var newContents = JSON.parse(newMagicNote.contents);
            var newData = {'noteorder': newContents.noteorder};
          }
          if (!oldMagicNote && result.magicNote) {
            // Save new magic note:
            controller.saveNoteOrder({
              'jid': -1,
            'version': newMagicNote.version,
            'created': newMagicNote.created,
            'edited': newMagicNote.edited,
            'deleted': getDeletedVal(newMagicNote.deleted),
            'contents': JSON.stringify(newData),
            'meta': '{}',
            'modified': 0
            });
            return;
          }
          if (newMagicNote.version <= oldMagicNote.version) {
            return; // Magic note not updated.
          }

          // Magic note was updated:
          var oldContents = JSON.parse(oldMagicNote.contents);
          var oldData = {'noteorder': oldContents.noteorder};

          // Make a dict of all the new jids in ordering:
          var newNoteJids = {};
          for (var i = 0; i < newData.noteorder.length; i++) {
            var jid = newData.noteorder[i];
            if (!(jid in newNoteJids)) {
              newNoteJids[jid] = true;
            }
          }

          var modified = 0;
          // For each jid in old ordering not in new ordering: add to new!
          for (var i = 0; i < oldData.noteorder.length; i++) {
            var jid = oldData.noteorder[i];
            if (!(jid in newNoteJids)) {
              // old jid isn't in newData, modify!
              modified = 1;
              if (i < oldData.numPinned) {
                // old note was pinned, add to front of pinned list:
                newData.noteorder.splice(0, 0, jid);
                newData.numPinned += 1;
              } else if (i > (oldData.noteorder.length - numArchived)) {
                // old note was archived, add to front of archive list:
                newData.noteorder.splice(newData.noteorder.length - newData.numArchived, 0, jid);
                newData.numArchived += 1;
              } else {
                // old note was in middle, add to front of middle section:
                newData.noteorder.splice(newData.numPinned, 0, jid);
              }
            }
          }

          // Save new note order data!
          controller.saveNoteOrder({
            'jid': -1,
          'version': newMagicNote.version,
          'created': newMagicNote.created,
          'edited': newMagicNote.edited,
          'deleted': getDeletedVal(newMagicNote.deleted),
          'contents': JSON.stringify(newData),
          'meta': '{}',
          'modified': modified
          });

        }); //End processing magic note.

      } catch (err) {
        debug('Error processing magic note:', err);
      }
      debug('continuing sync...');

      /**
        contents: '{'noteorder':[354486,689087,887008,761910,...,584002,197510]}'
        created: 1289069025605
        deleted: 1
        edited: 1306504582731
        id: 74455
        jid: -1
        version: 137
        */

      // Successful Ajax Response:
      model.publishSyncSuccess(true);

      // Compile all 'altered' & 'new' notes:
      var newNotes = [];
      var alteredNotes = [];

      var changedNotes = [];
      changedNotes.push.apply(changedNotes, result.committed);
      changedNotes.push.apply(changedNotes, result.update);

      // Process successfully committed & conflict-updated notes:
      var numChanged = changedNotes.length;
      for (var i = 0; i < numChanged; i++) {
        var serverNote = changedNotes[i];
        if (serverNote.jid === -1) {
          continue;
        }
        var clientNote = allNoteDict[serverNote.jid];
        alteredNotes.push(server.mergeNote_(clientNote, serverNote));
      }
      // Process notes UPDATED outside extension:
      if (result.updateFinal) {
        var externalUpdates = result.updateFinal;
        var numNotes = externalUpdates.length;
        for (var i = 0; i < numNotes; i++) {
          var serverNote = externalUpdates[i];
          if (serverNote.jid === -1) {
            continue;
          }
          //TODO(wstyke): Remove this TEMP fix to preserve META field:
          var clientNote = allNoteDict[serverNote['jid']];
          alteredNotes.push(server.mergeNote_(clientNote, serverNote));
        }
      }

      // Process notes ADDED outside extension:
      if (result.unknownNotes) {
        var unknownNotes = result.unknownNotes;
        var numNotes = unknownNotes.length;
        for (var i = 0; i < numNotes; i++) {
          var serverNote = unknownNotes[i];
          if (serverNote.jid === -1) {
            continue;
          }
          newNotes.push(server.mergeNote_({}, serverNote));
        }
      }

      // Update model & publish changes, if any occurred.
      if (newNotes.length !== 0) {
        debug(newNotes.length, ' new notes!');
        newNotes.reverse();
        model.insertBatchNotes(newNotes, true);
      }
      if (alteredNotes.length !== 0) {
        debug(alteredNotes.length, ' altered notes!');
        model.upsertBatchNotes(alteredNotes, true);
      }

  });
});
};

/**
 * Merge client note with updated server version.
 * @param {object} clientNote The client's copy of the note.
 * @param {object} serverNote The server's copy of the note.
 * @return {object} The most up-to-date copy of the note.
 * @private
 */
server.mergeNote_ = function(clientNote, serverNote) {
  var note = {modified: 0};
  //WARNING: Any fields not included here are wiped clean!
  var fields = ['jid', 'version', 'created',
      'edited', 'deleted', 'contents', 'meta'];
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (serverNote.hasOwnProperty(field)) {
      note[field] = serverNote[field];
    } else if (clientNote.hasOwnProperty(field)) {
      note[field] = clientNote[field];
    }
  }
  return note;
}

/**
 * Given all notes, bundles note data for server reception.
 * @param {object} allNotes List of notes.
 * @return {object} payload JSON bundled mod/unmod notes to send to server.
 */
server.bundleNoteData_ = function(allNotes) {
  var modifiedNotes = [];
  var unmodifiedNotes = {};
  var numNotes = allNotes.length;
  for (var i = 0; i < numNotes; i++) {
    var note = allNotes[i];
    if (note.jid < 0) {
      continue; // Skip magical notes. TODO: remove in future?
    } else if (note.modified === 1) { // Modified List.

      //delete note['meta'];

      modifiedNotes.push(note);
    } else { // Unmodified Dict.
      unmodifiedNotes[note.jid] = note.version;
    }
  }
  var payload = {modifiedNotes: modifiedNotes,
    unmodifiedNotes: unmodifiedNotes};
  payload = JSON.stringify(payload);
  return payload;
};


/**
 * Attempts to register user.  Passes success/fail to continuation.
 * @param {string} email The user's email.
 * @param {string} password The user's password.
 * @param {boolean} couhes True if user accepts study.
 * @param {function} continuation Called w/ boolean success of registration.
 */
server.createUser = function(email, password, couhes, continuation) {
  // Pulled from zen/tags site
  var firstname = '';
  var lastname = '';
  $.ajax({type: 'POST',
    url: ajax.baseURL_ + 'createuser/',
    data: ({username: email, password: password, couhes: couhes, 
      firstname: firstname, lastname: lastname}),
    success: function(data,success) {
      // Account Created!
      continuation(true);
    },
    cache: false,
    error: function(data,status) {
      // Account already exists.
      continuation(false);
    }
  });
};

/**
 * Get location information (IP, Country?, State?, City?)
 * @return {object} locInfo Hash of location information.
 */
server.getLocInfo = function() {
  if (window.XMLHttpRequest) { 
    xmlhttp = new XMLHttpRequest(); 
  } else {
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
  }
  xmlhttp.open('GET','http://api.hostip.info/get_html.php',false);
  try { //TODO(wstyke): Fix debugging hack to be compatible with offline mode.
    xmlhttp.send();
  } catch (e) {
    return '';
  }
  var locArr = xmlhttp.responseText.split('\n');
  var locInfo = {};
  for (var i = 0; i < locArr.length; i++) {
    var pair = locArr[i].split(':');
    if (pair.length === 2) {
      locInfo[pair[0]] = pair[1].trim();
    }
  }
  return locInfo;
};


/**
 * Push all logs to server, delete committed logs.
 */
server.pushLogs = function() {
  var logs = model.getAllLogs();
  var hashPass = model.getUserHashPass(); 
  var url = 'post_json_chrome_logs/?HTTP_AUTHORIZATION=' + hashPass;
  ajax.postAjax(url, JSON.stringify(logs), function(success, result) {
    if (!success) {
      debug("FAIL: Logs not sent to server.");
      return;
    }
    model.deleteLogsBefore(result.lastTimeRecorded);
  });
};


// Basic Ajax Requests:

/**
 * Base url for all ajax requests.
 */
ajax.baseURL_ = 'http://welist.it/listit/jv3/';

$(document).ready(function() {
  if (typeof window.location.host === 'string' &&
    window.location.host.search(':8000') !== -1) {
      // Use given IP in baseURL if sidebar in browser with port 8000.
      //ajax.baseURL_ = 'http://' + server.getLocInfo().IP + ':8000/listit/jv3/';
      ajax.baseURL_ = 'http://' + window.location.host + '/listit/jv3/';
    }
  if (ajax.DEBUG_MODE && controller.isChromeExt()) { 
    ajax.baseURL_ = 'http://' + server.getLocInfo().IP + ':8000/listit/jv3/';
  }
  debug('Base url:', ajax.baseURL_);
});

/**
 * Basic Ajax GET url request, passes response to continuation.
 * @param {string} urlMethod The url for the GET request.
 * @param {function} continuation Called with status & json parsed response.
 */
ajax.getAjax = function(urlMethod, continuation) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', ajax.baseURL_ + urlMethod, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var response;
      if (xhr.status === 200) {
        response = JSON.parse(xhr.responseText);
      } 
      continuation(xhr.status, response);
    }
  }
  xhr.send();
};



/**
 * Basic Ajax POST to url with payload and continuation.
 * @param {string} urlMethod The url to append to ajax.baseURL_.
 * @param {string} payload JSON string of content to send.
 * @param {function} continuation Given success and response params.
 */
ajax.postAjax = function(urlMethod, payload, continuation) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', ajax.baseURL_ + urlMethod, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var resp = JSON.parse(xhr.responseText);
        continuation(true, resp);
      } else {
        debug('postAjax failed:', urlMethod);
        continuation(false, '');
      }
    }
  };
  xhr.send(payload);
};

/**
 * Post JSON payload, continuation called with success and response.
 * @param {string} payload JSON payload string to send.
 * @param {function} continuation Called with success + response params.
 */
ajax.post_json_get_updates = function(payload, continuation) {
  var hashPass = model.getUserHashPass(); 
  var url = 'post_json_get_updates/?HTTP_AUTHORIZATION=' + hashPass;
  ajax.postAjax(url, payload, continuation);
};

/**
 * Passes notes from server to continuation.
 * @param {function} continuation Called with notes.
 */
ajax.getNotes = function(continuation) {
  var hashPass = model.getUserHashPass(); 
  var url = 'get_json_notes?HTTP_AUTHORIZATION=' + hashPass;
  ajax.getAjax(url, continuation);
};

/**
 * Post JSON notes to server, calls continuation.
 * @param {string} jsonNotes The notes to send.
 * @param {function} continuation Called with results.
 */
ajax.postNotes = function(jsonNotes, continuation) {
  var hashPass = model.getUserHashPass(); 
  var url = 'post_json_notes/?HTTP_AUTHORIZATION=' + hashPass;
  ajax.postAjax(url, jsonNotes, continuation);
};

