require('../util');

util.deepcopy = function(to, from, weak)
{
    for (var i in from)
    {
        if (from.hasOwnProperty(i))
        {
            var type = typeof to[i];
            if (type !== 'object')
            {
                if (!weak || type === 'undefined')
                {
                    to[i] = from[i];
                }
            }
            else
            {
                util.deepcopy(to[i], from[i], weak);
            }
        }
    }
};