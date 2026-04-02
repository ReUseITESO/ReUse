# Schema Evolution Guide - ReUseITESO

**DBA:** Daniel
**Date:** 5 March 2026
**Version:** 1.0

---

## Purpose

This document answers three key questions for the sustainable growth of the project:

1. How will future schema modifications be handled?
2. How do we avoid early structural debt?
3. How are changes that affect multiple modules evaluated?

---

## 1. How Future Schema Modifications Are Handled

### Base Rule

> Every schema change — without exception — must be made through a versioned Django migration committed to the repository.

The following are not allowed:

* Manual changes via psql or Adminer
* `ALTER TABLE` executed directly on the database
* Modifying models without generating the corresponding migration
* Pushing modified models without including the migration in the same commit

### Required Flow for Any Change

```
1. Open a GitHub issue describing the change
2. Tag the DBA (@Danielon123456789)
3. Wait for approval based on change type (see governance.md)
4. Implement in a feature/ branch
5. Generate migration: python manage.py makemigrations --name clear_description
6. Review SQL: python manage.py sqlmigrate app 000X
7. Apply locally and verify
8. Include the migration in the PR (same commit as the model)
9. DBA reviews the PR before merge
```

### Change Types and Approval Times

| Type               | Examples                                  | Response Time |
| ------------------ | ----------------------------------------- | ------------- |
| **Minor**    | Add nullable column, add index            | 24 hrs        |
| **Moderate** | Add table, NOT NULL column, rename        | 3 days        |
| **Major**    | Schema restructuring, destructive changes | 7 days        |
| **Hotfix**   | Critical production bug                   | 6 hrs         |

See `governance.md` for the full process per type.

### loaddata Compatibility (Lesson Learned)

Avoid these patterns in models that use fixtures:

```python
# INCOMPATIBLE with loaddata
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)

# CORRECT
created_at = models.DateTimeField(default=timezone.now, editable=False)
updated_at = models.DateTimeField(default=timezone.now)

def save(self, *args, **kwargs):
    if not self._state.adding:
        self.updated_at = timezone.now()
    super().save(*args, **kwargs)
```

`auto_now=True` marks the field as `editable=False`. Django ignores it in raw mode
and inserts NULL, violating the NOT NULL constraint.

---

## 2. How to Avoid Early Structural Debt

### Design Principles to Maintain

**Normalization (3NF)**

* Each piece of data lives in exactly one place
* Do not duplicate information across tables (e.g. `price` lives only in `products`, not in `transactions`)
* Changes that introduce duplication require explicit justification

**Scope-appropriate simplicity**

* Before adding a new table, ask: does a field on an existing table solve the same problem?
* Before adding a field, ask: will this actually be used in the MVP or is it "just in case"?
* "Just in case" is not sufficient justification in a semester-long project

**Constraints from the start**

* NOT NULL on every required field
* CHECK constraints for domains (enums, ranges)
* UNIQUE where the business requires it
* FK with appropriate ON DELETE (RESTRICT vs CASCADE)

Constraints are much cheaper to add at the start than to clean up corrupt data later.

### Early Warning Signs of Structural Debt

Escalate to the DBA if any of these patterns are observed:

| Signal                                         | Problem                          | Action                  |
| ---------------------------------------------- | -------------------------------- | ----------------------- |
| Generic `notes TEXT`field on multiple tables | Unstructured data, hard to query | Model a specific entity |
| Same data in two tables                        | Guaranteed desync                | Normalize, use FK       |
| Status as free text with no CHECK              | Inconsistent values in DB        | Add CHECK or choices    |
| Table with 20+ columns                         | God table, SRP violation         | Evaluate splitting      |
| FK without index                               | Slow queries on joins            | Add index               |
| Table without `created_at`                   | No traceability                  | Required on every table |

### Required Fields on Every New Table

```sql
id          BIGSERIAL PRIMARY KEY
created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

`updated_at` is recommended for tables that are frequently modified.

---

## 3. How Changes That Affect Multiple Modules Are Evaluated

### Identify Impact Before Approving

When a change reaches the DBA, it is evaluated across 4 dimensions:

**A. Impact on existing data**

* Does the change break data that already exists in the DB?
* Does it require a data migration in addition to the schema migration?
* Is the seed data still valid?

**B. Impact on dependent modules**

* Which other models reference the table or field being changed?
* Does any `__str__`, `clean()`, or `save()` in another model use the field?
* Are there serializers or views in other modules that depend on the field?

Real example (March 2026): PR #70 changed `User.name → first_name + last_name`.
Undetected impact: `forum_question.__str__` and `environment_impact.__str__`
used `self.user.name` → runtime crash.

**Cross-module impact checklist:**

```
[ ] Search the entire codebase for references to the changed field
[ ] grep -r "user.name" backend/  (example)
[ ] Review __str__ methods of related models
[ ] Review serializers that expose the field
[ ] Review tests that use the field
[ ] Update seed data if applicable
```

**C. Impact on existing migrations**

* Does the change conflict with already applied migrations?
* Is a `--fake` needed in any environment?
* Is the migration reversible?

**D. Impact on the ERD**

* Does the change require updating `erd_v1.md`?
* Should an RFC be created if it is a major change?
* Should it be recorded in `changes.md`?

### Changes That Always Require DBA Review

Regardless of type, these changes always go through the DBA:

* Modifying the `User` model (impacts all modules)
* Adding or removing tables
* Changing data types of existing columns
* Modifying constraints (FK, UNIQUE, CHECK)
* Renaming tables or columns
* Changes that affect more than one module (core + marketplace, etc.)

### Evaluation Process for Cross-Module Changes

```
1. DBA receives the issue/PR
2. Identifies all affected modules
3. Notifies the owners of each affected module
4. Discussion period based on change type
5. DBA documents the decision in the issue
6. If approved: implement with migration + update ERD + update changes.md
7. If rejected: document the reason in the issue
```

---

## Lessons Learned (Sprint 1)

These situations occurred in the first sprint and must be avoided going forward:

| Situation                                            | Impact                                    | Prevention                                        |
| ---------------------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| Models pushed without migrations                     | `DuplicateTable`error on migrate        | Include migration in the same commit as the model |
| `auto_now=True`on fields                           | Incompatible with `loaddata`            | Use `default=timezone.now`+`save()`override   |
| User model changed without cross-model impact review | Runtime crash in other models'`__str__` | Cross-module impact checklist required            |
| New tables merged without DBA approval               | Schema out of sync with ERD               | All PRs with new models require DBA tag           |
| Seed not updated after model change                  | `loaddata`fails                         | Seed update is part of the PR checklist           |

---

## Quick Reference

```bash
# View status of all migrations
python manage.py showmigrations

# View SQL of a migration before applying
python manage.py sqlmigrate app 000X

# Generate migration with descriptive name
python manage.py makemigrations app --name description_of_change

# Revert a migration (if reversible)
python manage.py migrate app 000X_previous

# Verify no pending migrations exist
python manage.py migrate --check
```

---

**Last updated:** 5 March 2026
**Responsible:** Daniel (DBA)
