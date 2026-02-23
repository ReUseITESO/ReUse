# Database Governance - ReUseITESO

**DBA:** Daniel  
**Fecha:** 15 de febrero de 2026

---

## Autoridad del DBA

**DBA decide:**
- Schema (tablas, columnas, tipos)
- Constraints (PK, FK, CHECK, UNIQUE)
- Índices
- Aprobación de migraciones

**Backend team decide:**
- Implementación de Django models
- Queries en código
- API design

---

## Tipos de Cambios

### Minor (auto-aprobación con review)
- Agregar columna NULLABLE
- Agregar índice
- Modificar DEFAULT

**Proceso:**
1. Crear PR con migración
2. Tag @dba
3. DBA aprueba <24hrs
4. Merge

### Moderate (requiere issue)
- Agregar tabla
- Agregar columna NOT NULL
- Modificar tipo de columna
- Renombrar tabla/columna

**Proceso:**
1. Crear issue con template
2. Discusión 48-72hrs
3. DBA aprueba
4. Implementar migración
5. PR + review
6. Merge

### Major (requiere RFC)
- Reestructuración
- Cambios destructivos
- Data migrations complejas

**Proceso:**
1. Crear RFC en `docs/database/rfc/`
2. Discusión 3-5 días
3. Meeting si necesario
4. DBA documenta decisión
5. Implementación supervisada
6. PR + review
7. Merge

---

## SLAs

| Tipo | Respuesta | Decisión |
|------|-----------|----------|
| Minor | 12hrs | 24hrs |
| Moderate | 24hrs | 3 días |
| Major | 48hrs | 7 días |
| Hotfix | 2hrs | 6hrs |

---

## Template de Issue

```markdown
## Cambio Propuesto

**Tipo:** [ ] Minor [ ] Moderate [ ] Major

**Razón:**
...

**Schema changes:**
```sql
ALTER TABLE ...
```

**Rollback Plan:**
...

**Checklist:**
- [ ] Migración probada
- [ ] Tests actualizados
- [ ] Seed data actualizado
```

---

## Hotfix (Emergencia)

Permitido sin pre-aprobación:
1. Aplicar fix mínimo
2. Notificar @dba inmediatamente
3. Crear PR post-facto
4. Documentar en postmortem

---

## Audit Trail

Cambios registrados en:
- Git history de migraciones
- `docs/database/changes.md`
