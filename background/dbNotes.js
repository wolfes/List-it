/**
 * @filedesc Contains note storage subsystem of Model.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var db = db || {};
db.notes = db.notes || {};


/**
 * The List-it HTML5 Database.
 * @private 
 */
db.DB_ = null;

/**
 * Open List-it HTML5 Database if not open already.
 * @private
 */
db.setupDatabase_ = function() {
  if (!db.DB_) {
    db.DB_ = openDatabase('listit','1.5','List-it Database', 5000000); // Lookup this # ?
  }
};

/**
 * Opens Database & Creates notes table.
 */
db.notes.setupTable = function() {
  // Open Database + Create Table if needed
  db.setupDatabase_();
  db.DB_.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS notes (' +
		  'jid INT PRIMARY KEY, '+ // unique
		  'version INT, ' + // # times edited
		  'created INT, ' + // timestamp of note creation time
		  'edited INT, ' + // timestamp when last-edited 
		  'deleted INT, ' + // 0 = not-deleted, 1 = deleted
		  'contents TEXT, ' + // The note's text.
		  'meta TEXT, ' + // JSON Metadata for note.
		  'modified INT)', []); // whether server knows of any changes to this note.
  });

};

//TODO(wstyke): Debug extra meta field!

/**
 * Updates or inserts note in notes database.
 * @param {Object} note Note to update.
 */
db.notes.upsertNote = function(note) {
  db.DB_.transaction(function(tx) {
    tx.executeSql('INSERT OR REPLACE INTO notes '+
		  '(jid, version, created, edited, deleted, contents, meta, modified) '+
		  'VALUES(?,?,?,?,?,?,?,?);',
		  [note.jid, note.version, 
		   note.created, note.edited, note.deleted, 
		   note.contents, note.meta, note.modified],
		  function(tx, rs) {
		    //debug('Note id = ', note.jid, ' upsert-ed in db.notes!');
		  }
		 );
  });
};

/**
 * Performs batched upsert on list of notes.
 * @param {object} notes The notes to upsert.
 */
db.notes.upsertBatchNotes = function(notes) {
  var sqlQuery = 'INSERT OR REPLACE INTO notes ' +
	'(jid, version, created, edited, deleted, contents, meta, modified) ' +
	'VALUES(?,?,?,?,?,?,?,?);';

  var numNotes = notes.length;
  var attributes = [];
  for (var i = 0; i < numNotes; i++){
    var note = notes[i];
    var deleted = 0;
    if (note.deleted === true || note.deleted === 'true' 
	|| note.deleted === 1) {
      deleted = 1;
    }
    attributes.push([
      parseInt(note.jid, 10),
      parseInt(note.version, 10),
      parseInt(note.created, 10),
      parseInt(note.edited, 10),
      deleted,
      note.contents,
      note.meta || "{}",
      parseInt(note.modified, 10)]);
  } // ~ 1000 times faster (no seek time for each transaction!)
  db.notes.repeatQuery_(sqlQuery, attributes);
};


/**
 * Performs batched insert on list of notes.
 * @param {object} notes The notes to upsert.
 */
db.notes.insertBatchNotes = function(notes) {
  var sqlQuery = 'INSERT INTO notes ' +
	'(jid, version, created, edited, deleted, contents, meta, modified) ' +
	'VALUES(?,?,?,?,?,?,?,?);';

  var numNotes = notes.length;
  var attributes = [];
  for (var i = 0; i < numNotes; i++){
    var note = notes[i];
    var deleted = 0;
    if (note.deleted === true || note.deleted === 'true' 
	|| note.deleted === 1) {
      deleted = 1;
    }
    attributes.push([
      parseInt(note.jid, 10),
      parseInt(note.version, 10),
      parseInt(note.created, 10),
      parseInt(note.edited, 10),
      deleted,
      note.contents,
      note.meta || "{}",
      parseInt(note.modified, 10)]);
  } // ~ 1000 times faster (no seek time for each transaction!)
  db.notes.repeatQuery_(sqlQuery, attributes);
};


// Repeat query n times for each: [[params 1], ..., [params n]].
/**
 * Repeat sqlQuery for each set of parameters.
 * @param {string} sqlQuery The sql query to run.
 * @param {object} parameters List of (param list) for query.
 * @private
 */
