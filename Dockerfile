# Zeek docker + Node.js
FROM debian:bookworm-slim

# Use bash shell with pipefail option
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV DEBIAN_FRONTEND noninteractive
ENV CCACHE_DIR "/var/spool/ccache"
ENV CCACHE_COMPRESS 1

# Set up the for node, npm, rust and zeek
ENV OPT_PATH "/opt"
ENV PATH="$OPT_PATH/node/bin:$OPT_PATH/zeek/bin:/root/.cargo/bin:$PATH"

# Define ARGS
ARG ZEEK_VERSION="6.0.3"
ARG NODE_VERSION="20.11.1"

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils software-properties-common curl ca-certificates gnupg2
RUN apt-get install -y --no-install-recommends \
      binutils \
      bison \
      build-essential \
      ca-certificates \
      ccache \
      cmake \
      cmake-data \
      distro-info-data \
      file \
      flex \
      g++ \
      gcc \
      git \
      google-perftools \
      iso-codes \
      jq \
      libarchive13 \
      libcurl3-gnutls \
      libdpkg-perl \
      libfl-dev \
      libfl2 \
      libgoogle-perftools-dev \
      libkrb5-dev \
      libmaxminddb-dev \
      libmaxminddb0 \
      libnode-dev \
      libnode108 \
      libpcap-dev \
      libpcap0.8 \
      libpcap0.8-dev \
      libpcre2-8-0 \
      libpython3-stdlib \
      libpython3.11 \
      librhash0 \
      libsqlite3-dev \
      libssl-dev \
      libssl3 \
      libuv1 \
      libuv1-dev \
      libxml2 \
      libz-dev \
      libz1 \
      locales-all \
      make \
      ninja-build \
      patch \
      python3 \
      python3-dev \
      python3-git \
      python3-pip \
      python3-semantic-version \
      python3-setuptools \
      python3-websocket \
      python3-wheel \
      swig \
      wget \
      zlib1g-dev \
     && apt-get clean \
     && rm -rf /var/lib/apt/lists/*

# Tell git all the repositories are safe.
RUN git config --global --add safe.directory '*'

# Install zkg
RUN python3 -m pip install --no-cache-dir zkg --break-system-packages

# Install Node.js from source and configure with shared OpenSSL
WORKDIR /tmp/node
RUN git clone https://github.com/nodejs/node.git && cd node \
    && git reset --hard v${NODE_VERSION} \
    && ./configure --prefix=/opt/node --shared --shared-openssl --shared-zlib \
    && make \
    && make install \
    && rm -rf /tmp/node

# Install zeek
WORKDIR /tmp/zeek
RUN wget --no-verbose https://download.zeek.org/zeek-${ZEEK_VERSION}.tar.gz -O /tmp/zeek.tar.gz && \
    tar -xzf /tmp/zeek.tar.gz -C /tmp && cd /tmp/zeek-${ZEEK_VERSION} && \
    ./configure --prefix=/opt/zeek/ \
    --enable-perftools \
    --disable-broker-tests \
	--build-type=Release \
	--disable-btest-pcaps \
	--disable-cpp-tests && \
     make && \
     make install

# Checks
RUN btest --version
RUN zeek --version
RUN node --version
RUN npm --version
RUN zeek -N Zeek::JavaScript

# Compile, test and install plugin
WORKDIR /src/
COPY . .
RUN zkg install zeekjs-redis
RUN zeek -r test.pcap ./index.js