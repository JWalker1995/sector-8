sector8.server.match = function(core, match)
{
    var _this = this;
    
    assert(this instanceof sector8.server.match);
    
    this.order = function(str)
    {
        var order = new sector8.order();
        if (order.from_notation(str))
        {
            var order_error = order.error_msg();
            if (order_error)
            {
                return order_error;
            }
            else
            {
                var apply_error = match.apply_order(order);
                if (apply_error)
                {
                    return apply_error;
                }
                else
                {
                    str = order.to_notation();
                    sessions.forEach(function(session)
                    {
                        session.send_order(str);
                    });
                }
            }
        }
        else
        {
            return 'Invalid order syntax';
        }
    };
};