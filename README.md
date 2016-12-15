# Requirements

- [Docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
- [Docker-Compose](https://docs.docker.com/compose/install/)

or simply **[launch this demo instantly on CloudShare](http://cloudshare.com/pricing-packages?envTemplate=BPXBNeZSSjSVAUtplVuB3XAA2&_ga=1.22155320.2011026143.1478775085)**

# Running

```
git clone https://github.com/cloudshare/express-ws-chat.git
cd express-ws-chat
docker-compose build
docker-compose -p chat up
```

# What's in the box

```
┌───────────────────────────────────┐
│                           this box│
│ ┌────────────────┐                │
│ │ Nginx (docker) │                │
│ │ ┌──────────────┤                │
│ │ │ static files │                │
│ │ │(html/css/js) │                │
│ └─┴──────────────┘                │
│          ▲                        │
│          │                        │
│        REST &                     │
│      WebSockets                   │
│          │                        │
│          ▼                        │
│ ┌────────────────┐                │
│ │  Node.js:3000  │                │
│ │    (docker)    │────────┐       │
│ └────────────────┘        ▼       │
│                     ┌───────────┐ │
│                     │ chat_logs │ │
│                     │  volume   │ │
│ ┌────────────────┐  └───────────┘ │
│ │    FileBeat    │        │       │
│ │    (docker)    │◀───────┘       │
│ └────────────────┘                │
│          │                        │
└───────────────────────────────────┘
           │
           ▼
  ┌ ─ ─ ─ ─ ─ ─ ─ ─
       LogStash    │
  │    (remote)
   ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

## Nginx

Nginx listens on port 80 and does two things. It serves static files (copied into its docker image) and acts as a proxy for Node.js.

The front-end source can be found in `chat-proxy/`.

### Chat rooms

This chat demo can host any number of chat rooms, but for simplicity the UI uses a fixed chat room name (room `237`). Adding support for switching rooms is a nice exercise, if you want to play around with this demo. All you need to do is change the WebSocket URL's room name part (see below) and add the relevant UI.

## Node.js

Node.js runs our chat server (see `app.js`). It listens for chat messages on `/room/[room number]` and broadcasts them to all connected users.

It also listens for REST API calls on `/api/...`.

Its docker-compose name is `web`. It outputs log records using Bunyan in JSON format. The log files are written to the `chat_logs` volume (see `docker-compose.yml`).

## FileBeat

Monitors the `chat_logs` volume and forwards log lines to LogStash. The hostname for LogStash should be defined using the `LOGSTASH_HOST` envar when you run `docker-compose up`. The default value (`logstash`) will only work if LogStash is running on the same Docker network (e.g. if you run the ELK service on the same host), so be sure it points to the right hostname. See `filebeat.yml`.
