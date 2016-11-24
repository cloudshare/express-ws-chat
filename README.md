# Requirements

- [Docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
- [Docker-Compose](https://docs.docker.com/compose/install/)

or simply **[launch this demo instantly on CloudShare](http://cloudshare.com/pricing-packages?envTemplate=BPXBNeZSSjSVAUtplVuB3XAA2&_ga=1.22155320.2011026143.1478775085)**

# Running

```
git clone https://github.com/cloudshare/express-ws-chat.git
cd express-ws-chat
docker-compose build
docker-compose up
```

# What's in the box

```
                                                 
    ┌────────────┐                               
    │  Nginx:80  │                               
    │  (docker)  │                               
    └────────────┘                               
           │                                     
           │                                     
           ├─────────────────────────┐           
           │                         │           
           │                         │           
           │                         │           
       REST API                  /static/*       
           +                         │           
       WebSocket                     │           
           │                         │           
           │                         │           
           │                         │           
           │                         │           
           ▼                         ▼           
  ┌────────────────┐     ┌──────────────────────┐
  │  Node.js:3000  │     │     static files     │
  │    (docker)    │     │    (html/css/js)     │
  └────────────────┘     │     served from      │
                         │   /opt/chat/static   │
                         └──────────────────────┘
```

