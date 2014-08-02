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
                copy(to[i], from[i]);
            }
        }
    }
};