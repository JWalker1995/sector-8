goog.require('util.logger');
goog.require('sector8.net');

goog.provide('sector8.core');

sector8.core = function()
{
    var log_path = 'log/';
    
    var is_nodejs = !(typeof document !== 'undefined' && typeof document.getElementById === 'function');
    this.is_client = function() {return !is_nodejs;};
    this.is_server = function() {return is_nodejs;};
    
    this.logger = new util.logger();
    var logger = this.logger;
    
    if (this.is_client())
    {
    }
    
    if (this.is_server())
    {
        var fs = require('fs');
        var trace_stream = fs.createWriteStream(log_path + 'trace_file.log', {'flags': 'a', 'mode': 0666});
        var event_stream = fs.createWriteStream(log_path + 'event_file.log', {'flags': 'a', 'mode': 0666});
        var error_stream = fs.createWriteStream(log_path + 'error_file.log', {'flags': 'a', 'mode': 0666});
        
        var make_func = function(endpoint)
        {
            return function(level, time, info, msg)
            {
                var throttle_str = (info.throttles ? ' throttled ' + info.throttles + 'x' : '');
                var str = level + ' ' + info.errno + throttle_str + ' at ' + time.getTime() + ' : ' + msg;
                endpoint(str);
            };
        };
        
        logger.update_handler('trace_file', true, [logger.trace], make_func(trace_stream.write));
        logger.update_handler('event_file', true, [logger.event, logger.alert], make_func(event_stream.write));
        logger.update_handler('error_file', true, logger.notice, make_func(error_stream.write));
        
        logger.update_handler('stdout', true, logger.trace, make_func(process.stdout.write));
        logger.update_handler('client', true, logger.notice, function(level, time, info, msg)
        {
            this.net.request('error', {
                'level': level,
                'time': time,
                'msg': msg,
                'errno': info.errno,
                'throttles': info.throttles
            });
        });
        logger.update_handler('email', true, logger.fatal, function(level, time, info, msg)
        {
        });
    }

    /*
    this.logger.log_trace('trace');
    this.logger.log_event('event');
    this.logger.log_alert('alert');
    this.logger.log_notice('notice');
    this.logger.log_warning('warning');
    this.logger.log_fatal('fatal');
    */
    
    this.net = new sector8.net(this);
    this.net.connect('localhost', 7854);
};
