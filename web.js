var express = require('express');
fs = require('fs');
var html_cont = fs.readFileSync("index.html");
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(html_cont);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
