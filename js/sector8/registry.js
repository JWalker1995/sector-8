sector8.registry = function()
{
    assert(this instanceof sector8.registry);
    
    var types = {};
    
    this.register_type = function(name, type, props)
    {
        if (typeof props === 'undefined')
        {
            switch (typeof type)
            {
                case 'object':
                    props = type;
                    type = function() {};
                    break;
                
                case 'function':
                    props = {};
                    break;
                
                default:
                    goog.asserts.fail();
            }
        }
        
        goog.asserts.assert(typeof name === 'string');
        goog.asserts.assert(typeof type === 'function');
        goog.asserts.assert(typeof props === 'object');
        
        if (types.hasOwnProperty(name) && types[name] !== type)
        {
            throw new Error('Registered 2 different types with the same name: "' + name + '"');
        }
        
        props.type = type;
        props.name = name;
        types[name] = props;
        type._s8_registry = props;
        
        var parts = name.split('.');
        var i = 0;
        var c = parts.length - 1;
        while (i < c)
        {
            var base = parts.slice(0, i).join('.');
            if (types.hasOwnProperty(base))
            {
                util.deepcopy(props, types[base], true);
            }
            
            i++;
        }
    };
    
    this.get_props = function(inst)
    {
        if (1
            && inst
            && typeof inst.constructor === 'function'
            && typeof inst.constructor._s8_registry !== 'undefined'
            && types.hasOwnProperty(inst.constructor._s8_registry)
           )
        {
            return types[inst.constructor._s8_registry];
        }
    };
};