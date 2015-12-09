var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor 
 
var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then substring() 
    console.log("you entered: [" + 
        d.toString().trim() + "]");
    sp.write(d, function(){
    	console.log("sent: " + d);
    });
  });

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
