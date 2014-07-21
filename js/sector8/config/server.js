goog.provide('sector8.config.server');

goog.require('util.deepcopy');
goog.require('sector8.config.common');

sector8.config.server = function()
{
    util.deepcopy(this, new sector8.config.common());
    
    util.deepcopy(this, {
        'mysql': {
            'host': 'localhost',
            'port': 3306,
            'user': 'sector8',
            'password': '',
            'database': 'sector8',
            'multipleStatements': true
        },
        'registration_email': 'no-reply@localhost',
        'sql_init_path': 'init.sql'
    });
};