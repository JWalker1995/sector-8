goog.provide('util.make_getters_setters');

util.make_getters_setters = function(obj, props)
{
    for (var prop in props)
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
                        props[prop] = val;
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
                        props[prop] = val;
                    }
                    else
                    {
                        throw new Error('set_' + prop + '(): Argument must be of type ' + type);
                    }
                };
            }
        })(prop);
    }
    
    obj.to_obj = function()
    {
        var o = {};
        for (var prop in props)
        {
            o[prop] = obj['get_' + prop]();
        }
        return o;
    };
    
    obj.from_obj = function(o)
    {
        for (var prop in props)
        {
            if (typeof o[prop] !== 'undefined')
            {
                obj['set_' + prop](o[prop]);
            }
        }
    };
};
