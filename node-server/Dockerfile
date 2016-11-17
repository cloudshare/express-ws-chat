FROM node

RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb
RUN dpkg -i dumb-init_*.deb

RUN mkdir -p /opt/chat
COPY package.json  /opt/chat/
WORKDIR /opt/chat

RUN npm install

COPY *.js /opt/chat/

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

EXPOSE 3000

CMD ["node", "index.js"]
