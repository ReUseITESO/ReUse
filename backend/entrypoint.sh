#!/bin/bash
set -e

echo "⏳ Waiting for database..."
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
echo "✅ Database ready"

echo "📦 Running migrations..."
python manage.py migrate --noinput

echo "👤 Creating default user (jose.chavez@iteso.mx)..."
python manage.py shell -c "
from core.models import User
if not User.objects.filter(email='jose.chavez@iteso.mx').exists():
    u = User.objects.create_user(
        email='jose.chavez@iteso.mx',
        password='Deuteronomio1',
        first_name='Jose',
        last_name='Chavez',
        phone='3300001111',
    )
    u.is_active = True
    u.is_email_verified = True
    u.save()
    print('  ✅ User created')
else:
    u = User.objects.get(email='jose.chavez@iteso.mx')
    u.set_password('Deuteronomio1')
    u.is_active = True
    u.is_email_verified = True
    u.save()
    print('  ✅ User already exists, password reset')
"

echo "🚀 Starting server..."
exec python manage.py runserver 0.0.0.0:8000
