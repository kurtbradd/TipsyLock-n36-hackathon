var http = require('http');
var fs 	= require('fs');


// LOCAL HOST TO SERVE HTML CODE
var server = http.createServer(function(req, res) {
		res.writeHead(200, { 
				'Content-type': 'text/html'});
				res.end(fs.readFileSync(__dirname + '/index.html'));
		}).listen(8080, function() {
				console.log('Listening at: 127.0.0.1 8080');
		}
);
		
var osc = require('osc-min');
var socket = require('socket.io-client')('http://3332ef7a.ngrok.com');
	socket.on('connect', function(){
		console.log('connected');
		socket.on('data_buffer', function (data) {
			calculateBaseline(osc.fromBuffer(data))
		})

		socket.on('disconnect', function(){});
 });

function calculateBaseline (data) {
	var values = data.args;	
	var alphaData = {
		value1: values[0].value,
		value2: values[1].value,
		value3: values[2].value,
		value4: values[3].value,
	}
	var average = 0;
	var count = 0;
	for (value in alphaData) {
		if (isNaN(alphaData[value])) {
			continue;
		}
		count++;
		average = average + parseFloat(alphaData[value]);
	}
	average /= count;
	console.log(average);
	return average;
}