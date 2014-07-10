goog.provide('sector8.session');

goog.require('goog.asserts');
goog.require('sector8.net');

//var mailer = require('nodemailer');
var bcrypt = require('bcrypt');

// Really should inherit from sector8.net
sector8.session = function(server, spark)
{
    goog.asserts.assertInstanceof(this, sector8.session);
    
    var net = new sector8.net(server, spark);
    var user;
    
    net.await('uptime', function(data, reply)
    {
        reply({'uptime': process.uptime()});
    });
    
    net.await('login', function(data, reply)
    {
        server.load_user(data.username, function(tmp_user)
        {
            var msg;
            if (data.password)
            {
                if (user_check_login(tmp_user, data.username, data.password))
                {
                    if (data.register)
                    {
                        user_set_registered(tmp_user, data.register);
                        if (tmp_user.get_registered())
                        {
                            tmp_user.save();
                        }
                    }

                    if (tmp_user.get_registered())
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
                if (!sector8.user.validate_username(data.username))
                {
                    msg = 'username invalid';
                }
                else if (tmp_user.get_username())
                {
                    msg = 'username unavailable';
                }
                else
                {
                    if (data.finish)
                    {
                        user = tmp_user;
                        user.set_username(data.username);
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
            if (user instanceof sector8.user)
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
    });

    net.await('register', function(data, reply)
    {
        if (error_else_login(reply)) {return;}

        if (!user.get_registered() && data.password && data.email)
        {
            if (sector8.user.validate_email(data.email))
            {
                var code = user_generate_registration_code(user, data.email);
                user.set_registration_code(code);
                user.save();
                var confirm_link = 'http://' + server.config.sector8.host + server.config.sector8.path + '?register=' + code;

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
                    'from': 'Sector-8 <no-reply@' + server.config.sector8.host + '>',
                    'to': user.get_username() + ' <' + data.email + '>',
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
    });

    net.await('logout', function(data, reply)
    {
        if (error_else_login(reply)) {return;}

        user.set_last_login(new Date());
        user.save();
        user = undefined;

        reply({'msg': 'logged out'});
    });

    net.await('create_match', function(data, reply)
    {
        if (error_else_login(reply)) {return;}
    });

    net.await('enter_match', function(data, reply)
    {
        if (error_else_login(reply)) {return;}
    });
    
    net.await('order', function(data, reply)
    {
        if (error_else_login(reply)) {return;}

        get_match(function(match)
        {
            match.order(data.order);
        });
    });

    net.on_close(function()
    {
        if (error_else_login(reply)) {return;}

        get_match(function(match)
        {
            match.exit(this);
        });
    });


    var error_else_login = function(reply)
    {
        return error_else(user instanceof sector8.user, reply, 'You are not logged in');
    };
    var error_else = function(cond, reply, error)
    {
        if (cond)
        {
            reply({'error': error});
            // TODO: log
        }
        return cond;
    };

    var get_match = function(reply, callback)
    {

        var match_id = user.get_match_id();
        if (error_else(match_id, reply, 'You are not currently in a match')) {return;}

        server.load_match(match_id, function(match)
        {
            if (error_else(match, reply, 'Match with id ' + match_id + ' does not exist')) {return;}
            callback(match);
        });
    };
    
    

    var user_set_password = function(user, password)
    {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        user.set_password_hash(hash);
    };
    var user_check_login = function(user, username, password)
    {
        return username === user.get_username() && bcrypt.compareSync(password, user.get_password_hash());
    };

    var user_generate_registration_code = function(user, email)
    {
        var code = '';
        code += crypto.randomBytes(16).toString('base64');
        code += ' ';
        code += Buffer(email).toString('base64');
        return code;
    };
    var user_set_registered = function(user, registration_code)
    {
        if (registration_code === user.get_registration_code())
        {
            var email = registration_code.split(' ')[1];
            user.set_email(email);
            user.set_registration_code('');
        }
    };
};
