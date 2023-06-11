#!/bin/bash

# Build the project
echo "Building the project..."
python3.11 -m pip install -r requirements.txt

# make migrations
echo "Make migrations..."
python3.11 manage.py makemigrations --noinput
python3.11 manage.py migrate --noinput

echo "Collect Static..."
python3.11 manage.py collectstatic --noinput --clear
