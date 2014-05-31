goog.provide('util.logger');

goog.require('goog.asserts');

util.logger = function()
{
    var throttle_ms = 1000;
    var levels = ['all', 'trace', 'event', 'alert', 'notice', 'warning', 'fatal'];
    var num_levels = levels.length;

    // Trace - method calls, loops
    // Event - user login/logout/register, moves
    // Alert - user login failed 3 times, client sends invalid packet
    // Notice - timeouts or reconnects
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

    var infos = {};
    
    this.log = function(level, errno, msg)
    {
        var date = new Date();
        var time = date.getTime();
        
        if (typeof errno === 'undefined') {errno = 0;}
        var info = infos[errno];
        if (typeof info !== 'object')
        {
            info = infos[errno] = {
                'errno': errno,
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

    var i = 0;
    while (i < num_levels)
    {
        this[levels[i]] = i;
        this['log_' + levels[i]] = this.log.bind(this, i);
        i++;
    }
    
    this.get_level_str = function(level) {return levels[level];};
};
