goog.provide('sector8.watchable');

goog.require('goog.asserts');
goog.require('sector8.core');


// lobby.*.user_id,username

sector8.watchable = function(type)
{
    goog.asserts.assertInstanceof(this, sector8.watchable, 'A sector8.watchable must be created with the new keyword');

    var parents;
    var children;

    switch (type)
    {
    case ''
    }

    var watchers = [];
    var star_watchers = [];

    this.watch = function(query, callback)
    {
        var dot = query.indexOf('.');
        if (dot !== -1)
        {
            var next_query = query.substr(0, dot);
            if (next_query === '*')
            {
                star_watchers.push(callback);
            }
            else
            {
                var children = next_query.split(',');
                for (var i in children)
                {
                    this[children]
                }
            }
        }
    };

    this.add_to = function(watchable, key)
    {
        goog.asserts.assertInstanceof(watchable, sector8.watchable, 'sector8.watchable.add_to(): First argument must be an instanceof sector8.watchable');

        if (typeof key === 'undefined')
        {

        }
    };

    this._receive = function(watchable, key)
    {

    };
};

sector8.watchable = function(obj, props)
{
    var parents = [];

    var prop_watchers = {};

    var set_prop = function(prop, val)
    {
        if (props[prop] !== val)
        {
            props[prop] = val;

            var prop_watchers

            for (var i in parents)
            {
                parents[i].get_watchers();
            }
        }
    };

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
                    if (val instanceof type)
                    {
                        set_prop(prop, val);
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
                        set_prop(prop, val);
                    }
                    else
                    {
                        throw new Error('set_' + prop + '(): Argument must be of type ' + type);
                    }
                };
            }
        })(prop);
    }
};



// lobby.games.[*].turns.[*]

var coherence = function(opts)
{
    if (typeof opts.onerror !== 'function')
    {
        opts.onerror = console.err.bind(console);
    }

    var types = [Object];
    this.register_type = function(type)
    {
        for (var i in types)
        {
            if (type instanceof types[i])
            {
                if (type !== types[i])
                {
                    types.splice(i, 0, type);
                }
                break;
            }
        }
    };
    this.registered_types_to_string = function()
    {
        var type_to_str = function(type)
        {
            var props = [];
            for (var prop in new type())
            {
                props.push(prop);
            }
            return type.name + ': ' + props.sort().join(',');
        };
        return types.map(type_to_str).join('\n');
    };
    this.registered_types_to_hash = function()
    {
        var sum = crypto.createHash('md5');
        sum.update(this.registered_types_to_string());
        return sum.digest('hex');
    };

    var get_type_id = function(type)
    {
        for (var i in types)
        {
            if (type instanceof types[i])
            {
                return i;
            }
        }
        return -1;
    };


    this.data = {};

    this.watch_data = function(query, callback)
    {
        watch(this.data, query, 0, callback);
    };

    this.watch = function(obj, query, callback)
    {
        watch(obj, query, 0, callback);
    };

    var watch = function(obj, query, i, callback)
    {
        var dot = query.indexOf('.', i);
        if (dot === -1) {dot = undefined;}
        var path = query.substring(0, dot);
        var part = query.substring(i, dot);
        if (part === '*' || part === '[*]')
        {
            send('l', path, function(str){registered_types_to_string = function()
    {
        var type_to_str = function(type)
        {
            var props = [];
            for (var prop in new type())
            {
                props.push(prop);
            }
            return type.name + ': ' + props.sort().join(',');
        };
        return types.map(type_to_str).join('\n');
    };
            });
        }
        else
        {
            var keys = part.split(',');
            keys.filter(function(key){return typeof obj[key] === 'undefined';});
            if (keys)
            {

            }
        }

        else if (typeof obj[first] === 'undefined')
        {

        }
        if (dot === -1)
        {
            first = query;
        }
        else
        {
            first = query.substr(i, dot);
            var rest = query.substr(dot + 1);
            if ()
        }

        var req = 'w ';
        reqs.push(req);
    };

    var send_timeout;
    var send_str = '';
    var waiters = [];
    var free_waiters = [];
    var send = function(command, arg, callback)
    {
        var c = free_waiters ? free_waiters.pop() : waiters.length;
        waiters[c] = callback;

        send_str += c + ' ' + command + ' ' + arg + '\n';

        if (typeof send_timeout === 'undefined')
        {
            send_timeout = setTimeout(function()
            {
                opts.send(send_str);
                send_timeout = undefined;
                send_str = undefined;
            }, 0);// Wait until js enters event loop
        }
    };

    this.receive = function(str)
    {
        var lines = str.split('\n');
        for (var i in lines)
        {
            var line = lines[i];
            
            var space = line.indexOf(' ');
            if (space === -1) {continue;}
            var c = parseInt(line.substring(0, space));
            var rest = line.substring(space + 1);

            if (!waiters[c](rest))
            {
                free_waiters.push(c);
            }
        }
    };
};

var data = new coherence();
