# Local Setup - ReUseITESO

**DBA:** Daniel
**Date:** 24 February 2026
**Version:** 1.2

---

## Prerequisites

* Docker Desktop
* Python 3.10+
* Git

---

## Quick Setup

### 1. Clone Repo

```bash
git clone https://github.com/ReUseITESO/ReUse.git
cd ReUse
```

### 2. Start PostgreSQL

```bash
docker-compose up -d db

# Verify it is running
docker-compose ps
# Status must show: healthy
```

### 3. Configure Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

Key dependencies:

* Django 5.0.1
* djangorestframework 3.14.0
* psycopg2-binary 2.9.9
* python-dotenv 1.0.0

### 5. Configure Environment Variables

Create the `.env` file inside `backend/`:

```bash
cp .env.example .env
```

The `.env` file must contain:

```dotenv
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
DB_NAME=reuse_iteso_dev
DB_USER=reuse_dev
DB_PASSWORD=local_dev_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ALLOWED_HOSTS=localhost,127.0.0.1
```

Credentials must match `docker-compose.yml`.

### 6. Apply Migrations

```bash
python manage.py migrate
```

Expected output:

```
Applying core.0001_initial... OK
Applying marketplace.0001_initial... OK
...
```

### 7. Load Seed Data

Gamification is not yet active. Load the partial seed (excludes gamification):

```bash
python -c "
import json
with open('seeds/seed_v1.json') as f:
    data = json.load(f)

filtered = []
for obj in data:
    if obj['model'].startswith('gamification'):
        continue
    if obj['model'] == 'core.user':
        fields = obj['fields']
        if 'created_at' in fields:
            fields['date_joined'] = fields.pop('created_at')
        fields['username'] = fields['email'].split('@')[0]
        fields['password'] = 'pbkdf2_sha256\$600000\$test\$test='
        fields['is_active'] = True
        fields['is_staff'] = False
        fields['is_superuser'] = False
    filtered.append(obj)

with open('seeds/seed_partial.json', 'w') as f:
    json.dump(filtered, f, indent=2)
print(f'Objects: {len(filtered)}')
"

python manage.py loaddata seeds/seed_partial.json
# Expected: Installed 32 object(s) from 1 fixture(s)
```

When gamification models are activated, use the full seed:

```bash
python manage.py loaddata seeds/seed_v1.json
# Expected: Installed 44 object(s) from 1 fixture(s)
```

### 8. Create Superuser

Promote the existing admin user from the seed:

```bash
python manage.py shell -c "
from core.models import User
u = User.objects.get(email='admin@iteso.mx')
u.is_superuser = True
u.is_staff = True
u.set_password('admin1234')
u.save()
print('Done')
"
```

### 9. Start Server

```bash
python manage.py runserver
```

Access:

* Admin panel: http://127.0.0.1:8000/admin/
  * Email: `admin@iteso.mx`
  * Password: `admin1234`
* API docs: http://127.0.0.1:8000/api/schema/swagger-ui/

---

## Verify Installation

```bash
python manage.py shell -c "
from core.models import User
from marketplace.models import Products, Category, Transaction, Images, ForumQuestion

print('Users:', User.objects.count())          # 6
print('Categories:', Category.objects.count()) # 5
print('Products:', Products.objects.count())   # 10
print('Transactions:', Transaction.objects.count()) # 3
print('Images:', Images.objects.count())       # 3
print('ForumQuestions:', ForumQuestion.objects.count()) # 5
"
```

---

## Useful Commands

### Docker (run from project root)

```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f db

# Stop services
docker-compose down

# Full reset (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d db
```

### Django (run from backend/)

```bash
# Apply migrations
python manage.py migrate

# View migration status
python manage.py showmigrations

# View SQL for a migration
python manage.py sqlmigrate core 0001

# Django shell
python manage.py shell

# PostgreSQL shell
python manage.py dbshell

# Generate new migration
python manage.py makemigrations
```

---

## Direct Database Access

### Option 1: Adminer (Web GUI)

```bash
docker-compose up -d adminer
```

Access: http://localhost:8080

Credentials:

* System: PostgreSQL
* Server: db
* Username: reuse_dev
* Password: local_dev_password
* Database: reuse_iteso_dev

### Option 2: psql (Terminal)

```bash
docker exec -it reuse_iteso_db psql -U reuse_dev -d reuse_iteso_dev

# Useful psql commands:
\dt                   # List tables
\d users              # Describe users table
SELECT * FROM users;  # Query
\q                    # Exit
```

---

## Troubleshooting

### Port 5432 already in use

If another PostgreSQL instance is running locally (common on Windows), it may conflict with Docker on port 5432.

Check which processes are using the port:

```bash
# Windows
netstat -ano | findstr :5432
tasklist | findstr <PID>
```

Stop the local PostgreSQL service:

```bash
# Windows
net stop postgresql
# Or find the exact service name:
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```

If you cannot stop the local service, change the Docker port in `docker-compose.yml`:

```yaml
ports:
  - "0.0.0.0:5433:5432"
```

And update `.env`:

```dotenv
DB_PORT=5433
```

### Connection refused

PostgreSQL is not running:

```bash
docker-compose up -d db
docker-compose ps
# Wait for status: healthy
```

### No module named 'dotenv'

```bash
pip install python-dotenv
```

### Password authentication failed

Verify `.env` credentials match `docker-compose.yml`:

```bash
# Windows
type .env
type docker-compose.yml
```

Both must have the same values for `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.

### migrations/ folder does not exist

```bash
# Mac/Linux
mkdir -p core/migrations marketplace/migrations gamification/migrations
touch core/migrations/__init__.py
touch marketplace/migrations/__init__.py
touch gamification/migrations/__init__.py

# Windows
New-Item -ItemType Directory -Path core\migrations, marketplace\migrations, gamification\migrations
New-Item -ItemType File -Path core\migrations\__init__.py, marketplace\migrations\__init__.py, gamification\migrations\__init__.py
```

### Full reset

```bash
# From project root
docker-compose down -v
docker-compose up -d db

# From backend/
python manage.py migrate
python manage.py loaddata seeds/seed_partial.json
```

---

## Database Architecture

**Engine:** PostgreSQL 15
**ORM:** Django ORM
**Migrations:** Django Migrations
**Containerization:** Docker Compose

Active tables (6):

1. `core_user` - ITESO users (AbstractUser)
2. `marketplace_category` - Product categories
3. `marketplace_products` - Listed items
4. `marketplace_images` - Product image gallery
5. `marketplace_transaction` - Delivery coordination
6. `marketplace_forumquestion` - Public Q&A per product

Pending activation (gamification module):

7. `gamification_badges` - Available achievements
8. `gamification_userbadges` - Badges earned by users
9. `gamification_environmentimpact` - Sustainability metrics

---

## User Model Notes

The `User` model extends Django's `AbstractUser`. This means:

* Authentication fields are included: `password`, `last_login`, `is_active`, `is_staff`, `is_superuser`
* `AUTH_USER_MODEL = "core.User"` is set in `settings.py`
* `date_joined` replaces `created_at` from the ERD
* `USERNAME_FIELD = 'email'` — login uses email, not username

---

## Next Steps

1. Explore the admin panel: http://127.0.0.1:8000/admin/
2. Review models in `backend/core/models/` and `backend/marketplace/models/`
3. Read `docs/database/erd_v1.md` for relationship details
4. Read `docs/database/governance.md` before making schema changes

---

**Last updated:** 24 February 2026
**Responsible:** Daniel (DBA)
