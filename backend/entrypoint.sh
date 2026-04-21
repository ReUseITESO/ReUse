#!/bin/bash
set -e

echo "Waiting for database..."
while ! python -c "
import psycopg2, os
psycopg2.connect(
    dbname=os.environ.get('DB_NAME','reuse_iteso_dev'),
    user=os.environ.get('DB_USER','reuse_dev'),
    password=os.environ.get('DB_PASSWORD','local_dev_password'),
    host=os.environ.get('DB_HOST','db'),
    port=os.environ.get('DB_PORT','5432')
)" 2>/dev/null; do
    sleep 1
done
echo "Database ready"

echo "Running migrations..."
python manage.py migrate --noinput --fake-initial

echo "Seeding development data..."
python manage.py seed_dev_data || echo "WARNING: seed_dev_data failed (migrations may be missing). Server will still start."

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000