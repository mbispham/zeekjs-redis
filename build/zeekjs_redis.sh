#!/bin/bash
# Sequentially execute bash scripts

# Exit if a command exits with a non-zero status.
set -e

# Display banner
echo
echo
cat img/banner.txt
echo
echo

# Call dependencies.sh
echo
cd deployment
chmod u+x dependencies.sh
./dependencies.sh
echo "Dependency check completed successfully."

# Call generate_redis_cert.sh
echo
echo "Checking Redis SSL Certificate..."
CERT_FILE="/etc/redis/ssl/redis.crt"
KEY_FILE="/etc/redis/ssl/redis.key"

# Check if both the certificate and key exist
if [[ -f "$CERT_FILE" && -f "$KEY_FILE" ]]; then
    echo "TLS certificate and key already exist in /etc/redis/ssl."
else
    echo "TLS certificate and/or key not found in /etc/redis/ssl."

    # Offer to generate a certificate
    while true; do
        read -p "Do you want to generate a local TLS certificate for Redis? (y/n): " generate_cert_choice
        case "${generate_cert_choice,,}" in  # Convert to lowercase
            y )
                chmod +x deployment/generate_redis_cert.sh
                if [[ -x "generate_redis_cert.sh" ]]; then
                    ./generate_redis_cert.sh
                    if [ $? -eq 0 ]; then
                        echo "Certificate generation completed successfully."
                    else
                        echo "Certificate generation failed. Check for errors."
                    fi
                else
                    echo "The script 'generate_redis_cert.sh' is not executable or not found."
                fi
                break;;
            n )
                echo "Skipping certificate generation."
                break;;
            * )
                echo "Please answer 'y' or 'n'.";;
        esac
    done
fi
echo "Redis SSL Cert check completed successfully."

# Call generate_pw.sh
echo
echo "Check redis password..."
chmod u+x generate_pw.sh
./generate_pw.sh
echo "Redis password completed successfully."

# Call redis_start.sh
echo
chmod u+x redis_start.sh
./redis_start.sh
echo "Redis server running successfully."