var express = require('express');
var app = express();

app.use(express.static('CordovaApp/www'));
app.get('/cordova.js', function (req, res) {
    res.send('window._cordovaTestMode = true;')
})

var server = app.listen(process.env.PORT ||7070, function () {
    var host = server.address().address ;
    var port = server.address().port;
    console.log("Simply web server running on http://%s:%s", host, port)
});