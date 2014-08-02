goog.provide('sector8.net');

goog.require('goog.asserts');

sector8.net = function(core, spark)
{
    goog.asserts.assertInstanceof(this, sector8.net);
    
    var trace_reporter = core.logger.get_reporter(core.logger.trace, 'sector8.net');
    var notice_reporter = core.logger.get_reporter(core.logger.notice, 'sector8.net');
    
    var callbacks = {};
    var next_callback = 0;
    
    var request = function(query, data, callback)
    {
        var reply = '_' + (++next_callback);
        query += ':' + reply;
        
        await(reply, callback);
        
        write_data([query, data]);
    };
    
    var await = function(query, callback)
    {
        if (typeof callback === 'function')
        {
            trace_reporter('Awaiting query: ' + query);
            
            callbacks[query] = function(reply_query, reply_data)
            {
                callback(reply_data, function(reply_reply_data, callback)
                {
                    request(reply_query[1], reply_reply_data, callback);
                });
            };
        }
    };
    
    var write_data = function(data)
    {
        trace_reporter('Writing data: ' + JSON.stringify(data));
        
        spark.write(data);
    };
    
    var on_data = function(data)
    {
        trace_reporter('Received data: ' + JSON.stringify(data));
        
        if (data instanceof Array)
        {
            var query = data[0].split(':', 2);
            var callback = callbacks[query[0]];
            if (typeof callback === 'function')
            {
                callback(query, data[1]);
                return;
            }
        }
        
        notice_reporter('Received data with invalid query: ' + JSON.stringify(data));
    };
    
    var on_end = function()
    {
        trace_reporter('Closed connection');
    };
    
    this.request = request;
    this.await = await;
    this.on_close = function(callback)
    {
        spark.on('end', callback);
    };
    
    spark.on('data', on_data);
    spark.on('end', on_end);
    
    
    var recurse = function(obj, callback)
    {
        obj = callback(obj);
        
        if (typeof obj === 'object')
        {
            for (var key in obj)
            {
                obj[key] = recurse(obj[key], callback);
            }
        }
        
        return obj;
    };
    
    //var spark_i = 1;
    var types = [];
    var insts = [];
    
    this.register_type = function(type, name, to_obj, from_obj)
    {
        if (types.hasOwnProperty(name) && types[name] !== type)
        {
            throw new Error('Registered 2 different types with the same name: "' + name + '"');
        }
        
        types[name] = [type, to_obj, from_obj];
        type._s8_adapter_type = name;
    };
    
    var encoder = function(data, fn)
    {
        if (typeof spark._s8_adapter_insts === 'undefined')
        {
            spark._s8_adapter_insts = [];
        }
        
        data = JSON.stringify(data, function(key)
        {
            // Do not use the second argument as val. For some reason, Date objects are converted to strings.
            var val = this[key];

            if (val && typeof val.constructor === 'function' && typeof val.constructor._s8_adapter_type !== 'undefined')
            {
                // val is a registered type

                var type = val.constructor._s8_adapter_type;
                goog.asserts.assert(types.hasOwnProperty(type));

                if (typeof val._s8_adapter_inst !== 'number' || typeof val._s8_adapter_sent !== 'object')
                {
                    val._s8_adapter_inst = insts.length;
                    insts[val._s8_adapter_inst] = val;
                    val._s8_adapter_sent = [];
                }

                var obj;
                if (val._s8_adapter_sent[spark_id] !== true)
                {
                    val._s8_adapter_sent[spark_id] = true;

                    obj = val[types[type][1]]();
                    if (typeof obj !== 'object')
                    {
                        obj = {'_s8_adapter_raw': obj};
                    }

                    obj._s8_adapter_type = type;

                    /*
                    val.watch(function(updated)
                    {
                        fn(undefined, val._s8_adapter_inst + encode(updated));
                    });
                    */
                }
                else
                {
                    obj = {};
                }

                obj._s8_adapter_inst = val._s8_adapter_inst;

                return obj;
            }
            else
            {
                // val is not a registered type

                return val;
            }
        });
        
        fn(undefined, data);
    };
    
    var decoder = function(data, fn)
    {
        var spark_id = get_spark_id(this);
        
        data = JSON.parse(data, function(key)
        {
            // Do not use the second argument as val. For some reason, Date objects are converted to strings.
            var val = this[key];

            if (val && typeof val._s8_adapter_inst === 'number')
            {
                var inst;

                if (typeof val._s8_adapter_type !== 'undefined')
                {
                    if (types.hasOwnProperty(val._s8_adapter_type))
                    {
                        var type_arr = types[val._s8_adapter_type];
                        inst = new type_arr[0]();

                        var obj = val.hasOwnProperty('_s8_adapter_raw') ? val._s8_adapter_raw : val;
                        inst[type_arr[2]](obj);

                        if (typeof insts[val._s8_adapter_inst] === 'undefined')
                        {
                            insts[val._s8_adapter_inst] = inst;
                        }
                        else
                        {
                            throw new Error('Tried to create a new instance with an already taken id "' + val._s8_adapter_inst + '"');
                        }
                    }
                    else
                    {
                        throw new Error('Tried to load an unregistered type "' + val._s8_adapter_type + '"');
                    }
                }
                else
                {
                    inst = insts[val._s8_adapter_inst];

                    if (typeof inst === 'undefined')
                    {
                        throw new Error('Tried to load an unsent instance "' + val._s8_adapter_inst + '"');
                    }
                }

                return inst;
            }
            else
            {
                return val;
            }
        });

        fn(undefined, data);
    };
};
