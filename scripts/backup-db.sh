#!/bin/bash
# Emiti Dagala Database Backup Script
# Usage: ./scripts/backup-db.sh [output-directory]

set -e

BACKUP_DIR="${1:-./database/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/emitidagala_${TIMESTAMP}.sql.gz"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-emitidagala}"
DB_USER="${DB_USER:-emitidagala}"

mkdir -p "${BACKUP_DIR}"

echo "Starting backup of ${DB_NAME} database..."
echo "Backup file: ${BACKUP_FILE}"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  | gzip > "${BACKUP_FILE}"

echo "Backup completed successfully."
echo "File size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Keep only last 30 days of backups
find "${BACKUP_DIR}" -name "emitidagala_*.sql.gz" -mtime +30 -delete
echo "Cleaned up backups older than 30 days."
