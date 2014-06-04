goog.provide('sector8.ui.lobby');

goog.require('goog.dom');
goog.require('goog.functions');

sector8.ui.lobby = function()
{
    goog.asserts.assertInstanceof(this, sector8.ui.lobby);
    
    var el;
    var render = function()
    {
        el = goog.dom.createDom('div', {'class': 'lobby'}, 'Loading...');
        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
