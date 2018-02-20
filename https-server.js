#! /usr/bin/env node

var https = require('https');
var fs = require('fs');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
var serve = serveStatic("./");
var child_process = require('child_process');


// var nodeRootFolder = child_process.execSync(`npm root -g`)
// var certFolder = nodeRootFolder.toString().trim() + '/simple-https-server/cert/'

var certFolder = "./certs/localhost/server"


var options = {
  key:  fs.readFileSync(certFolder + '/privkey.pem'),
  cert: fs.readFileSync(certFolder + '/cert.pem')
};

console.log('Starting server on https://localhost:9876...')

var httpsServer = https.createServer(options, function (req, res) {
  
  // res.writeHead(200);
  // res.end('hello world\n');

  var done = finalhandler(req, res);
  serve(req, res, done);

}).listen(9876);