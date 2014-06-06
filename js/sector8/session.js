goog.provide('sector8.session');

goog.require('goog.asserts');
goog.require('sector8.net');

var email = require('nodemailer');

// Really should inherit from sector8.net
sector8.session = function(server, spark)
{
    goog.asserts.assertInstanceof(this, sector8.session);
    
    var net = new sector8.net(spark);
    var user;
    
    net.await('uptime', function(data, reply)
    {
        reply({'uptime': process.uptime()});
    });
    
    net.await('login', function(data, reply)
    {
        var tmp_user = load_class(User, 'username', data.username, function()
        {
            var msg;
            if (data.password)
            {
                if (tmp_user.check_login(data.username, data.password))
                {
                    if (data.register)
                    {
                        tmp_user.set_registered(data.register);
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
                if (!User.validate_username(data.username))
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
    });

    net.await('register', function(data, reply)
    {
        if (user instanceof User && !user.get_registered() && data.password && data.email)
        {
            if (User.validate_email(data.email))
            {
                var code = user.generate_registration_code(data.email);
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
    });

    net.await('create_match', function(data, reply)
    {
        if (user instanceof User)
        {

        }
    });

    net.await('enter_match', function(data, reply)
    {
        if (user instanceof User)
        {

        }
    });
};
