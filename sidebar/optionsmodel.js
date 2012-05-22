/**
 * @filedesc Create model for options.
 * Using Backbone instead of Google Closure.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
L.model = L.model || {};
L.view = L.view || {};
L.make = L.make || {};

L.make.OptionsModel = Backbone.Model.extend({
  defaults: {
    pinSelected: true,
    shrinkSelected: true,
    syncing: false,

    shrinkNotesOnLoad: true,
  },
  initialize: function() {
    var shrinkNotesOnLoad = JSON.parse(localStorage.getItem('shrinkNotesOnLoad'));
    var shrinkOnLoad = (shrinkNotesOnLoad === null ?
			true : shrinkNotesOnLoad);
    this.set('shrinkNotesOnLoad', shrinkOnLoad);
    this.set('shrinkSelected', shrinkOnLoad); // set this way only for init.

    this.on('change:shrinkSelected', this.publishShrinkChange, this);
    this.on('change:syncing', this.processSyncing, this);
    vent.on('sys:endSyncing', function(){ this.set('syncing', false); }, this)

  },
  publishShrinkChange: function(model) {
    var msg = 'user:expandNotes';
    if (this.get('shrinkSelected')) {
      msg = 'user:shrinkNotes';
    }
    vent.trigger(msg, {
      log: true,
      optionsmodel: this
    });
  },
  processSyncing: function(model) {
    if (model.get('syncing')) {
      //vent.trigger('user:startSyncing');
      controller.sync();
      vent.trigger('showMsg', {
	msg: 'Saving your notes & retrieving any updates.',
	duration: 5 * 1000
      });
    }
    setTimeout(function() {
      model.set('syncing', false);
    }, 5 * 1000);
  },

  setShrinkOnLoad: function(shrinkOnLoad) {
    this.set('shrinkNotesOnLoad', shrinkOnLoad);
    localStorage.setItem('shrinkNotesOnLoad', shrinkOnLoad);
  }
});


$(document).ready(function() {
  // Create model.
  L.model.options = new L.make.OptionsModel({});

  // Create View for model.
  
/*
  L.view.OptionRow = new L.make.OptionRow({
    model: L.model.options
  });
  $('#cl-2').append(L.view.OptionRow.render());
*/
  
  L.view.OptionCol = new L.make.OptionCol({
    model: L.model.options
  });
  $('#controls-right').append(L.view.OptionCol.render());

  L.view.OptionView = new L.make.OptionView({
    model: L.model.options
  });
  $('#options-features').append(L.view.OptionView.render());
});