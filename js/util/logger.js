goog.provide('util.logger');

goog.require('goog.asserts');

util.logger = function()
{
    var throttle_ms = 1000;
    var levels = ['all', 'trace', 'event', 'alert', 'notice', 'warning', 'fatal'];
    var num_levels = levels.length;

    // Trace - method calls, loops
    // Event - user login/logout/register, moves
    // Alert - user login failed 3 times
    // Notice - timeouts or reconnects, client sends invalid packet
    // Warning - assertion failed
    // Fatal - cannot connect to db

    var handlers = {};

    this.update_handler = function(name, args)
    {
        var handler = handlers[name];
        if (typeof handler === 'undefined') {handler = handlers[name] = {};}

        var i = 1;
        var c = arguments.length;
        while (i < c)
        {
            var arg = arguments[i];
            switch (typeof arg)
            {
            case 'object':
                handler.levels = 0;
                var j = 0;
                while (j < arg.length)
                {
                    handler.levels |= 1 << arg[j];
                    j++;
                }
                break;

            case 'number':
                handler.levels = (1 << levels.length) - (1 << arg);
                break;

            case 'boolean':
                handler.enabled = arg;
                break;

            case 'function':
                handler.func = arg;
                break;
            }
            i++;
        }

        if (typeof handler.levels !== 'number') {handler.levels = 0;}
        if (typeof handler.enabled !== 'boolean') {handler.enabled = true;}
        if (typeof handler.func !== 'function') {delete handlers[name];}
    };

    /*
    var infos = {};
    
    this.log = function(level, type, msg)
    {
        var date = new Date();
        var time = date.getTime();
        
        var info = infos[type];
        if (typeof info !== 'object')
        {
            info = infos[type] = {
                'type': type,
                'throttles': 0,
                'next_report': time
            };
        }
        
        if (time < info.next)
        {
            info.throttles++;
            return;
        }
        else
        {
            info.throttles = 0;
            info.next_report = time + throttle_ms;
        }
        
        var level_bit = 1 << level;

        for (var i in handlers)
        {
            var handler = handlers[i];
            if (handler.enabled && (handler.levels & level_bit))
            {
                if (typeof msg === 'function') {msg = msg();}
                handler.func(level, date, info, msg);
            }
        }
    };
    */
    
    this.log = function(level, msg)
    {
        if (!msg) {return;}
        
        var info = {
            'level': level,
            'level_str': levels[level]
        };
        
        var level_bit = 1 << level;
        
        var date = new Date();
        
        log(level_bit, date, info, msg);
    };
    
    this.get_reporter = function(level, reporter)
    {
        var info = {
            'level': level,
            'level_str': levels[level],
            'reporter': reporter,
            'throttles': 0,
            'next_report': new Date().getTime()
        };
        
        var level_bit = 1 << level;
        
        return function(msg)
        {
            if (!msg) {return;}
            
            var date = new Date();
            var time = date.getTime();
            
            if (time < info.next)
            {
                info.throttles++;
                return;
            }
            else
            {
                info.throttles = 0;
                info.next_report = time + throttle_ms;
            }

            log(level_bit, date, info, msg);
        };
    };
    
    var log = function(level_bit, date, info, msg)
    {
        var process = true;
        
        for (var i in handlers)
        {
            var handler = handlers[i];
            if (handler.enabled && (handler.levels & level_bit))
            {
                if (process)
                {
                    msg = process_msg(msg);
                    process = false;
                }
                handler.func(date, info, msg);
            }
        }
    };
    
    var process_msg = function(msg)
    {
        if (typeof msg === 'function')
        {
            msg = msg();
        }
        
        if (typeof msg === 'object')
        {
            if (typeof msg.toString === 'function')
            {
                var toString = msg.toString();
                if (typeof toString === 'string') {msg.toString = toString;}
            }
            msg = JSON.stringify(msg);
        }
        
        return msg + '\n';
    };

    var i = 0;
    while (i < num_levels)
    {
        this[levels[i]] = i;
        //this['log_' + levels[i]] = this.log.bind(this, i);
        i++;
    }
};
