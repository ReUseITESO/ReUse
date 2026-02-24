# Database Standards - ReUseITESO

**DBA:** Daniel
**Date:** 24 February 2026

---

## Naming Conventions

### Tables

* Format: `{app}_{model}` — generated automatically by Django
* snake_case, plural
* Examples: `core_user`, `marketplace_products`, `marketplace_forumquestion`

### Columns

* snake_case, singular
* Examples: `seller_id`, `created_at`, `transaction_type`

### Foreign Keys

* Format: `{referenced_model}_id`
* Constraint: `fk_{origin_table}_{target_table}_{column}`

```sql
CONSTRAINT fk_marketplace_products_core_user_seller_id
  FOREIGN KEY (seller_id) REFERENCES core_user(id)
```

### Indexes

* Format: `idx_{table}_{column(s)}`

```sql
CREATE INDEX idx_marketplace_products_seller ON marketplace_products(seller_id);
```

---

## Data Types

| Use        | Type          |
| ---------- | ------------- |
| IDs        | BIGSERIAL     |
| Short text | VARCHAR(n)    |
| Long text  | TEXT          |
| Email      | VARCHAR(254)  |
| Integers   | INTEGER       |
| Decimals   | DECIMAL(10,2) |
| Booleans   | BOOLEAN       |
| Timestamps | TIMESTAMP     |
| URLs       | VARCHAR(500)  |

---

## Constraints

### Primary Keys

```sql
id BIGSERIAL PRIMARY KEY
```

### Foreign Keys

```sql
-- RESTRICT: Do not allow delete if dependents exist
seller_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE RESTRICT

-- CASCADE: Delete dependents automatically
product_id BIGINT REFERENCES marketplace_products(id) ON DELETE CASCADE
```

### Check Constraints

```sql
CHECK (price >= 0)
CHECK (email ~* '@iteso\.mx$')
CHECK (status IN ('disponible', 'en_proceso', 'completado', 'cancelado'))
```

### Unique

```sql
email VARCHAR(254) UNIQUE NOT NULL
UNIQUE(user_id, badge_id)
```

---

## Standard Timestamps

All tables include:

```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

`core_user` uses `date_joined` (inherited from Django AbstractUser) instead of `created_at`.

---

## Indexes

Create indexes on:

* Foreign key columns
* Columns used frequently in WHERE clauses
* Columns used in ORDER BY
* Full-text search columns (GIN)

```sql
-- Simple
CREATE INDEX idx_marketplace_products_seller ON marketplace_products(seller_id);

-- Composite
CREATE INDEX idx_marketplace_products_category_status ON marketplace_products(category_id, status);

-- Partial
CREATE INDEX idx_marketplace_products_available ON marketplace_products(status)
  WHERE status = 'disponible';

-- Full-text
CREATE INDEX idx_marketplace_products_search ON marketplace_products
  USING GIN(to_tsvector('spanish', title || ' ' || description));
```

---

## Validations

**At database level:**

* NOT NULL
* UNIQUE
* CHECK (domain validations)
* Foreign keys with appropriate ON DELETE behavior

**At Django level:**

* Complex business validations (e.g. seller != buyer)
* Cross-field validations in `clean()` methods

---

**Last updated:** 24 February 2026
**Responsible:** Daniel (DBA)
