#!/bin/bash
# Check if the database 'testdb' already exists
DB_EXISTS=$(psql -U capstone -d capstone -tAc "SELECT 1 FROM pg_database WHERE datname='capstone_tests'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database capstone_tests..."
  psql -U capstone -d capstone -c "CREATE DATABASE capstone_tests;"
else
  echo "Database capstone_tests already exists."
fi