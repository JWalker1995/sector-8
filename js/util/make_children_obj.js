require('../util');

util.make_children_obj = function(el)
{
    var obj = {};
    
    var add_el = function(el)
    {
        if (el.className) {obj[el.className] = el;}
        
        var children = el.childNodes;
        if (children && children.length)
        {
            var i = 0;
            while (i < children.length)
            {
                add_el(children[i]);
                i++;
            }
        }
    };
    
    add_el(el);
    return obj;
};