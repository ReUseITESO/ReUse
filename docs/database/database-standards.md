# Database Standards - ReUseITESO

**DBA:** Daniel  
**Fecha:** 15 de febrero de 2026

---

## Naming Conventions

### Tablas
- snake_case, plural
- Ejemplos: `users`, `products`, `forum_questions`

### Columnas
- snake_case, singular
- Ejemplos: `seller_id`, `created_at`, `transaction_type`

### Foreign Keys
- Formato: `{tabla_referenciada}_id`
- Constraint: `fk_{tabla_origen}_{tabla_destino}_{columna}`
```sql
CONSTRAINT fk_products_users_seller_id 
  FOREIGN KEY (seller_id) REFERENCES users(id)
```

### Índices
- Formato: `idx_{tabla}_{columna(s)}`
```sql
CREATE INDEX idx_products_seller ON products(seller_id);
```

---

## Tipos de Datos

| Uso | Tipo |
|-----|------|
| IDs | SERIAL |
| Texto corto | VARCHAR(n) |
| Texto largo | TEXT |
| Email | VARCHAR(255) |
| Números enteros | INTEGER |
| Decimales | DECIMAL(10,2) |
| Booleanos | BOOLEAN |
| Timestamps | TIMESTAMP |
| URLs | VARCHAR(500) |

---

## Constraints

### Primary Keys
```sql
id SERIAL PRIMARY KEY
```

### Foreign Keys
```sql
-- RESTRICT (default): No permitir delete si hay dependientes
seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT

-- CASCADE: Delete en cascada
products_id INTEGER REFERENCES products(id) ON DELETE CASCADE
```

### Check Constraints
```sql
CHECK (price >= 0)
CHECK (email ~* '@iteso\.mx$')
CHECK (status IN ('disponible', 'en_proceso', 'completado', 'cancelado'))
```

### Unique
```sql
email VARCHAR(255) UNIQUE NOT NULL
UNIQUE(user_id, badges_id)
```

---

## Timestamps Estándar

Todas las tablas:
```sql
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

---

## Índices

Crear índices en:
- Foreign Keys
- Columnas en WHERE frecuente
- Columnas en ORDER BY
- Full-text search (GIN)

```sql
-- Simple
CREATE INDEX idx_products_seller ON products(seller_id);

-- Compuesto
CREATE INDEX idx_products_category_status ON products(category_id, status);

-- Parcial
CREATE INDEX idx_products_available ON products(status) 
  WHERE status = 'disponible';

-- Full-text
CREATE INDEX idx_products_search ON products 
  USING GIN(to_tsvector('spanish', title || ' ' || description));
```

---

## Validaciones

**En Base de Datos:**
- NOT NULL
- UNIQUE
- CHECK (validaciones de dominio)
- Foreign Keys

**En Django:**
- Validaciones de negocio complejas
- Validaciones custom
