//Requirements...
var pngparser = require("pngparse");
var color = require("cli-color");
var SerialPort = require("serialport").SerialPort;
var glob = require("glob");
var sleep = require("sleep");

//Constants
var startByte = 0x10;
var endByte = 0x20;
var redByte = 0x00;
var greenByte = 0x01;
var blueByte = 0x02;
//Convert pixels data into
var redArray = new Array();
var greenArray = new Array();
var blueArray = new Array();

function buildSendBuffer(buffer, colorByte, colorArray, index)
{
	buffer.push(startByte);
	buffer.push(index);
	buffer.push(colorByte);
	buffer = buffer.concat(colorArray);
	buffer.push(endByte);
	return buffer;
};

function sendImageViaSerial(arrayToSend)
{
	serialPort.write(arrayToSend, function(err, result){
		console.log(color.red(err));
		console.log(color.green('Sending data of size: ' + result));
		serialPort.drain(function(err){
			if(err){
				console.log(color.red(err));
				return;
			}

			console.log(color.green('Data transmitted!'));
		});
	});
};

function sendFile(imgFile, index)
{
	pngparser.parseFile(imgFile, function(err, data){
		if(err)
			throw err;

		function printImage(imgArray, colorFunc){
			var index = 1;
			for(var j = 0; j < 8; j++)
			{
				var row = "";
				for(var i = 0; i < 8; i++)
				{
					var pixel = "[" + imgArray[j*8 + i] + "]";
					row = row + pixel;
				}
				console.log(colorFunc(row));	
			}
		};

		function extractRGB()
		{
			redArray = [];
			greenArray = [];
			blueArray = [];

			for(var j = 0; j < data.data.length; j++)
			{
				if ((j + 4) % 4 == 0)//red channel
					redArray.push(data.data[j]);
				else if ((j + 3) % 4 == 0)//green channel
					greenArray.push(data.data[j]);
				else if ((j + 2) % 4 == 0)//blue channel
					blueArray.push(data.data[j]);
			}
			printImage(redArray, color.red);
			printImage(greenArray, color.green);
			printImage(blueArray, color.blue);
		}

		function sendBuffer(colorByte, colorArray, index)
		{
			console.log("Sending channel of (" + index + ") color: " + colorByte);
			var sendBuffer = new Array();
			sendBuffer = buildSendBuffer(sendBuffer, colorByte, colorArray, index);	
			sendImageViaSerial(sendBuffer);	
		}

		extractRGB();
		sendBuffer(redByte, redArray, index);
		sendBuffer(greenByte, greenArray, index);
		sendBuffer(blueByte, blueArray, index);
	});
}

var imgFile = process.argv[2];
console.log("Loading image file: " + imgFile);

var serialPort = new SerialPort("/dev/tty.usbserial-A50285BI", {
	baudrate: 57600
}, false);

serialPort.open(function(error){
	if(error){
		console.log(color.red(error));
	}
	else{
		console.log(color.green('open'));

	    serialPort.on('data', function(data) {
      		console.log(color.blue('data received: ' + data));
    	});

		glob(imgFile + "*.png", null, function (err, files){
			console.log(files);
			if(files.length == 1){
				console.log("find one file only.");
				sendFile(files[0], 0);
			}
			else{
				console.log("find multiple file, let's create an animation.");
				for (var i=0; i<files.length; i++){
					console.log("sending " + files[i]);
					sendFile(files[i], i);
					sleep.sleep(2);
				}
			}
		});
	}
});


