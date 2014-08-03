require('../sector8');

require('../util/assert');

sector8.registry = function()
{
    util.assert(this instanceof sector8.registry);
    
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
                    util.fail();
            }
        }
        
        util.assert(typeof name === 'string');
        util.assert(typeof type === 'function');
        util.assert(typeof props === 'object');
        
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