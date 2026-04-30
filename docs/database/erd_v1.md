# ERD - ReUseITESO

**Date:** 22 April 2026
**DBA:** Daniel
**Version:** 1.5

---

## Changelog

| Version | Date        | Change                                                                                                                                                                                                        |
| ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 15 Feb 2026 | Initial ERD                                                                                                                                                                                                   |
| 1.1     | 5 Mar 2026  | User: name → first_name/last_name, email verification fields. Products: updated_at. Badges: icon_url → icon. Added PointRule, PointTransaction, EmailVerificationToken. All gamification tables now active. |
| 1.2     | 11 Mar 2026 | Added Social module: UserConnection, FrequentContact, Community, CommunityMember. Fixed FK column names: Images/Transaction/ForumQuestion use products_id (verified against source code).                     |
| 1.3     | 12 Mar 2026 | Added Social module: CommunityPost. ForumQuestion: products_id made nullable, post_id FK added, CHECK constraint enforces exactly one target.                                                                 |
| 1.4     | 19 Mar 2026 | Added Marketplace module: ProductReaction, Report. Added Core module: Notification. Rejected denormalized counters (likes_count, dislikes_count, report_count) — counts via query with index.                |
| 1.5     | 22 Apr 2026 | Added Marketplace module: SwapTransaction. Added updated_at to Transaction. Prerequisite for HU-MKT-12.                                                                                                       |

---

## Notes on Table Names

Django generates table names automatically as `{app}_{model}`. The actual table names in PostgreSQL are:

| Model                          | Table                              | Status |
| ------------------------------ | ---------------------------------- | ------ |
| core.User                      | `core_user`                      | Active |
| core.EmailVerificationToken    | `core_emailverificationtoken`    | Active |
| core.Notification              | `core_notification`              | Active |
| marketplace.Category           | `marketplace_category`           | Active |
| marketplace.Products           | `marketplace_products`           | Active |
| marketplace.Images             | `marketplace_images`             | Active |
| marketplace.Transaction        | `marketplace_transaction`        | Active |
| marketplace.SwapTransaction    | `marketplace_swaptransaction`    | Active |
| marketplace.ForumQuestion      | `marketplace_forumquestion`      | Active |
| marketplace.ProductReaction    | `marketplace_productreaction`    | Active |
| marketplace.Report             | `marketplace_report`             | Active |
| gamification.Badges            | `gamification_badges`            | Active |
| gamification.UserBadges        | `gamification_userbadges`        | Active |
| gamification.EnvironmentImpact | `gamification_environmentimpact` | Active |
| gamification.PointRule         | `gamification_pointrule`         | Active |
| gamification.PointTransaction  | `gamification_pointtransaction`  | Active |
| social.UserConnection          | `social_userconnection`          | Active |
| social.FrequentContact         | `social_frequentcontact`         | Active |
| social.Community               | `social_community`               | Active |
| social.CommunityMember         | `social_communitymember`         | Active |
| social.CommunityPost           | `social_communitypost`           | Active |

---

## Tables

### User

Extends Django `AbstractUser`. Authentication fields (`password`, `last_login`, `is_active`, `is_staff`, `is_superuser`) are included automatically.

