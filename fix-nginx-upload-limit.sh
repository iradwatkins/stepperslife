#!/bin/bash

# Fix nginx upload size limit for production server
# This script increases the client_max_body_size to allow larger file uploads

echo "🔧 Fixing nginx upload size limit on production server..."

# SSH to server and update nginx configuration
ssh root@72.60.28.175 << 'EOF'
echo "📝 Updating nginx configuration..."

# Check if nginx config exists
if [ ! -f /etc/nginx/sites-enabled/stepperslife ]; then
    echo "❌ Nginx config not found at /etc/nginx/sites-enabled/stepperslife"
    exit 1
fi

# Backup current config
cp /etc/nginx/sites-enabled/stepperslife /etc/nginx/sites-enabled/stepperslife.backup

# Update nginx config with increased upload limit
cat > /etc/nginx/sites-enabled/stepperslife << 'NGINX_CONFIG'
server {
    listen 80;
    listen [::]:80;
    server_name stepperslife.com www.stepperslife.com;
    
    # Increase client body size limit to 50MB for file uploads
    client_max_body_size 50M;
    
    # NO REDIRECTS - Cloudflare handles HTTPS
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        
        # Also set client body size for proxied requests
        client_max_body_size 50M;
    }
}
NGINX_CONFIG

# Test nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    # Reload nginx
    systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
    echo "✅ Upload limit increased to 50MB"
else
    echo "❌ Nginx configuration test failed, reverting..."
    mv /etc/nginx/sites-enabled/stepperslife.backup /etc/nginx/sites-enabled/stepperslife
    exit 1
fi

EOF

echo "✅ Production server nginx configuration updated successfully!"
echo "📋 Changes made:"
echo "  - Increased client_max_body_size to 50MB"
echo "  - Added proxy headers for better request forwarding"
echo "  - Configuration backed up to stepperslife.backup"