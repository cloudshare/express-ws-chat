var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
 
app.get('/', function(req, res, next){
    res.send("Welcome to express-ws chat!");
	next();
});

var rooms = {};
app.ws('/room/:room', function(ws, req) {
    var room_name = req.params.room;
    if (!(room_name in rooms)) {
        console.log("New room being opened", room_name);
        rooms[room_name] = new Set([ws]);
    } else {
        rooms[room_name].add(ws);
    }
    ws.on('message', function(msg) {

        var user = 'anonymous';
        try {
            var parsed = JSON.parse(msg);
            if ("user" in parsed && "message" in parsed) {
                user = parsed.user;
                msg = parsed.message;
            } else {
                throw new Error();
            }
        } catch (error) {
            console.log("Plain text message treated as from anonymous", msg);
        }
        var connections = rooms[room_name];
        connections.forEach(function(w) {
            if (w) {
                try {
                    if (w != ws) {
                        w.send(user + ": " + msg);
                    }
                } catch (e) {
                    connections.delete(w);
                }
            }
        });
    });
});

var port = 3000;
app.listen(port);
console.log("Chat listening on port", port);