db.notes.repeatQuery_ = function(sqlQuery, parameters) {
  db.DB_.transaction(function(tx) {
    var numParams = parameters.length;
    //debug('numParams:', numParams);
    for (var i = 0; i < numParams; i++) {
      tx.executeSql(sqlQuery, parameters[i],
		    function(tx, rs) { // Successful query.
		    }, function(tx, error) { // Failed query.
		    });
    }
  });
};

/**
 * Passes List of Undeleted Notes to continuation.
 * @param {function} continuation Handles list of notes.
 */
db.notes.getUndeletedNotes = function(continuation) {
  db.notes.getNotesByDeleted_(false, continuation);
};

/**
 * Passes List of Deleted Notes to continuation.
 * @param {function} continuation Handles list of notes.
 */
db.notes.getDeletedNotes = function(continuation) {
  db.notes.getNotesByDeleted_(true, continuation);
};

/**
 * Passes either all deleted or all undeleted notes to continuation.
 * @param {boolean} isDeleted Whether notes are deleted or not.
 * @param {function} continuation Handles list of notes, sorted by created.
 * @private
 */
db.notes.getNotesByDeleted_ = function(isDeleted, continuation) {
  db.DB_.transaction(function(tx) {
    tx.executeSql('SELECT * FROM notes WHERE deleted = ? ORDER BY created DESC',
		  [isDeleted ? 1 : 0],
		  function(tx, rs) {
		    var notes = [];
		    for (var i = 0; i < rs.rows.length; i++) {
		      var note = rs.rows.item(i);
		      if (note.jid >= 0) {
			// Only add 'real' notes.
			notes.push(note);
		      }
		    }
		    continuation(notes);
		  });
  });
};

/**
 * Passes all modified notes to continuation.
 * @param {function} continuation Called with list of modified notes.
 */
db.notes.getModifiedNotes = function(continuation) {
  db.notes.getNotesByModified_(1, continuation);
};

/**
 * Passes all un-modified notes to continuation.
 * @param {function} continuation Called with list of un-modified notes.
 */
db.notes.getUnmodifiedNotes = function(continuation) {
  db.notes.getNotesByModified_(0, continuation);
};

/**
 * Passes list of all notes of a modified value to continuation.
 * @param {number} modified Whether notes are modified or not.
 * @param {function} continuation Called with list of notes.
 * @private
 */
db.notes.getNotesByModified_ = function(modified, continuation) {
  db.DB_.transaction(function(tx) {
      tx.executeSql(
	'SELECT * FROM notes WHERE modified = ?', [modified],
	function(tx, rs) {
	  var notes = [];
	  var numNotes = rs.rows.length;
	  for (var i = 0; i < numNotes; i++) {
	    var note = rs.rows.item(i);
	    notes.push(note);
	  }
	  continuation(notes);
	});
  });
};

/**
 * Passes list of all notes to continuation.
 * @param {function} continuation Called with list of notes.
 */
db.notes.getAllNotes = function(continuation) {
  db.DB_.transaction(function(tx) {
    tx.executeSql(
      'SELECT * FROM notes', [],
      function(tx, rs) {
	var notes = [];
	var numNotes = rs.rows.length;
	for (var i = 0; i < numNotes; i++) {
	  var note = rs.rows.item(i);
	  notes.push(note);
	}
	continuation(notes);
      });
  });
};

/** 
 * Passes magic note to continuation, else undefined if no magic note.
 * @param {function} continuation Called with magic (jid = -1) note.
 */
db.notes.getMagicNote = function(continuation) {
  db.DB_.transaction(function(tx) {
    tx.executeSql(
      'SELECT * FROM notes WHERE jid = -1', [],
      function(tx, rs) {
	var magicNote;
	var numNotes = rs.rows.length;
	for (var i = 0; i < numNotes; i++) {
	  magicNote = rs.rows.item(i);
	}
	continuation(magicNote);
      });
  });
};


/**
 * Drops and adds new notes table to List-it Database.
 */
db.notes.dropNotesTable = function() {
  db.DB_.transaction(function(tx) {
    tx.executeSql('DROP TABLE notes', []);
  });
  db.notes.setupTable();
};
