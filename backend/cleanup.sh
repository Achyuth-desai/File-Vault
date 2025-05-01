#!/bin/sh

echo "Starting cleanup process..."

# Clean up media files
echo "Cleaning up media files..."
rm -rf /app/media/*

# Recreate necessary directories with proper permissions
echo "Recreating directories..."
mkdir -p /app/media/uploads
chmod -R 777 /app/media

# Clean up database
echo "Cleaning up database..."
if [ -f /app/data/db.sqlite3 ]; then
    echo "Removing existing database file..."
    rm -f /app/data/db.sqlite3
    # Verify deletion
    if [ -f /app/data/db.sqlite3 ]; then
        echo "ERROR: Failed to delete database file. Please check permissions."
        exit 1
    fi
fi

# Create fresh database and set permissions
echo "Creating fresh database..."
# Note: Not creating /app/data directory since it's mounted from host
touch /app/data/db.sqlite3
chmod 666 /app/data/db.sqlite3

# Verify the new file was created
if [ ! -f /app/data/db.sqlite3 ]; then
    echo "ERROR: Failed to create new database file."
    exit 1
fi

# Run migrations to create fresh database schema
echo "Running migrations..."
python manage.py migrate

# Create a custom management command to clean up
echo "from files.models import File; File.objects.all().delete()" > /app/cleanup_db.py
python manage.py shell < /app/cleanup_db.py
rm /app/cleanup_db.py

echo "Cleanup complete" 