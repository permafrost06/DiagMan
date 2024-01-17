#!/bin/bash

# Get the list of tables
tables=$(turso db shell diagman-opinion-dev .tables)

# Check if there are tables to drop
if [ -n "$tables" ]; then
    # Drop each table
    for table in $tables; do
        drop_command="DROP TABLE $table;"
        turso db shell diagman-opinion-dev "$drop_command"
    done
else
    echo "No tables found to drop."
fi

turso db shell diagman-opinion .dump > prod.sql

turso db shell diagman-opinion-dev < prod.sql

rm prod.sql

