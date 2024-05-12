FROM zeek/zeek:latest

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils software-properties-common curl ca-certificates gnupg2
RUN apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    make \
    g++ \
    libssl-dev \
    libpcap-dev \
    redis-server \
    jq \
    npm \
    vim

# FIXME remove vim
# FIXME add a better test for the plugin

RUN sed -i "s|# unixsocket /run/redis/redis-server.sock|unixsocket /var/run/redis/redis.sock|" /etc/redis/redis.conf
RUN /etc/init.d/redis-server restart

COPY . /staging

WORKDIR /staging

# FIXME this should be better
RUN git config --global --add safe.directory '*'

RUN npm install
RUN rm package-lock.json
RUN zkg install . --force

CMD bash
