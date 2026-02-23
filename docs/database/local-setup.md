# Local Setup - ReUseITESO

**DBA:** Daniel  
**Fecha:** 16 de febrero de 2026  
**Versión:** 1.1

---

## Prerequisitos

- Docker Desktop
- Python 3.12+
- Git

---

## Setup Rápido

### 1. Clonar Repo
```bash
git clone https://github.com/ReUseITESO/infrastucture.git
cd infrastucture
```

### 2. Levantar PostgreSQL
```bash
docker-compose up -d db

# Verificar que esté corriendo
docker-compose logs db | tail -20
# Debes ver: "database system is ready to accept connections"
```

### 3. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv

# Activar
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows
```

### 4. Instalar Dependencias
```bash
pip install -r requirements.txt
```

**Dependencias clave:**
- Django 5.0.1
- djangorestframework 3.14.0
- psycopg2-binary 2.9.9
- python-dotenv 1.0.0 (para cargar variables de entorno)

### 5. Configurar Variables de Entorno

**Crear archivo `.env`:**
```bash
cp .env.example .env
```

**El archivo `.env` debe contener:**
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

**⚠️ Importante:** Las credenciales deben coincidir con `docker-compose.yml`

### 6. Crear Carpetas de Migraciones

```bash
# Crear carpetas si no existen
mkdir -p core/migrations
mkdir -p marketplace/migrations
mkdir -p gamification/migrations

# Crear archivos __init__.py
touch core/migrations/__init__.py
touch marketplace/migrations/__init__.py
touch gamification/migrations/__init__.py
```

### 7. Generar y Aplicar Migraciones

```bash
# Generar migraciones
python manage.py makemigrations

# Deberías ver:
# Migrations for 'core':
#   core/migrations/0001_initial.py
#     - Create model User
# Migrations for 'marketplace':
#   marketplace/migrations/0001_initial.py
#     - Create model Category
#     - Create model Products
#     ...
# Migrations for 'gamification':
#   gamification/migrations/0001_initial.py
#     - Create model Badges
#     ...

# Aplicar migraciones
python manage.py migrate

# Deberías ver:
# Running migrations:
#   Applying core.0001_initial... OK
#   Applying marketplace.0001_initial... OK
#   Applying gamification.0001_initial... OK
```

### 8. Cargar Seed Data

```bash
python manage.py loaddata seeds/seed_v1.json

# Deberías ver:
# Installed 44 object(s) from 1 fixture(s)
```

**Seed data incluye:**
- 6 usuarios (@iteso.mx)
- 5 categorías
- 10 productos
- 3 transacciones
- 3 badges
- Y más...

### 9. Crear Superuser

```bash
python manage.py shell
```

Dentro del shell:
```python
from django.contrib.auth.models import User as AuthUser

AuthUser.objects.create_superuser(
    username='admin',
    email='admin@iteso.mx',
    password='admin123'
)

print("Superuser creado")
exit()
```

### 10. Iniciar Servidor

```bash
python manage.py runserver 0.0.0.0:8000
```

**Acceder a:**
- Admin: http://localhost:8000/admin/
  - Username: `admin`
  - Password: `admin123`

---

## Comandos Útiles

### Docker

```bash
# Ver status
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f db

# Detener servicios
docker-compose down

# Reset completo (⚠️ BORRA TODOS LOS DATOS)
docker-compose down -v
docker-compose up -d db
sleep 10
cd backend
python manage.py migrate
python manage.py loaddata seeds/seed_v1.json
```

### Django

```bash
# Aplicar migraciones
python manage.py migrate

# Ver estado de migraciones
python manage.py showmigrations

# Ver SQL de una migración
python manage.py sqlmigrate core 0001

# Django shell (Python interactivo)
python manage.py shell

# PostgreSQL shell directo
python manage.py dbshell

# Crear nueva migración
python manage.py makemigrations

# Crear fixture (exportar datos)
python manage.py dumpdata core.User --indent 2 > usuarios.json
```

---

## Acceso Directo a la Base de Datos

### Opción 1: Adminer (GUI Web)

```bash
# Levantar Adminer
docker-compose up -d adminer
```

**Acceder:** http://localhost:8080

**Credenciales:**
- System: `PostgreSQL`
- Server: `db`
- Username: `reuse_dev`
- Password: `local_dev_password`
- Database: `reuse_iteso_dev`

### Opción 2: psql (Terminal)

```bash
# Entrar al container
docker exec -it reuse_iteso_db psql -U reuse_dev -d reuse_iteso_dev

