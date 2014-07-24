goog.provide('sector8.net');

goog.require('goog.asserts');

sector8.net = function(core, spark)
{
    goog.asserts.assertInstanceof(this, sector8.net);
    
    var trace_reporter = core.logger.get_reporter(core.logger.trace, 'sector8.net');
    var notice_reporter = core.logger.get_reporter(core.logger.notice, 'sector8.net');
    
    var callbacks = {};
    var next_callback = 0;
    
    var request = function(query, data, callback)
    {
        goog.asserts.assert(typeof data.query === 'undefined');
        
        var reply = '_' + (++next_callback);
        data.query = query + ':' + reply;
        
        await(reply, callback);
        
        write_data(data);
    };
    
    var await = function(query, callback)
    {
        if (typeof callback === 'function')
        {
            trace_reporter('Awaiting query: ' + query);
            
            callbacks[query] = function(reply_query, reply_data)
            {
                callback(reply_data, function(reply_reply_data, callback)
                {
                    request(reply_query[1], reply_reply_data, callback);
                });
            };
        }
    };
    
    var write_data = function(data)
    {
        trace_reporter('Writing data: ' + JSON.stringify(data));
        
        debugger;
        spark.write(data);
    };
    
    var on_data = function(data)
    {
        trace_reporter('Received data: ' + JSON.stringify(data));
        
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
        
        notice_reporter('Received data with invalid query: ' + JSON.stringify(data));
    };
    
    var on_end = function()
    {
        trace_reporter('Closed connection');
    };
    
    this.request = request;
    this.await = await;
    this.on_close = spark.on.bind(spark, 'end');
    
    spark.on('data', on_data);
    spark.on('end', on_end);
};
