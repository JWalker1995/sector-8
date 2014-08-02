require('../../util/deepcopy');
require('../../sector8/config/common');

sector8.config.server = function()
{
    assert(this instanceof sector8.config.server);
    
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
        'google_closure_compiler_path': '/Users/joel.walker/source/closure-compiler/compiler.jar',
        'check_compiled_blacklist': [
            'my-password'
        ]
    });
};