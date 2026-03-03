# Database Governance - ReUseITESO

**DBA:** Daniel
**Date:** 24 February 2026

---

## DBA Authority

**DBA decides:**

* Schema (tables, columns, types)
* Constraints (PK, FK, CHECK, UNIQUE)
* Indexes
* Migration approval

**Backend team decides:**

* Django model implementation
* Queries in code
* API design

---

## Change Types

### Minor (self-approval with review)

* Add nullable column
* Add index
* Modify DEFAULT value

**Process:**

1. Open PR with migration
2. Tag @dba
3. DBA approves within 24hrs
4. Merge

### Moderate (requires issue)

* Add table
* Add NOT NULL column
* Modify column type
* Rename table or column

**Process:**

1. Open issue using the template below
2. Discussion period 48-72hrs
3. DBA approves
4. Implement migration
5. PR + review
6. Merge

### Major (requires RFC)

* Schema restructuring
* Destructive changes
* Complex data migrations

**Process:**

1. Create RFC in `docs/database/rfc/`
2. Discussion period 3-5 days
3. Meeting if needed
4. DBA documents decision
5. Supervised implementation
6. PR + review
7. Merge

---

## SLAs

| Type     | Response | Decision |
| -------- | -------- | -------- |
| Minor    | 12hrs    | 24hrs    |
| Moderate | 24hrs    | 3 days   |
| Major    | 48hrs    | 7 days   |
| Hotfix   | 2hrs     | 6hrs     |

---

## Issue Template

```markdown
## Proposed Change

**Type:** [ ] Minor [ ] Moderate [ ] Major

**Reason:**
...

**Schema changes:**
```sql
ALTER TABLE ...
```

**Rollback Plan:**
...

**Checklist:**

* [ ] Migration tested locally
* [ ] Tests updated
* [ ] Seed data updated

```

---

## Hotfix (Emergency)

Allowed without prior approval:

1. Apply minimal fix
2. Notify @dba immediately
3. Open post-facto PR
4. Document in postmortem

---

## Audit Trail

All changes are recorded in:

- Git history of migrations
- `docs/database/changes.md`

---

**Last updated:** 24 February 2026
**Responsible:** Daniel (DBA)
```
