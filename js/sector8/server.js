require('/home/joel/source/closure-library/closure/goog/bootstrap/nodejs');

var fs = require('fs');
var primus = require('primus');
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var email = require('nodemailer');

var sector8_opts = {
    'host': 'localhost',
    'path': '/sector8'
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

var user_table = 'test.users';

var User = function()
{
    if (!this instanceof User)
    {
        throw new Error('A User must be created with the new keyword');
    }

    var props = {
        'user_id': 0,
        'username': '',
        'password_hash': '',
        'email': '',
        'registration_code': '',
        'match_id': 0,
        'first_login': Date,
        'last_login': Date
    };

    util.make_getters_setters(this, props);


    this.get_id = this.get_user_id;

    this.populate_from = function(prop, value, callback)
    {
        var query = 'SELECT * FROM ' + user_table + ' WHERE ' + prop + '=? LIMIT 1';
        populate(query, [value], callback);
    };

    var populate = function(query, tokens, callback)
    {
        if (connection.state === 'authenticated')
        {
            connection.query(query, tokens, function(err, result)
            {
                handle_mysql_error(err);
                var success = !err && result && result[0];
                if (success)
                {
                    this.set_user_id(result[0].user_id);
                    this.set_username(result[0].username);
                    this.set_password_hash(result[0].password_hash);
                    this.set_email(result[0].email);
                    this.set_registration_code(result[0].registration_code);
                    this.set_match_id(result[0].match_id);
                    this.set_first_login(result[0].first_login);
                    this.set_last_login(result[0].last_login);
                }
                callback();
            });
        }
        else
        {
            callback();
        }
    };

    this.save = function(callback)
    {
        var query;
        if (this.get_user_id())
        {
            query = 'UPDATE ' + user_table + ' SET username=?, password_hash=?, email=?, registration_code=?, match_id=?, first_login=?, last_login=? WHERE user_id=?';
        }
        else
        {
            query = 'INSERT INTO ' + user_table + ' SET username=?, password_hash=?, email=?, registration_code=?, match_id=?, first_login=?, last_login=?, user_id=?';
        }

        if (connection.state === 'authenticated')
        {
            var tokens = [this.get_username(), this.get_password_hash(), this.get_email(), this.get_registration_code(), this.get_match_id(), this.get_first_login(), this.get_last_login(), this.get_user_id()];
            connection.query(query, tokens, function(err, result)
            {
                handle_mysql_error(err);
                if (result && result.insertId) {this.set_user_id(result.insertId);}
                callback();
            });
        }
        else
        {
            callback();
        }
    };

    this.set_password = function(password)
    {
        var salt = bcrypt.genSaltSync(bcrypt_opts.hash_rounds);
        var hash = bcrypt.hashSync(password, salt);
        this.set_password_hash(hash);
    };
    this.check_login = function(username, password)
    {
        return username === this.get_username() && bcrypt.compareSync(password, this.get_password_hash());
    };

    this.generate_registration_code = function(email)
    {
        var code = '';
        code += crypto.randomBytes(16).toString('base64');
        code += ' ';
        code += Buffer(email).toString('base64');
        return code;
    };
    this.set_registered = function(registration_code)
    {
        if (registration_code === this.get_registration_code())
        {
            var email = registration_code.split(' ')[1];
            this.set_email(email);
            this.set_registration_code('');
        }
    }

    this.get_registered = function()
    {
        return !!this.get_email();
    };
};
User.validate_username = function(username)
{
    return username.length > 5;
};
User.validate_password = function(password)
{
    return password.length > 8;
};
User.validate_email = function(email)
{
    var email_regex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
    return email_regex.test(email);
};

var Map = function()
{
    if (!this instanceof Map)
    {
        throw new Error('A Map must be created with the new keyword');
    }

    var props = {
        'map_id': 0,
        'name': '',
        'size_x': 0,
        'size_y': 0,
        'num_players': 0,
        'cells': Uint16Array,
        'creator_id': 0,
        'creation_date': Date
    };

    // Each cell: territory/unclaimed/void, permanent, prime, sectors, sector chance, sectoid chance

    util.make_getters_setters(this, props);

    this.get_id = this.get_map_id;
};

var Match = function()
{
    if (!this instanceof Match)
    {
        throw new Error('A Match must be created with the new keyword');
    }

    var props = {
        'match_id': 0,
        'name': '',
        'players': Array,
        'map_id': 0,
        'turn_type': 0,
        'timer_type': 0,
        'spectators': true,
        'moves': Uint32Array,
        'stakes': 1.0,
        'start_date': Date,
        'end_date': Date
    };

    util.make_getters_setters(this, props);

    this.get_id = this.get_match_id;
};


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
