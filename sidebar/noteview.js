/**
 * View for individual notes.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var BLOCK = false;

var L = L || {};

/** Make Namespace */
L.make = L.make || {};

/** Base Namespace */
L.base = L.base || {};

function htmlEncode(str) {
  var elm = document.createElement('div');
  var txtNode = document.createTextNode(str);
  elm.appendChild(txtNode);
  return elm.innerHTML;
}

/**
 * Create NoteView maker.
 */
L.make.NoteView = Backbone.View.extend({
  //tagName: 'div',
  initialize: function() {
    //this.render();
    this.id = this.model.get('jid');
    this.className = 'note hbox';
    this.model.on('change:noteHeight', this.fixHeight, this);
    this.model.on('change:focused', this.fixFocus, this);
    this.model.on('change:contents', this.showChangedContents, this);
    this.model.on('change:deleted', this.animatedRemoval, this);
    this.model.on('change:visible', this.setVisibility, this);

    this.model.on('change:urlMatch', this.urlMatch, this);

    vent.on('noteFocused', this.unfocus_, this);
  },
  render: function() {
    var jid = this.model.get('jid');
    var contents = this.model.get('contents');
    var meta = this.model.get('meta');
    var leftIcon = 'img/orangedot.png'; //'dotIcon';

    if (meta.hasOwnProperty('pinned') ||
        (contents.length > 0 && contents[0] === '!')) {
          leftIcon = 'img/pin.png'; //'pinIcon';
        }

    // Version 3.0: doT.js templating
    var note = L.template.note({
      jid: jid,
        leftIcon: leftIcon,
        contents: '',  //contents.replace('\n', '<br>')
        height: this.model.get('baseNoteHeight') //L.base.oneLineHeight
    });

    note = $(note);
    var txtElt = $('.noteContents', note)[0];
    if (BLOCK && txtElt.hasOwnProperty('innerText')) {
      txtElt.innerText = contents;
    } else {
      while (contents.search('\n') !== -1) {
        contents = contents.replace('\n', '<br>');
      }
      txtElt.innerHTML = contents;
    }

    this.setElement(note[0]);
    return this.$el;
  },
  events: {
    'focusin .noteContents': 'focus',
    'focusout .noteContents': 'blur',
    'click .linkIcon': 'openLink',
    'click .left img': 'leftIconClicked',
    'click .xIcon': 'removeNote',
    'keyup .noteContents': 'handleKeyUp_',
    'keypress .noteContents': 'handleKeyPress_',

    'mouseenter': 'showIcons_',
    'mouseleave': 'hideIcons_'
  },
  getNoteText: function() {
    var contents = this.$('.noteContents').html();
    //this.el.childNodes[1].childNodes[0].innerHTML;
    /*if (BLOCK && this.el.hasOwnProperty('innerText')) {
      return this.el.childNodes[1].childNodes[0].innerText;
      } else {*/
    while (contents.search('<br>') !== -1) {
      contents = contents.replace('<br>', '\n');
    }
    return contents;
    //}
  },
  setNoteText: function(contents) {
    if (BLOCK && this.el.hasOwnProperty('innerText')) {
      this.el.innerText = contents;
    } else {
      while (contents.search('\n') !== -1) {
        contents = contents.replace('\n', '<br>');
      }
      this.el.childNodes[1].childNodes[0].innerHTML = contents;
    }
  },
  fixHeight: function() {
    this.$('.noteContents').css('height', this.model.get('noteHeight'));
  },
  setVisibility: function(model, visible) {
    if (visible) {
      this.$el.css('display', '');
      //this.$el.addClass('box'); //css('display', '-webkit-box');
    } else {
      this.$el.css('display', 'none');
    }
  },
  focus: function() {
    this.model.set('focused', true);
  },
  blur: function() {
    this.model.set('focused', false);
  },
  fixFocus: function() {
    if (this.model.get('focused')) {
      vent.trigger('noteFocused', this);
      this.handleFocus_();
    } else {
      this.handleBlur_();
    }
  },
  handleFocus_: function() {
    this.showIcons_();
    this.$el.addClass('focus');
    this.el.childNodes[1].childNodes[0].style.height = 'auto';
    if (this.el.hasOwnProperty('scrollIntoViewIfNeeded')) {
      this.el.scrollIntoViewIfNeeded(); // Not in FF.
    }
    var contents = this.model.get('contents');
    var this_ = this;
    L.saveActivityLog({
      action: db.logs.LogType.NOTE_EDIT,
      noteid: this_.model.get('jid'),
      info: {
        pinned: (contents.length > 0 && contents[0] === '!')
      }
    });
  },
  handleBlur_: function() {
    var this_ = this;
    this.hideIcons_();
    this.$el.removeClass('focus');
    /*setTimeout(function() {
      this_.el.childNodes[1].childNodes[0].style.height = (
      this_.model.get('noteHeight');
      );
      }, 1 * 60 * 1000); */ // 1 minute

    var newContents = this.getNoteText(); //$('.noteContents')[0].innerText;

    if (newContents !== this.model.get('contents')) {
      // Note content was edited!
      var meta = this.getBasicMeta_();
      this.model.set({
        'edited': Date.now(),
        'contents': newContents,
        'meta': meta,
        'modified': 1
      });
      this.model.saveNote();
    }
  },
  unfocus_: function(noteView) { // New note is focused, reset this note's size.
    if (noteView.id !== this.id) {
      this.$('.noteContents').css('height', this.model.get('baseNoteHeight'));
    }
  },
  /**
   * Scroll List so note selected with tab is at top.
   */
  handleKeyUp_: function(event) {
    if (event.keyCode === 9) { // TAB
      event.target.scrollIntoView();
      $('#entries-container')[0].scrollTop -= 4;
    }
  },
  /**
   * Save note on shift-enter, without extra line.
   */
  handleKeyPress_: function(event) {
    if (event.shiftKey && event.keyCode === 13) {
      event.target.blur();
      event.preventDefault();
    }
  },
  setIcon_: function(iconName) {
    var source = {
      'dot': 'img/orangedot.png',
      'pin': 'img/pin.png'
    };
    this.$('.left img').attr('src', source[iconName]);
  },
  getBasicMeta_: function() {
    var meta = this.model.get('meta');
    var newContents = this.getNoteText(); //$('.noteContents')[0].innerText;

    if (newContents.length > 0 && newContents[0] === '!') {
      meta['pinned'] = true;
      this.setIcon_('pin');
    } else if (meta.hasOwnProperty('pinned')) {
      delete meta['pinned'];
      this.setIcon_('dot');
    }
    return meta;
  },
  openLink: function() {
    debug('READY');
    L.openLinkTimer = setTimeout(function() {
      debug('FIRE');
      window.open(this.model.get('meta').fullURL);
    }, 50);
  },
  showChangedContents: function(model, contents) {
    //this.$('.noteContents')[0].innerText = contents;
    this.setNoteText(contents);
  },
  removeNote: function() {
    this.model.set({
      'edited': Date.now(),
    'deleted': 1,
    'modified': 1
    });
    this.model.deleteSelf();
    var this_ = this;
    slideToggle(this.$el, false, 1000, function() {
      this_.$el.remove();
    });
  },
  animatedRemoval: function() {
    var this_ = this;
    slideToggle(this.$el, false, 1000, function() {
      this_.$el.remove();
    });
    /*this.$el.slideUp(400, function() {
      this_.$el.remove();
      });*/
  },
  /**
   * Floats note when tab focused with url note was created at.
   * @param {object} notemodel The note model behind this view.
   */
  urlMatch: function(notemodel) {
    // this === view :)
    if (!L.settings.FLOAT_URL_MATCHES || notemodel.get('deleted')) {
      return; // Setting turned off or note is deleted.
    }
    if (notemodel.isPinned()) {
      return; // Pinned notes already on top!
    }
    if (notemodel.get('urlMatch')) {
      // Show note at top of list.
      var a = this.remove();
      $('#entries').prepend(this.render());
    } else {
      // Put note back in it's place.
      // Let notelistview take care of this?
      //$('#entries').append(this.render());
    }
  },
  /**
   * Left icon clicked: Open URL note was created at.
   */
  leftIconClicked: function() {


    /* Bookmark Feature de-activated
       Use something other than drag icon 'pin/dot icon'.

       var meta = this.model.get('meta');
       if (typeof meta[MetaType.URL] == 'string') {
    // Open New Tab with Bookmarked URL
    var url = meta[MetaType.URL];

    vent.trigger('usr:openTab', {url: url}); // For Chrome Ext.
    controller.openTab(url); // For Firefox to listen to.

    var jid = this.model.get('jid');
    var contents = this.model.get('contents');
    var pinned = (contents.length > 0 && contents[0] === '!');
    L.saveActivityLog({
    action: db.logs.LogType.BOOKMARK_OPEN,
    noteid: jid,
    url: url,
    info: {
    pinned: pinned
    }
    });
    }
    */
  },
  /**
   * Show Dot/Pin and Delete Icon when note is moused over.
   */
  showIcons_: function(event) {
    this.$('.xIcon').css('display', '');
    //$('.note').live('hover', function(event) {
    //  window.e = event;  $('img', e.currentTarget).css('display', '')
    ///})
  },
  hideIcons_: function(event) {
    if (!this.model.get('focused')) {
      var this_ = this;
      setTimeout(function() {
        this_.$('.xIcon').css('display', 'none');
      }, 60);
    }
  }
});
