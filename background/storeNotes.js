/**
 * Contains note storage subsystem of Model.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var db = db || {};

/** Module Namespace */
db.nstore = db.nstore || {};

/**
 * Setup note dictionary in localStorage.
 */
db.nstore.setup = function() {
  if (db.nstore.getNoteDict() === null) {
    db.nstore.saveNoteDict({});
  }
};

/**
 * Return dictionary of jid->notes.
 * @return {object} Note dictionary with jid keys.
 */
db.nstore.getNoteDict = function() {
  if (JSON.parse(localStorage.getItem('notedict')) === null) {
    db.nstore.saveNoteDict({});
  }
  return JSON.parse(localStorage.getItem('notedict'));
};

/**
 * Return array of notes.
 * @return {object} notes Array of notes.
 */
db.nstore.getNoteArray = function() {
  var notes = [];
  var notedict = JSON.parse(localStorage.getItem('notedict'));
  for (var jid in notedict) {
    notes.push(notedict[jid]);
  }
  return notes;
};

/**
 * Store a dictionary object of notes with jid keys.
 * @param {object} ndict The dictionary of notes with jid keys.
 */
db.nstore.saveNoteDict = function(ndict) {
  localStorage.setItem('notedict', JSON.stringify(ndict));
};

/**
 * Updates or inserts note in notes database.
 * @param {Object} note Note to update.
 */
db.nstore.upsertNote = function(note) {
  var ndict = db.nstore.getNoteDict();
  ndict[note.jid] = note;
  db.nstore.saveNoteDict(ndict);
};

/**
 * Performs batched upsert on list of notes.
 * @param {object} notes The notes to upsert.
 */
db.nstore.upsertBatchNotes = function(notes) {
  db.nstore.insertBatchNotes(notes);
};

/**
 * Performs batched insert on list of notes.
 * @param {object} notes The notes to upsert.
 */
db.nstore.insertBatchNotes = function(notes) {
  var ndict = db.nstore.getNoteDict();
  for (var i = 0; i < notes.length; i++) {
    ndict[notes[i].jid] = notes[i];
  }
  db.nstore.saveNoteDict(ndict);
};


/**
 * Passes List of Undeleted Notes to continuation.
 * @param {function} continuation Handles list of notes.
 */
db.nstore.getUndeletedNotes = function(continuation) {
  var dbNotes = db.nstore.getNoteArray();
  var magicNote;
  var numNotes = dbNotes.length;
  var notes = [];
  for (var i = 0; i < numNotes; i++) {
    var note = dbNotes[i];
    if (note.jid === -1) {
      magicNote = note;
    } else if ((note.deleted === true ||
          note.deleted === 'true' ||
          note.deleted === 1) || note.jid < 0) {
            // Disqualified: deleted / other magic notes!
          } else {
            notes.push(note);
          }
  }

  debug(magicNote);
  if (typeof magicNote !== 'undefined') {
    debug('Using magicNote for ordering notes');
    var order = JSON.parse(magicNote.contents).noteorder;
    notes = _.sortBy(notes, function(note) {
      return _.indexOf(order, note.jid);
    });
  } else {
    notes = _.sortBy(notes, function(note) {
      return Date.now() - note.created;
    });
  }
  window.dd = notes;

  continuation(notes);

  /*
     notes = _.filter(notes, function(note) {
     return ((note.jid >= 0) &&
     (note.deleted === false ||
     note.deleted === 'false' ||
     note.deleted === 0));
     });

     notes = _.sortBy(notes, function(note) {
     return Date.now() - note.created;
     });
     continuation(notes);
     */
};

/**
 * Passes List of Deleted Notes to continuation.
 * @param {function} continuation Handles list of notes.
 */
db.nstore.getDeletedNotes = function(continuation) {
  var notes = db.nstore.getNoteArray();
  notes = _.filter(notes, function(note) {
    return ((note.jid >= 0) &&
      (note.deleted === true ||
       note.deleted === 'true' ||
       note.deleted === 1));
  });
  continuation(notes);
};

/**
 * Passes all modified notes to continuation.
 * @param {function} continuation Called with list of modified notes.
 */
db.nstore.getModifiedNotes = function(continuation) {
  var notes = db.nstore.getNoteArray();
  notes = _.filter(notes, function(note) {
    return note.modified === 1;
  });
  continuation(notes);
};

/**
 * Passes all un-modified notes to continuation.
 * @param {function} continuation Called with list of un-modified notes.
 */
db.nstore.getUnmodifiedNotes = function(continuation) {
  var notes = db.nstore.getNoteArray();
  notes = _.filter(notes, function(note) {
    return note.modified === 0;
  });
  continuation(notes);
};

/**
 * Passes list of all notes to continuation.
 * @param {function} continuation Called with list of notes.
 */
db.nstore.getAllNotes = function(continuation) {
  continuation(db.nstore.getNoteArray());
};

/**
 * Delete all notes locally from application.
 */
db.nstore.deleteAllNotes = function() {
  localStorage.removeItem('notedict');
};

/**
 * Passes magic note to continuation, else undefined if no magic note.
 * @return {object} magicNote Either MagicNote or undefined.
 */
db.nstore.getMagicNote = function() {
  var ndict = db.nstore.getNoteDict();
  var magicNote;
  if (-1 in ndict) {
    magicNote = ndict[-1];
  }
  return magicNote; // Note || undefined.
};

// FOR TESTING ONLY
/**
 * Remove magic note with user info from localStorage.
 */
db.nstore.removeMagicNote = function() {
  var ndict = db.nstore.getNoteDict();
  delete ndict[-1];
  db.nstore.saveNoteDict(ndict);
};
