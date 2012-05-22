/**
 * @filedesc Model for omnibox input (note-creation box).
 * 
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
L.model = L.model || {};
L.view = L.view || {};
L.make = L.make || {};
L.msg = L.msg || {};

L.msg.USER_ADDED_NOTE = 'user:noteAdd';

L.make.OmniboxModel = Backbone.Model.extend({
  defaults: {
    searchEnabled: true,
    searchTerms: ['']
  },
  initialize: function() {
    this.on('change:searchTerms', this.requestSearch, this);
  },
  requestSearch: function(model) {
    var searchTerms = this.get('searchTerms');
    if (searchTerms.length === 1 && searchTerms[0] === "") {
      //debug('triggering user:clearSearch');
      vent.trigger('user:clearSearch', ['']);
      // controller.recordActivityLog(log); // Record activitylog!
    } else {
      //debug('triggering user:newSearch');
      vent.trigger('user:newSearch', searchTerms); 
      // controller.recordActivityLog(log); // Record activitylog!
    }
  },

});

$(document).ready(function() {
  // Create model.
  L.model.Omnibox = new L.make.OmniboxModel({});

  L.view.Omnibox = new L.make.OmniboxView({
    el: $('#cl-1'),
    model: L.model.Omnibox
  });
  
});