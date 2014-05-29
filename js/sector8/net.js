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

    var callbacks = [];
    this.request = function(query, data, callback)
    {
        goog.asserts.assert(typeof data.query === 'undefined');
        data.query = query;
        
        goog.asserts.assert(typeof data.reply === 'undefined');
        var reply = callbacks.length;
        callbacks[reply] = function(reply_data) {callback(query, reply_data);};
        data.reply = reply;
        
        primus.write(data);
    };
    
    var rouge_callback;
    this.set_rouge_callback = function(callback) {rouge_callback = callback;};
    
    var on_data = function(data)
    {
        var query;
        if (typeof data.query !== 'undefined')
        {
            query = data.query;
            delete data.query;
        }
        
        if (typeof data.reply !== 'undefined')
        {
            var callback = callbacks[data.reply];
            delete data.reply;
            
            if (typeof callback === 'function')
            {
                callback(data);
            }
        }
        else
        {
            rouge_callback(query, data);
        }
    };
};
