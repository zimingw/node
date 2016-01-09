//Requirements...
var pngparser = require("pngparse");
var color = require("cli-color");
var SerialPort = require("serialport").SerialPort;

// var serialPort = new SerialPort("/dev/tty.usbserial-A50285BI", {
// 	baudrate: 115200
// });

//Constants
var startByte = 0x10;
var endByte = 0x20;
var redByte = 0x00;
var greenByte = 0x01;
var blueByte = 0x02;
var colorDuinoAddress = 0x05; //subject to change.
//Convert pixels data into
var redArray = new Array();
var greenArray = new Array();
var blueArray = new Array();
var imageArray = new Array();

function buildArray(buffer, colorByte, colorArray)
{
	buffer.push(startByte);
	buffer.push(colorByte);
	buffer.push(colorArray);
	buffer.push(endByte);
};

function sendImageViaSerial()
{

};

//Load bmp file pixels...
pngparser.parseFile("./fourCorners.png", function(err, data){
	if(err)
		throw err;

	function printImage(imgArray){
		var buffer = new Array();
		var index = 1;
		for(var j = 0; j < 8; j++)
		{
			var row = "";
			for(var i = 0; i < 8; i++)
			{
				var pixel = "[";
				for(var h=0; h<3; h++)
				{
					pixel = pixel + imgArray[index++] + ",";
				}
				pixel = pixel + "]";
				row = row + pixel;
			}
			console.log(row);	
		}
		return buffer;
	};

	function extractRGB()
	{
		var buffer = new Array();
		for(var j = 0; j < data.data.length; j++)
		{
			if((j + 1) % 4 == 0)continue;
			buffer.push(data.data[j]);
		}
		return buffer;
	}

	imageArray.push(startByte);
	imageArray = imageArray.concat(extractRGB());
	imageArray.push(endByte);

	printImage(imageArray);

	sendImageViaSerial();
});


///////////////////////////////////////////////////////////////////////