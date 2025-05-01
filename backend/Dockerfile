FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p media staticfiles && \
    chmod -R 777 media staticfiles

# Collect static files
RUN python manage.py collectstatic --noinput

# Copy and set up startup scripts
COPY start.sh .
RUN chmod +x start.sh

COPY cleanup.sh .
RUN chmod +x cleanup.sh

# Install tini
RUN apt-get update && apt-get install -y tini

# Use tini as the entrypoint
ENTRYPOINT ["/usr/bin/tini", "--"]

# Run the start script
CMD ["./start.sh"] 