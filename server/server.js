

const path = require('path');

var express = require("express");
var app = express();
var http = require('http').createServer(app);

var entityRouter = require('./entityRouter')

const port = 8111;

/**
 * Production files
 */
app.use(express.static(path.join(__dirname, 'build')));

/**
 * Entity router
 */
app.use('/', entityRouter)

// start server

http.listen(port, '0.0.0.0', () => {
    console.log("Server running on port ", port);
});

