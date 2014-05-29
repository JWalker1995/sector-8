goog.require('goog.asserts');
goog.require('primus');

goog.provide('sector8.net');

sector8.net = function()
{
    var primus;
    
    this.connect = function(host, port)
    {
        primus = new Primus('http://' + host + ':' + port, {});

        primus.on('data', on_data);
    };

    var callbacks = {};
    var next_callback = 0;
    
    var request = function(query, data, callback)
    {
        goog.asserts.assert(typeof data.query === 'undefined');
        
        var reply = '_' + (++next_callback);
        data.query = query + ':' + reply;
        
        await(reply, callback);
        
        primus.write(data);
    };
    
    var await = function(reply, callback)
    {
        callbacks[reply] = function(reply_query, reply_data)
        {
            callback(reply_data, function(reply_reply_data, callback)
            {
                request(reply_query[1], reply_reply_data, callback);
            });
        };
    };
    
    var on_data = function(data)
    {
        if (typeof data.query !== 'undefined')
        {
            var query = data.query.split(':', 2);
            var callback = callbacks[query[0]];
            if (typeof callback === 'function')
            {
                delete data.query;
                callback(query, data);
                return;
            }
        }
        
        console.error('Received data with invalid query: ', data);
    };

    this.request = request;
    this.await = await;
};
