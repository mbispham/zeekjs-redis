#!/bin/bash

# Check if Redis server is running using pgrep
check_redis_with_pgrep() {
    pgrep redis-server > /dev/null
}

# Check if Redis server is running using ps and grep
check_redis_with_ps() {
    ps aux | grep [r]edis-server > /dev/null
}

# Check if Redis server is running using pgrep, fallback to ps and grep if pgrep fails or is not available
if check_redis_with_pgrep || check_redis_with_ps; then
    echo "Redis server is already running."
else
    # Start a Redis server in the background if not running
    echo "Starting Redis server..."
    redis-server /etc/redis/redis.conf --daemonize yes
fi

# Check port 3000 is available for redis socket connection
port=3000
while netstat -ltn | awk '$4 ~ /:'"$port"'$/ {exit 1}'; do
    ((port++))
done

# Write available port to the .env file, updating if necessary
env_file="../scripts.env"

if grep -q "SOCKET_PORT=" "$env_file"; then
    # SOCKET_PORT exists, so replace its value
    sed -i "/^SOCKET_PORT=/c\SOCKET_PORT=$port" "$env_file"
else
    # SOCKET_PORT does not exist, so add it
    echo "SOCKET_PORT=$port" >> "$env_file"
fi

#TODO - make persistent through reboot
#TODO - other conf changes - timeout? logging? cluster-enabled? tuning data-structures?


