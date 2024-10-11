#!/bin/bash

set -e

echo "Starting database initialization..."

for db in risevest_db test_db; do
  echo "Creating database $db if it doesn't already exist"
  if psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$db"; then
    echo "Database $db already exists. Skipping creation."
  else
    psql -U "$POSTGRES_USER" -c "CREATE DATABASE $db;"
    echo "Database $db created."
  fi
done

echo "Database initialization complete."