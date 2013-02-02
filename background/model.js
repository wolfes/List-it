/**
 * Model API: Stores notes, activity logs, and user info.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var model = model || {};

/**
 * Sets up all model components.
 */
model.setupModel = function() {
  //db.notes.setupTable();
  db.nstore.setup();
  //db.logs.setupTable();
};

var shuffle = function(v) {
  return v;
};

/**
 * Asks model to publish undeleted notes.
 */
model.publishUndeletedNotes = function() {
  db.nstore.getUndeletedNotes(function(notes) {
    // Undeleted notes passed back from db.
    debug('Publishing: model.UNDELETED_NOTES');
    model.publisher.trigger(model.EventType.UNDELETED_NOTES, notes);
  });
};

/**
 * Publish newOpenHotkey in data to sidebars.
 * @param {Object} data The hotkey data to publish.
 */
model.publishNewOpenHotkey = function(data) {
  model.publisher.trigger(model.EventType.NEW_OPEN_HOTKEY, data);
};

/**
 * Adds a note to the model & publishes NOTE_ADD event.
 * @param {Object} event Event with note object to add.
 * !FIXME! Is it supposed to trigger NOTE_ADD with event?
 */
model.addNote = function(event) {
  model.publisher.trigger(model.EventType.NOTE_ADD, event);
  db.nstore.upsertNote(event.note);
};

/**
 * Saves a note to the model & publishes NOTE_SAVE event.
 * @param {Object} note Note object to save.
 */
model.saveNote = function(note) {
  db.nstore.upsertNote(note);
  model.publisher.trigger(model.EventType.NOTE_SAVE, note);
};

/**
 * Returns the magical note with note order info from nstore.
 * @return {Object} The magical note with note order.
 */
model.getNoteOrder = function() {
  return db.nstore.getMagicNote();
};

/**
 * Saves new note order to the model & publishes NOTE_ORDER_CHANGE event.
 * @param {Object} magicNote Magic Note object to save.
 */
model.saveNoteOrder = function(magicNote) {
  debug('saving magicNote:', magicNote.jid);
  db.nstore.upsertNote(magicNote);
  model.publisher.trigger(model.EventType.NOTE_ORDER_CHANGE, magicNote);
};

/**
 * Deletes a note from the model & publishes NOTE_DELETE event.
 * @param {Object} note Note object to save.
 */
model.deleteNote = function(note) {
  db.nstore.upsertNote(note);
  model.publisher.trigger(model.EventType.NOTE_DELETE, note);
};

/**
 * Passes all notes to a continuation.
 * @param {function} processNotes Called with list of all notes.
 */
model.getAllNotes = function(processNotes) {
  db.nstore.getAllNotes(function(notes) {
    processNotes(notes);
  });
};

/**
 * Updates note ordering and publishes note-order change event.
 * @param {object} noteOrder The note with the new note-order.
 */
model.updateNoteOrder = function(noteOrder) {
  db.nstore.upsertNote(noteOrder);
  model.publisher.trigger(
    model.EventType.UPDATE_NOTE_ORDER, noteOrder);
};

/**
 * Inserts all notes in list.  Optionally publish additions.
 * @param {object} notes The notes to insert.
 * @param {boolean} opt_publishEvent True <=> publish changes.
 */
model.insertBatchNotes = function(notes, opt_publishEvent) {
  //notes.reverse();
  db.nstore.insertBatchNotes(notes);
  if (opt_publishEvent) {
    model.publisher.trigger(model.EventType.BATCH_INSERT_NOTES,
      notes);
  }
};

/**
 * Updates/Inserts all notes in list.  Optionally publish changes.
 * @param {object} notes The notes to update.
 * @param {boolean} opt_publishEvent True <=> publish changes.
 */
model.upsertBatchNotes = function(notes, opt_publishEvent) {
  db.nstore.upsertBatchNotes(notes);
  if (opt_publishEvent) {
    model.publisher.trigger(model.EventType.BATCH_UPDATED_NOTES,
      notes);
  }
};

