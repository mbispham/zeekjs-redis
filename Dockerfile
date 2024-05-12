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
    npm


COPY . /staging

WORKDIR /staging

# FIXME this should be better
RUN git config --global --add safe.directory '*'

# FIXME adjust redis.conf in our docker

# FIXME temporarily disable dirty check

RUN npm install
RUN zkg install . --force

CMD bash
