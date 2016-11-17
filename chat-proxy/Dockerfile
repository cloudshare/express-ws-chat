FROM nginx


COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /opt/chat/static
COPY *.html /opt/chat/static/
COPY *.js /opt/chat/static/


