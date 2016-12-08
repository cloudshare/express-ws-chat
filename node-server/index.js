"use strict";

var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var bunyan = require('bunyan');
var elasticsearch = require('elasticsearch');


var log_streams = [{
    type: 'rotating-file',
    path: '/var/log/chat/chat.log',
    period: '1d',   // daily rotation
    count: 3        // keep 3 back copies
}];

if (process.env.DEBUG) {
    log_streams.push({
        name: 'node',
        stream: process.stdout,
        level: 'debug'
    });
}
var log = bunyan.createLogger({
    name: 'chat',
    streams: log_streams
});

var es_host = process.env.ES_HOST ? process.env.ES_HOST : "es";
var es_url = es_host + ":9200";

var es_client = new elasticsearch.Client({ host: es_url });

function fetch_room_history(room, done) {
    log.debug({ room: room }, "fetching room history from elasticsearch");
    es_client.search({
        "type": "chat_message",
        "body" : {
            "query" : { "term" : { "room": "room_" + room } },
            "sort": [{ "sent": "desc" }],
            "from": 0,
            "size": 10
        }
    }).then(function(response) {
        if (done) {
            done(response.hits);
        }
    }, function(error) {
        log.error(error);
    });
}

app.get('/api/history/:room', function(req, res){
    var room = req.params.room;
    fetch_room_history(room, function(hits) {
        res.setHeader('Content-Type', 'application/json');
        var history = hits.hits.map(function(hit) {
            var s = hit._source;
            return { msg: s.message, time: s.sent, user: s.user };
        });
        var body = JSON.stringify({ messages: history});
        res.write(body);
        res.end();
    });
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
        if (msg == "_announce_") {
            send(ws, "Room", "Welcome to chat room " + room_name);
            msg = user + " has joined the chat";
            user = "Room";
        }
        broadcast(room, ws, user, msg);
        if (msg != "_announce") {
            log.info({ user: user, message: msg, room: "room_" + room_name, type: "chat_message",
                sent: new Date()}, "user message");
        }
    });

    send(ws, "Room", "_whois_");
});

var port = 3000;
app.listen(port);
console.log("Chat listening on port", port);
log.info({ port: port }, "Chat server is up");
