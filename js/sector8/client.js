goog.provide('sector8.client');

goog.require('goog.functions');
goog.require('sector8.config');
goog.require('sector8.net');
goog.require('sector8.ui.ui');
goog.require('util.logger');
goog.require('primus');

// Like sector8.server, really should inherit core instead of passing it as an argument and proxying it's methods
sector8.client = function()
{
    goog.asserts.assertInstanceof(this, sector8.client);
    
    var ui = new sector8.ui.ui(this);
    
    var run = function()
    {
        setup_logger();
        setup_config();
        setup_net();
        
        return ui.render();
    };
    this.run = goog.functions.cacheReturnValue(run);
    
    var setup_logger = function()
    {
        this.logger = new util.logger();
    };
    
    var setup_config = function()
    {
        this.config = new sector8.config(this);
        this.config.load('config/common.json');
        this.config.load('config/client.json');
    };
    
    var setup_net = function()
    {
        var host = this.config.primus.host;
        var port = this.config.primus.port;
        var primus = new Primus('http://' + host + ':' + port, {});

        this.net = new sector8.net(this, primus);
    };
};
