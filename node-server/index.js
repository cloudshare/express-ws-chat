var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'chat',
    streams: [{
        type: 'rotating-file',
        path: '/var/log/chat/chat.log',
        period: '1d',   // daily rotation
        count: 3        // keep 3 back copies
    }]
});
 
app.get('/api', function(req, res, next){
    res.send("Welcome to express-ws chat API!");
	next();
});

var rooms = {};
app.ws('/room/:room', function(ws, req) {
    var room_name = req.params.room;
    if (!(room_name in rooms)) {
        log.info({ name: room_name }, "new room created");
        rooms[room_name] = new Set([ws]);
    } else {
        rooms[room_name].add(ws);
    }
    ws.send(JSON.stringify({ user: "Room", message: "Welcome to chat room " + room_name}));

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
            log.info({ msg: msg }, "Plain text message (not JSON) treated as from anonymous");
        }
        log.info({ user: user, message: msg}, "user message");
        var connections = rooms[room_name];
        connections.forEach(function(w) {
            if (w) {
                try {
                    if (w != ws) {
                        w.send(JSON.stringify({ user: user, message: msg}));
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
log.info({ port: port }, "Chat server is up");
