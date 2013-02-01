/**
 * Contains activitylog storage subsystem of Model.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var db = db || {};

/** Module Namespace */
db.lstore = db.lstore || {};

/**
 * Opens Database & Creates activitylogs table.
 */
db.lstore.setupTable = function() {};

/**
 * Updates or inserts log in notes database.
 * @param {Object} log ActivityLog to insert.
 */
db.lstore.insertLog = function(log) {
  var logs = db.lstore.getAllLogs();
  logs.push(log);
  db.lstore.saveLogs(logs);
};

/**
 * Save JSON string of logs in localStorage.
 * @param {object} logs The array of logs to store.
 */
db.lstore.saveLogs = function(logs) {
  localStorage.setItem('logs', JSON.stringify(logs));
};

/**
 * Pass all logs to continuation.
 * @return {Object} A list of all logs.
 */
db.lstore.getAllLogs = function() {
  return JSON.parse(localStorage.getItem('logs')) || [];
};


/**
 * Delete all logs from before the timestamp.
 * @param {number} when Integer timestamp.
 */
db.lstore.deleteBefore = function(when) {
  if (when === null || when === undefined) {
    return;
  }

  var allLogs = db.lstore.getAllLogs();
  var newLogs = _.filter(allLogs, function(log) {
    return log.time > when;
  });
  db.lstore.saveLogs(newLogs);
};
