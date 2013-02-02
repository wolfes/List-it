
var L = L || {};
/** Make Namespace */
L.make = L.make || {};
/** Base Namespace */
L.base = L.base || {};


/**
 * Create NoteCol collection maker.
 */
L.make.NoteCol = Backbone.Collection.extend({
  model: L.make.NoteModel,
  initialize: function() {
    // Set note
    L.template.note = L.template.webkitNote;
    if (navigator.userAgent.search('Firefox') !== -1) {
      L.template.note = L.template.firefoxNote;
    }

    vent.on('user:newSearch', this.performSearch, this);
    vent.on('user:clearSearch', this.performSearch, this);

    vent.on('user:expandNotes', this.expandNotes, this);
    vent.on('user:shrinkNotes', this.shrinkNotes, this);

    model.publisher.on( // Only listen to first event.
      model.EventType.UNDELETED_NOTES,
      function(payload) {
        model.publisher.off(model.EventType.UNDELETED_NOTES);
        this.addNotesFromBG(payload);
      }, this
    );
    model.publisher.on(
      model.EventType.NOTE_ADD,
      this.addNoteFromServer, this
    );
    model.publisher.on(
      model.EventType.NOTE_SAVE,
      this.updateNoteFromServer, this
    );
    model.publisher.on(
      model.EventType.NOTE_DELETE,
      this.deleteNoteFromServer, this
    );
    model.publisher.on(
      model.EventType.BATCH_INSERT_NOTES,
      this.batchInsertFromServer, this
    );
    model.publisher.on(
      model.EventType.BATCH_UPDATED_NOTES,
      this.batchUpdateFromServer, this
    );

    this.on('change:urlMatch', this.urlMatch, this);
  },
  urlMatch: function(notemodel) {
    // Called for each note with urlMatch change.
    if (notemodel.isPinned()) {
      return; // Pinned notes already on top!
    }

    if (!notemodel.get('urlMatch')) {
      // Put note's view back in place.
    }
  },

  /**
   * Returns new randomly generated unique note jid.
   */
  getUniqueID: function() {
    var jid = Math.floor(Math.random() * 1000000);
    while (this.get(jid) !== undefined) {
      jid = Math.floor(Math.random() * 1000000);
    }
    return jid;
  },
  addNotesFromBG: function(notes) {
    // First time loading notes into sidebar.
    this.addNotes_(notes, true);
  },
  /**
   * Repeats: Add 30 notes at a time to increase percieved load speed.
   * @param {Object} notes Array of note info objects.
   * @param {boolean} opt_firstLoad True if notes are first into sidebar.
   */
  addNotes_: function(notes, opt_firstLoad) {
    var this_ = this;
    var firstLoad = opt_firstLoad || false;
    var notesDisplayed = 40; //30;
    var dispNotes = notes.slice(0, notesDisplayed);
    var contNotes = notes.slice(notesDisplayed);
    var numNotes = dispNotes.length;

    for (var i = 0; i < numNotes; i++) {
      var note = notes[i];
      if (!note.meta || note.meta === 'undefined') {
        note.meta = {};
      }
      note.meta = ((note.meta instanceof String) ?
          JSON.parse(note.meta) : note.meta);
      note.id = note.jid;
      this.add(note);
      /* Put meta fields in spot where they can be listened to...?
         for (var j in note.meta) {
         debug(i, note.meta[i]);
         note[j] = note[j] || note.meta[j];
         }*/
    }

    if (contNotes.length !== 0) {
      setTimeout(function() {
        this_.addNotes_(contNotes, firstLoad);
      }, 60);
    } else {
      L.fixPageResize();
    }
  },


  addNoteFromServer: function(data) {
    data.note.prepend = true;
    data.note.id = data.note.jid;
    this.add([data.note]);
  },
  updateNoteFromServer: function(noteData) {
    var note = this.get(noteData.jid);
    note.recieveUpdate(noteData);
  },

  batchInsertFromServer: function(notes) {
    for (var i = 0; i < notes.length; i++) {
      notes[i].prepend = true;
    }
    notes.reverse();
    this.addNotes_(notes);
  },
  /**
   * Updates note given new copy from server / etc.
   * Protects user from losing unsaved edits during sync.
   * @param {object} updatedNote Contains new note attributes.
   */
  batchUpdateFromServer: function(notes) {
    var numNotes = notes.length;
    var idToUpdate = {};
    for (var i = 0; i < numNotes; i++) {
      idToUpdate[notes[i].jid] = notes[i];
    }
    this.each(function(model) {
      var jid = model.get('jid');
      if (jid in idToUpdate) {
        model.recieveUpdateFromSync(idToUpdate[jid]);
      }
    });
    //TODO(wstyke): requestSearch();
  },
  deleteNoteFromServer: function(noteData) {
    var note = this.get(noteData.jid);
    if (note) {
      note.recieveDelete(noteData);
    }
  },

  performSearch: _.debounce(function(searchTerms) {
    var terms = [];
    for (var i = 0; i < searchTerms.length; i++) {
      terms.push(searchTerms[i].toLowerCase());
    }
    // Stop previous search.
    clearTimeout(L.set.noteset.searchTimer);
    this.performFragmentedSearch_(terms, this.models);
  }, 100),
  performFragmentedSearch_: function(searchTerms, notes, opt_visibleJIDs) {
    debug('performFragmentedSearch_', searchTerms);
    var this_ = this;
    var visibleJIDs = opt_visibleJIDs || [];
    var notesDisplayed = 60;
    var dispNotes = notes.slice(0, notesDisplayed);
    var contNotes = notes.slice(notesDisplayed);
    var numNotes = dispNotes.length;
    var showAllNotes = (searchTerms.length === 0 || (
          searchTerms.length === 1 && searchTerms[0] === ''));

    if (showAllNotes) {
      // Clear Search
      for (var i = 0; i < numNotes; i++) {
        notes[i].set('visible', true);
      }
    } else {
      // Search
      for (var i = 0; i < numNotes; i++) {
        var note = notes[i];
        var contents = note.get('lowerCaseContents');
        for (var j = 0; j < searchTerms.length; j++) {
          var term = searchTerms[j];
          if (term === '' || term === ' ') {
            continue;
          }
          term = term.replace('&nbsp;', '');
          var isPositiveTerm = term[0] !== '-';
          term = isPositiveTerm ? term : term.substr(1);
          // - non-compatible with IE
          var termMatches = contents.indexOf(term) !== -1;
          if ((isPositiveTerm && !termMatches) ||
              (!isPositiveTerm && termMatches)) {
                // Missing Good Term || Has Bad Term
                note.set('visible', false);
                break;
              }
          note.set('visible', true);
          visibleJIDs.push(note.get('jid'));
        }
      }
    }

    // Repeat Search || Finish Search
    if (contNotes.length !== 0) {
      L.set.noteset.searchTimer = setTimeout(function() {
        this_.performFragmentedSearch_(
          searchTerms, contNotes, visibleJIDs);
      }, 40);
    } else {
      // End of Search: Save ActivityLog + Show Clear Search if No Results

      // Feature: Expand Notes when Few Search Results
      if (visibleJIDs.length <= 5 && visibleJIDs.length !== 0) {
        // Expand Notes when 0-5 search results.
        vent.trigger('user:expandNotes', {log: false});
      } else {
        // Reset Note Size to User Choice when 6+ search results.
        if (L.model.options.get('shrinkSelected')) {
          debug('end:showAllNotes:shrink');
          vent.trigger('user:shrinkNotes', {log: false});
        } else {
          debug('clear:showAllNotes:shrink');
          vent.trigger('user:expandNotes', {log: false});
        }
      }

      var action = db.logs.LogType.SEARCH;
      var info = {
        terms: searchTerms,
        noteids: visibleJIDs
      };
      if (searchTerms.length === 1 && searchTerms[0] === '') {
        action = db.logs.LogType.SEARCH_CLEAR;
        info = {};
      }
      L.saveActivityLog({
        action: action,
        info: info
      });
    }
  },
  shrinkNotes: function(data) {
    this.baseNoteHeight = L.base.oneLineHeight;
    this.fixNoteHeight();

    if (typeof data.log !== 'undefined' && data.log) {
      L.saveActivityLog({
        action: db.logs.LogType.SHRINK,
        info: {}
      });
    }

  },
  expandNotes: function(data) {
    this.baseNoteHeight = 'auto';
    this.fixNoteHeight();

    if (typeof data.log !== 'undefined' && data.log) {
      L.saveActivityLog({
        action: db.logs.LogType.EXPAND,
        info: {}
      });
    }
  },
  fixNoteHeight: function() {
    this.fixNotesHeight_(this.models);
  },
  fixNotesHeight_: function(notes) {
    var this_ = this;
    var notesDisplayed = 30;
    var dispNotes = notes.slice(0, notesDisplayed);
    var contNotes = notes.slice(notesDisplayed);
    var numNotes = dispNotes.length;

    for (var i = 0; i < numNotes; i++) {
      notes[i].set('noteHeight', this.baseNoteHeight);
      notes[i].set('baseNoteHeight', this.baseNoteHeight);
    }

    if (contNotes.length !== 0) {
      setTimeout(function() {
        this_.fixNotesHeight_(contNotes);
      }, 20);
    }
  }
});
