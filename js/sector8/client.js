goog.require('goog.functions');
require('../sector8/config/client');
require('../sector8/registry');
require('../sector8/user');
require('../sector8/match');
require('../sector8/player');
require('../sector8/map');
require('../sector8/board');
require('../sector8/cell');
require('../sector8/parser');
require('../sector8/net');
require('../sector8/ui/ui');
require('../sector8/primus');
require('../util/logger');

sector8.client = function()
{
    var _this = this;
    
    assert(this instanceof sector8.client);
    
    _this.is_master = false;
    
    var ui = new sector8.ui.ui(this);
    
    var run = function()
    {
        setup_logger();
        setup_config();
        setup_registry();
        setup_parser();
        setup_primus();
        setup_net();
        
        // TODO: Remove debug code
        window.client = _this;
        window.parser = parser;
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
    
    var registry;
    _this.registry = registry;
    var setup_registry = function()
    {
        // TODO: Move this function to a class because it is duplicated on sector8.client and sector8.server
        
        _this.logger.log(_this.logger.trace, 'Creating registry...');
        registry = new sector8.registry(_this);
        _this.logger.log(_this.logger.trace, 'Created registry');
        
        _this.logger.log(_this.logger.trace, 'Registering types...');
        
        registry.register_type('Date', Date, {
            'to_obj': 'getTime',
            'from_obj': 'setTime'
        });
        
        registry.register_type('sector8', {
            'to_obj': 'to_obj',
            'from_obj': 'from_obj'
        });
        registry.register_type('sector8.user', sector8.user, {
            'table': 'users'
        });
        registry.register_type('sector8.match', sector8.match, {
            'table': 'matches'
        });
        registry.register_type('sector8.player', sector8.player, {
            'table': 'players'
        });
        registry.register_type('sector8.map', sector8.map, {
            'table': 'maps'
        });
        registry.register_type('sector8.board', sector8.board, {
        });
        registry.register_type('sector8.cell', sector8.cell, {
        });
        
        _this.logger.log(_this.logger.trace, 'Registered types');
    };
    
    var parser;
    var setup_parser = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating parser...');
        parser = new sector8.parser(_this);
        _this.logger.log(_this.logger.trace, 'Created parser');
    };
    
    var primus_client;
    var setup_primus = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating primus client...');
        
        var host = _this.config.primus.host;
        var port = _this.config.primus.port;
        var config = {};
        config.parser = parser;
        
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
