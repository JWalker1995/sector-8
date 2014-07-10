goog.provide('sector8.map');

goog.require('goog.asserts');
goog.require('util.make_getters_setters');

sector8.map = function()
{
    goog.asserts.assertInstanceof(this, sector8.map);

    var props = {
        'map_id': 0,
        'name': '',
        'num_players': 0,
        'rows': 0,
        'cols': 0,
        'cells': Array,
        //'primes': [],
        'symmetry_flip_x': false,
        'symmetry_flip_y': false,
        'symmetry_rot_90': false,
        'symmetry_rot_180': false,
        'creator_id': 0,
        'creation_date': Date
    };
    
    // Each cell: territory/unclaimed/void, permanent, prime, sectors, sector chance, sectoid chance

    util.make_getters_setters(this, props);
};