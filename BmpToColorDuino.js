//Requirements...
var pngparser = require("pngparse");
var color = require("cli-color");

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

function buildArray(buffer, colorByte, colorArray)
{
	buffer.push(startByte);
	buffer.push(colorByte);
	buffer.push(colorArray);
	buffer.push(endByte);
};

function sendImageViaI2C()
{
	//Send xxxArray via i2c to colorduino here in order of red, green, blue
	console.log(color.blue("Sending blue channel"));
	console.log(color.blue(blueArray));
};

//Load bmp file pixels...
pngparser.parseFile("./blue_four_Corners.png", function(err, data){
	if(err)
		throw err;

	function printChannel(pos, colorFunc){
		var buffer = new Array();
		for(var j = 0; j < 8; j++)
		{
			var row = "";
			for(var i = 0; i < 8; i++)
			{
				var index = j*8*4 + i*4 +pos;
				var row = row + data.data[index] + " | ";
				buffer.push(data.data[index]);
			}
			console.log(colorFunc(row));		
		}
		return buffer;
	};

	buildArray(redArray, redByte, printChannel(0, color.red));
	buildArray(greenArray, greenByte, printChannel(1, color.green));
	buildArray(blueArray, blueByte, printChannel(2, color.blue));
	printChannel(3, color.white);

	sendImageViaI2C();
});


///////////////////////////////////////////////////////////////////////