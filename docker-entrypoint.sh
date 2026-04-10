#!/bin/sh
set -e

DB_FILE="/data/app.db"

if [ ! -f "$DB_FILE" ]; then
  echo "No database found -- copying seed database..."
  cp /app/prisma/seed.db "$DB_FILE"
  echo "Database ready at $DB_FILE"
fi

exec node server.js
