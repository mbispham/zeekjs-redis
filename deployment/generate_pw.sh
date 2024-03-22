#!/bin/bash

read -p "Do you want to generate a new or replace an existing Redis password? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then

  # Generate password
  PASSWORD_LENGTH=32
  PASSWORD=$(openssl rand -base64 $PASSWORD_LENGTH)

  # .env file location
  ENV_FILE="../scripts/.env"

  # Check if the .env file exists
  if [ -f "$ENV_FILE" ]; then
      # replace empty REDIS_PASSWORD entry with the generated password
      escaped_password=$(echo "$PASSWORD" | sed -e 's/[\/&]/\\&/g')
      sed -i "s|^REDIS_PASSWORD='.*'|REDIS_PASSWORD='$escaped_password'|" $ENV_FILE
      echo "Password generated and updated in $ENV_FILE"
  else
      echo "Error: .env file does not exist at the specified location."
  fi
  else
      echo "Password not created or existing password used."
  fi