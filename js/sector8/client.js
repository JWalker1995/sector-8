goog.provide('sector8.client');

goog.require('goog.functions');
goog.require('sector8.ui.ui');
goog.require('sector8.net');
goog.require('primus');

// Like sector8.server, really should inherit core instead of passing it as an argument and proxying it's methods
sector8.client = function(core)
{
    goog.asserts.assertInstanceof(this, sector8.client);
    
    var ui = new sector8.ui.ui(this);
    
    var run = function()
    {
        setup_logger();
        setup_net();
        
        return ui.render();
    };
    this.run = goog.functions.cacheReturnValue(run);
    
    var setup_logger = function()
    {
        this.logger = core.logger;
    };
    
    var setup_net = function()
    {
        var host = 'localhost';
        var port = 7854;
        var primus = new Primus('http://' + host + ':' + port, {});

        this.net = new sector8.net(this, primus);
    };
});
