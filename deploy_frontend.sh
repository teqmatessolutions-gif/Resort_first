#!/bin/bash

# TeqMates Resort Management System - Frontend Deployment Script
# This script builds and deploys the React applications for production

set -e  # Exit on any error

echo "🚀 Starting Frontend Deployment for TeqMates Resort Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Set production environment
export NODE_ENV=production

# Function to build React application
build_app() {
    local app_name=$1
    local app_path=$2
    local build_path=$3
    
    print_status "Building $app_name..."
    
    if [ ! -d "$app_path" ]; then
        print_error "$app_name directory not found at $app_path"
        return 1
    fi
    
    cd "$app_path"
    
    # Install dependencies
    print_status "Installing dependencies for $app_name..."
    npm install --production=false
    
    # Build the application
    print_status "Building $app_name for production..."
    npm run build
    
    # Verify build
    if [ ! -d "$build_path" ]; then
        print_error "Build failed for $app_name - build directory not found"
        return 1
    fi
    
    print_success "$app_name built successfully!"
    cd - > /dev/null
}

# Build Dashboard Application
print_status "Building Dashboard Application..."
build_app "Dashboard" "dasboard" "dasboard/build"

# Build Userend Application
print_status "Building Userend Application..."
build_app "Userend" "userend/userend" "userend/userend/build"

# Verify builds
print_status "Verifying builds..."

if [ -d "dasboard/build" ]; then
    print_success "Dashboard build verified ✓"
else
    print_error "Dashboard build failed ✗"
    exit 1
fi

if [ -d "userend/userend/build" ]; then
    print_success "Userend build verified ✓"
else
    print_error "Userend build failed ✗"
    exit 1
fi

# Set proper permissions
print_status "Setting proper permissions..."
sudo chown -R www-data:www-data dasboard/build
sudo chown -R www-data:www-data userend/userend/build
sudo chmod -R 755 dasboard/build
sudo chmod -R 755 userend/userend/build

print_success "Frontend applications built successfully!"
print_status "Build locations:"
print_status "  - Dashboard: dasboard/build/"
print_status "  - Userend: userend/userend/build/"

# Test the builds locally (optional)
if [ "$1" == "--test" ]; then
    print_status "Testing builds..."
    
    # Test dashboard
    if [ -f "dasboard/build/index.html" ]; then
        print_success "Dashboard index.html found ✓"
    else
        print_error "Dashboard index.html not found ✗"
    fi
    
    # Test userend
    if [ -f "userend/userend/build/index.html" ]; then
        print_success "Userend index.html found ✓"
    else
        print_error "Userend index.html not found ✗"
    fi
fi

print_success "🎉 Frontend deployment completed successfully!"
print_status "Next steps:"
print_status "1. Restart your FastAPI backend server"
print_status "2. Restart Nginx: sudo systemctl restart nginx"
print_status "3. Test your applications at:"
print_status "   - https://www.teqmates.com (Landing Page)"
print_status "   - https://www.teqmates.com/admin (Dashboard)"
print_status "   - https://www.teqmates.com/resort (User Interface)"

exit 0
