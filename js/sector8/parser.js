goog.provide('sector8.parser');

goog.require('goog.asserts');

sector8.parser = function(core)
{
    this.encoder = function(data, fn)
    {
        data = JSON.stringify(data);
        if (core.config.net.enable_compression)
        {
            // TODO: compress data
        }
        fn(undefined, data);
    };
    
    this.decoder = function(data, fn)
    {
        data = JSON.parse(data);
        if (core.config.net.enable_compression)
        {
            // TODO: decompress data
        }
        fn(undefined, data);
    };
    
    // Primus defaults to encoder/decoder.toString() to write the client code (in sector8.server.write_client_js),
    // However, since the encoder and decoder use class resources (like core), this won't work,
    // So in the browser, a parser is created and passed to the primus client (in sector8.client.setup_primus),
    // And this code forwards calls to the parser instance.
    this.encoder.client = 'function() {this.options.parser.encoder.apply(this, arguments);}';
    this.decoder.client = 'function() {this.options.parser.decoder.apply(this, arguments);}';
};