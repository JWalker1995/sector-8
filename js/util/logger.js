goog.requires('goog.assert');

goog.provides('util.logger');

util.logger = function()
{
    var levels = ['info', 'notice', 'warning', 'error'];
    
    var num_handlers = 0;
    var handler_map = {};
    var handler_funcs = [];
    var handler_levels = [];
    
    var log = function(level, msg)
    {
        var i = 0;
        while (i < num_handlers)
        {
            if (level >= handler_levels[i])
            {
                if (typeof msg === 'function')
                {
                    msg = msg();
                }
                handler_funcs[i][level](msg);
            }
            i++;
        }
    };
    
    var i = 0;
    while (i < levels.length)
    {
        this['level_' + levels[i]] = i;
        this[levels[i]] = log.bind(this, i);
        i++;
    }
    
    this.add_handler = function(name, funcs, level)
    {
        goog.assert(handler_funcs.length === handler_levels.length);
        
        if (funcs.length === levels.length)
        {
            handler_map[name] = num_handlers;
            handler_funcs[num_handlers] = funcs;
            handler_levels[num_handlers] = level || 0;
            num_handlers++;
            
            return true;
        }
        else
        {
            return false;
        }
    };
    
    this.set_handler_min_level = function(name, level)
    {
        handler_levels[handler_map[name]] = level;
    };
};