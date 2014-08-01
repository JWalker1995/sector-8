goog.provide('sector8.client');

goog.require('goog.functions');
goog.require('sector8.config.client');
goog.require('sector8.adapter');
goog.require('sector8.user');
goog.require('sector8.match');
goog.require('sector8.map');
goog.require('sector8.board');
goog.require('sector8.cell');
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
        setup_adapter();
        setup_primus();
        setup_net();
        
        // TODO: Remove debug code
        window.client = _this;
        window.adapter = adapter;
        window.primus_client = primus_client;
        window.net = _this.net;
        
        return ui.render();
    };
    this.run = goog.functions.cacheReturnValue(run);
    
    var setup_logger = function()
    {
        _this.logger = new util.logger();
        
        var make_func = function(endpoint)
        {
            return function(date, info, msg)
            {
                var throttle_str = (info.throttles ? ' throttled ' + info.throttles + 'x' : '');
                var str = info.level_str + ' ' + info.reporter + throttle_str + ' at ' + date.getTime() + ' : ' + msg;
                endpoint(str);
            };
        };
        
        _this.logger.update_handler('console', true, _this.logger.trace, make_func(console.log.bind(console)));
        
        _this.logger.log(_this.logger.trace, 'Started logger');
    };
    
    var setup_config = function()
    {
        _this.logger.log(_this.logger.trace, 'Importing client config...');
        
        _this.config = new sector8.config.client();
        
        _this.logger.log(_this.logger.trace, 'Imported client config');
    };
    
    var adapter;
    var setup_adapter = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating adapter...');
        adapter = new sector8.adapter();
        _this.logger.log(_this.logger.trace, 'Created adapter');
        
        _this.logger.log(_this.logger.trace, 'Registering adapter types...');
        adapter.register_type(sector8.user, 'sector8.user', 'to_obj', 'from_obj');
        adapter.register_type(sector8.match, 'sector8.match', 'to_obj', 'from_obj');
        adapter.register_type(sector8.map, 'sector8.map', 'to_obj', 'from_obj');
        adapter.register_type(sector8.board, 'sector8.board', 'to_obj', 'from_obj');
        adapter.register_type(sector8.cell, 'sector8.cell', 'to_obj', 'from_obj');
        adapter.register_type(Date, 'Date', 'getTime', 'setTime');
        _this.logger.log(_this.logger.trace, 'Registered adapter types');
    };
    
    var primus_client;
    var setup_primus = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating primus client...');
        
        var host = _this.config.primus.host;
        var port = _this.config.primus.port;
        var config = {};
        config.parser = adapter;
        
        primus_client = new Primus('http://' + host + ':' + port, config);
        
        _this.logger.log(_this.logger.trace, 'Created primus client');
    };
    
    var setup_net = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating net...');
        
        _this.net = new sector8.net(_this, primus_client);
        
        _this.logger.log(_this.logger.trace, 'Created net');
    };
};
