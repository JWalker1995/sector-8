goog.provide('sector8.adapter');

goog.require('goog.asserts');
goog.require('util.make_class');

sector8.adapter = function()
{
    goog.asserts.assertInstanceof(this, sector8.adapter);
    
    var spark_i = 0;
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
    
    this.encoder = function(data, fn)
    {
        var spark_id = get_spark_id(this);
        
        var err;
        try
        {
            data = JSON.stringify(data, function(key)
            {
                // Do not use the second argument as val. For some reason, Date objects are converted to strings.
                val = this[key];
                
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
        }
        catch (e)
        {
            throw e;
            err = e;
        }
        
        fn(err, data);
    };
    
    this.decoder = function(data, fn)
    {
        var spark_id = get_spark_id(this);
        
        var err;
        try
        {
            data = JSON.parse(data, function(key)
            {
                // Do not use the second argument as val. For some reason, Date objects are converted to strings.
                val = this[key];
                
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
        }
        catch (e)
        {
            throw e;
            err = e;
        }
        
        fn(err, data);
    };
    
    // Primus defaults to encoder/decoder.toString() to write the client code (in sector8.server.write_client_js),
    // However, since the encoder and decoder use class resources (like get_spark_id), this won't work,
    // So in the browser, an adapter is created and passed to the primus client (in sector8.client.setup_primus),
    // And this code forwards calls to the adapter instance.
    this.encoder.client = 'function() {this.options.parser.encoder.apply(this, arguments);}';
    this.decoder.client = 'function() {this.options.parser.decoder.apply(this, arguments);}';
    
    var get_spark_id = function(spark)
    {
        if (typeof spark._s8_adapter_spark === 'undefined')
        {
            spark._s8_adapter_spark = spark_i++;
        }

        return spark._s8_adapter_spark;
    };
};