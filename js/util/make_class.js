require('../util');

require('../util/assert');

util.make_class = function(obj, props)
{
    if (typeof props === 'undefined') {props = obj;}
    
    var watchers = [];
    var has_updated = false;
    var updated = {};
    
    var call_watchers = function(arr)
    {
        var i = 0;
        while (i < arr.length)
        {
            var watcher = arr[i];
            if (typeof watcher === 'function')
            {
                watcher(updated);
            }
            else
            {
                call_watchers(watcher);
            }
            i++;
        }
    };
    
    var set = function(prop, val)
    {
        props[prop] = val;
        
        if (!has_updated)
        {
            has_updated = true;
            
            setTimeout(function()
            {
                call_watchers(watchers);
                
                has_updated = false;
                updated = {};
            }, 0);
        }
        
        updated[prop] = val;
    };
    
    util.assert(typeof props === 'object');
    
    obj.defaults = goog.object.clone(props);
    
    if (props instanceof Array)
    {
        var first = props.shift();
        var type = typeof first;

        obj.get = function(i)
        {
            return props[i];
        };

        if (type === 'undefined')
        {
            obj.set = function(i, val)
            {
                set(i, val);
            };
        }
        else if (type === 'function')
        {
            obj.set = function(i, val)
            {
                if (val === null || val instanceof first)
                {
                    set(i, val);
                }
                else
                {
                    throw new Error('set(): Argument must be an instanceof ' + first);
                }
            };
        }
        else
        {
            if (first === '_func') {type = 'function';}
            obj.set = function(i, val)
            {
                if (typeof val === type)
                {
                    set(i, val);
                }
                else
                {
                    throw new Error('set(): Argument must be of type ' + type);
                }
            };
        }
    }
    else
    {
        for (var prop in props)
        {
            if (props.hasOwnProperty(prop))
            {
                (function(prop)
                {
                    var type = typeof props[prop];

                    obj['get_' + prop] = function()
                    {
                        return props[prop];
                    };

                    if (type === 'function')
                    {
                        type = props[prop];
                        obj['set_' + prop] = function(val)
                        {
                            if (val === null || val instanceof type)
                            {
                                set(prop, val);
                            }
                            else
                            {
                                throw new Error('set_' + prop + '(): Argument must be an instanceof ' + type);
                            }
                        };
                        props[prop] = null;
                    }
                    else
                    {
                        if (props[prop] === '_func') {type = 'function';}
                        obj['set_' + prop] = function(val)
                        {
                            if (typeof val === type)
                            {
                                set(prop, val);
                            }
                            else
                            {
                                throw new Error('set_' + prop + '(): Argument must be of type ' + type);
                            }
                        };
                    }
                })(prop);
            }
        }
    }
    
    obj.to_obj = function()
    {
        var o = {};
        for (var prop in props)
        {
            if (props.hasOwnProperty(prop))
            {
                o[prop] = obj['get_' + prop]();
            }
        }
        return o;
    };
    
    obj.from_obj = function(o)
    {
        for (var prop in props)
        {
            if (props.hasOwnProperty(prop) && o.hasOwnProperty(prop))
            {
                obj['set_' + prop](o[prop]);
            }
        }
    };
    
    obj.watch = function(arg)
    {
        util.assert(typeof arg === 'function' || arg instanceof Array);
        
        watchers.push(arg);
    };
    
    return obj;
};
