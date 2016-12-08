"use strict";

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

function send(tgt, from_user, message) {
    if (tgt) {
        tgt.send(JSON.stringify({ user: from_user, message: message}));
    }
}

function broadcast(room, from_ws, user, message) {
    room.forEach(function(tgt) {
        try {
            if (tgt != from_ws) {
                send(tgt, user, message);
            }
        } catch (e) {
            room.delete(tgt);
        }
    });
}

app.ws('/room/:room', function(ws, req) {
    var room_name = req.params.room;
    if (!(room_name in rooms)) {
        log.info({ room: room_name }, "new room created");
        rooms[room_name] = new Set([ws]);
    } else {
        rooms[room_name].add(ws);
    }
    var room = rooms[room_name];

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
        log.info({ user: user, message: msg, room: room_name}, "user message");
        if (msg == "_announce_") {
            send(ws, "Room", "Welcome to chat room " + room_name);
            msg = user + " has joined the chat";
            user = "Room";
        }
        broadcast(room, ws, user, msg);
    });

    send(ws, "Room", "_whois_");
});

var port = 3000;
app.listen(port);
console.log("Chat listening on port", port);
log.info({ port: port }, "Chat server is up");
