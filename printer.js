const escpos = require('escpos');
escpos.USB = require('escpos-usb');

function openDrawer() {
    return (escpos.findPrinter());

// 	const device 	= new escpos.USB(0x0416, 0x5011);
// 	var printer 	= new escpos.Printer(device);

// 	printer.cashdraw();
}

module.exports = {
	openDrawer: openDrawer
};