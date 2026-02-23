# Migration Strategy - ReUseITESO

**DBA:** Daniel  
**Fecha:** 15 de febrero de 2026

---

## Reglas Fundamentales

1. **NUNCA modificar migraciones ya aplicadas**
2. **Una migración por feature**
3. **Probar localmente antes de PR**

---

## Workflow

### 1. Modificar Models
```python
# core/models.py
class User(models.Model):
    # Agregar campo
    bio = models.TextField(blank=True, null=True)
```

### 2. Generar Migración
```bash
python manage.py makemigrations --name add_bio_to_user core
```

### 3. Revisar SQL
```bash
python manage.py sqlmigrate core 0002
```

### 4. Aplicar
```bash
python manage.py migrate
```

### 5. Probar Rollback
```bash
python manage.py migrate core 0001  # Volver atrás
python manage.py migrate  # Re-aplicar
```

---

## Naming

Formato: `{numero}_{accion}_{descripcion}.py`

Ejemplos:
```
0001_initial.py
0002_add_bio_to_user.py
0003_fix_email_constraint.py
```

---

## Checklist Pre-PR

- [ ] Migración generada
- [ ] SQL revisado
- [ ] Aplicada localmente
- [ ] Rollback probado
- [ ] Seed data actualizado (si aplica)

---

## Data Migrations

```python
from django.db import migrations

def populate_field(apps, schema_editor):
    User = apps.get_model('core', 'User')
    # Lógica aquí

def reverse(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [('core', '0001_initial')]
    
    operations = [
        migrations.RunPython(populate_field, reverse),
    ]
```

---

## Conflictos

Si dos developers crean misma migración:
```bash
python manage.py makemigrations --merge
```

---

## Ver Estado

```bash
# Listar migraciones
python manage.py showmigrations

# Ver pendientes
python manage.py showmigrations --plan
```
