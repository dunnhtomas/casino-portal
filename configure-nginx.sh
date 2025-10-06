#!/bin/bash

# Nginx Configuration Script for Astro Static Site
echo "Configuring Nginx for static site..."

sudo tee /etc/nginx/sites-available/bestcasinoportal.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name bestcasinoportal.com www.bestcasinoportal.com bestcasinopo.vps.webdock.cloud;
    
    root /var/www/html;
    index index.html index.htm;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Main location block
    location / {
        try_files $uri $uri/ $uri.html =404;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }
    
    # Astro assets
    location /_astro/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Favicon
    location = /favicon.ico {
        expires 30d;
        access_log off;
        log_not_found off;
    }
    
    # Robots.txt
    location = /robots.txt {
        expires 30d;
        access_log off;
        log_not_found off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Enable the site
echo "Enabling site configuration..."
sudo ln -sf /etc/nginx/sites-available/bestcasinoportal.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    sudo systemctl reload nginx
    echo "Nginx configured successfully!"
else
    echo "Nginx configuration test failed!"
    exit 1
fi