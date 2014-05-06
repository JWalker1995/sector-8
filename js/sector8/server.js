var mysql_opts = {
    'host': 'localhost',
    'user': 'root',
    'password': 'G6.67e-11Cm'
};

var primus_opts = {
    'port': 7854,
    'pathname': '/socket_s8',
    'parser': 'JSON',
    'transformer': 'websockets',
    'iknowhttpsisbetter': true
};

require('/home/joel/source/closure-library/closure/goog/bootstrap/nodejs');

var primus = require('primus');
var http = require('http');
var mysql = require('mysql');

var connection = mysql.createConnection(mysql_opts);
connection.connect(function(err)
{
    if (err)
    {
        console.error('Error connecting to mysql: ' + err.stack);
    }
});


var users = {};
var User = function()
{
    if (!this instanceof User)
    {
        throw new Error('A User must be created with the new keyword');
    }

    var props = {
        'user_id': 0,
        'username': '',
        'password': '',
        'email': '',
        'in_game': 0,
        'first_login': Date,
        'last_login': Date
    };

    util.make_getters_setters(this, props);

    this.populate_from_login = function(callback)
    {
        if (connection.state === 'connected')
        {
            var login = [this.get_username(), this.get_password()];
            connection.query('SELECT * FROM sector8.users WHERE username=? AND password=? LIMIT 1', login, function(err, result)
            {
                if (!err)
                {
                    console.log(result);
                }

                callback(err.stack);
            });
        }
        else
        {
            callback('Cannot connect to database');
        }
    };

    this.save_user = function(callback)
    {
    };

    this.is_registered = function() {return !!this.get_user_id();};

    delete this.set_user_id;
    delete this.set_first_login;
    delete this.set_last_login;
};

User.from_login = function(username, password, callback)
{
    if (username in users)
    {
        return users[username];
    }
    else
    {
        var user = new User();
        user.set_username(username);
        user.set_password(password);
        user.populate_from_login(callback);
        users[username] = user;
        return user;
    }
};


var connection = function(spark)
{
    var user;
    spark.on('data', function(data)
    {
        switch (data.query)
        {
        case 'login':
            user = User.from_login(data.username, data.password, function(err)
            {
                if (err)
                {
                    spark.write({
                        'query': 'error',
                        'msg': err
                    });
                }
                if (data.reply)
                {
                    spark.write({
                        'query': data.reply,
                        'user': {
                            'username': user.get_username(),
                            'email': user.get_email(),
                            'in_game': user.get_in_game(),
                            'first_login': user.get_first_login(),
                            'last_login': user.get_last_login()
                        }
                    });
                }
            });
            break;
        }
    });
};
var server = primus.createServer(connection, primus_opts);
