goog.provide('sector8.adapter');

goog.require('goog.asserts');
goog.require('util.make_class');

sector8.adapter = function()
{
    goog.asserts.assertInstanceof(this, sector8.adapter);
    
    var spark_i = 0;
    var types = [];
    var insts = [];
    
    this.register_type = function(type, name)
    {
        if (typeof types[name] !== 'undefined' && types[name] !== type)
        {
            throw new Error('Registered 2 different types with the same name: "' + name + '"');
        }
        
        types[name] = type;
        type._s8_adapter_type = name;
    };
    
    this.encoder = function(data, fn)
    {
        var spark_id = get_spark_id(this);
        
        debugger;
        
        var err;
        try
        {
            data = JSON.stringify(data, function(key, val)
            {
                if (val && typeof val.constructor === 'function' && typeof val.constructor._s8_adapter_type !== 'undefined')
                {
                    // val is a registered type
                    
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
                        
                        obj = val.to_obj();
                        obj._s8_adapter_type = val.constructor._s8_adapter_type;

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
            data = JSON.parse(data, function(key, val)
            {
                if (typeof val._s8_adapter_inst === 'number')
                {
                    var inst;
                    
                    if (typeof val._s8_adapter_type !== 'undefined')
                    {
                        var type = types[val._s8_adapter_type];
                        if (typeof type !== 'undefined')
                        {
                            inst = new type();
                            inst.from_obj(val);
                            
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