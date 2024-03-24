#!/bin/bash

set -a  # Export vars
source ../scripts/.env
set +a

create_directory() {
    mkdir -p "${1}" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "Warning: Unable to create directory ${1}."
        echo "No certificates have been generated. Elevated privileges might be required to create directory ${1}."
        exit 1
    fi
}

# Ask the user for the domain name
read -p "Enter the domain name for the TLS certificate: " DOMAIN_NAME
echo "Using domain name: $DOMAIN_NAME"

# Function to create directory and handle permission error
create_directory() {
    mkdir -p "${1}" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "Warning: Unable to create directory ${1}."
        echo "No certificates have been generated. Elevated privileges might be required to create directory ${1}."
        exit 1
    fi
}

create_directory "${REDIS_CERT_PATH}"
cd "${REDIS_CERT_PATH}"

openssl genrsa -out "${REDIS_CERT_PATH}/redis.key" 2048
openssl req -new -key "${REDIS_CERT_PATH}/redis.key" -out "${REDIS_CERT_PATH}/redis.csr" -subj "/CN=${DOMAIN_NAME}"
openssl x509 -req -days "${DAYS_VALID}" -in "${REDIS_CERT_PATH}/redis.csr" -signkey "${REDIS_CERT_PATH}/redis.key" -out "${REDIS_CERT_PATH}/redis.crt"

rm -f "${REDIS_CERT_PATH}/redis.csr"
chmod 600 "${REDIS_CERT_PATH}/redis.key"
echo "TLS certificate and key for Redis have been generated successfully."