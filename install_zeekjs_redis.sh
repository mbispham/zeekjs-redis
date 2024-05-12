#!/usr/bin/env bash

PACKAGE_URL="https://github.com/mbispham/zeekjs-redis"

expect -c "
spawn zkg install $PACKAGE_URL
expect \"Proceed? (Y/n)\"
send \"y\r\"
expect \"install_npm_dependencies:\"
send \"y\r\"
expect \"install_redis_cli:\"
send \"y\r\"
expect \"redis_conf_path:\"
send \"/etc/redis/redis.conf\r\"
expect \"redis_socket_path:\"
send \"/var/run/redis/redis.sock\r\"
expect \"start_redis_server:\"
send \"y\r\"
expect eof
"