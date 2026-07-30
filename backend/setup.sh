#!/bin/bash

# Temp-Mail Backend Setup Script
# This script helps you create a .env file interactively

echo "=========================================="
echo "   Temp-Mail Backend Configuration"
echo "=========================================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
    rm .env
fi

echo "Let's configure your backend environment..."
echo ""

# Database URL
echo "📦 DATABASE CONFIGURATION"
echo "-------------------------------------------"
echo "Example: postgresql://user:password@localhost:5432/tempmail"
read -p "Enter your PostgreSQL DATABASE_URL: " database_url
echo ""

# Domain Configuration
echo "🌐 DOMAIN CONFIGURATION"
echo "-------------------------------------------"
read -p "Enter your email domain (e.g., temp.yourdomain.com): " smtp_domain
echo ""

# Frontend URL
echo "🎨 FRONTEND CONFIGURATION"
echo "-------------------------------------------"
echo "Enter your frontend URL(s) separated by commas"
echo "Example: https://temp.yourdomain.com,https://temp-app.vercel.app"
read -p "Frontend URL(s): " cors_origin
echo ""

# Server Ports
echo "🔌 SERVER PORTS"
echo "-------------------------------------------"
read -p "API Port (default: 3001): " api_port
api_port=${api_port:-3001}

read -p "SMTP Port (25 for production, 2525 for testing) [default: 25]: " smtp_port
smtp_port=${smtp_port:-25}
echo ""

# Environment
echo "⚙️  ENVIRONMENT"
echo "-------------------------------------------"
read -p "Environment (production/development) [default: production]: " node_env
node_env=${node_env:-production}
echo ""

# Cleanup Configuration
echo "🧹 CLEANUP SERVICE"
echo "-------------------------------------------"
read -p "Enable automatic cleanup? (true/false) [default: true]: " cleanup_enabled
cleanup_enabled=${cleanup_enabled:-true}

read -p "Is this the cleanup leader? (true/false) [default: true]: " cleanup_leader
cleanup_leader=${cleanup_leader:-true}
echo ""

# Optional: PostHog Analytics
echo "📊 ANALYTICS (Optional)"
echo "-------------------------------------------"
read -p "PostHog API Key (leave empty to skip): " posthog_key
echo ""

# Create .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL=$database_url

# Server Configuration
API_PORT=$api_port
SMTP_PORT=$smtp_port

# Domain Configuration
SMTP_DOMAIN=$smtp_domain
MAIL_DOMAIN=$smtp_domain

# CORS Configuration
CORS_ORIGIN=$cors_origin
FRONTEND_URL=$(echo $cors_origin | cut -d',' -f1)

# Environment
NODE_ENV=$node_env

# Cleanup Service
CLEANUP_ENABLED=$cleanup_enabled
CLEANUP_LEADER=$cleanup_leader
EOF

# Add PostHog if provided
if [ ! -z "$posthog_key" ]; then
    cat >> .env << EOF

# Analytics
POSTHOG_KEY=$posthog_key
POSTHOG_HOST=https://app.posthog.com
EOF
fi

echo "✅ .env file created successfully!"
echo ""
echo "📋 Your configuration:"
echo "-------------------------------------------"
cat .env
echo "-------------------------------------------"
echo ""
echo "🚀 Next steps:"
echo "1. Review the .env file: cat .env"
echo "2. Generate Prisma client: pnpm prisma:generate"
echo "3. Run migrations: pnpm prisma migrate deploy"
echo "4. Build the application: pnpm build"
echo "5. Start the server: pnpm start"
echo ""
echo "For development mode: pnpm dev"
echo ""
