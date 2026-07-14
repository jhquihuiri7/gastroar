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
#   PROJECT_ID  (default: gasrtoar)
#   REGION      (default: us-central1)
#   SERVICE     (default: gastroar)
# ==========================================================

PROJECT_ID="${PROJECT_ID:-gasrtoar}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-gastroar}"

echo "==> Proyecto : ${PROJECT_ID}"
echo "==> Región   : ${REGION}"
echo "==> Servicio : ${SERVICE}"
echo

# Verifica que gcloud esté disponible
if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: gcloud CLI no encontrado. Instala el SDK de Google Cloud." >&2
  exit 1
fi

gcloud config set project "${PROJECT_ID}"

echo "==> Habilitando APIs necesarias (idempotente)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

echo "==> Desplegando a Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --source . \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

echo
echo "==> Despliegue completado. URL del servicio:"
gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --format 'value(status.url)'
