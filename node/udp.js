var PORT = 5001;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
// var io = require('socket.io')


server.on('listening', function () {
	var address = server.address();
	console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
	console.log(remote.address + ':' + remote.port +' - ' + message);
	// console.log(message);
	io.sockets.emit('data_string', '' + message);
	io.sockets.emit('data_buffer', message);
});

server.bind(PORT, HOST);


// var spawn = require('child_process').spawn;
// var tail_child = spawn('oscdump', ['5001']);
// tail_child.stdout.on('data', function(data){
// 	console.log(data);
// 	console.log(data.toString());
// });

var http = require('http');
var server = http.createServer().listen(8001);

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
	socket.emit('message', {'message': 'hello world'});
});

