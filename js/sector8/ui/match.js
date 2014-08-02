goog.require('goog.dom');
goog.require('goog.functions');
require('../../sector8/ui/board');

sector8.ui.match = function(core, match)
{
    assert(this instanceof sector8.ui.match);
    
    var board = new sector8.ui.board(core, match);
    
    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'match'});
        
        goog.dom.append(el, board.render());
        
        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
