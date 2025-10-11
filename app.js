var http = require('http');
const express = require('express');
const bcryptjs = require('bcryptjs');
var nodemailer = require('nodemailer');
const { providerEmail } = require('./keys.js');
const { providerPassword } = require('./keys.js');
const cors = require('cors');
const util = require('util');
const User = require('./models/user.js');
const SALT = 10;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: providerEmail,
        pass: providerPassword
    }
});

// dbConnect();

const app = express();

const eventsRouter = require("./routes/event.routes");
const betRouter = require("./routes/bet.routes");
const usersRouter = require("./routes/users.routes");
const posRouter = require("./routes/pos.routes");
const { stat } = require('fs');

const corsOptions = {
    'allowedHeaders': ['Content-Type'],
    'exposedHeaders': ['Content-Type'],
    'origin': '*',
    'methods': 'GET,PUT,POST,DELETE',
    'preflightContinue': false
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(fileUpload());

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.use("/backend/products", productsRouter);
app.use("/backend/deliveries", deliveriesRouter);
app.use("/backend/customers", customersRouter);
app.use("/backend/addresses", addressesRouter);
app.use("/backend/orders", ordersRouter);
app.use("/backend/pos", posRouter);

app.use("/backend/users", usersRouter);

app.post('/backend/openCashDrawer', function(req, res) {
	try {
	    res.json(printer.openDrawer());
// 		printer.openDrawer(req);
	} catch(err) {
		throw 'Error opening Drawer: ' + err;
	}
});

const server = http.createServer(app);
server.listen();

