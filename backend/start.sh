#!/bin/sh

# Run cleanup first
./cleanup.sh

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch..."
until curl -s http://elasticsearch:9200/_cluster/health | grep -q '"status":"green\|yellow"'; do
    echo "Elasticsearch is unavailable - sleeping"
    sleep 2
done
echo "Elasticsearch is ready!"

# Run migrations if needed
python manage.py migrate

# Create/Update Elasticsearch indices
echo "Setting up Elasticsearch indices..."
python manage.py search_index --delete || true  # Delete existing index if it exists
python manage.py search_index --create  # Create fresh index
python manage.py search_index --rebuild -f  # Rebuild index with existing data

# Start the Django development server
echo "Starting Django server..."
exec gunicorn --bind 0.0.0.0:8000 core.wsgi:application 