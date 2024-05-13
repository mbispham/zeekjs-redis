FROM zeek/zeek:latest

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    make \
    libpcap-dev \
    g++ \
    redis-server \
    npm \
    vim

# Configure unixsocket for redis
RUN sed -i "s|# unixsocket /run/redis/redis-server.sock|unixsocket /var/run/redis/redis.sock|" /etc/redis/redis.conf

# Copy the source dir
COPY . /zeekjs-redis

# Set workdir during install
WORKDIR /zeekjs-redis

# Install package
RUN zkg install . --force

# Install the extra dependencies for the nodejs
# $HOME/.node_modules is default path for nodejs
RUN npm install
RUN mv node_modules /root/.node_modules

# Only copy the test pcap in root and then delete tmpdir
WORKDIR /root
RUN mv /zeekjs-redis/testing/Traces/*.pcap /root
RUN rm -rf /zeekjs-redis

CMD /etc/init.d/redis-server start && bash
