# ERD - ReUseITESO

**Fecha:** 15 de febrero de 2026  
**DBA:** Daniel

---

## Tablas

### User
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '@iteso\.mx$'),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    profile_picture VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

---

### Category
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### Products
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    condition VARCHAR(20) NOT NULL CHECK (condition IN ('nuevo', 'como_nuevo', 'buen_estado', 'usado')),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('donation', 'sale', 'swap')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('disponible', 'en_proceso', 'completado', 'cancelado')),
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

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_available ON products(status, category_id) WHERE status = 'disponible';
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('spanish', title || ' ' || description));
```

---

### Images
```sql
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    products_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    order_number INTEGER NOT NULL CHECK (order_number > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(products_id, order_number)
);

CREATE INDEX idx_images_product ON images(products_id);
```

---

### Transaction
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    products_id INTEGER UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('donation', 'sale', 'swap')),
    seller_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    seller_confirmed_at TIMESTAMP,
    buyer_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
    buyer_confirmed_at TIMESTAMP,
    delivery_date TIMESTAMP,
    delivery_location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pendiente', 'confirmada', 'completada', 'cancelada')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (seller_id != buyer_id)
);

CREATE UNIQUE INDEX idx_transactions_product ON transactions(products_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
```

---

### Forum_question
```sql
CREATE TABLE forum_questions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    products_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    parent_id INTEGER REFERENCES forum_questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (id != parent_id)
);

CREATE INDEX idx_forum_questions_product ON forum_questions(products_id);
CREATE INDEX idx_forum_questions_user ON forum_questions(user_id);
CREATE INDEX idx_forum_questions_parent ON forum_questions(parent_id);
```

---

### Badges
```sql
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('comun', 'raro', 'epico', 'legendario')),
    points INTEGER NOT NULL CHECK (points >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### User_Badges
```sql
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badges_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badges_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

---

### Environment_impact
```sql
CREATE TABLE environment_impact (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kg_co2_saved DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (kg_co2_saved >= 0),
    reused_products INTEGER NOT NULL DEFAULT 0 CHECK (reused_products >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_environment_impact_user ON environment_impact(user_id);
```

---

## Relaciones

- User 1 → N Products (seller)
- Category 1 → N Products
- Products 1 → N Images
- Products 1 → 1 Transaction
- User 1 → N Transactions (seller)
- User 1 → N Transactions (buyer)
- Products 1 → N Forum_questions
- User 1 → N Forum_questions
- Forum_question 1 → N Forum_question (self-referential)
- User N → M Badges (through User_Badges)
- User 1 → 1 Environment_impact

---

## Triggers Necesarios

```sql
-- Auto-update updated_at (agregar columna a tablas que lo necesiten)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a cada tabla con updated_at
```
