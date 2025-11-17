# MsgXone Production Deployment Guide

This guide provides step-by-step instructions for deploying MsgXone to a production environment on a Linux server.

## Prerequisites

- Ubuntu 20.04/22.04 LTS server
- Domain name (codexone.online) with DNS access
- SSH access to your server
- Root or sudo privileges

## 1. Server Setup

### 1.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Dependencies

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Redis
sudo apt install -y redis-server
```

### 1.3 Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Application Setup

### 2.1 Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www
cd /var/www

# Clone your repository
sudo git clone https://github.com/yourusername/msgxone.git
sudo chown -R $USER:$USER /var/www/msgxone
cd msgxone
```

### 2.2 Install Dependencies

```bash
npm ci --production
```

### 2.3 Configure Environment

```bash
# Copy production environment file
cp production.env.example .env.production

# Edit the configuration
nano .env.production
```

Update the following variables in `.env.production`:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.codexone.online
NEXT_PUBLIC_SOCKET_URL=wss://ws.codexone.online
NEXT_PUBLIC_SOCKET_PATH=/ws
PORT=3000
CORS_ORIGIN=https://www.codexone.online
REDIS_URL=redis://localhost:6379
COOKIE_SECRET=generate_a_secure_random_string
ENCRYPTION_KEY=generate_a_32_character_string
```

### 2.4 Build the Application

```bash
npm run build
```

## 3. Configure Nginx

### 3.1 Copy Nginx Configuration

```bash
# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Copy your nginx config
sudo cp nginx.conf /etc/nginx/sites-available/msgxone

# Enable the site
sudo ln -s /etc/nginx/sites-available/msgxone /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 4. Set Up SSL with Let's Encrypt

### 4.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d codexone.online -d www.codexone.online -d api.codexone.online -d ws.codexone.online
```

### 4.3 Set Up Auto-Renewal

```bash
# Test the renewal process
sudo certbot renew --dry-run

# Add a cron job for auto-renewal
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
```

## 5. Run the Application

### 5.1 Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Then run the command provided by the above command

# Save the PM2 process list again
pm2 save
```

### 5.2 Verify Application Status

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs msgxone
```

## 6. Post-Deployment Tasks

### 6.1 Configure Log Rotation

```bash
# Install logrotate for PM2
sudo pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 6.2 Set Up Monitoring (Optional)

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View monitoring dashboard
pm2 monit
```

## 7. Maintenance

### 7.1 Updating the Application

```bash
# Pull the latest changes
git pull

# Install new dependencies
npm ci --production

# Rebuild the application
npm run build

# Restart the application
pm2 restart msgxone
```

### 7.2 Backup and Restore

#### Create a Backup

```bash
# Create backup directory
mkdir -p ~/backups/msgxone

# Backup application files
tar -czf ~/backups/msgxone/backup-$(date +%Y%m%d).tar.gz /var/www/msgxone

# Backup Redis data
redis-cli SAVE
sudo cp /var/lib/redis/dump.rdb ~/backups/msgxone/redis-dump-$(date +%Y%m%d).rdb
```

#### Restore from Backup

```bash
# Stop services
pm2 stop msgxone
sudo systemctl stop redis

# Restore application files
tar -xzf ~/backups/msgxone/backup-YYYYMMDD.tar.gz -C /

# Restore Redis data
sudo cp ~/backups/msgxone/redis-dump-YYYYMMDD.rdb /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb

# Start services
sudo systemctl start redis
pm2 start msgxone
```

## 8. Troubleshooting

### Common Issues

#### Application Not Starting

```bash
# Check PM2 logs
pm2 logs msgxone

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew --force-renewal
```

#### Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

## 9. Security Hardening

### 9.1 Update Server Regularly

```bash
# Set up automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 9.2 Harden SSH Access

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set the following options:
# Port 2222  # Change default SSH port
# PermitRootLogin no
# PasswordAuthentication no
# AllowUsers yourusername

# Restart SSH
sudo systemctl restart sshd
```

## 10. Performance Tuning

### 10.1 Optimize Nginx

Add these to your Nginx config in the `http` block:

```nginx
# In /etc/nginx/nginx.conf
http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Buffer size for POST submissions
    client_body_buffer_size 10K;
    client_max_body_size 8m;
    
    # Buffer size for headers
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    # Gzip Settings
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 10.2 Optimize Node.js Memory

```bash
# Edit PM2 ecosystem config
nano ecosystem.config.js

# Add these to the app config:
"max_memory_restart": "1G",
"node_args": "--max-old-space-size=1024"
```

## 11. Monitoring and Alerts

### 11.1 Set Up PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Install PM2 logs management
pm2 install pm2-logrotate
```

### 11.2 Set Up Uptime Monitoring

```bash
# Install Uptime Kuma (self-hosted monitoring)
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```

Access the dashboard at `http://your-server-ip:3001` and set up monitoring for your domain.

## 12. Backup Strategy

### 12.1 Automated Backups

Create a backup script at `/usr/local/bin/backup-msgxone.sh`:

```bash
#!/bin/bash

# Create backup directory
BACKUP_DIR="/backups/msgxone/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/app-$(date +%Y%m%d-%H%M%S).tar.gz /var/www/msgxone

# Backup Redis
redis-cli SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis-dump-$(date +%Y%m%d-%H%M%S).rdb

# Backup Nginx config
cp -r /etc/nginx $BACKUP_DIR/nginx-config

# Keep only last 7 days of backups
find /backups/msgxone -type d -mtime +7 -exec rm -rf {} \;

# Sync to remote storage (example with S3)
# aws s3 sync $BACKUP_DIR s3://your-bucket/msgxone-backups/

# Set permissions
chmod 600 $BACKUP_DIR/*
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-msgxone.sh
```

### 12.2 Schedule Daily Backups

```bash
# Edit crontab
sudo crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /usr/local/bin/backup-msgxone.sh
```

## 13. Scaling

### 13.1 Horizontal Scaling

For high traffic, consider:

1. **Load Balancing**: Set up multiple app servers behind a load balancer
2. **Redis Cluster**: For high-availability Redis
3. **CDN**: For static assets
4. **Database Sharding**: If using a database in the future

### 13.2 Vertical Scaling

1. **Upgrade Server**: More CPU/RAM as needed
2. **Optimize Queries**: Ensure efficient database queries
3. **Caching**: Implement Redis caching for frequently accessed data

## 14. Maintenance Mode

### 14.1 Enable Maintenance Mode

Create a maintenance page at `/var/www/maintenance.html` and update Nginx:

```nginx
server {
    # ... existing config ...
    
    location / {
        error_page 503 @maintenance;
        if (-f /var/www/maintenance.html) {
            return 503;
        }
        # ... rest of your config ...
    }
    
    location @maintenance {
        root /var/www;
        rewrite ^(.*)$ /maintenance.html break;
    }
}
```

### 14.2 Toggle Maintenance Mode

```bash
# Enable maintenance mode
sudo touch /var/www/maintenance.html

# Disable maintenance mode
sudo rm /var/www/maintenance.html
```

## 15. Conclusion

Your MsgXone application is now deployed in a production environment with:

- ✅ Secure Nginx configuration with SSL
- ✅ PM2 process management
- ✅ Automated backups
- ✅ Monitoring and logging
- ✅ Maintenance procedures

For additional security, consider:

- Setting up a Web Application Firewall (WAF)
- Implementing rate limiting at the application level
- Regular security audits
- Monitoring for suspicious activities

For support, please contact your system administrator or refer to the official documentation at [MsgXone Docs](https://docs.msgxone.com).
