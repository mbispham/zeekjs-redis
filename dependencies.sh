#!/bin/bash

# Display banner
cat img/banner.txt

echo
echo "Checking dependencies..."

# Function to ask for user confirmation
ask_to_install_packages() {
    while true; do
        read -p "Do you want to install the missing npm packages? [Y/n] " yn
        case $yn in
            [Yy]* ) npm install; return $?;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(cat .env | sed 's/#.*//g' | xargs)
else
    echo ".env file not found."
    exit 1
fi

# Check for Node.js presence
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed."
    exit 1
fi

# Output the version of Node.js
node_version=$(node -v)
echo "Node.js is installed - v$node_version"

# Check for npm presence
if ! command -v npm &> /dev/null; then
    echo "npm is not installed."
    exit 1
fi

# Output the version of npm
npm_version=$(npm -v)
echo "npm is installed - v$npm_version"

# Check for package.json file
if [ ! -f "package.json" ]; then
    echo "package.json not found."
    exit 1
fi

# Check if npm packages are installed and output versions
npm ls --depth=0
if [ $? -ne 0 ]; then
    echo "Some npm packages are missing."
    ask_to_install_packages
    if [ $? -ne 0 ]; then
        echo "Failed to install npm packages or installation aborted."
        exit 1
    fi
    echo "Installed npm packages:"
    npm ls --depth=0
fi

# Check for Redis-cli presence
if ! command -v redis-cli &> /dev/null; then
    echo "redis-cli is not installed."

    # Identify the OS
    OS=""
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="Debian/Ubuntu"
        elif [ -f /etc/redhat-release ]; then
            OS="CentOS/RHEL"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    fi

    # If OS is recognized, ask to install redis-cli
    if [ ! -z "$OS" ]; then
        read -p "You are using $OS. Do you want to install redis-cli? [Y/n] " yn
        case $yn in
            [Yy]* )
                if [ "$OS" == "Debian/Ubuntu" ]; then
                    sudo apt-get update
                    sudo apt-get install redis-server
                elif [ "$OS" == "macOS" ]; then
                    brew install redis
                elif [ "$OS" == "CentOS/RHEL" ]; then
                    sudo yum install redis
                fi
                ;;
            [Nn]* )
                echo "Installation aborted."
                exit 1
                ;;
            * )
                echo "Please answer yes or no."
                ;;
        esac
    else
        echo "Operating system not supported for automatic installation."
        exit 1
    fi
fi

echo "redis-cli is installed."

# Extract Redis connection info from environment variables
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-''}

# Attempt to connect to Redis server
if [ -z "$REDIS_PASSWORD" ]; then
    redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null
else
    redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping > /dev/null
fi

if [ $? -ne 0 ]; then
    echo "Failed to connect to Redis server at $REDIS_HOST:$REDIS_PORT."
fi

start_redis_server() {
    # Depending on how Redis is set up, you might need to modify this command
    redis-server --daemonize yes --bind $REDIS_HOST --port $REDIS_PORT --requirepass "$REDIS_PASSWORD"
    sleep 2 # Wait a bit to ensure Redis server starts
}

# Attempt to connect to Redis server
if [ -z "$REDIS_PASSWORD" ]; then
    redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null
else
    redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping > /dev/null
fi

# Check connection status
if [ $? -ne 0 ]; then
    echo "Failed to connect to Redis server at $REDIS_HOST:$REDIS_PORT."
    echo
    echo Attempting to start Redis server..."
    start_redis_server

    # Try to reconnect
    if [ -z "$REDIS_PASSWORD" ]; then
        redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null
    else
        redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping > /dev/null
    fi

    if [ $? -ne 0 ]; then
        echo "Failed to connect to Redis server after attempting to start it."
        exit 1
    fi
fi

echo "Connected to Redis server successfully."
echo "All checks passed. Environment is ready."
