var http = require('http');
const express = require('express');
// var nodemailer = require('nodemailer');
// const { providerEmail } = require('./keys.js');
// const { providerPassword } = require('./keys.js');
const cors = require('cors');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: providerEmail,
//         pass: providerPassword
//     }
// });

const app = express();

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

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

const authRouter = require("./routes/auth.routes")
const eventsRouter = require("./routes/event.routes");
const betsRouter = require("./routes/bet.routes");
const commentsRouter = require("./routes/comment.routes");
const usersRouter = require("./routes/user.routes");

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/comments", commentsRouter);
app.use("/events", eventsRouter);
app.use("/bets", betsRouter);
app.get("/test", function (req, res, next) {
    res.json("TEST!");
});

const PORT = process.env.PORT || 80;
const server = http.createServer(app);
server.listen(PORT);


