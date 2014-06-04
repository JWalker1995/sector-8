goog.provide('sector8.core');

goog.require('util.logger');

sector8.core = function()
{
    goog.asserts.assertInstanceof(this, sector8.core);
    
    this.logger = new util.logger();
    
    this.sector8_opts = {
        'host': 'localhost',
        'path': '/sector8'
    };

    this.bcrypt_ops = {
        'hash_rounds': 12
    };

    this.mysql_opts = {
        'host': 'localhost',
        'port': 3306,
        'user': 'root',
        'password': ''
    };

    this.primus_opts = {
        'port': 7854,
        'pathname': this.sector8_opts.path + '/socket',
        'parser': 'JSON',
        'transformer': 'websockets',
        'iknowhttpsisbetter': true
    };

    /*
    this.logger.log_trace('trace');
    this.logger.log_event('event');
    this.logger.log_alert('alert');
    this.logger.log_notice('notice');
    this.logger.log_warning('warning');
    this.logger.log_fatal('fatal');
    */
};
