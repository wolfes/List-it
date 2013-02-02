/**
 * Create's option box for view control icons.
 * Using BackboneJS instead of Google Closure.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
/** Maker namespace */
L.make = L.make || {};

/**
 * Option row view for sidebar.
 */
L.make.OptionRow = Backbone.View.extend({
  tagName: 'div',
  id: 'options',
  initialize: function() {
    //this.render();
    this.model.on('change:pinSelected', this.updatePinIcon, this);
  },
  render: function() {
    var template = L.template.optionrow({
      savedSearch: ['1', '2']
    });


    this.setElement(template);
    return this.$el;
  },
  events: {
    'click': 'boxClicked',
    'click #pin-option': 'pinClicked'
  },
  boxClicked: function(event) {
    if (event.target.id === this.id) {
      vent.trigger('user:viewTopNote', {});
    }
  },
  pinClicked: function(event) {
    this.model.set({pinSelected: !this.model.get('pinSelected')});
  },
  updatePinIcon: function() {
    // Respond to model change.
    debug('Updating pin icon...');
    var pinIcon = $('#pin-option', this.el);
    var newSrc = pinIcon.attr('src') === 'img/pin.png' ?
        'img/pin_pencil.png' : 'img/pin.png';
    pinIcon.attr('src', newSrc);
  }
});



