/**
 * View for user to toggle features.
 *
 * @author: Wolfe Styke - wstyke@gmail.com
 */

var L = L || {};
/** Maker namespace */
L.make = L.make || {};

/**
 * View for User Options.
 */
L.make.OptionView = Backbone.View.extend({
    initialize: function() {
        //this.model.on('change:shrinkSelected', this.updateShrinkIcon, this);
    },
    render: function() {
        var checkShrink = this.model.get('shrinkNotesOnLoad') ? 'checked' : '';
        var template = L.template.optionview({
            checkShrink: checkShrink,
            openHotkey: localStorage.getItem('openHotkeyNew')
        });
        this.setElement(template);
        return this.$el;
    },
    events: {
        'click #shrink': 'setShrinkDefault',
        'click #saveOpenHotkey': 'saveOpenHotkey'
    },
    setShrinkDefault: function(event) {
        var shrinkOnLoad = this.$('#shrink')[0].checked;
        this.model.setShrinkOnLoad(shrinkOnLoad);
    },
    saveOpenHotkey: function(event) {
        debug('saveOpenHotkey');
        var newHotkey = this.$('#openHotkey').val();
        controller.setOpenHotkey(newHotkey);
    }
});
