goog.require('primus');

goog.provide('sector8.net');

sector8.net = function()
{
    var primus = new Primus('http://localhost', {});



    var socket;
    var to_send = [];
    var listeners = {};

    var connect = function()
    {
        socket = new goog.net.WebSocket(true, retry_connect);
        socket.listen(goog.net.WebSocket.EventType.OPENED, opened);
        socket.listen(goog.net.WebSocket.EventType.MESSAGE, receive);
        socket.open('127.0.0.1', 7854);
    };

    var retry_connect = function(tries)
    {
        var time = Math.pow(2, tries) * 1000;
        return Math.min(time, 60 * 1000);
    };

    var opened = function()
    {
        for (var i in to_send)
        {
            socket.send(to_send[i]);
        }
        to_send = [];
    };

    var receive = function(e)
    {
        var data = e.message;
        var space = data.indexOf(' ');
        var command = data.substr(0, space);
        var msg = data.substr(space + 1);

        if (command in listeners)
        {
            for (var i in listeners[command])
            {
                listeners[command][i](command, msg);
            }
        }
        else
        {
            console.warn('Received a "' + command + '" command, but no listeners registered.');
        }
    };

    var send = this.send = function(command, msg)
    {
        if (command.length >= 256)
        {
            throw new Error('sector8.net.send(): First argument (command) must be shorter than 256 characters');
        }
        if (msg.length >= 65536)
        {
            throw new Error('sector8.net.send(): Second argument (msg) must be shorter than 65536 characters');
        }

        var data = '';
        data += String.fromCharCode(command.length);
        data += String.fromCharCode(msg.length / 256);
        data += String.fromCharCode(msg.length % 256);
        data += command;
        data += msg;

        if (socket.isOpen())
        {
            socket.send(data);
        }
        else
        {
            to_send.push(data);
        }
    };

    var listen = this.listen = function(command, callback)
    {
        if (command in listeners)
        {
            listeners[command] = [callback];
        }
        else
        {
            listeners[command].push(callback);
        }
    };

    connect();
};
