
# Local Database Setup - ReUseITESO

**DBA:** Daniel
**Date:** 22 April 2026
**Version:** 1.5

---

## Changelog

| Version | Date        | Change                                                                                      |
| ------- | ----------- | ------------------------------------------------------------------------------------------- |
| 1.0     | 15 Feb 2026 | Initial setup guide                                                                         |
| 1.1     | 24 Feb 2026 | Added Docker Compose instructions and .env.example reference                                |
| 1.2     | 5 Mar 2026  | Updated seed filename to seed_dev_fixed.json                                                |
| 1.3     | 11 Mar 2026 | Added social app setup instructions                                                         |
| 1.4     | 19 Mar 2026 | Updated expected migration output: added social 0002, marketplace 0004/0005/0006, core 0003 |
| 1.5     | 22 Apr 2026 | Updated expected migration output: added marketplace 0003/0004 (SwapTransaction)            |

---

## Requirements

* Docker Desktop installed and running
* Python 3.11+
* Git

If you cannot use Docker, see [Fallback: Local PostgreSQL](https://claude.ai/chat/e0ddd24d-9151-4755-91d5-2799b12630c9#fallback-local-postgresql) at the bottom.

---

## 1. Clone and configure environment

```bash
git clone https://github.com/ReUseITESO/ReUse.git
cd ReUse
```

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your local values:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reuse_iteso_dev
DB_USER=reuse_dev
DB_PASSWORD=local_dev_password
```

> **Port conflict on Windows:** If you have PostgreSQL installed locally, port 5432 may already be in use.
> Check with: `netstat -ano | findstr :5432`
> If occupied, change `DB_PORT=5433` in your `.env` and update `docker-compose.yml` accordingly.

---

## 2. Start the database container

```bash
docker compose up -d db
```

Verify it is running:

```bash
docker compose ps
```

Wait for the health check to pass (status: `healthy`). This takes ~30 seconds on first run.

---

## 3. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## 4. Apply migrations

```bash
python manage.py migrate
```

Expected output — all migrations should show `[X]`:

```
core
  [X] 0001_initial
  [X] 0002_alter_user_managers_user_deactivated_at_and_more
marketplace
  [X] 0001_initial
  [X] 0002_comment_forumquestion_images_productreaction_report_and_more
  [X] 0003_add_updated_at_transaction
  [X] 0004_add_swap_transaction
gamification
  [X] 0001_initial
social
  [X] 0001_initial
  [X] 0002_add_community_post_and_forum_post_link
```

If you see `DuplicateTable` errors, a teammate pushed models without including the migration. See [Troubleshooting](https://claude.ai/chat/e0ddd24d-9151-4755-91d5-2799b12630c9#troubleshooting).

---

## 5. Load seed data

```bash
python manage.py loaddata seeds/seed_dev_fixed.json
```

This loads:

* 6 users (1 admin + 5 students)
* 5 categories
* 10 products (mix of sale / donation / swap)
* 3 transactions (pending / confirmed / completed)
* 5 forum questions + 3 forum questions linked to community posts
* 3 badges + 3 user_badges
* 6 environment_impact records
* 3 user_connections + 2 frequent_contacts
* 2 communities + 5 community_members + 3 community_posts

> **Note:** ProductReaction, Report, Notification, and SwapTransaction do not have seed data. These tables are populated through normal app usage.

---

## 6. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

Use an `@iteso.mx` email or the email validation will fail.

---

## 7. Verify in admin panel

Start the backend:

```bash
python manage.py runserver
```

Open: `http://localhost:8000/admin`

All modules should be visible: Core, Marketplace, Gamification, Social.

---

## Checking migration status

```bash
# View all migrations and their status
python manage.py showmigrations

# Verify no pending migrations exist
python manage.py migrate --check
```

---

## Stopping and resetting

```bash
# Stop container (data is preserved)
docker compose down

# Stop and delete all data (full reset)
docker compose down -v

# After full reset, repeat steps 4 and 5
```

---

## Fallback: Local PostgreSQL

If Docker is not available, install PostgreSQL 15 manually and create the database:

```sql
CREATE DATABASE reuse_iteso_dev;
CREATE USER reuse_dev WITH PASSWORD 'local_dev_password';
GRANT ALL PRIVILEGES ON DATABASE reuse_iteso_dev TO reuse_dev;
```

Then update your `.env` to point to `localhost` and follow steps 4–7 above.

---

## Troubleshooting

### `DuplicateTable` on migrate

A teammate pushed a model change without committing the migration. Solution:

```bash
# Check which migration is conflicting
python manage.py showmigrations

# If the table already exists and migration shows as unapplied, fake it
python manage.py migrate <app> <migration_number> --fake
```

### `django.db.utils.IntegrityError` on loaddata

The seed file references a model field that no longer exists. Check that your branch is up to date:

```bash
git pull origin dev
python manage.py migrate
python manage.py loaddata seeds/seed_dev_fixed.json
```

### Port 5432 already in use

Change the host port in `.env`:

```bash
DB_PORT=5433
```

And update `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

---

## Key files

| File                                  | Purpose                             |
| ------------------------------------- | ----------------------------------- |
| `docker-compose.yml`                | Database and services configuration |
| `.env.example`                      | Environment variables template      |
| `backend/seeds/seed_dev_fixed.json` | Current canonical seed file         |
| `docs/database/erd_v1.md`           | Full schema reference               |
| `docs/database/migrations.md`       | Migration strategy and rules        |
| `docs/database/governance.md`       | Who approves schema changes         |

---

**Last updated:** 22 April 2026
**Responsible:** Daniel (DBA)
