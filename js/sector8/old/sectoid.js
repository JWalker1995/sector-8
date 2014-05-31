goog.provide('sector8.sectoid');

goog.require('util.make_getters_setters');

sector8.sectoid = function()
{
    if (!(this instanceof sector8.sectoid))
    {
        throw new Error('sector8.sectoid must be created with the new keyword');
    }

    var props = {
        'is_king': false,
        'sectors': 0
    };

    util.make_getters_setters(this, props);
};
