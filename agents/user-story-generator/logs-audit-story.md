# User can view activity logs and audit trail

**Domain:** Core

## User Story

As a administrador y usuario regular (con permisos limitados), I want to view activity logs and audit trail so that de logs y auditoría que permita a los usuarios, especialmente administradores, ver el historial de actividades importantes en la plataforma reuse. el sistema debe registrar y mostrar eventos críticos como: inicios de sesión exitosos y fallidos, publicación de items, intercambios realizados, cambios en perfiles de usuario, acciones administrativas (aprobaciones, rechazos, suspensiones), y cambios en configuraciones del sistema. los usuarios administradores deben poder filtrar los logs por rango de fechas, tipo de acción específica, usuario que realizó la acción, y módulo/dominio afectado. el sistema debe permitir la exportación de logs en formato csv o json para análisis externos o cumplimiento de auditorías. los logs deben incluir información detallada como timestamp preciso, dirección ip, user agent, datos anteriores y nuevos en caso de modificaciones, y resultado de la acción (éxito/fallo). el sistema debe ser eficiente para manejar grandes volúmenes de logs y debe implementar retención automática de logs según políticas de la institución..

## Descripción detallada

Implementar un sistema completo de logs y auditoría que permita a los usuarios, especialmente administradores, ver el historial de actividades importantes en la plataforma ReUse. El sistema debe registrar y mostrar eventos críticos como: inicios de sesión exitosos y fallidos, publicación de items, intercambios realizados, cambios en perfiles de usuario, acciones administrativas (aprobaciones, rechazos, suspensiones), y cambios en configuraciones del sistema. Los usuarios administradores deben poder filtrar los logs por rango de fechas, tipo de acción específica, usuario que realizó la acción, y módulo/dominio afectado. El sistema debe permitir la exportación de logs en formato CSV o JSON para análisis externos o cumplimiento de auditorías. Los logs deben incluir información detallada como timestamp preciso, dirección IP, user agent, datos anteriores y nuevos en caso de modificaciones, y resultado de la acción (éxito/fallo). El sistema debe ser eficiente para manejar grandes volúmenes de logs y debe implementar retención automática de logs según políticas de la institución. 
This feature is for the web platform. Priority: high. 
This story focuses on the core functionality. Advanced features, edge cases, and optimizations may be addressed in separate stories.

## Acceptance Criteria

- [ ] Los administradores pueden acceder a la interfaz de logs desde el panel de administración
- [ ] El sistema registra automáticamente todos los eventos críticos definidos en el alcance
- [ ] Los usuarios pueden filtrar logs por rango de fechas (desde-hasta)
- [ ] Los usuarios pueden filtrar logs por tipo de acción (login, publicación, intercambio, etc.)
- [ ] Los usuarios pueden filtrar logs por usuario específico
- [ ] Los administradores pueden exportar logs filtrados en formato CSV
- [ ] Los administradores pueden exportar logs filtrados en formato JSON
- [ ] Cada entrada de log muestra: timestamp, usuario, acción, detalles, IP, resultado
- [ ] Los usuarios regulares solo pueden ver sus propias actividades
- [ ] El sistema implementa paginación para manejar grandes volúmenes de logs
- [ ] Los logs se retienen según política institucional (mínimo 90 días, máximo 2 años)
- [ ] El sistema muestra estadísticas agregadas de actividad (logs por día, usuarios más activos, acciones más frecuentes)

## Implementation Details

### Backend
- Log entry model with fields: id, timestamp, user_id, action_type, details (JSON), ip_address, user_agent, result (success/failure), affected_resource
- GET /api/logs endpoint with query parameters: start_date, end_date, action_type, user_id, page, limit
- POST /api/logs/export endpoint to generate CSV/JSON exports
- Middleware/interceptor to automatically log critical actions across the application
- Database indexes on timestamp, user_id, and action_type for efficient querying
- Automatic log archiving job (cron/scheduled task) to move old logs to cold storage
- Role-based access control: admins see all logs, users see only their own

### Frontend
- Logs dashboard component with filters panel (date range picker, action type dropdown, user search)
- Data table with pagination, sorting, and expandable rows for log details
- Export button that triggers CSV/JSON download
- Statistics dashboard with charts showing activity trends
- Loading and error states
- Responsive design for mobile and desktop
- API integration with backend /api/logs endpoints

### Database
- logs table with proper indexes on timestamp, user_id, action_type
- Partitioning by date for better query performance on large datasets
- Archive table or separate database for logs older than 90 days
- Retention policy enforcement through automated cleanup jobs

## Testing Notes

- Test log creation for all critical events (login, item publication, exchange, profile changes, admin actions)
- Test filtering by date range with various edge cases (same day, large ranges, future dates)
- Test filtering by action type (single type, multiple types, all types)
- Test filtering by user (existing user, non-existing user, current user)
- Test combined filters (date + action + user)
- Test pagination with different page sizes (10, 25, 50, 100 logs per page)
- Test CSV export with filtered and unfiltered data
- Test JSON export with proper formatting
- Test access control: admins can see all logs, regular users only see their own
- Test performance with large datasets (1M+ log entries)
- Test log retention and archiving functionality
- Test statistics/analytics calculations accuracy

## Test Data Required

- Test admin user account with full permissions
- Test regular user accounts (at least 3 different users)
- Sample log entries for each action type:
  - Login attempts (successful and failed)
  - Item publications, edits, deletions
  - Exchange requests, acceptances, rejections
  - Profile updates (name, email, preferences)
  - Admin actions (user suspensions, content approvals)
- Logs spanning different time periods (today, this week, last month, 3+ months ago)
- Large dataset for performance testing (100K+ log entries)
- Logs with various IP addresses and user agents
- Edge case scenarios: logs with special characters, very long details, missing optional fields

## Potential Mocks

- Database queries for unit tests
- Log creation interceptor/middleware for isolated testing
- Date/time functions to test time-based filtering
- CSV/JSON export generators
- External archiving service for log retention
- Authentication service to test role-based access control

## Dependencies & Duplication Check

**Dependencies:** 
- Issue #7: User authentication and authorization system (required to identify users in logs and enforce access control)

**Possible duplicates:** None

## Assumptions

- User is authenticated as an ITESO community member
- Backend API follows RESTful conventions
- Frontend uses Next.js and TypeScript
- Database is PostgreSQL
