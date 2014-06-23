goog.provide('sector8.client');

goog.require('goog.functions');
goog.require('sector8.config.client');
goog.require('sector8.net');
goog.require('sector8.ui.ui');
goog.require('util.logger');
goog.require('primus');

sector8.client = function()
{
    var _this = this;
    
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
        _this.logger = new util.logger();
    };
    
    var setup_config = function()
    {
        _this.config = new sector8.config.client();
    };
    
    var setup_net = function()
    {
        var host = _this.config.primus.host;
        var port = _this.config.primus.port;
        var primus = new Primus('http://' + host + ':' + port, {});

        _this.net = new sector8.net(_this, primus);
    };
};
