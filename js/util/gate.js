goog.provide('util.gate');

util.gate = function(opens)
{
    if (typeof opens !== 'number') {opens = 1;}
    
    var funcs = [];
    
    this.open = function()
    {
        opens--;
        if (opens < 0) {opens = 0;}
        if (opens === 0)
        {
            var i = 0;
            while (i < funcs.length)
            {
                funcs[i]();
                i++;
            }
            funcs = [];
        }
    };

    this.close = function()
    {
        opens++;
    };

    // Wraps func so that calls to it will be delayed until open is called the specified number of times.
    // Guarantees that call order will be preserved
    this.pass = function(func)
    {
        if (opens)
        {
            return function()
            {
                var f = func.apply.bind(func, null, arguments);
                if (opens)
                {
                    funcs.push(f);
                }
                else
                {
                    f();
                }
            };
        }
        else
        {
            return func;
        }
    };

    this.run = function(func)
    {
        return this.pass(func)();
    };
};