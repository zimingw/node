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

function buildSendBuffer(buffer, colorByte, colorArray)
{
	buffer.push(startByte);
	buffer.push(colorByte);
	buffer = buffer.concat(colorArray);
	buffer.push(endByte);
	return buffer;
};

function sendImageViaSerial(arrayToSend)
{
	 var serialPort = new SerialPort("/dev/tty.usbserial-A50285BI", {
	 	baudrate: 57600
	 });

	 serialPort.open(function(error){
	 	if(error)
	 	{
	 		console.log(color.red(error));
	 	}
	 	else
	 	{
	 		console.log(color.green('open'));
	 		serialPort.write(arrayToSend, function(err, result){
	 			console.log(color.red(err));
	 			console.log(color.green('result: ' + result));
	 		});
	 		serialPort.close();
	 	}
	 });
};

function sendFile(imgFile)
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

		function sendBuffer(colorByte, colorArray)
		{
			var sendBuffer = new Array();
			sendBuffer = buildSendBuffer(sendBuffer, colorByte, colorArray);	
			sendImageViaSerial(sendBuffer);	
		}

		extractRGB();
		sendBuffer(redByte, redArray);
		sendBuffer(greenByte, greenArray);
		sendBuffer(blueByte, blueArray);
	});
}

var imgFile = process.argv[2];
console.log("Loading image file: " + imgFile);

glob(imgFile + "*.png", null, function (err, files){
	console.log(files);
	if(files.length == 1){
		console.log("find one file only.");
		sendFile(files[0]);
	}
	else{
		console.log("find multiple file, let's create an animation.");
		for (var i=0; i<files.length; i++){
			sendFile(files[i]);
			sleep.sleep(1);
		}
	}
});