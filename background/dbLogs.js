/**
 * Contains activitylog storage subsystem of Model.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var db = db || {};

/** Module Namespace */
db.logs = db.logs || {};

/**
 * Opens Database & Creates activitylogs table.
 */
db.logs.setupTable = function() {
    // Open Database + Create Table if needed
    try {
        db.setupDatabase_();
        db.DB_.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS logs (' +
                'time INT, ' +     // timestamp msec when event occurred.
                'action TEXT, ' + // Type of activity.
                'tabid INT, ' +   // ID of extension tab (cr-ext only)
                'url TEXT,' +     // Focused page URL (cr-ext only)
                'noteid INT, ' +  // Note log is related to, if any.
                'info TEXT, ' +   // JSON describing event.
                'modified INT)', []); // 0 if server has this log, else 1.
        });
    } catch (err) {
        debug(err);
    }
};

/**
 * Updates or inserts log in notes database.
 * @param {Object} log ActivityLog to insert.
 */
db.logs.insertLog = function(log) {
    debug('Inserting log!!', log);
    db.DB_.transaction(function(tx) {
        tx.executeSql(
            'INSERT OR REPLACE INTO logs ' +
            '(time, action, tabid, noteid, url, info, modified)' +
            'VALUES(?,?,?,?,?,?,?);',
            [log.time || Date.now(),
            log.action,
            log.tabid || -1,
            log.noteid || -10,
            log.url || '',
            log.info || '{}',
            1],
            function(tx, rs) {
                //debug('Success');
            }
            );
    });
};

/**
 * Pass list of all activity logs to continuation.
 * @param {function} continuation Called with list of activity logs.
 */
db.logs.getAllLogs = function(continuation) {
    db.DB_.transaction(function(tx) {
        tx.executeSql(
            'SELECT * FROM logs', [],
            function(tx, rs) {
                var logs = [];
                var numLogs = rs.rows.length;
                for (var i = 0; i < numLogs; i++) {
                    var log = rs.rows.item(i);
                    logs.push(log);
                }
                continuation(logs);
            });
    });
};

/**
 * Delete all logs from before the timestamp.
 * @param {number} when Integer timestamp.
 */
db.logs.deleteBefore = function(when) {
    db.DB_.transaction(function(tx) {
        tx.executeSql(
            'DELETE FROM logs WHERE time <= ' + when, [],
            function(tx, rs) {
                // Deletion was a success!
            });
    });
};
