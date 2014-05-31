goog.provide('sector8.server');

goog.require('goog.functions');
goog.require('sector8.core');
goog.require('sector8.user');
goog.require('sector8.map');

sector8.server = function(core)
{
    var run = function()
    {
        setup_logger();
    };
    this.run = goog.functions.cacheReturnValue(run);
    
    var setup_logger = function()
    {
        var log_path = 'log/';
        
        var fs = require('fs');
        var trace_stream = fs.createWriteStream(log_path + 'trace_file.log', {'flags': 'a', 'mode': 0666});
        var event_stream = fs.createWriteStream(log_path + 'event_file.log', {'flags': 'a', 'mode': 0666});
        var error_stream = fs.createWriteStream(log_path + 'error_file.log', {'flags': 'a', 'mode': 0666});
        
        var logger = core.logger;
        
        var make_func = function(endpoint)
        {
            return function(level, time, info, msg)
            {
                var throttle_str = (info.throttles ? ' throttled ' + info.throttles + 'x' : '');
                var str = logger.get_level_str(level) + ' ' + info.errno + throttle_str + ' at ' + time.getTime() + ' : ' + msg;
                endpoint(str);
            };
        };
        
        logger.update_handler('trace_file', true, [logger.trace], make_func(trace_stream.write));
        logger.update_handler('event_file', true, [logger.event, logger.alert], make_func(event_stream.write));
        logger.update_handler('error_file', true, logger.notice, make_func(error_stream.write));
        
        logger.update_handler('stdout', true, logger.trace, make_func(process.stdout.write));
        logger.update_handler('client', true, logger.notice, function(level, time, info, msg)
        {
            this.net.request('error', {
                'level': level,
                'time': time,
                'msg': msg,
                'errno': info.errno,
                'throttles': info.throttles
            });
        });
        logger.update_handler('email', true, logger.fatal, function(level, time, info, msg)
        {
        });
    };
};

var fs = require('fs');
var primus = require('primus');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var email = require('nodemailer');

var sector8_opts = {
    'host': 'localhost',
    'path': '/sector8',
    'debug': 4 // 0:none, 1:errors, 2:warnings, 3:notices, 4:messages
};

var bcrypt_ops = {
    'hash_rounds': 12
};

var mysql_opts = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': ''
};

var primus_opts = {
    'port': 7854,
    'pathname': '/sector8_socket',
    'parser': 'JSON',
    'transformer': 'websockets',
    'iknowhttpsisbetter': true
};


var handle_mysql_error = function(err)
{
};
var connection = mysql.createConnection(mysql_opts);
connection.connect(handle_mysql_error);
//connection.end();



