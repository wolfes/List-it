/**
 * View for column of options (sync/options/shrink+expand).
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
/** Maker Namespace */
L.make = L.make || {};

/**
 * Option Column View.
 */
L.make.OptionCol = Backbone.View.extend({
  initialize: function() {
    //this.render();

    this.model.on('change:shrinkSelected', this.updateShrinkIcon, this);
  },
  render: function() {
    var sizeIcon = (this.model.get('shrinkSelected') ?
      'img/p-arrow-left.png' : 'img/p-arrow-down.png');

    var template = L.template.optioncol({
      sizeIcon: sizeIcon
    });

    this.setElement(template);
    return this.$el;
  },
  events: {
    'click #syncIcon': 'syncClicked',
    'click #optionsIcon': 'optionsClicked',
    'click #shrinkIcon': 'shrinkClicked'
  },
  syncClicked: function(event) {
    this.model.set('syncing', true);
  },
  optionsClicked: function(event) {
    vent.trigger('user:openSettingsPage');
    vent.trigger('showMsg', {
      'msg': 'Opening Options Page',
      'duration': 2 * 1000
    });
  },
  shrinkClicked: function(event) {
    this.model.set('shrinkSelected', !this.model.get('shrinkSelected'));
  },
  /**
   * Update the shrink/expand notes icon.
   */
  updateShrinkIcon: function(model) {
    var newSrc = (model.get('shrinkSelected') ?
      'img/p-arrow-left.png' : 'img/p-arrow-down.png');
    var newTitle = (model.get('shrinkSelected') ?
      'Minimize Notes' : 'Expand Notes');
    var shrinkIcon = this.$('#shrinkIcon');
    shrinkIcon.attr('src', newSrc);
    shrinkIcon.attr('title', newTitle);
  }
});