# Comandos útiles en psql:
\dt                    # Listar tablas
\d users              # Describir tabla users
\d+ products          # Describir tabla products con detalles
SELECT * FROM users;  # Query
\q                    # Salir
```

### Opción 3: Django dbshell

```bash
cd backend
python manage.py dbshell

# Ahora estás en psql
\dt
```

---

## Verificar Instalación

### Checklist Completo

```bash
# 1. PostgreSQL corriendo
docker-compose ps
# ✅ reuse_iteso_db debe estar "Up"

# 2. Conexión a DB funcional
python manage.py dbshell
\dt
\q

# 3. Ver las 9 tablas
python manage.py dbshell
\dt
# ✅ Debes ver:
# - users
# - categories
# - products
# - images
# - transactions
# - forum_questions
# - badges
# - user_badges
# - environment_impact

# 4. Verificar datos del seed
python manage.py shell
```

```python
from core.models import User
from marketplace.models import Products, Category
from gamification.models import Badges

print(f"Usuarios: {User.objects.count()}")  # Debe ser 6
print(f"Productos: {Products.objects.count()}")  # Debe ser 10
print(f"Categorías: {Category.objects.count()}")  # Debe ser 5
print(f"Badges: {Badges.objects.count()}")  # Debe ser 3
exit()
```

---

## Troubleshooting

### Error: "Port 5432 already in use"

**Opción A:** Cambiar puerto en `.env`
```dotenv
DB_PORT=5433
```

Actualizar `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"
```

**Opción B:** Detener proceso en 5432
```bash
# Linux/Mac
sudo lsof -i :5432
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :5432
taskkill /PID <PID> /F
```

### Error: "No module named 'dotenv'"

```bash
pip install python-dotenv
```

### Error: "password authentication failed"

Verificar que `.env` tenga las mismas credenciales que `docker-compose.yml`:

```bash
# Ver credenciales de Docker
cat docker-compose.yml | grep -A 5 "POSTGRES"

# Ver credenciales de Django
cat .env | grep DB_
```

Deben coincidir:
- `DB_NAME=reuse_iteso_dev`
- `DB_USER=reuse_dev`
- `DB_PASSWORD=local_dev_password`

### Error: "connection refused"

PostgreSQL no está corriendo:
```bash
docker-compose up -d db
sleep 10
docker-compose logs db | tail -20
```

### Carpeta migrations/ no existe

```bash
mkdir -p core/migrations marketplace/migrations gamification/migrations
touch core/migrations/__init__.py
touch marketplace/migrations/__init__.py
touch gamification/migrations/__init__.py
```

### "No changes detected" al hacer makemigrations

Verificar que los modelos estén correctamente importados:

```bash
python manage.py shell
```

```python
from core.models import User
from marketplace.models import Category, Products
from gamification.models import Badges
print("✅ Modelos se importan correctamente")
exit()
```

---

## Arquitectura de la Base de Datos

**Motor:** PostgreSQL 15  
**ORM:** Django ORM  
**Migraciones:** Django Migrations  
**Containerización:** Docker Compose

**9 Tablas Principales:**
1. `users` - Usuarios ITESO
2. `categories` - Categorías de productos
3. `products` - Items publicados
4. `images` - Galería de imágenes por producto
5. `transactions` - Coordinación de entregas
6. `forum_questions` - Foro público Q&A
7. `badges` - Logros disponibles
8. `user_badges` - Badges obtenidos por usuarios
9. `environment_impact` - Métricas de sostenibilidad

---

## Próximos Pasos

1. Explorar el admin: http://localhost:8000/admin/
2. Revisar los modelos en `backend/core/models/`, `backend/marketplace/models/`, `backend/gamification/models/`
3. Leer `docs/database/erd_v1.md` para entender las relaciones
4. Revisar `docs/database/governance.md` antes de hacer cambios al schema

---

**Última actualización:** 16 de febrero de 2026  
**Responsable:** Daniel (DBA)