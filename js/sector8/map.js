goog.require('sector8.util.make_getters_setters');

goog.provide('sector8.map');

sector8.map = function()
{
    if (!(this instanceof sector8.map))
    {
        throw new Error('sector8.map must be created with the new keyword');
    }

    var props = {
        'num_players': 0,
        'size_x': 0,
        'size_y': 0,
        'cells': [],
        'kings': [],
        'symmetry_flip_x': false,
        'symmetry_flip_y': false,
        'symmetry_rot_90': false,
        'symmetry_rot_180': false
    };

    sector8.util.make_getters_setters(this, props);
};
