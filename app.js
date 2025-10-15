var http = require('http');
const express = require('express');
const bcryptjs = require('bcryptjs');
var nodemailer = require('nodemailer');
const { providerEmail } = require('./keys.js');
const { providerPassword } = require('./keys.js');
const cors = require('cors');
const util = require('util');
// const User = require('./models/user.model.js');
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
const usersRouter = require("./routes/user.routes");
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


app.use("/users", usersRouter);
app.use('/', (req, res) => {
    res.json({ message: 'Ok' });
});

const { sequelize, User } = require('./models');


app.get('/makeuser', function(req, res) {
    (async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // use { alter: true } or migrations in production
        const user = await User.create({
        email: 'joe@example.com',
        password: 'secret', // hash this in real apps (bcryptjs available)
        firstName: 'Joe',
        lastName: 'Knowles',
        avatarUrl: '',
        balance: 100.00
        });
        console.log('Created user:', user.toJSON());
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
    })();
});

const server = http.createServer(app);
server.listen(5000);

