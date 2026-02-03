#!/bin/bash

# Jespark Rewards - Production Deployment Script
# This script helps deploy frontend and backend to production

set -e  # Exit on error

echo "🚀 Jespark Rewards Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Menu
echo ""
echo "Select deployment option:"
echo "1) Deploy Frontend only"
echo "2) Deploy Backend only"
echo "3) Deploy Both (Full deployment)"
echo "4) Test Production Build Locally"
echo "5) Exit"
echo ""
read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Building Frontend for Production..."
        echo "======================================"
        
        # Check if .env.production exists
        if [ ! -f ".env.production" ]; then
            print_warning ".env.production not found. Using .env.local instead"
        fi
        
        # Install dependencies
        echo "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
        
        # Build
        echo "Building..."
        npm run build
        print_success "Build completed successfully"
        
        # Check if Vercel CLI is installed
        if command -v vercel &> /dev/null; then
            echo ""
            read -p "Deploy to Vercel now? (y/n): " deploy_vercel
            if [ "$deploy_vercel" = "y" ] || [ "$deploy_vercel" = "Y" ]; then
                vercel --prod
                print_success "Frontend deployed to Vercel!"
            fi
        else
            print_warning "Vercel CLI not installed. Install with: npm i -g vercel"
            echo "To deploy manually: vercel --prod"
        fi
        ;;
        
    2)
        echo ""
        echo "📦 Preparing Backend for Production..."
        echo "======================================"
        
        cd server
        
        # Check if .env exists
        if [ ! -f ".env" ]; then
            print_error ".env file not found in server directory"
            echo "Please create server/.env with required variables"
            exit 1
        fi
        
        # Install dependencies
        echo "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
        
        # Test server
        echo "Testing server..."
        timeout 5 npm start &
        sleep 3
        if curl -s http://localhost:5000/ > /dev/null; then
            print_success "Server test passed"
        else
            print_warning "Server test failed or taking too long"
        fi
        
        echo ""
        print_warning "Backend deployment requires manual push to Railway/Render"
        echo "Steps:"
        echo "1. Push your code to GitHub"
        echo "2. Railway/Render will auto-deploy"
        echo "Or configure environment variables in your platform dashboard"
        
        cd ..
        ;;
        
    3)
        echo ""
        echo "📦 Full Production Deployment"
        echo "======================================"
        
        # Build Frontend
        echo "Building Frontend..."
        npm install
        npm run build
        print_success "Frontend built"
        
        # Prepare Backend
        echo ""
        echo "Preparing Backend..."
        cd server
        npm install
        print_success "Backend dependencies installed"
        cd ..
        
        echo ""
        print_success "Build completed successfully!"
        echo ""
        print_warning "Next steps:"
        echo "1. Deploy frontend: vercel --prod"
        echo "2. Push to GitHub for backend auto-deploy"
        echo "3. Configure environment variables on deployment platforms"
        ;;
        
    4)
        echo ""
        echo "🧪 Testing Production Build Locally"
        echo "======================================"
        
        # Build Frontend
        echo "Building frontend..."
        npm install
        npm run build
        print_success "Frontend built"
        
        # Start preview
        echo ""
        echo "Starting preview server..."
        echo "Frontend will be available at: http://localhost:4173"
        echo ""
        print_warning "Don't forget to start the backend server in another terminal:"
        echo "cd server && npm start"
        echo ""
        npm run preview
        ;;
        
    5)
        echo "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
