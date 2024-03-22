#!/bin/bash

# Start a redis server in the background
redis-server /etc/redis/redis.conf --daemonize yes

#TODO - make persistent through reboot
#TODO - other conf changes - timeout? logging? cluster-enabled? tuning data-structures?
