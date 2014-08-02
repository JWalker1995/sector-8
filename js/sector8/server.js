goog.provide('sector8.server');

goog.require('goog.asserts');
goog.require('goog.functions');

goog.require('sector8.config.client');
goog.require('sector8.config.server');
goog.require('sector8.facade');
goog.require('sector8.registry');
goog.require('sector8.user');
goog.require('sector8.match');
goog.require('sector8.player');
goog.require('sector8.map');
goog.require('sector8.board');
goog.require('sector8.cell');
goog.require('sector8.parser');
goog.require('sector8.session');
goog.require('util.make_class');
goog.require('util.logger');
goog.require('util.gate');

var fs = require('fs');
var primus = require('primus');
var mysql = require('mysql');
var shell = require('child_process');

sector8.server = function(cd)
{
    var _this = this;
    
    goog.asserts.assertInstanceof(this, sector8.server);
    
    _this.is_master = true;
    
    var ready_gate;

    var run = function()
    {
        ready_gate = new util.gate(1);

        setup_logger();
        _this.logger.log(_this.logger.info, 'Server is starting...');

        setup_config();
        setup_registry();
        setup_parser();
        setup_primus();
        setup_facade();
        setup_caches();

        write_primus();
        write_css_config();
        compile();

        load_challenges();

        ready_gate.open();

        ready_gate.run(function()
        {
            _this.logger.log(_this.logger.info, 'Server is ready!!!');
        });
    };
    this.run = goog.functions.cacheReturnValue(run);

    var setup_logger = function()
    {
        var log_path = 'log/';
        
        var trace_stream = fs.createWriteStream(log_path + 'trace_file.log', {'flags': 'a', 'encoding': 'utf8', 'mode': 0666});
        var event_stream = fs.createWriteStream(log_path + 'event_file.log', {'flags': 'a', 'encoding': 'utf8', 'mode': 0666});
        var error_stream = fs.createWriteStream(log_path + 'error_file.log', {'flags': 'a', 'encoding': 'utf8', 'mode': 0666});
        
        var gate = new util.gate(3);
        trace_stream.on('open', gate.open);
        event_stream.on('open', gate.open);
        error_stream.on('open', gate.open);
        
        _this.logger = new util.logger();
        
        var spaces = Array(1025).join(' ');
        var pad_str = function(str, len)
        {
            var prepend = len < 0;
            
            str += '';
            var add = (prepend ? -len : len) - str.length;
            
            if (add > 0)
            {
                goog.asserts.assert(add < spaces.length);
                
                var pend = spaces.slice(0, add);
                if (prepend)
                {
                    str = pend + str;
                }
                else
                {
                    str = str + pend;
                }
            }
            
            return str;
        };
        
        var make_func = function(endpoint)
        {
            var last_time = (new Date()).getTime();
            
            return function(date, info, msg)
            {
                var level_str = pad_str(info.level_str, 8);
                var throttle_str = (info.throttles ? ' throttled ' + info.throttles + 'x' : '');
                var time = date.getTime();
                var str = level_str + ' ' + info.reporter + throttle_str + ' at ' + time + ' (+' + pad_str(time - last_time, -4) + ') : ' + msg;
                last_time = time;
                endpoint(str);
            };
        };
        
        _this.logger.update_handler('trace_file', true, [_this.logger.trace], make_func(gate.pass(trace_stream.write.bind(trace_stream))));
        _this.logger.update_handler('event_file', true, [_this.logger.event, _this.logger.alert], make_func(gate.pass(event_stream.write.bind(event_stream))));
        _this.logger.update_handler('error_file', true, _this.logger.notice, make_func(gate.pass(error_stream.write.bind(error_stream))));
        
        _this.logger.update_handler('stdout', true, _this.logger.trace, make_func(process.stdout.write.bind(process.stdout)));
        _this.logger.update_handler('client', true, _this.logger.notice, function(date, info, msg)
        {
            /*
            _this.net.request('error', {
                'level': info.level_str,
                'time': date,
                'msg': msg,
                'type': info.type,
                'throttles': info.throttles
            });
            */
        });
        _this.logger.update_handler('email', true, _this.logger.fatal, function(date, info, msg)
        {
        });
        
        _this.logger.update_handler('exit', true, _this.logger.fatal, process.exit.bind(process, 1));

        ready_gate.close();
        gate.run(ready_gate.open);
        
        _this.logger.log(_this.logger.trace, 'Started logger');
    };
    
    var setup_config = function()
    {
        _this.logger.log(_this.logger.trace, 'Importing server config...');
        
        _this.config = new sector8.config.server();
        
        _this.logger.log(_this.logger.trace, 'Imported server config');
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
    
    var primus_server;
    var setup_primus = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating primus server...');
        
        var config = _this.config.primus;
        config.parser = parser;
        
        primus_server = primus.createServer(function(spark)
        {
            return new sector8.session(_this, spark);
        }, config);
        
        _this.logger.log(_this.logger.trace, 'Created primus server');
    };
    
    var setup_facade = function()
    {
        _this.logger.log(_this.logger.trace, 'Creating mysql connection...');
        var conn = mysql.createConnection(_this.config.mysql);
        
        _this.logger.log(_this.logger.trace, 'Connecting to mysql server...');
        conn.connect(_this.logger.get_reporter(_this.logger.fatal, 'sector8.server.setup_mysql'));
        
        _this.logger.log(_this.logger.trace, 'Reading sql init scripts...');
        var init_sql = fs.readFileSync(_this.config.sql_init_path);
        
        _this.logger.log(_this.logger.trace, 'Executing sql init scripts...');
        var reporter = _this.logger.get_reporter(_this.logger.fatal, 'sector8.server.setup_facade');
        conn.query(init_sql.toString(), [], reporter);
        
        _this.logger.log(_this.logger.trace, 'Creating facade...');
        _this.facade = new sector8.facade(_this, conn);
        _this.logger.log(_this.logger.trace, 'Created facade');
        
        _this.logger.log(_this.logger.trace, 'Registering facade types...');
        // TODO: combine with facade
        _this.facade.register_type(sector8.user, 'users');
        _this.facade.register_type(sector8.match, 'matches');
        _this.facade.register_type(sector8.map, 'maps');
        _this.logger.log(_this.logger.trace, 'Registered facade types');
    };
    
    var setup_caches = function()
    {
    };
    
    var write_primus = function()
    {
        _this.logger.log(_this.logger.trace, 'Writing client js...');
        
        var str = '';
        str += '// Autogenerated by js/sector8/server.js';
        str += '\n';
        str += '\n';
        str += 'goog.provide(\'primus\');\n';
        str += '\n';
        str += primus_server.library();

        fs.writeFileSync(cd + '/js/sector8/primus.js', str);
        
        _this.logger.log(_this.logger.trace, 'Wrote client js');
    };
    
    var write_css_config = function()
    {
        _this.logger.log(_this.logger.trace, 'Importing client config...');
        
        var client_config = new sector8.config.client();
        
        _this.logger.log(_this.logger.trace, 'Imported client config');

        _this.logger.log(_this.logger.trace, 'Writing client css...');
        
        var str = '';
        str += '// Autogenerated by js/sector8/server.js';
        str += '\n';
        str += '\n';
        
        var write_prop = function(key, val)
        {
            if (typeof val === 'number')
            {
                str += '$' + key + ': ' + val + 'px;\n';
            }
            else
            {
                str += '$' + key + ': "' + val.replace(/[\\"']/g, '\\$&') + '";\n';
            }
        };

        for (var key in client_config.includes)
        {
            write_prop(key, client_config.includes[key]);
        }

        str += '\n';

        for (var key in client_config.geometry)
        {
            write_prop(key, client_config.geometry[key]);
        }

        fs.writeFileSync(cd + '/css/config.scss', str);
        
        _this.logger.log(_this.logger.trace, 'Wrote client css');
    };

    var get_compile_config = function()
    {
        return {
            'public/bundle.js': [
                'python',
                'js/closure-library/closure/bin/build/closurebuilder.py',
                '--root=js/closure-library/',
                '--root=js/util/',
                '--root=js/sector8/',
                '--namespace=goog.dom',
                '--namespace=sector8.client',
                '--output_mode=script',
                '--compiler_jar="' + _this.config.google_closure_compiler_path + '"',
                '--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS"',
                '--output_file={tmp_path}'
            ],
            'public/bundle.css': [
                'sass',
                '--scss',
                '--update',
                'css/main.scss:{tmp_path}'
            ]
        };
    }

    var compile = function()
    {
        _this.logger.log(_this.logger.trace, 'Compiling...');

        var compile_config = get_compile_config();

        for (var dest in compile_config)
        {
            compile_item(dest, compile_config[dest]);
        }
    };

    var compile_item = function(dest, args)
    {
        ready_gate.close();

        var tmp_path = _this.config.tmp_dir_path + '/sector8_' + dest.replace(/[^a-zA-Z0-9_]/g, '_');

        var i = 0;
        while (i < args.length)
        {
            args[i] = args[i].replace(/\{tmp_path\}/g, tmp_path);
            i++;
        }

        _this.logger.log(_this.logger.trace, 'Spawning ' + dest + ' compiler...');

        var command = args.shift();
        shell.execFile(command, args, {}, function(error, stdout, stderr)
        {
            if (error)
            {
                _this.logger.log(_this.logger.fatal, 'Could not compile ' + dest + ': ' + error.toString());
            }
            else
            {
                _this.logger.log(_this.logger.trace, 'Compiled ' + dest);
                check_compiled(dest, tmp_path);
                publish_compiled(dest, tmp_path);
                ready_gate.open();
            }
        });

        _this.logger.log(_this.logger.trace, 'Spawned ' + dest + ' compiler');
    };

    var check_compiled = function(dest, path)
    {
        _this.logger.log(_this.logger.trace, 'Reading compiled ' + dest + ' from ' + path + ' ...');
        var contents = fs.readFileSync(path).toString();
        _this.logger.log(_this.logger.trace, 'Read compiled ' + dest);

        _this.logger.log(_this.logger.trace, 'Checking compiled ' + dest + '...');

        var bad = false;

        var blacklist = _this.config.check_compiled_blacklist;
        var i = 0;
        while (i < blacklist.length)
        {
            if (contents.indexOf(blacklist[i]) !== -1)
            {
                _this.logger.log(_this.logger.fatal, 'Compiled ' + dest + ' contains blacklisted string "' + blacklist[i] + '"');
                bad = true;
            }
            i++;
        }

        _this.logger.log(_this.logger.trace, 'Checked compiled ' + dest);
    };

    var publish_compiled = function(dest, path)
    {
        _this.logger.log(_this.logger.trace, 'Publishing compiled ' + dest + ' from ' + path + ' ...');

        ready_gate.close();

        fs.rename(path, dest, function (err)
        {
            if (err)
            {
                _this.logger.log(_this.logger.fatal, 'Could not publish ' + dest + ' from ' + path + ' : ' + error.toString());
            }
            else
            {
                _this.logger.log(_this.logger.trace, 'Published ' + dest);
                ready_gate.open();
            }
        });
    };

    
    var users = {};
    this.load_user = function(username, callback)
    {
        if (users.hasOwnProperty(username))
        {
            callback(users[username]);
        }
        else
        {
            var user = new sector8.user();
            _this.facade.load(user, {'username': username}, callback.bind(null, user));
            users[username] = user;
        }
    };
    
    
    var challenges;
    var challenges_gate = new util.gate(1);
    
    var load_challenges = function()
    {
        challenges = util.make_class([sector8.match]);
        _this.facade.load_arr(sector8.match, {
            'start_date': new sector8.facade.expr(' IS NULL'),
            'end_date': new sector8.facade.expr(' IS NULL')
        }, function(arr)
        {
            goog.asserts.assert(challenges.length === 0);

            var i = 0;
            while (i < arr.length)
            {
                challenges.set(i, arr[i]);
                i++;
            }
            
            challenges_gate.open();
        });
    };
    
    this.create_challenge = challenges_gate.pass(function(match, reply)
    {
        match.set_match_id(0);
        //match.set_start_date(null);// TODO: uncomment
        match.set_end_date(null);
        match.set_players([]);
        match.set_orders('');
        match.set_board(match.get_map().get_board());
        
        _this.facade.save(match, reply.bind(null, {'msg': 'Successfully created a new match'}));
        
        match.watch(challenges);
        
        challenges.set(challenges.length, match);
    });
    
    this.watch_challenges = challenges_gate.pass(function(data, reply)
    {
        challenges.watch(reply);
    });
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
