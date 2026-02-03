#!/bin/bash

# Jespark Rewards - Database Backup Script
# This script creates backups of the JSON database

set -e

echo "💾 Jespark Rewards - Database Backup"
echo "======================================"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Create backup directory if it doesn't exist
BACKUP_DIR="server/backups"
mkdir -p "$BACKUP_DIR"

# Get current date and time
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/database_backup_$TIMESTAMP.json"

# Check if database exists
if [ ! -f "server/database.json" ]; then
    echo "Error: server/database.json not found"
    exit 1
fi

# Create backup
cp server/database.json "$BACKUP_FILE"
print_success "Backup created: $BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE" 2>/dev/null && {
    print_success "Backup compressed: $BACKUP_FILE.gz"
    BACKUP_FILE="$BACKUP_FILE.gz"
}

# Show backup size
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup size: $SIZE"

# List all backups
echo ""
echo "All backups:"
ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{print $9, "("$5")"}'

# Clean old backups (keep last 10)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
    echo ""
    echo "Cleaning old backups (keeping last 10)..."
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs rm -f
    cd - > /dev/null
    print_success "Old backups cleaned"
fi

echo ""
print_success "Backup completed successfully!"
