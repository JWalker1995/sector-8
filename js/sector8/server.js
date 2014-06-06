goog.provide('sector8.server');

goog.require('goog.functions');
goog.require('sector8.config');
goog.require('sector8.facade');
goog.require('sector8.user');
goog.require('sector8.map');
goog.require('sector8.session');
goog.require('util.logger');

var fs = require('fs');
var primus = require('primus');
var mysql = require('mysql');

// Like sector8.client, really should use inheritance here instead of passing core as an argument and proxying it's methods
sector8.server = function()
{
    goog.asserts.assertInstanceof(this, sector8.server);
 
    var _this = this;
    
    var run = function()
    {
        setup_logger();
        setup_config();
        setup_server();
        write_client_js();
        setup_facade();
    };
    this.run = goog.functions.cacheReturnValue(run);
    
    var setup_logger = function()
    {
        var log_path = 'log/';
        
        var trace_stream = fs.createWriteStream(log_path + 'trace_file.log', {'flags': 'a', 'encoding': 'utf8', 'mode': 0666});
        var event_stream = fs.createWriteStream(log_path + 'event_file.log', {'flags': 'a', 'encoding': 'utf8', 'mode': 0666});
        var error_stream = fs.createWriteStream(log_path + 'error_file.log', {'flags': 'a', 'encoding': 'utf8', 'mode': 0666});
        
        debugger;
        
        this.logger = new util.logger();
        
        var make_func = function(endpoint)
        {
            return function(date, info, msg)
            {
                debugger;
                var throttle_str = (info.throttles ? ' throttled ' + info.throttles + 'x' : '');
                var str = info.level_str + ' ' + info.type + throttle_str + ' at ' + date.getTime() + ' : ' + msg;
                endpoint(str);
            };
        };
        
        this.logger.update_handler('trace_file', true, [this.logger.trace], make_func(trace_stream.write));
        this.logger.update_handler('event_file', true, [this.logger.event, this.logger.alert], make_func(event_stream.write));
        this.logger.update_handler('error_file', true, this.logger.notice, make_func(error_stream.write));
        
        this.logger.update_handler('stdout', true, this.logger.trace, make_func(process.stdout.write));
        this.logger.update_handler('client', true, this.logger.notice, function(date, info, msg)
        {
            this.net.request('error', {
                'level': info.level_str,
                'time': date,
                'msg': msg,
                'type': info.type,
                'throttles': info.throttles
            });
        });
        this.logger.update_handler('email', true, this.logger.fatal, function(date, info, msg)
        {
        });
    };
    
    var setup_config = function()
    {
        this.config = new sector8.config(this);
        this.config.load('config/common.json');
        this.config.load('config/server.json');
    };
    
    var server;
    var setup_server = function()
    {
        server = primus.createServer(sector8.session.bind(sector8.session, this), this.config.primus);
    };
    
    var write_client_js = function()
    {
        var str = '';
        str += 'goog.provide(\'primus\');\n';
        str += '\n';
        str += server.library();

        fs.writeFileSync(__dirname + '/primus.js', str, 'utf-8');
    };
    
    var setup_facade = function()
    {
        var conn = mysql.createConnection(this.config.mysql);
        conn.connect(this.logger.get_reporter(this.logger.fatal, 'sector8.server.setup_mysql'));
        this.facade = new sector8.facade(_this, conn);
    };
};


/*

701
6 2
543

qrad +: hundreds of options, many effects/powers, interesting board
qrad -: slow, random
chess +: strategic, different kinds of pieces, skill
chess -: slow, boring
s8 +: fast, hundreds of options
s8 -: 


When player A loses, his territory diminishes.
    Every turn for player B, automatically claim any territory of player A touching player B's territory


Multiple players can move at the same time if their pieces aren't close.

// Move the N, NE, E, S, and SW sectors of the piece currently on b5 south in 2, 3, and 4 turns
+2-4:b5.01245:4

// Cancel the orders of all sectors of the piece on b5
:b5:

Turns: 11
Cell X: 25
Cell Y: 25
Sectors: 256
Dir: 9


Match creation options:
    Map
    Turn type (parallel, serial)
    Timer type (hourglass, per-turn, per-game)
    Shadow match (if yes, then a player can only see cells consecutive to his territory)
    Unit match (if yes, then sectoids can only move one cell on each turn)
    Spectators
    


Legendary - Spectators vote legendary or typical on matches. At end of period (week or month), match with highest vote ratio is dubbed "legendary".
Dishonorable loss - When a player leaves a game without resigning and his opponent accepting.

LN(games_played + 1) * (foreach game: stakes * (dishonorable_loss ? -1 : distance_from_last_place * (1 + legendary * 10))) / (sum_of_total_players)

*/
