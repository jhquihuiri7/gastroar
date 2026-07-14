#!/usr/bin/env bash
set -euo pipefail

# ==========================================================
# Deploy de gastroar (Next.js 16) a Google Cloud Run.
# Construye la imagen con Cloud Build (usando el Dockerfile)
# y la despliega. No requiere Docker instalado localmente.
#
# Uso:
#   ./deploy.sh
#
# Variables sobreescribibles:
#   PROJECT_ID       (default: gasrtoar)
#   REGION           (default: us-central1)
#   SERVICE          (default: gastroar)
#   SERVICE_ACCOUNT  (default: firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com)
#
# Requiere un .env.local con las variables NEXT_PUBLIC_FIREBASE_*,
# FIREBASE_PROJECT_ID y GCS_BUCKET_NAME (ver .env.example). No se necesita
# GOOGLE_APPLICATION_CREDENTIALS en producción: el servicio corre con la
# identidad de SERVICE_ACCOUNT, que ya firma/lee Firestore y GCS de forma
# nativa (ver README para los roles IAM que esa cuenta necesita).
# ==========================================================

PROJECT_ID="${PROJECT_ID:-gasrtoar}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-gastroar}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com}"

echo "==> Proyecto        : ${PROJECT_ID}"
echo "==> Región          : ${REGION}"
echo "==> Servicio        : ${SERVICE}"
echo "==> Service account : ${SERVICE_ACCOUNT}"
echo

# Verifica que gcloud esté disponible
if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: gcloud CLI no encontrado. Instala el SDK de Google Cloud." >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "ERROR: no existe .env.local. Copia .env.example y complétalo antes de desplegar." >&2
  exit 1
fi

# Carga NEXT_PUBLIC_FIREBASE_*, FIREBASE_PROJECT_ID y GCS_BUCKET_NAME desde
# .env.local (GOOGLE_APPLICATION_CREDENTIALS también se carga pero no se usa
# aquí — es solo para desarrollo local).
set -a
# shellcheck disable=SC1091
source .env.local
set +a

for var in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID NEXT_PUBLIC_FIREBASE_APP_ID FIREBASE_PROJECT_ID GCS_BUCKET_NAME; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: falta ${var} en .env.local" >&2
    exit 1
  fi
done

gcloud config set project "${PROJECT_ID}"

echo "==> Habilitando APIs necesarias (idempotente)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# `gcloud run deploy --source --set-build-env-vars` only reaches buildpacks
# builds, not a Dockerfile build — it's silently ignored here, which is what
# shipped a client bundle with an empty Firebase config the first time. A
# Dockerfile build needs an explicit --build-arg, so build and deploy happen
# as two steps: cloudbuild.yaml passes the NEXT_PUBLIC_* build args to
# `docker build`, then `gcloud run deploy --image` deploys that image.
IMAGE="us-central1-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/${SERVICE}:$(date +%Y%m%d%H%M%S)"

echo "==> Construyendo imagen con Cloud Build..."
gcloud builds submit \
  --config cloudbuild.yaml \
  --region "${REGION}" \
  --substitutions "_NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY},_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN},_NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID},_NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID},_IMAGE=${IMAGE}" \
  .

echo "==> Desplegando a Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --service-account "${SERVICE_ACCOUNT}" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},GCS_BUCKET_NAME=${GCS_BUCKET_NAME}"

echo
echo "==> Despliegue completado. URL del servicio:"
gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --format 'value(status.url)'
