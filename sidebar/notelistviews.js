/**
 * @filedesc Views on Note Collection for pinned/regular notes.
 * 
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
L.make = L.make || {};
L.base = L.base || {};

/**
 * Abstract View on note collection.
 */
L.make.NotesView = Backbone.View.extend({
  defaults: {
    noteHeight: '1.3em', //L.base.oneLineHeight, //'1.2em',
    lastFocusedNote: null
  },
  initialize: function() {
    this.collection.on('add', this.addNoteToView, this);
    //vent.on("shrinkNotes", this.shrinkNotes, this); ??
  },
  render: function(eltId) {
    var notelist = document.createElement('div');
    notelist.id = eltId;
    
    notelist.className = 'notelist';
    this.setElement(notelist);
    return this.$el;
  },
  getNotes: function() {
    return this.collection.models;
  },
});


/**
 * Pinned Notes View on note collection.
 */
L.make.NotesPinView = L.make.NotesView.extend({
  defaults: {
    'containerId': 'entries-pin'
  },
  getNotes: function() {
    return _.filter(
      this.collection.models,
      function(note) {
	var contents = note.get('contents');
	return contents.length > 0 && contents[0] === '!';
      });
  },
  addNoteToView: function(note) {
    var contents = note.get('contents');
    if (contents.length !== 0 && contents[0] === '!') {
      var noteView = new L.make.NoteView({
	model: note
      });
      if (note.get('prepend')) {
	$('#entries-pin').prepend(noteView.render());
      } else {
	$('#entries-pin').append(noteView.render());
      }
      L.fixPageResize();
    }
  },
});


/**
 * Normal Notes View on note collection.
 */
L.make.NotesNormView = L.make.NotesView.extend({
  getNotes: function() {
    return _.filter(
      this.collection.models,
      function(note) {
	var contents = note.get('contents');
	return contents.length === 0 || contents[0] !== '!';
      });
  },
  addNoteToView: function(note) {
    var contents = note.get('contents');
    if (contents.length === 0 || contents[0] !== '!') {
      var noteView = new L.make.NoteView({
	model: note
      });
      if (note.get('prepend')) {
	$('#entries').prepend(noteView.render());
      } else {
	$('#entries').append(noteView.render());
      }
      L.fixPageResize();
    }
  },
  fixNoteHeight: function() {
    // Make this wait 1ms to let pinned view fix height first.
    var this_ = this;
    var notes = this.getNotes();
    setTimeout(function() {
      this_.fixNotesHeight_(this_.getNotes());
    }, 1);
  },
});
