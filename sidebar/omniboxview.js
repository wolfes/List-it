/**
 * @filedesc View: omnibox input. Provides search and note-creation.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */


var L = L || {};
L.make = L.make || {};
L.set = L.set || {};

L.make.OmniboxView = Backbone.View.extend({
  initialize: function() {
    var this_ = this;
    $(window).unload(function() {
      this_.unloadHandler_();
    });
    this.model.set('untouched', true); // View untouched by user.
    this.render();
  },
  render: function() {
    var that = this;
    var newNote = L.template.input({});

    $(this.el).append(newNote);

    setTimeout(function() {
      that.focusInputWithCaret();
    }, 1);
  },
  events: {
    'click #save-icon': 'saveClicked_',
    'click #place-icon': 'saveLinkClicked_',
    'click #eye-icon': 'savePinClicked_',
    'click #new-note': 'clickHandler_',

    'keypress #new-note-entry': 'keyPressHandler_',
    'keyup #new-note-entry': 'keyUpHandler_',
    'focus #new-note-entry': 'focusInHandler_',
    'blur #new-note-entry': 'focusOutHandler_'
  },

  /**
   * Handles clicks on note creation container.
   * @param {object} event The click event.
   * @private
   */
  clickHandler_: function(event) {
    this.$('#new-note').addClass('focus');
    this.$('#new-note-entry')[0].focus();
  },
  /**
   * Handles KEYPRESS event:
   *   Shift+Enter => create note.
   * @param {object}
   */
  keyPressHandler_: function(event) {
    var isEnter = event.keyCode === 13;
    if (event.shiftKey && isEnter) {
      var meta = this.getBasicMeta_();
      var text = this.getNoteText();
      var note = this.buildNewNote_(text, meta);
      this.saveAndFocus_(note);
      event.preventDefault(); // Prevent enter from entering new note area.
    }
  },
  /**
   * Handles KEYUP event: "After char enters entry."
   *   Text change: Search.
   * @param {object}
   */
  keyUpHandler_: function(event) {
    var isESC = event.keyCode === 27;
    var isEnter = event.keyCode === 13;
    if (isESC) {
      this.clearInput();
      this.focusInputWithCaret();
    } else if (!isEnter && this.$('#new-note-entry').text() === '') {
      // Note Entry cleared of text (backspace)
      // Clear any remaining <div></div> fragments in contenteditable box.
      this.clearInput();
    }

    if (this.model.get('searchEnabled')) {
      var searchTerms = this.getSearchTerms();
      if (searchTerms !== this.model.get('searchTerms')) {
	this.model.set('searchTerms', searchTerms);
      }
    }
  },
  /**
   * Handle window.unload event.
   */
  unloadHandler_: function(event) {
    // Safety Feature: Don't save empty or one-line searches.
    if (this.isEmpty() || !this.isMultiLine()) { return; }

    var text = this.getNoteText();
    var meta = this.getBasicMeta_();
    var note = this.buildNewNote_(text, meta);
    this.saveNewNote_(note);
  },


  /**
   * Handles new note focus event.
   * @param {Object} event The focus event.
   * @private
   */
  focusInHandler_: function(event) {
    this.$('#new-note-desc').css('display', 'none');
    this.$('#new-note').addClass('focus');

    if (this.model.get('untouched')) {
      // First focus is from autofocus.
      this.model.set('untouched', false);
      L.saveActivityLog({
	action: db.logs.LogType.CREATE_AUTOFOCUS,
	info: {}
      });
    } else {
      L.saveActivityLog({
	action: db.logs.LogType.CREATE_FOCUS,
	info: {}
      });
    }
  },
  /**
   * Handles new note blur event.
   * @param {Object} event The blur event.
   * @private
   */
  focusOutHandler_: function(event) {
    if (this.isEmpty()) {
      this.$('#new-note-desc').css('display', '');
      this.$('#new-note').removeClass('focus');
    }
  },


  /**
   * Handles note focus event.
   */
  focus: function() {
    this.$('#new-note').addClass('focus');
    this.$('#new-note')[0].focus();
  },
  /**
   * Handles note blur event.
   */
  blur: function() {
    this.$('#new-note').removeClass('focus');
    this.$('#new-note')[0].blur();
  },

  /**
   * Handles new-note save button click event.
   * @param {object} click event
   * @private
   */
  saveClicked_: function(event) {
    var meta = this.getBasicMeta_();
    var text = this.getNoteText();
    var note = this.buildNewNote_(text, meta);
    this.saveAndFocus_(note);
  },
  /**
   * Handles Note Creation, adding URL context.
   * @param {object} event The click event.
   * @private
   */
  saveLinkClicked_: function(event) {
    var meta = this.getBasicMeta_();
    var text = this.getNoteText();

    var tabURL = controller.getFocusedURL();
    if (tabURL !== undefined && tabURL !== '') {
      // Add url to note + meta info:
      text += '\n\n@url:' + tabURL;
      meta['hostURL'] = getHostname(tabURL);
      meta['fullURL'] = tabURL;
    }
    
    var note = this.buildNewNote_(text, meta);
    this.saveAndFocus_(note);
  },
  /**
   * Handles New Note Save w/ Place & URL Relevance Info:
   * @param {object} event The click event.
   * @private
   */
  savePinClicked_: function(event) {
    var meta = this.getBasicMeta_();
    meta[MetaType.PINNED] = true;
    var text = '!! ' + this.getNoteText();

    var note = this.buildNewNote_(text, meta);
    this.saveAndFocus_(note);
  },

  /**
   * Returns true if input element is empty.
   * @return {boolean}
   */
  isEmpty: function() {
    var inputHTML = this.getNoteText().trim();
    return inputHTML === "" || inputHTML === "<br>";
  },
  /**
   * Returns true of new note box is 2+ lines long.
   * @return {boolean}
   */
  isOneLine: function() {
    var inputHTML = this.getNoteText().trim();
    return inputHTML.search('<div>') === -1;
  },
  /**
   * Returns text of note-creation input.
   * @return {string} Text of note-creation input.
   */
  getNoteText: function() {
    var el = this.$('#new-note-entry')[0];
    var text = el.innerHTML; //this.el.childNodes[1].childNodes[0].innerHTML;
    if (false && el.hasOwnProperty('innerText')) {
      // DEPRECATED innerText ...
      text = el.innerText;
    } else {
      while (text.search('<br>') !== -1) {
	text = text.replace('<br>', '\n')
      }
    }
    return text;
  },
  /**
   * Returns input element.
   * @return Content-editable div Input DOM Element
   */
  getInput: function() {
    return this.$('#new-note-entry')[0];
  },
  /**
   * Clear NewNote's innerText.
   */
  clearInput: function() {
    var noteInput = this.getInput();
    noteInput.innerText = '';
    noteInput.textContents = '';
    noteInput.innerHTML = '';
    this.$('#new-note').removeClass('nonempty');
    this.model.set('searchTerms', ['']);
  },



  /**
   * Returns basic meta information object.
   * @return {object} meta Object with basic meta info.
   * @private
   */
  getBasicMeta_: function() {
    var meta = {};
    var text = this.getNoteText();
    if (text.length > 0 && text[0] === '!') {
      meta[MetaType.PINNED] = true;
    }
    var url = controller.getFocusedURL();
    if (url !== '') {
      meta[MetaType.URL] = url;
    }
    return meta;
  },
  /**
   * Constructs and returns a new note object.
   * @param {String} contents Note Text.
   * @param {String/Object} meta Stringified JSON or object with meta-data.
   */
  buildNewNote_: function(contents, meta) {
    if (meta && typeof(meta) === 'object') {
      meta = JSON.stringify(meta);
    }
    var jid = L.set.noteset.getUniqueID();
    var note = {
      jid: jid,
      version: 0,
      created: Date.now(),
      edited: Date.now(),
      deleted: 0,
      contents: contents,
      meta: meta || '{}',
      modified: 1
    };
    return note;
  },
  /**
   * Saves note, clears and re-focuses note input.
   * @param {object} note The note to save.
   */
  saveAndFocus_: function(note) {
    this.saveNewNote_(note);
    this.clearInput();
    this.focusInputWithCaret();
  },
  /**
   * Saves new note object to client database.
   * @param {object} note The note to save.
   * @param {boolean} focusOnAdd Whether to focus note on render.
   */
  saveNewNote_: function(note, focusOnAdd) {    
    // Save Note
    controller.addNote({
      'note': note, 
      'source': 'newnote', 
      'focusOnAdd': focusOnAdd || false
    });
    
    // Log Note Save
    L.saveActivityLog({
      action: db.logs.LogType.CREATE_SAVE,
      noteid: note.jid,
      info: {
	contents: note.contents,
	pinned: ((note.contents.length > 0) && (note.contents[0] === '!')),
      }
    });
  },
  
  /**
   * Focuses row=1, col=1 of new note entry box.
   */
  focusInputWithCaret: function() {
    try {
      var el = this.$('#new-note-entry')[0];
      var range = document.createRange();
      var sel = window.getSelection();
      range.setStart(el, 0); //row: el.childNodes[0], col: 0
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    } catch (err) {
      debug('FAIL: focusInputWithCaret()');
    }
  },
  
  /**
   * Returns the current search terms
   * @return {string} The search text.
   */
  getSearchTerms: function() {
    if (this.$('#new-note-entry').text() === '') {
      // Empty text input.
      return [];
    }
    var cleanedTerms = [];
    var searchText = this.getNoteText();
    var searchTerms = searchText.split('\n')[0].split(' ');
    for (var i = 0; i < searchTerms.length; i++) {
      cleanedTerms.push(searchTerms[i].trim());
    }
    return cleanedTerms;
  }

});
