#!/bin/bash

# Resort Management System - Automated Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: staging | production (default: staging)

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-staging}
REPO_URL="https://github.com/teqmatessolutions-gif/Resort_first.git"
APP_DIR="/var/www/teqmates.com"
BACKUP_DIR="/var/backups/resort-app"
SERVICE_NAME="resort-api"
NGINX_SITE="teqmates.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Use sudo when needed."
        exit 1
    fi

    if ! sudo -n true 2>/dev/null; then
        error "This script requires sudo privileges. Please run with a user that has sudo access."
        exit 1
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."

    # Check if required commands exist
    local required_commands=("git" "nginx" "python3" "node" "npm" "systemctl" "postgresql")

    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Required command '$cmd' is not installed"
            exit 1
        fi
    done

    # Check if PostgreSQL is running
    if ! sudo systemctl is-active --quiet postgresql; then
        error "PostgreSQL is not running. Please start it with: sudo systemctl start postgresql"
        exit 1
    fi

    # Check if nginx is running
    if ! sudo systemctl is-active --quiet nginx; then
        warning "Nginx is not running. It will be started after deployment."
    fi

    log "Pre-deployment checks passed ✓"
}

# Create backup
create_backup() {
    log "Creating backup..."

    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="${BACKUP_DIR}/${backup_timestamp}"

    # Create backup directory
    sudo mkdir -p "$backup_path"

    # Backup application files (if exists)
    if [[ -d "$APP_DIR" ]]; then
        log "Backing up application files..."
        sudo cp -r "$APP_DIR" "$backup_path/app_backup"
    fi

    # Backup database
    log "Backing up database..."
    sudo -u postgres pg_dump resort_db > "$backup_path/database_backup.sql" 2>/dev/null || {
        warning "Database backup failed. Database might not exist yet."
    }

    # Backup nginx configuration
    if [[ -f "/etc/nginx/sites-available/$NGINX_SITE" ]]; then
        log "Backing up nginx configuration..."
        sudo cp "/etc/nginx/sites-available/$NGINX_SITE" "$backup_path/nginx_backup.conf"
    fi

    log "Backup created at: $backup_path"
    echo "$backup_path" > /tmp/resort_backup_path
}

# Clone or update repository
update_repository() {
    log "Updating repository..."

    if [[ -d "$APP_DIR" ]]; then
        log "Updating existing repository..."
        cd "$APP_DIR"
        sudo git fetch --all
        sudo git reset --hard origin/main
        sudo git pull origin main
    else
        log "Cloning repository..."
        sudo mkdir -p "$(dirname "$APP_DIR")"
        sudo git clone "$REPO_URL" "$APP_DIR"
    fi

    # Set proper ownership
    sudo chown -R $USER:$USER "$APP_DIR"

    log "Repository updated ✓"
}

# Setup Python environment
setup_python_environment() {
    log "Setting up Python environment..."

    cd "$APP_DIR/Resort_first/ResortApp"

    # Create virtual environment if it doesn't exist
    if [[ ! -d "venv" ]]; then
        log "Creating Python virtual environment..."
        python3 -m venv venv
    fi

    # Activate virtual environment and install dependencies
    log "Installing Python dependencies..."
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt

    # Setup environment file
    if [[ ! -f ".env" ]]; then
        log "Creating environment file..."
        cp .env.example .env
        warning "Please edit .env file with your production values"

        # Generate a random secret key
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
        sed -i "s/your-secret-key-here-change-this-in-production/$SECRET_KEY/" .env
    fi

    log "Python environment setup complete ✓"
}

# Setup database
setup_database() {
    log "Setting up database..."

    cd "$APP_DIR/Resort_first/ResortApp"
    source venv/bin/activate

    # Check if database exists, create if it doesn't
    if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw resort_db; then
        log "Creating database..."
        sudo -u postgres createdb resort_db

        # Create user if it doesn't exist
        sudo -u postgres psql -c "CREATE USER resort_user WITH ENCRYPTED PASSWORD 'secure_password_123';" 2>/dev/null || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE resort_db TO resort_user;"

        warning "Database user created with default password. Please change it in production!"
    fi

    # Run migrations
    log "Running database migrations..."
    alembic upgrade head

    log "Database setup complete ✓"
}

