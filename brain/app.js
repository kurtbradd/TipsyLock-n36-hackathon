
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var BaseLine = require('./BaseLine.js');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/Brain');
var	BaseLineModel = mongoose.model('BaseLine');
var baseLineDB = new BaseLineModel;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var LONG_BASELINE = 0;
var LONG_BASELINE_COUNT = 0;

var BASE = 0.05906257408130182;

var getBaseLine = false;
var baseLine = 0;
var baseLineCount = 0;

app.get('/baseLine', function (req, res) {
	console.log('starting baseline calculation');
	baseLine = 0;
	baseLineCount = 0
	getBaseLine = true;
	setTimeout(function () {
		getBaseLine = false;
		console.log('baseline calc finished');
		baseLine /= baseLineCount;
		console.log("Baseline Average: " + baseLine);
	}, 20000)
	res.send(200);
})

var getDrunkTest = false;
var drunkAverage = 0;
var drunkAverageCount = 0;

app.get('/drunktest', function (req, res) {
	console.log('starting drunktest');
	drunkAverage = 0;
	drunkAverageCount = 0
	getDrunkTest = true;
	setTimeout(function () {
		getDrunkTest = false;
		console.log('drunk test finished');
		drunkAverage /= drunkAverageCount;
		console.log("Bassline: " + BASE);
		console.log('Drunk Average: '+ drunkAverage);
		var isDrunk = (drunkAverage > BASE) ? true : false;
		console.log(isDrunk);
		res.header('Access-Control-Allow-Origin', 'http://kurtberg.com');
		res.send(200, {"drunk": isDrunk});
	}, 10000)
});

// setInterval(function() {
// 	baseLineDB.value = LONG_BASELINE;
// 	baseLineDB.save(function (err, saved_data) {
// 		console.log("saved to db");
// 	});
// }, 10*60*1000)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var osc = require('osc-min');
var socket = require('socket.io-client')('http://3332ef7a.ngrok.com');
	socket.on('connect', function(){
		console.log('connected');

		socket.on('data_buffer', function (data) {
			var avg = calculateAlpha(osc.fromBuffer(data));
			console.log(avg);
			// if (avg) {
			// 	console.log(avg);
			// }
			// if (avg) {
			// 	LONG_BASELINE += avg;
			// 	LONG_BASELINE_COUNT++
			// 	if (LONG_BASELINE_COUNT > 1) {
			// 		LONG_BASELINE /= 2;
			// 	} else {
			// 		LONG_BASELINE /= LONG_BASELINE_COUNT;
			// 	}
			// 	console.log(LONG_BASELINE);
			// }

			if (getBaseLine) {
				console.log('doing baseline test');
				var avg = calculateAlpha(osc.fromBuffer(data));
				if (avg) {
					baseLineCount++;
					baseLine += avg;
				}
			}

			else if (getDrunkTest) {
				console.log('doing drunk test');
				var avg = calculateAlpha(osc.fromBuffer(data));
				if (avg) {
					drunkAverageCount++;
					drunkAverage += avg;
				}
			}
		})

		socket.on('disconnect', function(){});
 });


function calculateAlpha (data) {
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
		// console.log('good data');
		count++;
		average = average + parseFloat(alphaData[value]);
	}
	average /= count;
	if (isNaN(average)) {
		return false;
	} else {
		return average;
	}
}