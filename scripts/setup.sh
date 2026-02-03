#!/bin/bash

# Jespark Rewards - Initial Setup Script
# This script helps set up the project for the first time

set -e  # Exit on error

echo "🎉 Jespark Rewards - Initial Setup"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js version
echo ""
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js 18+ recommended. Current: $(node -v)"
else
    print_success "Node.js version: $(node -v)"
fi

# Install Frontend Dependencies
echo ""
echo "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Install Backend Dependencies
echo ""
echo "Installing backend dependencies..."
cd server
npm install
print_success "Backend dependencies installed"
cd ..

# Create .env files if they don't exist
echo ""
echo "Setting up environment files..."

# Frontend .env.local
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000/api
VITE_LIFF_ID=
VITE_APP_ENV=development
EOF
    print_success "Created .env.local"
else
    print_warning ".env.local already exists (skipping)"
fi

# Backend .env
if [ ! -f "server/.env" ]; then
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "please_change_this_jwt_secret_minimum_32_characters")
    
    cat > server/.env << EOF
# Server Environment Variables
PORT=5000
NODE_ENV=development

# JWT Secret (generate a random string)
JWT_SECRET=${JWT_SECRET}

# CORS Origins (comma separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000

# Admin Credentials (Change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Supabase Configuration (optional, for future migration)
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
EOF
    print_success "Created server/.env with random JWT secret"
else
    print_warning "server/.env already exists (skipping)"
fi

# Create gitignore if doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
server/node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production
server/.env
server/.env.local
server/.env.production

# Database
server/database.json

# Logs
*.log
npm-debug.log*

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
EOF
    print_success "Created .gitignore"
fi

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "===================================="
print_success "Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.local and server/.env"
echo "2. Start the development servers:"
echo "   Terminal 1: npm run dev"
echo "   Terminal 2: cd server && npm start"
echo "3. Open http://localhost:3000 in your browser"
echo ""
print_warning "Don't forget to:"
echo "- Change ADMIN_PASSWORD in server/.env"
echo "- Set up your LINE LIFF ID in .env.local"
echo "- Read PRODUCTION_READY_GUIDE.md before deploying"
