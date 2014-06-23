goog.provide('sector8.ui.ui');

goog.require('goog.functions');
goog.require('sector8.ui.login');

sector8.ui.ui = function(core)
{
    goog.asserts.assertInstanceof(this, sector8.ui.ui);
    
    var el;

    var login = new sector8.ui.login(core);

    var render = function()
    {
        el = goog.dom.createDom('div', {'class': 'game'});
        goog.dom.append(el, login.render());

        return el;

        /*
        Right column:
            Timeline navigation
            Resign / Offer draw
            Moves
            Orders
            Stats
                Territory
                Sectors
            Stats graph
            Chat

            players connect, then agree on game

        */
    };

    this.render = goog.functions.cacheReturnValue(render);
};