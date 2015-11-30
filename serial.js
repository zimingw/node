var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
 
var sp = new SerialPort("/dev/tty.usbserial-A50285BI", {
	baudrate: 115200,
  	parser: serialport.parsers.readline("\n")
});

sp.on("open", function(){
	console.log('open');
	sp.on('data', function(data){
		console.log('data received: ' + data);
	});
});
