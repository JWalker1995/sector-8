goog.require('goog.dom');
goog.require('goog.functions');

goog.provide('sector8.lobby');

sector8.lobby = function()
{
    var el;
    var render = function()
    {
        el = goog.dom.createDom('div', {'class': 'lobby'), 'Loading...'});
        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
