goog.provide('sector8.classloader');

sector8.classloader = function(db)
{
    if (!(this instanceof sector8.classloader))
    {
        throw new Error('A sector8.classloader must be created with the new keyword');
    }

    if (!(this instanceof sector8.db))
    {
        throw new Error('sector8.classloader(): First argument must be of type sector8.db');
    }

    var load_class = function(class, cache, prop, value, callback)
    {
        var id_cache = cache['id'];
        var prop_cache = cache[prop];
        if (typeof prop_cache === 'undefined')
        {
            prop_cache = cache[prop] = {};
        }

        var prop_inst = prop_cache[value];
        if (typeof prop_inst === 'undefined' && prop_inst['get_' + prop]() === value)
        {
            prop_inst = new class();
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


    var user_id_cache = {};
    var user_username_cache = {};

    this.load_user_by_username = function(username, callback)
    {
        load_class(sector8.user, user_cache, 'username', username, callback);
    };
};




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
