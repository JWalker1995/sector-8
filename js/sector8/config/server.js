require('../../sector8/config');

require('../../util/assert');
require('../../util/deepcopy');
require('../../sector8/config/common');

var fs = require('fs');

sector8.config.server = function()
{
    util.assert(this instanceof sector8.config.server);
    
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
        'sql_init_path': 'init.sql',
        'tmp_dir_path': '/tmp',
        'check_compiled_blacklist': [
        ]
    });
    
    var local = fs.readFileSync('server_config.json', {'encoding': 'utf8'});
    util.deepcopy(this, JSON.parse(local));
};