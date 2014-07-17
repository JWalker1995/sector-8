goog.provide('sector8.map');

goog.require('goog.asserts');
goog.require('util.make_getters_setters');

sector8.map = function()
{
    goog.asserts.assertInstanceof(this, sector8.map);
    
    var props = {
        'map_id': 0,
        'name': '',
        'creator_id': 0,
        'creation_date': Date,
        'num_players': 0,
        'board': sector8.board,
        //'primes': [],
        'symmetry_flip_x': false,
        'symmetry_flip_y': false,
        'symmetry_rot_90': false,
        'symmetry_rot_180': false
    };
    
    // Each cell: territory/unclaimed/void, permanent, prime, sectors, sector chance, sectoid chance

    util.make_getters_setters(this, props);
};