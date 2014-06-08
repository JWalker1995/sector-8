goog.provide('sector8.facade');

goog.require('goog.asserts');

sector8.facade = function(server, conn)
{
    goog.asserts.assertInstanceof(this, sector8.facade);

    var report_registration = server.logger.get_reporter(server.logger.fatal, 'sector8.facade.show_columns');
    var report_load = server.logger.get_reporter(server.logger.error, 'sector8.facade.load');
    var report_save = server.logger.get_reporter(server.logger.error, 'sector8.facade.save');
    
    var types = [];
    
    var showing = 0;
    var ready_callbacks = [];
    
    this.register_type = function(type, table)
    {
        showing++;
        
        type._facade = types.length;
        var c = types[types.length] = {};
        
        c.table = table;
        c.primaries = [];
        c.composites = [];
        c.cols = [];
        
        // if conn.state === 'authenticated'
        conn.query('SHOW COLUMNS FROM ' + table, [], function(err, result)
        {
            report_registration(err);
            if (result)
            {
                var sets = [];
                
                var i = 0;
                while (i < result.length)
                {
                    var field = result[i].Field;
                    
                    (result[i].Key === 'PRI' ? c.primaries : c.composites).push(field);
                    c.cols.push(field);
                    sets.push(field + '=?');

                    i++;
                }
                
                if (!c.primaries.length)
                {
                    report_registration('No primary key for table ' + table);
                }
                
                sets = sets.join(', ');
                c.save_query = 'INSERT INTO ' + table + ' SET ' + sets + ' ON DUPLICATE KEY UPDATE ' + sets;
            }
            else
            {
                report_registration('Show columns result is empty for table ' + table);
            }
            
            showing--;
            if (!showing)
            {
                var i = 0;
                while (i < ready_callbacks.length)
                {
                    ready_callbacks[i]();
                    i++;
                }
            }
        });
    };
    
    this.load = function(inst, prop, value, callback)
    {
        var func = function()
        {
            if (!inst.constructor._facade)
            {
                report_load('Tried to load an unregistered type');
                return;
            }
            
            var c = types[inst.constructor._facade];
            goog.asserts.assert(c);
            
            var query = 'SELECT * FROM ' + c.table + ' WHERE ' + prop + '=? LIMIT 1';
            conn.query(query, [value], function(err, result)
            {
                report_load(err);
                if (result)
                {
                    var i = 0;
                    while (i < result.length)
                    {
                        for (var key in result[i])
                        {
                            inst['set_' + key](result[i][key]);
                        }
                        i++;
                    }
                }
                callback();
            });
        };
        
        if (showing) {ready_callbacks.push(func);}
        else {func();}
    };
    
    this.save = function(inst, callback)
    {
        var func = function()
        {
            if (!inst.constructor._facade)
            {
                report_load('Tried to save an unregistered type');
                return;
            }
            
            var c = types[inst.constructor._facade];
            goog.asserts.assert(c);
            
            var tokens = [];
            var i = 0;
            while (i < c.cols.length)
            {
                tokens[i] = inst['get_' + c.cols[i]]();
                i++;
            }
            
            conn.query(c.save_query, tokens, function(err, result)
            {
                report_save(err);
                debugger;
                callback();
            });
        };
        
        if (showing) {ready_callbacks.push(func);}
        else {func();}
    };
};

/*
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
    
    
    
    var load_type = function(class, cache, prop, value, callback)
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
*/