goog.require('sector8.util.make_getters_setters');

goog.provide('sector8.sectoid');

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

    sector8.util.make_getters_setters(this, props);
};
