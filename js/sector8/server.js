var net = require('net');

var server = net.createServer(function (socket) {
    socket.write('Echo server\r\n');
    socket.pipe(socket);
});

server.listen(server_port, server_host);

console.log('Server running at http://' + server_host + ':' + server_port + '/');
