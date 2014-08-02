util.class = function(arg1, arg2)
{
    goog.asserts.assert(typeof arg1 === 'function');
    
    var base;
    var derived;
    if (typeof arg2 === 'function')
    {
        base = arg1;
        derived = arg2;
    }
    else
    {
        base = Object;
        derived = arg1;
    }
    
    var c = function()
    {
        assert(this instanceof c);
        
        var called_super = false;
        this.super = function()
        {
            goog.asserts.assert(!called_super);
            called_super = true;
            base.apply(c, arguments);
        };
        
        derived.apply(c, arguments);
        
        delete this.super;
        
        if (!called_super)
        {
            base.apply(c, []);
        }
    };
    
    for (var key in base)
    {
        c[key] = base[key];
    }
    for (var key in derived)
    {
        c[key] = derived[key];
    }
    
    return c;
};