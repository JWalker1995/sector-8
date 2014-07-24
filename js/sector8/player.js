goog.provide('sector8.player');

goog.require('goog.asserts');
goog.require('util.make_class');

sector8.player = function()
{
    goog.asserts.assertInstanceof(this, sector8.player);
    
    var props = {
        'player_id': 0,
        'match': sector8.match,
        'user': sector8.user
    };
    
    this.get_match_id = function() {return this.get_match().get_match_id();};
    this.get_user_id = function() {return this.get_user().get_user_id();};

    util.make_class(this, props);
};