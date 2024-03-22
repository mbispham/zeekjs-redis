#!/bin/bash
# Sequentially execute the other bash scripts

# Exit if a command exits with a non-zero status.
set -e

# Display banner
echo
echo
cat img/banner.txt
echo
echo

# Call dependencies.sh
echo "Running dependencies.sh..."
./dependencies.sh
echo "dependencies.sh completed successfully."

# Call generate_redis_cert.sh
echo "Running generate_redis_cert.sh..."
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
                chmod +x generate_redis_cert.sh
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
echo "generate_redis_cert.sh completed successfully."

# Call generate_pw.sh
echo "Running generate_pw.sh..."
./generate_pw.sh
echo "generate_pw.sh completed successfully."

# Call redis_start.sh
echo "Running redis_start.sh..."
./redis_start.sh
echo "redis_start.sh completed successfully."