goog.provide('sector8.ui.match');

goog.require('goog.dom');
goog.require('goog.functions');
goog.require('sector8.map');
goog.require('sector8.sectoid');

sector8.ui.match = function(core, match)
{
    goog.asserts.assertInstanceof(this, sector8.ui.match);
    
    var board = new sector8.ui.board(core, match);
    
    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'lobby'});
        
        goog.dom.append(el, board.render());
        
        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
