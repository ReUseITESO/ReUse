# ERD - ReUseITESO

**Date:** 24 February 2026
**DBA:** Daniel

---

## Notes on Table Names

Django generates table names automatically as `{app}_{model}`. Since `db_table` overrides were removed, the actual table names in PostgreSQL are:

| Model                          | Table                              |
| ------------------------------ | ---------------------------------- |
| core.User                      | `core_user`                      |
| marketplace.Category           | `marketplace_category`           |
| marketplace.Products           | `marketplace_products`           |
| marketplace.Images             | `marketplace_images`             |
| marketplace.Transaction        | `marketplace_transaction`        |
| marketplace.ForumQuestion      | `marketplace_forumquestion`      |
| gamification.Badges            | `gamification_badges`            |
| gamification.UserBadges        | `gamification_userbadges`        |
| gamification.EnvironmentImpact | `gamification_environmentimpact` |

---

## Tables

### User

Extends Django `AbstractUser`. Authentication fields (`password`, `last_login`, `is_active`, `is_staff`, `is_superuser`) are included automatically.

```sql
CREATE TABLE core_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL CHECK (email ~* '@iteso\.mx$'),
    username VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    profile_picture VARCHAR(500),
    date_joined TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_core_user_email ON core_user(email);
```

---

### Category

```sql
CREATE TABLE marketplace_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### Products

```sql
CREATE TABLE marketplace_products (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES marketplace_category(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('nuevo', 'como_nuevo', 'buen_estado', 'usado')),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('donation', 'sale', 'swap')),
    status VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_proceso', 'completado', 'cancelado')),
    price DECIMAL(10,2) CHECK (price >= 0),
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (transaction_type = 'donation' AND price IS NULL) OR
        (transaction_type = 'sale' AND price > 0) OR
        (transaction_type = 'swap')
    )
);

CREATE INDEX idx_marketplace_products_seller ON marketplace_products(seller_id);
CREATE INDEX idx_marketplace_products_category ON marketplace_products(category_id);
CREATE INDEX idx_marketplace_products_status ON marketplace_products(status);
CREATE INDEX idx_marketplace_products_available ON marketplace_products(status, category_id) WHERE status = 'disponible';
CREATE INDEX idx_marketplace_products_search ON marketplace_products USING GIN(to_tsvector('spanish', title || ' ' || description));
```

---

### Images

```sql
CREATE TABLE marketplace_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    order_number INTEGER NOT NULL CHECK (order_number > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, order_number)
);

CREATE INDEX idx_marketplace_images_product ON marketplace_images(product_id, order_number);
```

---

### Transaction

```sql
CREATE TABLE marketplace_transaction (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    seller_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE RESTRICT,
    buyer_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('donation', 'sale', 'swap')),
    seller_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    seller_confirmed_at TIMESTAMP,
    buyer_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    buyer_confirmed_at TIMESTAMP,
    delivery_date TIMESTAMP,
    delivery_location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (seller_id != buyer_id)
);

CREATE UNIQUE INDEX idx_marketplace_transaction_product ON marketplace_transaction(product_id);
CREATE INDEX idx_marketplace_transaction_seller ON marketplace_transaction(seller_id);
CREATE INDEX idx_marketplace_transaction_buyer ON marketplace_transaction(buyer_id);
```

---

### ForumQuestion

```sql
CREATE TABLE marketplace_forumquestion (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    parent_id BIGINT REFERENCES marketplace_forumquestion(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (id != parent_id)
);

CREATE INDEX idx_marketplace_forumquestion_product ON marketplace_forumquestion(product_id);
CREATE INDEX idx_marketplace_forumquestion_user ON marketplace_forumquestion(user_id);
CREATE INDEX idx_marketplace_forumquestion_parent ON marketplace_forumquestion(parent_id);
```

---

### Badges (pending — gamification module not yet active)

```sql
CREATE TABLE gamification_badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('comun', 'raro', 'epico', 'legendario')),
    points INTEGER NOT NULL CHECK (points >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### UserBadges (pending — gamification module not yet active)

```sql
CREATE TABLE gamification_userbadges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    badge_id BIGINT NOT NULL REFERENCES gamification_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_gamification_userbadges_user ON gamification_userbadges(user_id);
```

---

### EnvironmentImpact (pending — gamification module not yet active)

```sql
CREATE TABLE gamification_environmentimpact (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    kg_co2_saved DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (kg_co2_saved >= 0),
    reused_products INTEGER NOT NULL DEFAULT 0 CHECK (reused_products >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_gamification_environmentimpact_user ON gamification_environmentimpact(user_id);
```

---

## Relations

* User 1 → N Products (seller)
* Category 1 → N Products
* Products 1 → N Images
* Products 1 → 1 Transaction
* User 1 → N Transactions (as seller)
* User 1 → N Transactions (as buyer)
* Products 1 → N ForumQuestions
* User 1 → N ForumQuestions
* ForumQuestion 1 → N ForumQuestion (self-referential, replies)
* User N → M Badges (through UserBadges)
* User 1 → 1 EnvironmentImpact

---

## Triggers (planned)

```sql
-- Auto-update updated_at on tables that require it
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

**Last updated:** 24 February 2026
**Responsible:** Daniel (DBA)
