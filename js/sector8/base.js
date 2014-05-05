goog.require('goog.dom');
goog.require('goog.functions');
goog.require('sector8.lobby');
goog.require('sector8.board');

goog.provide('sector8');

sector8 = function()
{
    var lobby;
    var board;

    var render = function()
    {
        lobby = new sector8.lobby();
        board = new sector8.board();
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

            2 ways for player connection:
                players connect, then agree on game

        */
    };

    this.render = goog.functions.cacheReturnValue(render);
};
