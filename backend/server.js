const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //ensures incoming json requests are parsed and put into the req.body

const cookieParser = require("cookie-parser");
app.use(cookieParser()); //allows cookies to be parsed into the req object

const PORT = 3500;
const server = app.listen(PORT, () => console.log(`Server connected to port ${PORT}`));

//connect to mongoDB
const connectDB = require("./db");
connectDB();

//create error handler which catches every unhandledRejection error
process.on("unhandledRejection", err=> {
    console.log(`an error occured: ${err.message}`);
    server.close(() => process.exit(1)) //logs out error + closes server w/ exit code of 1
});

//TO FIX CORS PROBLEM
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


const authRouter = require("./route/AuthRoutes");
const refreshTokenRouter = require("./route/RefreshTokenRoutes"); 
const s3Router = require("./route/s3Routes");

app.use("/api/auth",authRouter);
app.use("/api/refresh", refreshTokenRouter);
app.use("/api/s3", s3Router);

const startSocket = require("./socket/socketHandler");
startSocket(server);