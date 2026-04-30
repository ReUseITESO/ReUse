# Database Changes Log - ReUseITESO

**DBA:** Daniel
**Last updated:** 22 April 2026

---

## [2026-04-22] HU-DBA-03 — SwapTransaction + Transaction.updated_at

**Author:** Daniel (DBA)
**Type:** Moderate (new table + new column on existing table)
**DBA approved:** Yes — self-approved (DBA)

### Context

Prerequisite for HU-MKT-12 (#34). Adds dedicated state machine for swap negotiation flow: product proposal → agenda proposal → delivery confirmation. Without this table, HU-MKT-12 would be coupled to temporary solutions with high technical debt.

### Schema changes

**Table: `marketplace_swaptransaction`** — New table

| Column              | Type         | Constraints                                                           |
| ------------------- | ------------ | --------------------------------------------------------------------- |
| id                  | BIGSERIAL    | PK                                                                    |
| transaction_id      | BIGINT       | FK to marketplace_transaction(id) ON DELETE CASCADE, NOT NULL, UNIQUE |
| proposed_product_id | BIGINT       | FK to marketplace_products(id) ON DELETE RESTRICT, NOT NULL           |
| stage               | VARCHAR(30)  | NOT NULL DEFAULT 'proposal_pending', CHECK 6 valid values             |
| agenda_location     | VARCHAR(255) | NULLABLE                                                              |
| proposal_decided_at | TIMESTAMP    | NULLABLE                                                              |
| agenda_decided_at   | TIMESTAMP    | NULLABLE                                                              |
| created_at          | TIMESTAMP    | NOT NULL DEFAULT NOW()                                                |
| updated_at          | TIMESTAMP    | NOT NULL DEFAULT NOW()                                                |

Indexes:

* `idx_swaptx_transaction` on `(transaction_id)` — UNIQUE
* `idx_swaptx_proposed_product` on `(proposed_product_id)`
* `idx_swaptx_stage` on `(stage)`
* `idx_swaptx_stage_created` on `(stage, created_at)` — pending inbox queries

**Table: `marketplace_transaction`** — Column added

| Change      | Detail                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Field added | `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`                                                                        |
| Fix applied | `auto_now_add=True`on `created_at`replaced by `default=timezone.now`+`save()`override (loaddata compatibility) |

### Migrations

* `marketplace/migrations/0003_add_updated_at_transaction.py`
* `marketplace/migrations/0004_add_swap_transaction.py`

### Design notes

* Cross-table constraint (`proposed_product_id != transaction.products_id`) enforced at Django layer via `clean()` — PostgreSQL does not support cross-row CHECK constraints.
* `ON DELETE RESTRICT` on `proposed_product_id` — a product involved in an active swap proposal cannot be deleted.
* On `stage = agenda_accepted`, service layer must sync `agenda_location` → `Transaction.delivery_location` before proceeding to delivery confirmation flow.

---

## [2026-03-19] HU-DB-01 — ProductReaction + Report + Notification

**Author:** Daniel (DBA)
**Type:** Moderate (three new tables — two in marketplace, one in core)
**DBA approved:** Yes — self-approved (DBA)

### Context

Three new tables approved to support HU-MKT-17 (reactions), HU-MKT-18 (reports), and HU-CORE-14 (notifications). All proposals reviewed against the existing schema before approval.

Two design changes applied during review:

* **Rejected `likes_count`, `dislikes_count` on Products (HU-DB-01):** Denormalized counters were proposed with Django signals to keep them updated. Rejected — signals do not fire on bulk operations, causing silent drift. Counts are obtained via `COUNT()` query with composite index `(product_id, type)`.
* **Rejected `report_count` on Products (Report proposal):** Same reasoning. Count via `COUNT()` with index on `product_id`.
* **Rejected UUID as PK on Report:** Inconsistent with the rest of the project which uses BIGSERIAL throughout. No technical justification for UUID at this scope.

### Schema changes

**Table: `marketplace_productreaction`** — New table

| Column     | Type        | Constraints                                                |
| ---------- | ----------- | ---------------------------------------------------------- |
| id         | BIGSERIAL   | PK                                                         |
| product_id | BIGINT      | FK to marketplace_products(id) ON DELETE CASCADE, NOT NULL |
| user_id    | BIGINT      | FK to core_user(id) ON DELETE CASCADE, NOT NULL            |
| type       | VARCHAR(10) | NOT NULL CHECK IN ('like', 'dislike')                      |
| created_at | TIMESTAMP   | NOT NULL DEFAULT NOW()                                     |
| UNIQUE     |             | (product_id, user_id)                                      |

Indexes:

* `idx_pr_product_type` on `(product_id, type)` — count queries
* `idx_pr_user` on `(user_id)` — reactions by user

**Table: `marketplace_report`** — New table

| Column      | Type         | Constraints                                                                                                    |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| id          | BIGSERIAL    | PK                                                                                                             |
| product_id  | BIGINT       | FK to marketplace_products(id) ON DELETE CASCADE, NOT NULL                                                     |
| reporter_id | BIGINT       | FK to core_user(id) ON DELETE CASCADE, NOT NULL                                                                |
| reason      | VARCHAR(30)  | NOT NULL CHECK IN ('prohibited_item', 'misleading_description', 'offensive_content', 'possible_scam', 'other') |
| description | VARCHAR(300) | NULLABLE                                                                                                       |
| created_at  | TIMESTAMP    | NOT NULL DEFAULT NOW()                                                                                         |
| UNIQUE      |              | (product_id, reporter_id)                                                                                      |

Indexes:

* `idx_marketplace_report_product` on `(product_id)`
* `idx_report_reporter` on `(reporter_id)`

**Table: `core_notification`** — New table

| Column       | Type         | Constraints                                     |
| ------------ | ------------ | ----------------------------------------------- |
| id           | BIGSERIAL    | PK                                              |
| user_id      | BIGINT       | FK to core_user(id) ON DELETE CASCADE, NOT NULL |
| type         | VARCHAR(50)  | NOT NULL                                        |
| title        | VARCHAR(255) | NOT NULL                                        |
| body         | TEXT         | NULLABLE                                        |
| reference_id | INTEGER      | NULLABLE (no FK — generic reference)           |
| is_read      | BOOLEAN      | NOT NULL DEFAULT FALSE                          |
| read_at      | TIMESTAMP    | NULLABLE                                        |
| created_at   | TIMESTAMP    | NOT NULL DEFAULT NOW()                          |

Indexes:

* `idx_notif_user_unread` on `(user_id, is_read)` WHERE `is_read = FALSE` — partial index for unread notifications

### Tables with no changes

| Table                    | Proposed change        | Decision                  |
| ------------------------ | ---------------------- | ------------------------- |
| `marketplace_products` | Add `likes_count`    | ❌ Rejected — drift risk |
| `marketplace_products` | Add `dislikes_count` | ❌ Rejected — drift risk |
| `marketplace_products` | Add `report_count`   | ❌ Rejected — drift risk |

### Migrations

* `marketplace/migrations/0005_add_product_reaction.py`
* `marketplace/migrations/0006_add_report.py`
* `core/migrations/0003_add_notification.py`

### Pending

* [ ] Update `erd_v1.md` to v1.4 — done
* [ ] Backend team implements models for the three new tables
* [ ] Backend team generates and commits migrations with models in the same commit
* [ ] PRs tagged to DBA before merge

---

## [2026-03-12] Social — CommunityPost + ForumQuestion post_id

**Author:** Daniel (DBA)
**Type:** Moderate (new table + FK added to existing table)
**DBA approved:** Yes — self-approved (DBA)

### Context

New `CommunityPost` table added to the `social` app. Posts are published inside communities by their members. Supports pinned posts for announcements.

`ForumQuestion` extended to support threaded discussion on community posts. `products_id` made nullable. New `post_id` FK added. Exactly one of the two must be non-null — enforced by CHECK constraint at the DB level and by `clean()` in Django.

### Schema changes

**Table: `social_communitypost`** — New table

| Column       | Type         | Constraints                                            |
| ------------ | ------------ | ------------------------------------------------------ |
| id           | BIGSERIAL    | PK                                                     |
| community_id | BIGINT       | FK to social_community(id) ON DELETE CASCADE, NOT NULL |
| user_id      | BIGINT       | FK to core_user(id) ON DELETE CASCADE, NOT NULL        |
| title        | VARCHAR(255) | NOT NULL                                               |
| content      | TEXT         | NOT NULL                                               |
| image_url    | VARCHAR(500) | NULLABLE                                               |
| is_pinned    | BOOLEAN      | NOT NULL DEFAULT FALSE                                 |
| created_at   | TIMESTAMP    | NOT NULL DEFAULT NOW()                                 |
| updated_at   | TIMESTAMP    | NOT NULL DEFAULT NOW()                                 |

**Table: `marketplace_forumquestion`** — Fields modified

| Change        | Before                          | After                                                                                              |
| ------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Field changed | `products_id BIGINT NOT NULL` | `products_id BIGINT NULL`                                                                        |
| Field added   | —                              | `post_id BIGINT NULL REFERENCES social_communitypost(id) ON DELETE CASCADE`                      |
| CHECK added   | —                              | `(products_id IS NOT NULL AND post_id IS NULL) OR (products_id IS NULL AND post_id IS NOT NULL)` |
| Index added   | —                              | `idx_marketplace_forumquestion_post ON (post_id)`                                                |

### Migrations

* `social/migrations/0002_add_community_post_and_forum_post_link.py`
* `marketplace/migrations/0004_add_community_post_and_forum_post_link.py`

### Seed data updated

`seeds/seed_dev_fixed.json` updated. Added:

* 3 `social.communitypost` records (pks 1-3)
* 3 `marketplace.forumquestion` records linked to posts (pks 6-8)

Total objects: 62 (previously 44, then 56 after social module seed).

---

## [2026-03-05] HU-CORE-09 — Email Verification Fields

**PR:** #70
**Author:** OmarTieso
**Merged by:** Ferreirafc1133
**Type:** Moderate (schema change to core model)
**DBA approved:** No — merged without DBA approval

### Schema changes

**Table: `core_user`**

| Change        | Before                         | After                                                        |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| Field removed | `name VARCHAR(255) NOT NULL` | —                                                           |
| Field added   | —                             | `first_name VARCHAR(150) NOT NULL`(inherited AbstractUser) |
| Field added   | —                             | `last_name VARCHAR(150) NOT NULL`(inherited AbstractUser)  |
| Field added   | —                             | `is_email_verified BOOLEAN NOT NULL DEFAULT FALSE`         |
| Field added   | —                             | `email_verified_at TIMESTAMP NULL`                         |

**Table: `core_emailverificationtoken`** — New table

| Column     | Type      | Constraints                           |
| ---------- | --------- | ------------------------------------- |
| id         | BIGSERIAL | PK                                    |
| user_id    | BIGINT    | FK to core_user(id) ON DELETE CASCADE |
| token      | VARCHAR   | UNIQUE NOT NULL                       |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW()                |
| expires_at | TIMESTAMP | NOT NULL                              |
| is_used    | BOOLEAN   | NOT NULL DEFAULT FALSE                |

### Migration

`core/migrations/0002_user_email_verified_at_user_is_email_verified_and_more.py`

### Side effects (bugs introduced)

* `marketplace/models/forum_question.py` — `__str__` used `self.user.name` — fixed to `get_full_name()`
* `gamification/models/environment_impact.py` — `__str__` used `self.user.name` — fixed to `get_full_name()`
* `seeds/seed_partial.json` and `seeds/seed_v1_fixed.json` — outdated user fields — replaced by `seed_dev_fixed.json`

---

## [2026-03-05] HU-GAM-02 — Earn Points (PointRule + PointTransaction)

**PR:** #62
**Author:** Rudrok18 (Rodrigo Lopez Coronado)
**Merged by:** Ferreirafc1133
**Type:** Major (new tables not included in ERD v1)
**DBA approved:** No — merged without DBA approval

> **Design note:** ERD v1 explicitly documented that `users.points` was sufficient for MVP and that a points ledger was not needed. This PR introduced two additional tables. They have been retained by team decision but required ERD update.

### Schema changes

**Table: `gamification_pointrule`** — New table

| Column      | Type        | Constraints                  |
| ----------- | ----------- | ---------------------------- |
| id          | BIGSERIAL   | PK                           |
| action      | VARCHAR(50) | UNIQUE NOT NULL              |
| points      | INTEGER     | NOT NULL CHECK (points >= 0) |
| description | TEXT        | NOT NULL                     |
| is_active   | BOOLEAN     | NOT NULL DEFAULT TRUE        |
| created_at  | TIMESTAMP   | NOT NULL DEFAULT NOW()       |

**Table: `gamification_pointtransaction`** — New table

| Column       | Type        | Constraints                           |
| ------------ | ----------- | ------------------------------------- |
| id           | BIGSERIAL   | PK                                    |
| user_id      | BIGINT      | FK to core_user(id) ON DELETE CASCADE |
| action       | VARCHAR(50) | NOT NULL                              |
| points       | INTEGER     | NOT NULL                              |
| reference_id | INTEGER     | NULLABLE                              |
| created_at   | TIMESTAMP   | NOT NULL DEFAULT NOW()                |

### Migration

`gamification/migrations/0001_initial.py` (includes all gamification tables)

### Pending

* [X] Update `erd_v1.md` with these two tables — done in v1.1
* [ ] Create `docs/database/rfc/rfc_001_point_ledger.md` as post-facto RFC
* [ ] Configure `PointRule` rows via admin panel before demo (no seed data)

---

## [2026-03-05] HU-GAM-03 — Achievements / Badges

**PR:** #64
**Author:** LuisArturo21
**Merged by:** Ferreirafc1133
**Type:** Moderate (field name differs from ERD)
**DBA approved:** No — merged without DBA approval

### Schema changes

**Table: `gamification_badges`** — New table

| Column      | Type         | Constraints                                                      | Note                                             |
| ----------- | ------------ | ---------------------------------------------------------------- | ------------------------------------------------ |
| id          | BIGSERIAL    | PK                                                               |                                                  |
| name        | VARCHAR(100) | NOT NULL                                                         |                                                  |
| description | TEXT         | NOT NULL                                                         |                                                  |
| icon        | VARCHAR(500) | NOT NULL                                                         | ERD specified `icon_url`— unified to `icon` |
| rarity      | VARCHAR(20)  | NOT NULL CHECK (rarity IN ('comun','raro','epico','legendario')) |                                                  |
| points      | INTEGER      | NOT NULL CHECK (points >= 0)                                     |                                                  |
| created_at  | TIMESTAMP    | NOT NULL DEFAULT NOW()                                           |                                                  |

**Table: `gamification_userbadges`** — New table

| Column    | Type      | Constraints                                     |
| --------- | --------- | ----------------------------------------------- |
| id        | BIGSERIAL | PK                                              |
| user_id   | BIGINT    | FK to core_user(id) ON DELETE CASCADE           |
| badge_id  | BIGINT    | FK to gamification_badges(id) ON DELETE CASCADE |
| earned_at | TIMESTAMP | NOT NULL DEFAULT NOW()                          |
| UNIQUE    |           | (user_id, badge_id)                             |

### Migration

`gamification/migrations/0001_initial.py`

### Pending

* [X] Update `erd_v1.md`: change `icon_url` to `icon` in Badges — done in v1.1

---

## [2026-03-05] Marketplace — ForumQuestion, Images, Transaction + Products updated_at

**PR:** #49, #51 (multiple marketplace PRs)
**Type:** Moderate — new tables + new field in Products
**DBA approved:** Not formally reviewed

### Schema changes

**Table: `marketplace_products`** — field added

| Change      | Detail                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Field added | `updated_at TIMESTAMP NOT NULL DEFAULT NOW()`                                                           |
| Fix applied | `auto_now=True`replaced by `default=timezone.now`+`save()`override (incompatible with `loaddata`) |

**Tables added:** `marketplace_forumquestion`, `marketplace_images`, `marketplace_transaction`
(defined in ERD v1 — expected changes, no governance violations)

### Migration

`marketplace/migrations/0002_forumquestion_images_transaction_and_more.py`

---

## [2026-03-06] Fix — updated_at / created_at in Products

**Author:** Daniel (DBA)
**Type:** Minor — compatibility fix
**DBA approved:** Self-approved (DBA)

### Problem

`auto_now=True` and `auto_now_add=True` in Django 5 are incompatible with `loaddata` and with `ordering` in `Meta`.

### Fix

```python
# BEFORE
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)

# AFTER
created_at = models.DateTimeField(default=timezone.now, editable=False)
updated_at = models.DateTimeField(default=timezone.now)

def save(self, *args, **kwargs):
    if not self._state.adding:
        self.updated_at = timezone.now()
    super().save(*args, **kwargs)
```

### Migration

`marketplace/migrations/0003_fix_updated_at_products.py`

---

## [2026-03-06] Fix — Seed data for dev branch

**Author:** Daniel (DBA)
**Type:** Minor — seed data updated

### Changes

* `seed_partial.json` and `seed_v1_fixed.json` replaced by `seed_dev_fixed.json`
* Users: `name` replaced by `first_name` + `last_name`, removed `username`, added `is_email_verified` + `email_verified_at`
* FKs corrected to Django attribute names (no `_id` suffix in fixture keys)
* Badges: `icon_url` replaced by `icon` (aligned to actual model)
* `updated_at` added explicitly in all Products entries

---

## [2026-03-11] Fix — FK column names in documentation

**Author:** Daniel (DBA)
**Type:** Minor — documentation correction
**DBA approved:** Self-approved (DBA)

### Problem

`erd_v1.md` documented `product_id` (singular) as the FK column name in three tables. Direct inspection of the source code confirmed all three models use `db_column="products_id"` (plural, consistent with the model name `Products`).

### Correction applied

| Table                         | Before         | Correct         |
| ----------------------------- | -------------- | --------------- |
| `marketplace_images`        | `product_id` | `products_id` |
| `marketplace_transaction`   | `product_id` | `products_id` |
| `marketplace_forumquestion` | `product_id` | `products_id` |

`erd_v1.md` and `database-standards.md` updated to reflect verified names.

---

## [2026-03-11] Social Module — UserConnection, FrequentContact, Community, CommunityMember

**Type:** Major (new module)
**DBA approved:** Yes — design approved by DBA

### Context

New `social` app to support social connections between users: friend requests, frequent contacts, and communities. Does not modify any existing table.

### Schema changes

**Table: `social_userconnection`** — New table

| Column       | Type        | Constraints                                                                     |
| ------------ | ----------- | ------------------------------------------------------------------------------- |
| id           | BIGSERIAL   | PK                                                                              |
| requester_id | BIGINT      | FK to core_user(id) ON DELETE CASCADE, NOT NULL                                 |
| addressee_id | BIGINT      | FK to core_user(id) ON DELETE CASCADE, NOT NULL                                 |
| status       | VARCHAR(20) | NOT NULL DEFAULT 'pending' CHECK IN ('pending','accepted','rejected','blocked') |
| created_at   | TIMESTAMP   | NOT NULL DEFAULT NOW()                                                          |
| updated_at   | TIMESTAMP   | NOT NULL DEFAULT NOW()                                                          |
| UNIQUE       |             | (requester_id, addressee_id)                                                    |
| CHECK        |             | requester_id != addressee_id                                                    |

**Table: `social_frequentcontact`** — New table

| Column     | Type      | Constraints                                     |
| ---------- | --------- | ----------------------------------------------- |
| id         | BIGSERIAL | PK                                              |
| user_id    | BIGINT    | FK to core_user(id) ON DELETE CASCADE, NOT NULL |
| contact_id | BIGINT    | FK to core_user(id) ON DELETE CASCADE, NOT NULL |
| created_at | TIMESTAMP | NOT NULL DEFAULT NOW()                          |
| UNIQUE     |           | (user_id, contact_id)                           |
| CHECK      |           | user_id != contact_id                           |

**Table: `social_community`** — New table

| Column      | Type         | Constraints                                      |
| ----------- | ------------ | ------------------------------------------------ |
| id          | BIGSERIAL    | PK                                               |
| creator_id  | BIGINT       | FK to core_user(id) ON DELETE RESTRICT, NOT NULL |
| name        | VARCHAR(100) | NOT NULL                                         |
| description | TEXT         | NOT NULL                                         |
| icon        | VARCHAR(500) | NULLABLE                                         |
| is_private  | BOOLEAN      | NOT NULL DEFAULT FALSE                           |
| is_active   | BOOLEAN      | NOT NULL DEFAULT TRUE                            |
| created_at  | TIMESTAMP    | NOT NULL DEFAULT NOW()                           |
| updated_at  | TIMESTAMP    | NOT NULL DEFAULT NOW()                           |

**Table: `social_communitymember`** — New table

| Column       | Type        | Constraints                                                       |
| ------------ | ----------- | ----------------------------------------------------------------- |
| id           | BIGSERIAL   | PK                                                                |
| community_id | BIGINT      | FK to social_community(id) ON DELETE CASCADE, NOT NULL            |
| user_id      | BIGINT      | FK to core_user(id) ON DELETE CASCADE, NOT NULL                   |
| role         | VARCHAR(20) | NOT NULL DEFAULT 'member' CHECK IN ('admin','moderator','member') |
| joined_at    | TIMESTAMP   | NOT NULL DEFAULT NOW()                                            |
| UNIQUE       |             | (community_id, user_id)                                           |

### Migration

`social/migrations/0001_initial.py`

---

## Documentation pending

| Item                                                                         | Status                                          |
| ---------------------------------------------------------------------------- | ----------------------------------------------- |
| Update `erd_v1.md`with PointRule, PointTransaction,`icon`field in Badges | Done — v1.1                                    |
| Post-facto RFC for PointTransaction                                          | Documented in erd_v1.md v1.1 Known Design Notes |
| Notify team: schema changes must tag DBA in PRs                              | Pending                                         |
| Update `erd_v1.md`with CommunityPost and ForumQuestion dual-target         | Done — v1.3                                    |
| Update `erd_v1.md`with ProductReaction, Report, Notification               | Done — v1.4                                    |
| Update `erd_v1.md`with SwapTransaction and Transaction.updated_at          | Done — v1.5                                    |
