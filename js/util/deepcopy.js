goog.provide('util.deepcopy');

util.deepcopy = function(to, from)
{
    for (var i in from)
    {
        if (from.hasOwnProperty(i))
        {
            if (typeof to[i] !== 'object')
            {
                to[i] = from[i];
            }
            else
            {
                copy(to[i], from[i]);
            }
        }
    }
};