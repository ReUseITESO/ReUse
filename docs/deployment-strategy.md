# Deployment Strategy

**Plataforma:** Google Cloud Platform — Cloud Run
**Region:** `us-central1`
**Project:** `reuse-iteso`

Este documento reemplaza la versión anterior (Sprint 1), que describía un setup AWS que nunca se implementó.

## Servicios GCP

| Servicio | Propósito |
|---|---|
| Cloud Run | Hosting de containers backend y frontend, autoscaling, escala a 0 sin tráfico |
| Artifact Registry | Registro Docker privado en `us-central1-docker.pkg.dev/reuse-iteso/reuse-repo` |
| Cloud SQL (Postgres 15) | DB de producción |
| Cloud Storage (GCS) | Bucket para imágenes de productos y avatars |
| Secret Manager | Credenciales sensibles inyectadas como env vars |

## URLs en producción

- **Backend:** https://backend-674659739241.us-central1.run.app
- **Frontend:** https://frontend-dscgahxthq-uc.a.run.app

## Flujo de deploy

Push a `main` dispara el workflow `.github/workflows/ci.yml`. Si `CI Gate` está verde, el job `deploy` se ejecuta:

1. Authenticate to GCP usando `GCP_SA_KEY` (GitHub Secret)
2. Configure Docker para Artifact Registry
3. Build & push `backend:latest` y `frontend:latest`
4. `gcloud run deploy backend` y `gcloud run deploy frontend`
5. Print service URLs

**Tiempo típico del pipeline completo:** ~7 minutos.

## Por qué no es manual

Antes había un README con pasos manuales (`docker build`, `docker push`, `gcloud deploy`). Se automatizó porque:
1. Subía margen de error (alguien builda local sin pasar CI)
2. Demoraba 15-20 min cada deploy
3. No quedaba trazabilidad

Con el deploy automático: PR → review → merge a main → live en ~7 min. Si rompe, rollback con `gcloud run services update-traffic backend --to-revisions=PREVIOUS_REVISION=100 --region=us-central1`.

## Gotchas conocidas

### 1. `entrypoint.sh` debe correr `makemigrations` antes de `migrate`

Las migrations de `core`, `marketplace` y `gamification` están en `.gitignore` (decisión del equipo). Sin generarlas en boot, el container deploya código que referencia columnas que la DB no tiene → fallo silencioso al primer query.

Ver: `decisions/entrypoint-makemigrations-on-boot.md` (en el vault del tech lead).

### 2. `frontend/Dockerfile` necesita `RUN chmod +x ./entrypoint.sh`

Git trackea el archivo con mode `100644`. Sin el `chmod` explícito en Dockerfile, Cloud Run falla con "container failed to start" porque no puede ejecutar el entrypoint.

### 3. `NEXT_PUBLIC_API_URL` debe ser build arg, no env var runtime

Next.js bake-ea las env vars `NEXT_PUBLIC_*` en el bundle estático al build. Si la inyectas como env var de Cloud Run, no llega al cliente. El workflow ya lo pasa correctamente como `--build-arg`.

### 4. Throttle rates en `settings.py` cambian con `DEBUG`

En prod (`DEBUG=False`): auth 5/min, email_verification 3/min, password_reset 3/hour.
En dev/CI (`DEBUG=True`): todos relajados a 1000+/min para que la suite de tests no se rate-limitee.

## Variables de entorno (Cloud Run config)

Backend:
- `DEBUG=False`
- `SECRET_KEY` (Secret Manager)
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (Cloud SQL connector)
- `ALLOWED_HOSTS` (incluye el dominio de Cloud Run)
- `CORS_ALLOWED_ORIGINS` (incluye el URL del frontend)
- `GS_BUCKET_NAME`, `GOOGLE_APPLICATION_CREDENTIALS` (para GCS)
- `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (SendGrid)

Frontend (todas como `--build-arg` en docker build):
- `NEXT_PUBLIC_API_URL=https://backend-674659739241.us-central1.run.app/api`

## Rollback

```bash
# listar revisions
gcloud run revisions list --service=backend --region=us-central1

# rollback al previo
gcloud run services update-traffic backend \
    --to-revisions=backend-NNNNN=100 \
    --region=us-central1
```

Tarda <1 min. Aplica igual para `frontend`.

## Monitoring

- Logs en tiempo real: `gcloud run services logs tail backend --region=us-central1`
- GCP Console: https://console.cloud.google.com/run?project=reuse-iteso
- No hay alerting configurado todavía (pendiente post-entrega)

## Costos estimados

Cloud Run con escala a 0 + Cloud SQL `db-f1-micro` + GCS bucket pequeño: ~$15-25 USD/mes sin tráfico. Cubierto por los créditos académicos GCP.
