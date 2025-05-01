#!/bin/sh

# Run cleanup first
./cleanup.sh

# Run migrations if needed
python manage.py migrate

# Start the Django development server
echo "Starting Django server..."
exec gunicorn --bind 0.0.0.0:8000 core.wsgi:application 