> **v1.1 change:** `name` replaced by `first_name` + `last_name` (PR #70). Email verification fields added.

```sql
CREATE TABLE core_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL CHECK (email ~* '@iteso\.mx$'),
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    profile_picture VARCHAR(500),
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMP,
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

### EmailVerificationToken

> **v1.1:** New table added by PR #70.

```sql
CREATE TABLE core_emailverificationtoken (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    token VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_core_emailverificationtoken_user ON core_emailverificationtoken(user_id);
```

---

### Notification

> **v1.4:** New table. Stores in-app notifications for users. Triggered by badge awards, point transactions, reports, and reactions.

```sql
CREATE TABLE core_notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    reference_id INTEGER,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_user_unread ON core_notification(user_id, is_read) WHERE is_read = FALSE;
```

**Design note:** `reference_id` is a generic reference (no FK constraint) — it can point to different tables depending on `type`. The `type` field indicates which table `reference_id` belongs to (e.g. `badge_earned` → `gamification_badges`, `points_added` → `gamification_pointtransaction`). Integrity is enforced at the Django layer, not at the DB level.

**Known `type` values:**

| type                      | reference_id points to            |
| ------------------------- | --------------------------------- |
| `badge_earned`          | `gamification_badges`           |
| `points_added`          | `gamification_pointtransaction` |
| `transaction_confirmed` | `marketplace_transaction`       |
| `product_reported`      | `marketplace_report`            |
| `new_reaction`          | `marketplace_productreaction`   |

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

> **v1.1:** `updated_at` added. `auto_now=True` replaced by `default=timezone.now` + `save()` override for `loaddata` compatibility.

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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    products_id BIGINT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    order_number INTEGER NOT NULL CHECK (order_number > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(products_id, order_number)
);

CREATE INDEX idx_marketplace_images_product ON marketplace_images(products_id, order_number);
```

---

### Transaction

> **v1.5:** `updated_at` added. `auto_now_add=True` on `created_at` replaced by `default=timezone.now` + `save()` override for `loaddata` compatibility.

```sql
CREATE TABLE marketplace_transaction (
    id BIGSERIAL PRIMARY KEY,
    products_id BIGINT UNIQUE NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (seller_id != buyer_id)
);

CREATE UNIQUE INDEX idx_marketplace_transaction_product ON marketplace_transaction(products_id);
CREATE INDEX idx_marketplace_transaction_seller ON marketplace_transaction(seller_id);
CREATE INDEX idx_marketplace_transaction_buyer ON marketplace_transaction(buyer_id);
```

---

### SwapTransaction

> **v1.5:** New table. Dedicated state machine for swap-type transactions. Linked 1:1 to Transaction. Tracks product proposal and meeting agenda negotiation stages. Prerequisite for HU-MKT-12.

```sql
CREATE TABLE marketplace_swaptransaction (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT UNIQUE NOT NULL
        REFERENCES marketplace_transaction(id) ON DELETE CASCADE,
    proposed_product_id BIGINT NOT NULL
        REFERENCES marketplace_products(id) ON DELETE RESTRICT,
    stage VARCHAR(30) NOT NULL DEFAULT 'proposal_pending'
        CHECK (stage IN (
            'proposal_pending',
            'proposal_rejected',
            'proposal_accepted',
            'agenda_pending',
            'agenda_rejected',
            'agenda_accepted'
        )),
    agenda_location VARCHAR(255),
    proposal_decided_at TIMESTAMP,
    agenda_decided_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_swaptx_transaction
    ON marketplace_swaptransaction(transaction_id);
CREATE INDEX idx_swaptx_proposed_product
    ON marketplace_swaptransaction(proposed_product_id);
CREATE INDEX idx_swaptx_stage
    ON marketplace_swaptransaction(stage);
CREATE INDEX idx_swaptx_stage_created
    ON marketplace_swaptransaction(stage, created_at);
```

**Stage flow:**

* `proposal_pending` — buyer proposed a product, seller has not responded
* `proposal_rejected` — seller rejected the proposed product
* `proposal_accepted` — seller accepted the proposed product
* `agenda_pending` — product accepted, meeting location/date proposed, pending acceptance
* `agenda_rejected` — meeting proposal rejected
* `agenda_accepted` — meeting confirmed, transaction proceeds to delivery confirmation

**Design note:** `proposed_product_id` uses `ON DELETE RESTRICT` — a product that is part of an active swap proposal cannot be deleted. Cross-table constraint (`proposed_product_id != transaction.products_id`) is enforced at the Django layer via `clean()`. On `stage = agenda_accepted`, the service layer must sync `agenda_location` → `Transaction.delivery_location`.

---

### ForumQuestion

> **v1.3:** `products_id` made nullable. `post_id` FK added. CHECK constraint enforces exactly one target (product or post, never both, never neither).

```sql
CREATE TABLE marketplace_forumquestion (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    products_id BIGINT REFERENCES marketplace_products(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES social_communitypost(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    parent_id BIGINT REFERENCES marketplace_forumquestion(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (id != parent_id),
    CHECK (
        (products_id IS NOT NULL AND post_id IS NULL) OR
        (products_id IS NULL AND post_id IS NOT NULL)
    )
);

CREATE INDEX idx_marketplace_forumquestion_product ON marketplace_forumquestion(products_id);
CREATE INDEX idx_marketplace_forumquestion_user ON marketplace_forumquestion(user_id);
CREATE INDEX idx_marketplace_forumquestion_parent ON marketplace_forumquestion(parent_id);
CREATE INDEX idx_marketplace_forumquestion_post ON marketplace_forumquestion(post_id);
```

---

### ProductReaction

> **v1.4:** New table. Stores individual like/dislike reactions per user per product. Reaction counts are obtained via query — no denormalized counters in Products.

```sql
CREATE TABLE marketplace_productreaction (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('like', 'dislike')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_productreaction_product_user UNIQUE (product_id, user_id)
);

CREATE INDEX idx_pr_product_type ON marketplace_productreaction(product_id, type);
CREATE INDEX idx_pr_user ON marketplace_productreaction(user_id);
```

**Design note:** The count query uses the composite index `(product_id, type)` — no full table scan needed. No `likes_count` / `dislikes_count` stored in `Products` to avoid drift from bulk operations that bypass Django signals.

---

### Report

> **v1.4:** New table. Stores user-submitted reports on products. Report counts are obtained via query — no denormalized `report_count` in Products.

```sql
CREATE TABLE marketplace_report (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
    reporter_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    reason VARCHAR(30) NOT NULL CHECK (reason IN ('prohibited_item', 'misleading_description', 'offensive_content', 'possible_scam', 'other')),
    description VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_report_product_reporter UNIQUE (product_id, reporter_id)
);

CREATE INDEX idx_marketplace_report_product ON marketplace_report(product_id);
CREATE INDEX idx_report_reporter ON marketplace_report(reporter_id);
```

**Design note:** `reporter_id` uses CASCADE — if a user is deleted their reports are removed. `product_id` uses CASCADE — if a product is deleted its reports are removed. No `report_count` in `Products` for the same reason as `likes_count`.

---

### Badges

> **v1.1:** `icon_url` renamed to `icon` (PR #64). Module now active.

```sql
CREATE TABLE gamification_badges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(500) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('comun', 'raro', 'epico', 'legendario')),
    points INTEGER NOT NULL CHECK (points >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

### UserBadges

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

### EnvironmentImpact

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

### PointRule

> **v1.1:** New table added by PR #62. Defines how many points each action awards.

```sql
CREATE TABLE gamification_pointrule (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50) UNIQUE NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Example rows (must be configured manually via admin panel):**

| action                | points | description              |
| --------------------- | ------ | ------------------------ |
| `complete_sale`     | 50     | Completar una venta      |
| `complete_donation` | 100    | Completar una donación  |
| `complete_swap`     | 75     | Completar un intercambio |

---

### PointTransaction

> **v1.1:** New table added by PR #62. Records every point movement per user.

```sql
CREATE TABLE gamification_pointtransaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    reference_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gamification_pointtransaction_user ON gamification_pointtransaction(user_id);
```

---

## Social Module

> **v1.2:** New module added. Four tables to support user connections, frequent contacts, and communities.

### UserConnection

Manages the full lifecycle of a friend request between two users. A single row represents the relationship — once `accepted`, both users are considered connected (bidirectional).

```sql
CREATE TABLE social_userconnection (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    addressee_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

CREATE INDEX idx_social_userconnection_requester ON social_userconnection(requester_id);
CREATE INDEX idx_social_userconnection_addressee ON social_userconnection(addressee_id);
CREATE INDEX idx_social_userconnection_status ON social_userconnection(addressee_id, status);
```

**Status flow:**

* `pending` — requester sent request, addressee has not responded
* `accepted` — addressee accepted, connection is now bidirectional
* `rejected` — addressee declined
* `blocked` — either user blocked the other

---

### FrequentContact

Personal and unilateral mark. A user can tag any of their accepted connections as "frequent". The contact is not notified and does not need to take any action.

```sql
CREATE TABLE social_frequentcontact (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, contact_id),
    CHECK (user_id != contact_id)
);

CREATE INDEX idx_social_frequentcontact_user ON social_frequentcontact(user_id);
```

**Design note:** No FK to `social_userconnection`. The prerequisite (must be accepted friends) is enforced at the business logic layer in Django, not at the DB level. Keeps schema simple.

---

### Community

Communities created by users. Supports public and private communities. Uses soft delete via `is_active` — communities are never hard deleted.

```sql
CREATE TABLE social_community (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(500),
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_community_creator ON social_community(creator_id);
CREATE INDEX idx_social_community_active ON social_community(is_active) WHERE is_active = TRUE;
```

**Design note:** `ON DELETE RESTRICT` on `creator_id` — a user who created communities cannot be deleted without first transferring ownership or deactivating the community.

---

### CommunityMember

N:M junction table between users and communities, with a role per membership.

```sql
CREATE TABLE social_communitymember (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES social_community(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
);

CREATE INDEX idx_social_communitymember_community ON social_communitymember(community_id);
CREATE INDEX idx_social_communitymember_user ON social_communitymember(user_id);
CREATE INDEX idx_social_communitymember_role ON social_communitymember(community_id, role);
```

**Design note:** The `creator_id` in `social_community` is audit-only. Actual permissions are governed by `role` in this table. When a community is created, the creator must be inserted here with `role = 'admin'`.

---

### CommunityPost

> **v1.3:** New table. Posts published inside communities by their members. Supports pinned posts for announcements.

```sql
CREATE TABLE social_communitypost (
    id BIGSERIAL PRIMARY KEY,
    community_id BIGINT NOT NULL REFERENCES social_community(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES core_user(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_communitypost_community ON social_communitypost(community_id);
CREATE INDEX idx_social_communitypost_user ON social_communitypost(user_id);
CREATE INDEX idx_social_communitypost_pinned ON social_communitypost(community_id, is_pinned) WHERE is_pinned = TRUE;
```

---

## Relations

**Core**

* User 1 → N EmailVerificationToken
* User 1 → N Notification

**Marketplace**

* User 1 → N Products (as seller)
* Category 1 → N Products
* Products 1 → N Images
* Products 1 → 1 Transaction
* Transaction 1 → 1 SwapTransaction
* Products 1 → N SwapTransaction (as proposed_product)
* User 1 → N Transactions (as seller)
* User 1 → N Transactions (as buyer)
* Products 1 → N ForumQuestions
* User 1 → N ForumQuestions
* ForumQuestion 1 → N ForumQuestion (self-referential, replies)
* User 1 → N ProductReaction
* Products 1 → N ProductReaction
* User 1 → N Report (as reporter)
* Products 1 → N Report

**Gamification**

* User N → M Badges (through UserBadges)
* User 1 → 1 EnvironmentImpact
* User 1 → N PointTransaction

**Social**

* User 1 → N UserConnection (as requester)
* User 1 → N UserConnection (as addressee)
* User 1 → N FrequentContact (as user)
* User 1 → N FrequentContact (as contact)
* User 1 → N Community (as creator)
* Community N → M User (through CommunityMember)
* Community 1 → N CommunityPost
* User 1 → N CommunityPost
* CommunityPost 1 → N ForumQuestion (as post target)

---

## Known Design Notes

**`updated_at` and `auto_now=True`**

`auto_now=True` in Django 5 is incompatible with `loaddata` (marks field as `editable=False`, Django ignores it in raw mode and inserts NULL). All `updated_at` fields use `default=timezone.now` with a `save()` override instead.

**`PointRule` and `PointTransaction`**

These tables were not in the original ERD v1 design (which used `users.points` as a simple counter for MVP). They were added in PR #62 without prior DBA approval. They have been retained but require `PointRule` rows to be configured manually via the admin panel before the points system functions.

**`Badges.icon` vs `icon_url`**

The original ERD specified `icon_url`. The implementation uses `icon` (PR #64). The ERD has been updated to reflect the actual implementation.

**Social Module**

`UserConnection` uses a single row per pair (requester/addressee) to represent a bidirectional friendship once accepted. Querying friends requires checking both FK columns. `FrequentContact` is a unilateral personal mark — no notification or acceptance required from the contact. `Community` uses soft delete (`is_active`) to preserve history. `CommunityMember` governs all access via `role`; the `creator_id` on `Community` is audit-only.

**Denormalized counter rejection (v1.4)**

HU-DB-01 and the Report table proposal both requested denormalized counters (`likes_count`, `dislikes_count`, `report_count`) on `marketplace_products`. These were rejected. Django signals do not fire on bulk operations (`bulk_create`, `QuerySet.delete()`), which causes silent drift between the counter and the actual row count. All counts are obtained via `COUNT()` query with composite indexes on `(product_id, type)` for reactions and `(product_id)` for reports.

**`core_notification.reference_id`**

Generic reference with no FK constraint. The `type` field determines which table `reference_id` points to. Enforced at Django layer only. This is intentional — PostgreSQL does not support FK constraints pointing to multiple tables simultaneously.

**`SwapTransaction.proposed_product_id` cross-table constraint (v1.5)**

PostgreSQL does not support CHECK constraints that reference other tables. The constraint (`proposed_product_id != transaction.products_id`) is enforced at the Django layer via `clean()` on the `SwapTransaction` model. On `stage = agenda_accepted`, the service layer is responsible for syncing `agenda_location` → `Transaction.delivery_location` before proceeding to the delivery confirmation flow.

---

**Last updated:** 22 April 2026
**Responsible:** Daniel (DBA)
