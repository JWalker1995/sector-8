goog.provide('sector8.user');

goog.require('util.make_getters_setters');

var user_table = 'test.users';

sector8.user = function()
{
    goog.asserts.assertInstanceof(this, sector8.user);
    
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
sector8.user.validate_username = function(username)
{
    return username.length > 0;
};
sector8.user.validate_password = function(password)
{
    return password.length > 8;
};
sector8.user.validate_email = function(email)
{
    var email_regex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
    return email_regex.test(email);
};
