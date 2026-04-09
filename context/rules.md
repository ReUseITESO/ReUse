# Rules

## Git
- Never push
- Commits: `tipo(scope): descripcion` — solo titulo, sin body
- Entre menos palabras mejor
- Priorizar PRs mas viejas primero para evitar conflictos

## Code
- Zero rastro de IA — sin co-authored-by, sin comentarios de IA, sin nada
- Comentarios solo los 100% necesarios
- Simple > clever
- No adornos, no emojis en codigo/logs/commits

## Proceso
- Yo (Claude) elijo que comando correr, el usuario solo da contexto
- Autonomo: no pedir permisos, solo ejecutar
- Si hay duda → preguntar siempre
- Nunca tocar fuera de backend/ y frontend/ sin preguntar

## PR Review
- Revisar de mas vieja a mas nueva
- Checklist: migraciones, contratos API front↔back, imports, tipos
- Reportar solo lo que rompe o esta mal — no sugerencias cosmeticas
- Formato de reporte: corto, directo, sin adornos
