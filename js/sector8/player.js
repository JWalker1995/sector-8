goog.provide('sector8.player');

goog.require('goog.asserts');
goog.require('util.make_class');

sector8.player = function()
{
    goog.asserts.assertInstanceof(this, sector8.player);
    
    var props = {
        'player_id': 0,
        'match_id': 0,
        'user_id': 0
    };

    util.make_class(this, props);
};