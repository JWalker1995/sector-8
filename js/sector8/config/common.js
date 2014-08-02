sector8.config.common = function()
{
    assert(this instanceof sector8.config.common);
    
    util.deepcopy(this, {
        'sector8': {
            'host': 'localhost',
            'path': '/sector8',
            'max_players': 26,
            'max_wait': 100,
            'max_duration': 100,
            'max_rows': 25,
            'max_cols': 25
        },
        'primus': {
            'host': 'localhost',
            'port': 7854,
            'pathname': '/sector8/socket',
            'parser': 'JSON',
            'transformer': 'websockets',
            'iknowhttpsisbetter': true
        },
        'net': {
            'enable_compression': true
        },
        'bcrypt': {
            'hash_rounds': 12
        }
    });
};