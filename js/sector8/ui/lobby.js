goog.require('goog.dom');
goog.require('goog.functions');

sector8.ui.lobby = function(core)
{
    assert(this instanceof sector8.ui.lobby);
    
    var challenge_list = new sector8.ui.challenge_list(core);
    var user_list = new sector8.ui.user_list(core);
    var match_list = new sector8.ui.match_list(core);

    var render = function()
    {
        var el = goog.dom.createDom('div', {'class': 'lobby'});
        
        goog.dom.append(el, challenge_list.render());
        goog.dom.append(el, user_list.render());
        goog.dom.append(el, match_list.render());
        
        return el;
    };

    this.render = goog.functions.cacheReturnValue(render);
};
