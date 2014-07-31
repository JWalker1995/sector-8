goog.provide('sector8.facade');

goog.require('goog.asserts');
goog.require('util.gate');

var mysql = require('mysql');

sector8.facade = function(server, conn)
{
    var _this = this;
    
    goog.asserts.assertInstanceof(this, sector8.facade);

    var report_registration = server.logger.get_reporter(server.logger.fatal, 'sector8.facade.show_columns');
    var report_load = server.logger.get_reporter(server.logger.error, 'sector8.facade.load');
    var report_save = server.logger.get_reporter(server.logger.error, 'sector8.facade.save');
    
    var models = [];
    
    var showing = 0;
    var ready_callbacks = [];
    
    this.register_type = function(type, table)
    {
        showing++;
        
        type._s8_facade = models.length;
        var model = models[models.length] = {};
        
        model.type = type;
        model.table = table;
        
        model.primaries = [];
        model.composites = [];
        model.cols = [];
        
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
                    
                    (result[i].Key === 'PRI' ? model.primaries : model.composites).push(field);
                    model.cols.push(field);
                    sets.push(field + '=?');

                    i++;
                }
                
                if (!model.primaries.length)
                {
                    report_registration('No primary key for table ' + table);
                }
                
                sets = sets.join(', ');
                model.save_query = 'INSERT INTO ' + table + ' SET ' + sets + ' ON DUPLICATE KEY UPDATE ' + sets;
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
            if (typeof inst.constructor._s8_facade !== 'number')
            {
                report_load('Tried to load an unregistered type');
                return;
            }
            
            var model = models[inst.constructor._s8_facade];
            goog.asserts.assert(model);
            
            var where = {};
            where[prop] = value;
            var query = 'SELECT * FROM ' + model.table + ' WHERE ' + create_where(where) + ' LIMIT 1';
            conn.query(query, function(err, result)
            {
                report_load(err);
                if (result && result.length)
                {
                    goog.asserts.assert(result.length === 1);
                    
                    populate(model, inst, result[0]);
                }
                callback();
            });
        };
        
        if (showing) {ready_callbacks.push(func);}
        else {func();}
    };
    
    this.load_arr = function(constructor, where, callback)
    {
        var func = function()
        {
            if (typeof constructor._s8_facade !== 'number')
            {
                report_load('Tried to load an unregistered type');
                return;
            }
            
            var model = models[constructor._s8_facade];
            goog.asserts.assert(model);
            
            var query = 'SELECT * FROM ' + model.table + ' WHERE ' + create_where(where);
            conn.query(query, function(err, result)
            {
                report_load(err);
                
                var arr = [];
                if (result)
                {
                    var i = 0;
                    while (i < result.length)
                    {
                        var inst = new constructor();
                        arr.push(inst);
                        
                        populate(model, inst, result[i]);
                        
                        i++;
                    }
                }
                callback(arr);
            });
        };
        
        if (showing) {ready_callbacks.push(func);}
        else {func();}
    };
    
    this.save = function(inst, callback)
    {
        var func = function()
        {
            if (!inst.constructor._s8_facade)
            {
                report_load('Tried to save an unregistered type');
                return;
            }
            
            var model = models[inst.constructor._s8_facade];
            goog.asserts.assert(model);
            
            var tokens = [];
            var i = 0;
            while (i < model.cols.length)
            {
                var getter_key = 'get_' + model.cols[i];
                
                if (!inst.hasOwnProperty(getter_key) && getter_key.slice(-3) === '_id')
                {
                    var inst2 = inst[getter_key.slice(0, -3)]();
                    tokens[i] = inst2 ? inst2[getter_key]() : 0;
                }
                else
                {
                    tokens[i] = inst[getter_key]();
                }
                i++;
            }
            
            debugger;
            
            conn.query(model.save_query, tokens.concat(tokens), function(err, result)
            {
                debugger;
                report_save(err);
                callback();
            });
        };
        
        if (showing) {ready_callbacks.push(func);}
        else {func();}
    };
    
    var create_where = function(where)
    {
        var eqs = [];
        for (var col in where)
        {
            var eq = mysql.escapeId(col);
            var val = where[col];
            if (val instanceof sector8.facade.expr)
            {
                eq += val.get_str();
            }
            else
            {
                eq += '=' + conn.escape(val);
            }
        }
        
        return eqs.join(' AND ');
    };
    
    var make_loader = function(inst, col, id)
    {
        var gate = new util.gate(1);
        var dirty = true;
        
        return function(callback)
        {
            if (dirty)
            {
                _this.load(inst, col, id, gate.open);
                dirty = false;
            }

            gate.pass(callback)();
        };
    };
    
    // Updates an instance based on a row returned by a mysql query
    var populate = function(model, inst, row)
    {
        var i = 0;
        while (i < model.cols.length)
        {
            var col = model.cols[i];
            var val = row[col];
            
            var setter_key = 'set_' + col;
            
            if (!inst.hasOwnProperty(setter_key) && col.slice(-3) === '_id')
            {
                var field = col.slice(0, -3);
                
                var inst2 = new inst.defaults[field]();
                inst2[setter_key](val);
                
                inst['load_' + field] = make_loader(inst2, col, val);
                
                inst['set_' + field](inst2);
            }
            else
            {
                inst[setter_key](val);
            }
            
            i++;
        }
    };
};

sector8.facade.expr = function(str)
{
    goog.asserts.assertInstanceof(this, sector8.facade.expr);
    
    this.get_str = function() {return str;}
};