var load_class = function(Class, prop, value, callback)
{
    if (typeof Class.cache === 'undefined')
    {
        Class.cache = {'id': {}};
    }

    var id_cache = Class.cache['id'];
    var prop_cache = Class.cache[prop];
    if (typeof prop_cache === 'undefined')
    {
        prop_cache = Class.cache[prop] = {};
    }

    var prop_inst = prop_cache[value];
    if (typeof prop_inst === 'undefined' && prop_inst['get_' + prop]() === value)
    {
        prop_inst = new Class();
        prop_inst.populate_from(prop, value, callback);

        var id_inst = id_cache[prop_inst.get_id()];
        if (typeof id_inst === 'undefined')
        {
            id_cache[prop_inst.get_id()] = prop_inst;
        }
        else
        {
            delete prop_inst;
            prop_inst = id_inst;
        }

        prop_cache[prop] = prop_inst;
    }
    else
    {
        callback();
    }

    return prop_inst;
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
    Spectators
    


Legendary - Spectators vote legendary or typical on matches. At end of period (week or month), match with highest vote ratio is dubbed "legendary".
Dishonorable loss - When a player leaves a game without resigning and his opponent accepting.

LN(games_played + 1) * (foreach game: stakes * (dishonorable_loss ? -1 : distance_from_last_place * (1 + legendary * 10))) / (sum_of_total_players)

*/


var Session = function(spark)
{
    var user;

    var queries = {};
    spark.on('data', function(obj)
    {
        var reply = function(reply_obj)
        {
            reply_obj.query = obj.query + '_reply';
            spark.write(reply_obj);
        };

        var func = queries[obj.query];
        if (typeof func === 'function')
        {
            func(obj, reply);
        }
        else
        {
            reply({'error': 'Invalid query "' + obj.query + '"'});
        }
    });


    queries.uptime = function(obj, reply)
    {
        reply({'uptime': process.uptime()});
    };
    
    queries.login = function(obj, reply)
    {
        var tmp_user = load_class(User, 'username', obj.username, function()
        {
            var msg;
            if (obj.password)
            {
                if (tmp_user.check_login(obj.username, obj.password))
                {
                    if (obj.register)
                    {
                        tmp_user.set_registered(obj.register);
                        if (tmp_user.get_registered())
                        {
                            tmp_user.save();
                        }
                    }

                    if (obj.get_registered())
                    {
                        user = tmp_user;
                        user.set_last_login(new Date());
                        user.save();

                        msg = 'user logged in';
                    }
                    else
                    {
                        msg = 'email not validated';
                    }
                }
                else
                {
                    msg = 'login incorrect';
                }
            }
            else
            {
                if (!User.validate_username(obj.username))
                {
                    msg = 'username invalid';
                }
                else if (tmp_user.get_username())
                {
                    msg = 'username unavailable';
                }
                else
                {
                    if (obj.finish)
                    {
                        user = tmp_user;
                        user.set_username(obj.username);
                        user.set_first_login(new Date());
                        user.set_last_login(new Date());
                        user.save();

                        msg = 'guest logged in';
                    }
                    else
                    {
                        msg = 'username available';
                    }
                }
            }

            var user_json;
            if (user instanceof User)
            {
                user_json = {
                    'username': user.get_username(),
                    'email': user.get_email(),
                    'registered': user.get_registered(),
                    'match_id': user.get_match_id(),
                    'first_login': user.get_first_login(),
                    'last_login': user.get_last_login()
                };
            }
            else
            {
                user_json = false;
            }

            reply({'msg': msg, 'user': user_json});
        });
    };

    queries.register = function(obj, reply)
    {
        if (user instanceof User && !user.get_registered() && obj.password && obj.email)
        {
            if (User.validate_email(obj.email))
            {
                var code = user.generate_registration_code(obj.email);
                user.set_registration_code(code);
                user.save();
                var confirm_link = 'http://' + sector8_opts.host + sector8_opts.path + '?register=' + code;

                var html = '';
                html += '<html>';
                    html += '<body>';
                        html += '<h3>Welcome to Sector-8</h3>';
                        html += '<a href="' + confirm_link + '">Click here to confirm your registration</a>';
                    html += '</body>';
                html += '</html>';

                var text = '';
                text += 'Welcome to Sector-8\n';
                text += 'Go to this link to confirm your registration: ' + confirm_link + '\n';

                email_transport.sendMail({
                    'from': 'Sector-8 <no-reply@' + sector8_opts.host + '>',
                    'to': user.get_username() + ' <' + obj.email + '>',
                    'subject': 'Sector-8 Registration Confirmation',
                    'html': html,
                    'text': text
                }, function(err, resp)
                {
                    if (err)
                    {
                        reply({'error': err.message});
                    }
                    else
                    {
                        reply({'msg': 'email sent'});
                    }
                });
            }
            else
            {
                reply({'msg': 'email invalid'});
            }
        }
    };

    queries.logout = function(obj, reply)
    {
        var msg;
        if (user instanceof User)
        {
            user.set_last_login(new Date());
            user.save();
            user = undefined;

            msg = 'logged out';
        }
        else
        {
            msg = 'not logged in';
        }

        reply({'msg': msg});
    };

    queries.create_match = function(obj, reply)
    {
        if (user instanceof User)
        {

        }
    };

    queries.enter_match = function(obj, reply)
    {
        if (user instanceof User)
        {

        }
    };
};

var server = primus.createServer(Session, primus_opts);

var str = '';
str += 'goog.provide(\'primus\');\n';
str += '\n';
str += server.library();

fs.writeFileSync(__dirname + '/primus.js', str, 'utf-8');
