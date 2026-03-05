# ReUseITESO — Backend

REST API for the ReUseITESO marketplace. Built with Django 5 + Django REST Framework + PostgreSQL.

## Stack

- Python 3.12
- Django 5.0 + Django REST Framework
- PostgreSQL 15 (via Docker)
- AWS S3 (image storage)
- boto3 + django-storages

---

## Prerequisites

- Python 3.12
- Docker Desktop
- Git

---

## Initial Setup (first time)

### 1. Clone the repo

```bash
git clone <repo-url>
cd ReUse
```

### 2. Start the database

From the repo root (where `docker-compose.yml` lives):

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Adminer (DB UI) on `http://localhost:8080`

### 3. Create and activate the virtual environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file inside `backend/`:

```bash
# Django
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL (must match docker-compose values)
DB_NAME=reuse_iteso_dev
DB_USER=reuse_dev
DB_PASSWORD=local_dev_password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket_name
AWS_S3_REGION_NAME=us-east-2
```

> AWS credentials are shared by the team. Never commit the `.env` file.

### 6. Run migrations

```bash
python manage.py makemigrations core
python manage.py makemigrations marketplace
python manage.py migrate
```

### 7. Load seed data

```bash
# Marketplace categories
python manage.py loaddata seeds/categories_only.json

# Mock users for development
python manage.py create_mock_users
```

### 8. Start the server

```bash
python manage.py runserver
```

---

## Available URLs

| URL | Description |
|-----|-------------|
| `http://localhost:8000/api/marketplace/products/` | Products |
| `http://localhost:8000/api/marketplace/categories/` | Categories |
| `http://localhost:8000/api/schema/swagger-ui/` | Swagger UI (API docs) |
| `http://localhost:8080` | Adminer (DB UI) |

---

## Development Authentication

The project uses a mock auth middleware while JWT is not yet implemented. To authenticate any request, add the header:

```
X-Mock-User-Id: 1
```

Available mock user IDs are `1`, `2`, and `3` (created with `create_mock_users`).

---

## Publishing a Product with Images

`POST /api/marketplace/products/` using `multipart/form-data`:

| Field | Type | Description |
|-------|------|-------------|
| `title` | text | Product title |
| `description` | text | Product description |
| `condition` | text | `nuevo`, `como_nuevo`, `buen_estado`, `usado` |
| `transaction_type` | text | `sale`, `donation`, `swap` |
| `price` | text | Required only if `transaction_type` is `sale` |
| `category` | text | Category ID |
| `images` | file | Up to 5 images (JPEG, PNG or WebP). Repeat the field for each image. |

Images are uploaded to S3 and referenced in the DB via the `Images` model.

---

## Useful Commands

```bash
# Run tests
python manage.py test

# Create a new migration after modifying a model
python manage.py makemigrations <app>

# Open Django shell
python manage.py shell

# List all registered URLs
python manage.py show_urls
```

---

## Project Structure

```
backend/
├── config/              # Settings, root URLs, WSGI/ASGI
│   ├── settings.py
│   └── urls.py
├── core/                # App: users and authentication
│   ├── models/
│   ├── middleware.py    # MockAuthMiddleware (dev only)
│   └── management/commands/create_mock_users.py
├── marketplace/         # App: products, categories, images
│   ├── models/
│   │   ├── product.py
│   │   ├── images.py
│   │   └── category.py
│   ├── serializers/
│   ├── views/
│   ├── services/
│   │   ├── s3_service.py      # S3 file upload logic
│   │   └── product_service.py # Product business logic
│   └── urls.py
├── seeds/               # Initial data for development
├── requirements.txt
└── manage.py
```
