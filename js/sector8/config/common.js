goog.provide('sector8.config.common');

sector8.config.common = function()
{
    util.deepcopy(this, {
        'sector8': {
            'host': 'localhost',
            'path': '/sector8'
        },
        'primus': {
            'host': 'localhost',
            'port': 7854,
            'pathname': '/sector8/socket',
            'parser': 'JSON',
            'transformer': 'websockets',
            'iknowhttpsisbetter': true
        },
        'bcrypt': {
            'hash_rounds': 12
        }
    });
};