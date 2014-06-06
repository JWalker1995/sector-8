goog.provide('sector8.db');

goog.require('goog.asserts');

sector8.db = function()
{
    goog.asserts.assertInstanceof(this, sector8.db, 'A sector8.db must be created with the new keyword');

    this.load_class = function(inst, table, col, value, callback)
    {
    };
};