/**
 * Adds activity log to model.
 * @param {Object} activityLog The Activity Log object to save.
 */
model.addActivityLog = function(activityLog) {
  //TODO(wstyke): Implement log saving code: db.lstore.addLog(log);
  try {
    db.lstore.insertLog(activityLog);
  } catch (err) {
    debug('Failed to save activity log:', err);
  }
};

/**
 * Return list of activitylogs.
 * @return {Object} A list of activity logs.
 */
model.getAllLogs = function() {
  var logs = db.lstore.getAllLogs();
  return logs;
};

/**
 * Deletes all logs before occuring before timestamp.
 * @param {number} when Integer timestamp.
 */
model.deleteLogsBefore = function(when) {
  db.lstore.deleteBefore(when);
};

// User Login Information

/**
 * Sets valid user login information + publishes event.
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 * @param {boolean} opt_couhes True if user is participating in study.
 */
model.setValidUserInfo = function(email, password, opt_couhes) {
  db.info.setUserLoginData(email, password);
  if (opt_couhes) {
    db.info.setUserCouhes(opt_couhes);
  }
  model.publisher.trigger(
    model.EventType.USER_VALIDATED, {
      email: email,
      password: password,
      couhes: opt_couhes
  });
};

/**
 * Publish invalid user info, such as after a failed login.
 * @param {string} email The user's email address.
 * @param {string} password The user's password.
 */
model.publishInvalidUserInfo = function(email, password) {
  model.publisher.trigger(
    model.EventType.USER_INVALID, {
      email: email,
      password: password
  });
};

/**
 * Publishes that server was not reachable.
 */
model.publishServerDisconnect = function() {
  model.publisher.trigger(
    model.EventType.SERVER_UNREACHABLE, {});
};

/**
 * Publishes whether a user is logged in or not.
 */
model.publishLoginState = function() {
  var loggedIn = db.info.isUserLoggedIn();
  var email = db.info.getUserEmail();
  model.publisher.trigger(
    model.EventType.USER_LOGIN_STATUS, {
      loggedIn: loggedIn,
      email: email
  });
};

/**
 * Returns user's email for server syncs.
 * @return {string} email User's email for server syncing.
 */
model.getUserEmail = function() {
  var email = db.info.getUserEmail();
  return email;
};


/**
 * Returns user's hashpass for server syncs.
 * @return {string} hashpass User's hashpass for server syncing.
 */
model.getUserHashPass = function() {
  var hashpass = db.info.getUserHashPass();
  return hashpass;
};

/**
 * Optionally stores, then publishes last sync attempt's success.
 * @param {boolean} opt_syncSuccess True if last sync was successful.
 */
model.publishSyncSuccess = function(opt_syncSuccess) {
  var syncSuccess = (opt_syncSuccess !== undefined ?
    opt_syncSuccess : db.info.getSyncSuccess());
  db.info.setSyncSuccess(syncSuccess);
  var email = db.info.getUserEmail();
  var msgType = (syncSuccess ?
    model.EventType.SYNC_SUCCESS :
    model.EventType.SYNC_FAILURE);
  model.publisher.trigger(msgType, {
    email: email
  });
};

/**
 * Returns success of last sync attempt.
 * Warning: A false reply could mean last sync happened while offline.
 * @return {boolean} loginState True if last sync was successful.
 */
model.getLoginState = function() {
  var loginState = db.info.getSyncSuccess();
  return loginState;
};


/**
 * Clears all user information & publishes LOGOUT event.
 */
model.logoutUser = function() {
  db.info.clearUserInfo();
  model.deleteAllNotes();
  model.publisher.trigger(model.EventType.LOGOUT, {});
};

/**
 * Drops and reinstantiates notes table, deleting all notes.
 */
model.deleteAllNotes = function() {
  db.nstore.deleteAllNotes();
};
