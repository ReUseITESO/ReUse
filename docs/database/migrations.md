# Migration Strategy - ReUseITESO

**DBA:** Daniel
**Date:** 24 February 2026

---

## Core Rules

1. Never modify migrations that have already been applied
2. One migration per feature
3. Test locally before opening a PR

---

## Workflow

### 1. Modify the Model

```python
# core/models/user.py
class User(AbstractUser):
    # Add field
    bio = models.TextField(blank=True, null=True)
```

### 2. Generate Migration

```bash
python manage.py makemigrations --name add_bio_to_user core
```

### 3. Review SQL

```bash
python manage.py sqlmigrate core 0002
```

### 4. Apply

```bash
python manage.py migrate
```

### 5. Test Rollback

```bash
python manage.py migrate core 0001  # Roll back
python manage.py migrate             # Re-apply
```

---

## Naming

Format: `{number}_{action}_{description}.py`

Examples:

```
0001_initial.py
0002_add_bio_to_user.py
0003_fix_email_constraint.py
```

---

## Pre-PR Checklist

* [ ] Migration generated
* [ ] SQL reviewed
* [ ] Applied locally
* [ ] Rollback tested
* [ ] Seed data updated (if applicable)

---

## Data Migrations

```python
from django.db import migrations


def populate_field(apps, schema_editor):
    User = apps.get_model('core', 'User')
    # Logic here


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [('core', '0001_initial')]

    operations = [
        migrations.RunPython(populate_field, reverse),
    ]
```

---

## Merge Conflicts

If two developers generate a migration at the same time:

```bash
python manage.py makemigrations --merge
```

---

## View Status

```bash
# List all migrations
python manage.py showmigrations

# View pending
python manage.py showmigrations --plan
```

---

**Last updated:** 24 February 2026
**Responsible:** Daniel (DBA)
