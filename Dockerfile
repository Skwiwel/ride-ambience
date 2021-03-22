FROM nginx:stable

RUN  sed -i.bak 's/\(listen.*\)80/\18081/' /etc/nginx/conf.d/default.conf \
     && rm -r /var/cache/apt/* \
     && chgrp -R 0 /var/cache/ /var/log/ /var/run/ \
     && chmod -R g=u /var/cache/ /var/log/ /var/run/ \
     && chgrp -R 0 /etc/nginx \
     && chmod -R g+rwX /etc/nginx 
     
EXPOSE 8081

COPY ./ /usr/share/nginx/html
