require('../sector8');

require('../util/assert');
require('../util/make_class');

sector8.player = function()
{
    util.assert(this instanceof sector8.player);
    
    var props = {
        'player_id': 0,
        'match': sector8.match,
        'user': sector8.user
    };
    
    this.get_match_id = function() {return this.get_match().get_match_id();};
    this.get_user_id = function() {return this.get_user().get_user_id();};

    util.make_class(this, props);
};