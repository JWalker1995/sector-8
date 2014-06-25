goog.provide('util.gate');

util.gate = function(times)
{
    if (typeof times !== 'number') {times = 1;}
    
    var funcs = [];
    
    this.open = function()
    {
        times--;
        if (!times)
        {
            var i = 0;
            while (i < funcs.length)
            {
                funcs[i]();
                i++;
            }
        }
    };
    
    this.pass = function(func)
    {
        if (times)
        {
            return function()
            {
                var f = func.apply.bind(func, null, arguments);
                if (times)
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
};