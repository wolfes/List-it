/**
 * Status Message Module for showing messages to user.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
/** Model Namespace */
L.model = L.model || {};
/** View Namespace */
L.view = L.view || {};
/** Maker Namespace */
L.make = L.make || {};

/**
 * Status Model for keeping track of messages to show.
 */
L.make.StatusModel = Backbone.Model.extend({
  defaults: {
    msg: '',
    duration: 0
  },
  initialize: function() {
    vent.on('showMsg', function(data) {
      this.showMsg(data.msg, data.duration);
    }, this);
  },
  showMsgData: function(data) {
    this.showMsg(data.msg, data.duration);
  },
  /**
   * Set model's msg and duration.
   * @param {string} textMsg The message to show.
   * @param {number} duration The number of milliseconds to show msg.
   */
  showMsg: function(textMsg, duration) {
    var this_ = this;
    clearTimeout(this.get('timerId'));
    this.set({
      msg: textMsg,
      duration: duration
    });
    var timerId = setTimeout(function() {
      this_.set({
        msg: '',
        duration: 0
      });
    }, duration);
    this.set('timerId', timerId);
  }
});


/**
 * View for showing status messages.
 */
L.make.StatusView = Backbone.View.extend({
  initialize: function() {
    this.render();
    this.model.on('change:msg', this.showMsg, this);
  },
  render: function() {
    var container = document.createElement('div');
    container.id = 'statusMsg';
    container.className = 'box center_box';

    var msgBox = document.createElement('div');
    msgBox.id = 'msgBox';
    msgBox.innerHTML = 'Test Status Message.';
    container.appendChild(msgBox);
    $(this.el).append(container);
  },
  /**
   * Show a text status message.
   * @param {object} model Has string textMsg attribute - The message to show.
   */
  showMsg: function(model) {
    var textMsg = model.get('msg');
    if (textMsg === '') {
      this.hideMsg();
      return;
    }
    this.$('#msgBox').html(textMsg);
    this.$('#statusMsg').addClass('show');
  },
  /**
   * Hides status message.
   */
  hideMsg: function() {
    this.$('#statusMsg').removeClass('show');
  }

});


$(document).ready(function() {
  // Create model.
  L.model.Status = new L.make.StatusModel({});

  L.view.Status = new L.make.StatusView({
    el: $('#page-main'),
    model: L.model.Status
  });
});