# Build frontend applications
build_frontend() {
    log "Building frontend applications..."

    # Build admin dashboard
    log "Building admin dashboard..."
    cd "$APP_DIR/Resort_first/dasboard"

    if [[ -f "package.json" ]]; then
        npm ci --production=false
        npm run build

        # Copy build to web directory
        sudo mkdir -p /var/www/teqmates.com/dashboard
        sudo cp -r build/* /var/www/teqmates.com/dashboard/
    fi

    # Build user frontend
    log "Building user frontend..."
    cd "$APP_DIR/Resort_first/userend/userend"

    if [[ -f "package.json" ]]; then
        npm ci --production=false
        npm run build

        # Copy build to web directory
        sudo mkdir -p /var/www/teqmates.com/userend
        sudo cp -r build/* /var/www/teqmates.com/userend/
    fi

    # Copy landing page
    log "Setting up landing page..."
    sudo mkdir -p /var/www/teqmates.com/landingpage
    sudo cp -r "$APP_DIR/Resort_first/landingpage"/* /var/www/teqmates.com/landingpage/

    log "Frontend applications built ✓"
}

# Setup system service
setup_service() {
    log "Setting up system service..."

    # Copy service file
    sudo cp "$APP_DIR/Resort_first/deployment/resort-api.service" /etc/systemd/system/

    # Update service file with correct paths
    sudo sed -i "s|/var/www/teqmates.com|$APP_DIR|g" /etc/systemd/system/resort-api.service

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable $SERVICE_NAME

    log "System service configured ✓"
}

# Configure nginx
configure_nginx() {
    log "Configuring Nginx..."

    # Copy nginx configuration
    sudo cp "$APP_DIR/Resort_first/deployment/nginx.conf" "/etc/nginx/sites-available/$NGINX_SITE"

    # Enable site
    sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" "/etc/nginx/sites-enabled/"

    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default

    # Test nginx configuration
    if sudo nginx -t; then
        log "Nginx configuration is valid ✓"
    else
        error "Nginx configuration is invalid!"
        exit 1
    fi
}

# Set file permissions
set_permissions() {
    log "Setting file permissions..."

    # Create necessary directories
    sudo mkdir -p /var/www/teqmates.com/{uploads,logs}

    # Set ownership and permissions
    sudo chown -R www-data:www-data /var/www/teqmates.com
    sudo chmod -R 755 /var/www/teqmates.com
    sudo chmod -R 775 /var/www/teqmates.com/uploads
    sudo chmod -R 775 /var/www/teqmates.com/logs

    # Set permissions for application directory
    sudo chown -R $USER:www-data "$APP_DIR/Resort_first/ResortApp"
    sudo chmod -R 755 "$APP_DIR/Resort_first/ResortApp"

    log "File permissions set ✓"
}

# Start services
start_services() {
    log "Starting services..."

    # Start API service
    if sudo systemctl restart $SERVICE_NAME; then
        log "API service started ✓"
    else
        error "Failed to start API service"
        sudo journalctl -u $SERVICE_NAME --no-pager -n 20
        exit 1
    fi

    # Start nginx
    if sudo systemctl restart nginx; then
        log "Nginx started ✓"
    else
        error "Failed to start Nginx"
        sudo journalctl -u nginx --no-pager -n 20
        exit 1
    fi

    # Enable services to start on boot
    sudo systemctl enable $SERVICE_NAME
    sudo systemctl enable nginx
}

# Health checks
run_health_checks() {
    log "Running health checks..."

    # Wait a moment for services to start
    sleep 5

    # Check API service status
    if sudo systemctl is-active --quiet $SERVICE_NAME; then
        log "✓ API service is running"
    else
        error "✗ API service is not running"
        return 1
    fi

    # Check nginx status
    if sudo systemctl is-active --quiet nginx; then
        log "✓ Nginx is running"
    else
        error "✗ Nginx is not running"
        return 1
    fi

    # Check API endpoint
    if curl -f -s http://localhost:8000/health &>/dev/null; then
        log "✓ API health check passed"
    else
        warning "⚠ API health check failed (this might be normal if health endpoint is not implemented)"
    fi

    # Check if ports are listening
    if netstat -tuln | grep -q ":8000 "; then
        log "✓ API is listening on port 8000"
    else
        error "✗ API is not listening on port 8000"
        return 1
    fi

    if netstat -tuln | grep -q ":80 \|:443 "; then
        log "✓ Nginx is listening on HTTP/HTTPS ports"
    else
        error "✗ Nginx is not listening on HTTP/HTTPS ports"
        return 1
    fi

    log "Health checks completed ✓"
}

# Setup SSL (optional)
setup_ssl() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Setting up SSL certificate..."

        # Check if certbot is installed
        if command -v certbot &> /dev/null; then
            # Only run certbot if certificate doesn't exist
            if [[ ! -f "/etc/letsencrypt/live/teqmates.com/fullchain.pem" ]]; then
                info "Obtaining SSL certificate..."
                sudo certbot --nginx -d teqmates.com -d www.teqmates.com --non-interactive --agree-tos -m admin@teqmates.com

                # Setup auto-renewal
                sudo systemctl enable certbot.timer
                log "SSL certificate obtained and auto-renewal configured ✓"
            else
                log "SSL certificate already exists ✓"
            fi
        else
            warning "Certbot not installed. SSL certificate not configured."
            info "Install certbot with: sudo apt install certbot python3-certbot-nginx"
        fi
    else
        log "Skipping SSL setup for staging environment"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."

    # Keep only last 5 backups
    if [[ -d "$BACKUP_DIR" ]]; then
        sudo find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \; 2>/dev/null || true
        log "Old backups cleaned up ✓"
    fi
}

# Display deployment summary
deployment_summary() {
    log "=== DEPLOYMENT SUMMARY ==="
    info "Environment: $ENVIRONMENT"
    info "Application Directory: $APP_DIR"
    info "Backup Location: $(cat /tmp/resort_backup_path 2>/dev/null || echo 'No backup created')"
    info "Domain: teqmates.com"

    echo
    log "=== SERVICE STATUS ==="
    sudo systemctl status $SERVICE_NAME --no-pager -l || true

    echo
    log "=== NEXT STEPS ==="
    info "1. Update DNS records to point to this server"
    info "2. Configure environment variables in $APP_DIR/Resort_first/ResortApp/.env"
    info "3. Test the application at http://$(hostname -I | awk '{print $1}')"

    if [[ "$ENVIRONMENT" == "production" ]]; then
        info "4. The application should be accessible at:"
        info "   - Landing Page: https://www.teqmates.com"
        info "   - Admin Dashboard: https://www.teqmates.com/dashboard"
        info "   - User Portal: https://www.teqmates.com/userend"
        info "   - API Documentation: https://www.teqmates.com/api/docs"
    fi

    echo
    log "=== MONITORING COMMANDS ==="
    info "View API logs: sudo journalctl -u $SERVICE_NAME -f"
    info "View Nginx logs: sudo tail -f /var/log/nginx/error.log"
    info "Restart API: sudo systemctl restart $SERVICE_NAME"
    info "Restart Nginx: sudo systemctl restart nginx"
}

# Rollback function (in case of failure)
rollback() {
    local backup_path=$(cat /tmp/resort_backup_path 2>/dev/null)

    if [[ -n "$backup_path" && -d "$backup_path" ]]; then
        error "Deployment failed! Rolling back..."

        # Stop services
        sudo systemctl stop $SERVICE_NAME 2>/dev/null || true

        # Restore application files
        if [[ -d "$backup_path/app_backup" ]]; then
            sudo rm -rf "$APP_DIR"
            sudo mv "$backup_path/app_backup" "$APP_DIR"
        fi

        # Restore database
        if [[ -f "$backup_path/database_backup.sql" ]]; then
            sudo -u postgres psql resort_db < "$backup_path/database_backup.sql" 2>/dev/null || true
        fi

        # Restore nginx configuration
        if [[ -f "$backup_path/nginx_backup.conf" ]]; then
            sudo cp "$backup_path/nginx_backup.conf" "/etc/nginx/sites-available/$NGINX_SITE"
        fi

        # Restart services
        sudo systemctl start $SERVICE_NAME 2>/dev/null || true
        sudo systemctl restart nginx 2>/dev/null || true

        error "Rollback completed. Please check the logs and fix the issues."
    else
        error "No backup found for rollback!"
    fi
}

# Trap to handle errors and perform rollback
trap rollback ERR

# Main deployment function
main() {
    log "Starting Resort Management System deployment..."
    log "Environment: $ENVIRONMENT"

    check_permissions
    pre_deployment_checks
    create_backup
    update_repository
    setup_python_environment
    setup_database
    build_frontend
    setup_service
    configure_nginx
    set_permissions
    start_services
    run_health_checks

    if [[ "$ENVIRONMENT" == "production" ]]; then
        setup_ssl
    fi

    cleanup_backups
    deployment_summary

    log "🎉 Deployment completed successfully!"
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
