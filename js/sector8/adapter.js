require('../util/make_class');

sector8.adapter = function()
{
    assert(this instanceof sector8.adapter);
    
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
    
    this.encoder = function(data, fn)
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
    
    this.decoder = function(data, fn)
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