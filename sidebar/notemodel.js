/**
 * @filedesc Model for individual notes.
 * 
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
L.make = L.make || {};
L.base = L.base || {};

L.make.NoteModel = Backbone.Model.extend({
  defaults: {
    visible: true,
    /*noteHeight: L.base.oneLineHeight,*/
    /*baseNoteHeight: '1.3em', //L.base.oneLineHeight, //'1.2em',*/
    contents: '',
    meta: {},
    focused: false,
    modified: 0,
    urlMatch: false
  },
  initialize: function(data) {
    if (data.meta === 'undefined') {
      data.meta = {};
    }
    if (typeof(data.meta) === 'string') {
      data.meta = JSON.parse(data.meta);
    }
    
    var meta = (data.meta === '{}' ? {} : data.meta);
    this.set('meta', (meta && meta !== 'undefined' ? meta : {}));
    this.set('lowerCaseContents', data.contents.toLowerCase());

    this.set('noteHeight', (L.model.options.get('shrinkSelected') ? 
			    L.base.oneLineHeight : 'auto'));
    this.set('baseNoteHeight', this.get('noteHeight'));

    vent.on('sys:tabFocused', this.tabFocused, this);
  },
  packageNote_: function() {
    var note = {
      jid: this.get('jid'),
      version: this.get('version'),
      created: this.get('created'),
      edited: this.get('edited'),
      deleted: this.get('deleted'),
      contents: this.get('contents'),
      meta: JSON.stringify(this.get('meta')),
      modified: this.get('modified')
    };
    return note;
  },
  saveNote: function() {
    this.set('lowerCaseContents', this.get('contents').toLowerCase());

    var note = this.packageNote_();
    controller.saveNote(note);

    L.saveActivityLog({
      action: db.logs.LogType.NOTE_SAVE,
      noteid: this.get('jid'),
      info: {
	pinned: (note.contents.length > 0 && note.contents[0] === '!'),
	contents: note.contents	
      }
    });
  },
  updateLowerContents: function() {
    this.set({
      'lowerCaseContents': this.get('contents').toLowerCase()
    });
  },
  recieveUpdate: function(data) {
    this.set('version', data.version);
    this.set('edited', data.edited);
    this.set('contents', data.contents);
    this.set('modified', data.modified);
  },
  /**
   * Delete this note and record deletion log.
   */
  deleteSelf: function() {
    controller.deleteNote(this.packageNote_());

    var contents = this.get('contents');
    L.saveActivityLog({
      action: db.logs.LogType.NOTE_DELETE,
      noteid: this.get('jid'),
      info: {
	pinned: (contents.length > 0 && contents[0] === '!'),
	contents: contents	
      }
    });

    this.collection.remove(this);
  },
  /**
   * Recieve background/sync request to delete this note.
   * @param {object} data 
   */
  recieveDelete: function(data) {
    this.set('deleted', true);
  },
  /**
   * Sync with server says this note needs updating.
   * @param {object} updatedNote Contains new note attributes.
   */
  recieveUpdateFromSync: function(updatedNote) {
    if (updatedNote.deleted || updatedNote.deleted === 1) {
      this.recieveDelete();
      return;
    }
    this.set('version', updatedNote.version || this.get('version'));
    this.set('edited', updatedNote.edited || this.get('edited'));
    this.set('modified', updatedNote.modified || this.get('modified'));
    this.set('contents', updatedNote.contents || this.get('contents'));
  },
  
  isPinned: function() {
    var pinned = false;
    var meta = this.get('meta');
    if (typeof meta[MetaType.PINNED] !== undefined) {
      pinned = meta[MetaType.PINNED];
    }
    return pinned;
  },

  tabFocused: function(data) {
    var meta = this.get('meta');
    if (typeof meta.url !== 'undefined') {
      if (meta.url === data.url) {
	this.set('urlMatch', true);
      } else {
	this.set('urlMatch', false)
      }
    }
  }
});
