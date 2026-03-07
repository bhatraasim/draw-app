# Deployment Guide

This guide covers deploying the Draw App to production using Docker and Nginx.

---

## Prerequisites

### Server Requirements

| Resource | Minimum       | Recommended      |
| -------- | ------------- | ---------------- |
| CPU      | 1 core        | 2 cores          |
| RAM      | 1 GB          | 2 GB             |
| Storage  | 20 GB         | 40 GB            |
| OS       | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### Required Software

- Docker >= 20.x
- Docker Compose >= 2.x
- Nginx >= 1.18
- Certbot (for SSL)

---

## Step 1: Server Initial Setup

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER

# Enable Docker on boot
sudo systemctl enable docker

# Install Docker Compose
sudo apt install docker-compose -y
```

### Install Nginx

```bash
sudo apt install nginx -y
```

### Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## Step 2: Domain Configuration

### DNS Setup

1. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Add A record:
   - **Name**: draw.rasim.online
   - **Value**: your-server-ip
3. Wait for DNS propagation (can take up to 24 hours)

### Verify DNS

```bash
nslookup draw.rasim.online
# Should return your server IP
```

---

## Step 3: Application Deployment

### Clone Repository

```bash
# SSH to server
ssh user@your-server-ip

# Create project directory
mkdir -p ~/draw-app
cd ~/draw-app

# Clone repository
git clone https://github.com/bhatraasim/draw-app.git .

# Or use your fork
git clone https://github.com/YOUR_USERNAME/draw-app.git .
```

### Configure Environment

```bash
# Create production environment file
nano .env
```

Add the following:

```env
# Database (use your MongoDB Atlas connection string)
DATABASE_URL=mongodb+srv://admin:your-password@cluster0.xxx.mongodb.net/draw-app

# JWT Secret (generate a strong secret, min 32 characters)
JWT_SECRET=your-super-secret-key-at-least-32-characters

# Frontend URL
FRONTEND_URL=https://draw.rasim.online

# Public URLs (HTTPS is required for production)
NEXT_PUBLIC_API_URL=https://draw.rasim.online/api
NEXT_PUBLIC_WS_URL=wss://draw.rasim.online/ws

# Docker Hub (if using pre-built images)
DOCKERHUB_USERNAME=your-username
```

### Start Services

```bash
# Pull and start all services
docker compose pull
docker compose up -d

# Check status
docker compose ps
```

---

## Step 4: Nginx Configuration

### Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/draw-app
```

Add the following configuration:

```nginx
server {
    server_name draw.rasim.online;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy no-referrer-when-downgrade always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # HTTP Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/draw.rasim.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/draw.rasim.online/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP to HTTPS redirect
server {
    server_name draw.rasim.online;
    listen 80;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/draw-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 5: SSL Certificate

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Generate Certificate

```bash
# Create directory for ACME challenge
sudo mkdir -p /var/www/certbot

# Generate certificate
sudo certbot --nginx -d draw.rasim.online -d www.draw.rasim.online \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

### Verify Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Check certificates
sudo certbot certificates
```

### Certificate Renewal (Manual)

If auto-renewal fails:

```bash
# Renew all certificates
sudo certbot renew

# Reload nginx
sudo nginx -s reload
```

---

## Step 6: Verify Deployment

### Check Services

```bash
# Check Docker containers
docker compose ps

# Check service logs
docker compose logs -f draw-frontend
docker compose logs -f http-backend
docker compose logs -f ws-backend
```

### Test Endpoints

```bash
# Test HTTPS
curl -I https://draw.rasim.online

# Test API
curl -I https://draw.rasim.online/api/signin

# Test WebSocket (basic connection)
curl -I wss://draw.rasim.online/ws
```

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Maintenance

### Update Application

```bash
# SSH to server
ssh user@your-server-ip

# Navigate to project
cd ~/draw-app

# Pull latest
git pull

# Pull latest Docker images
docker compose pull

# Restart services
docker compose up -d

# Check logs
docker compose logs -f
```

### Backup Database

```bash
# Using mongodump (if local MongoDB)
mongodump --uri="mongodb://localhost:27017/draw-app" --out=/backup/

# Using Atlas (use Atlas UI or CLI)
# Go to Atlas > Deployments > Backups
```

### Log Rotation

Configure log rotation for Docker logs:

```bash
sudo nano /etc/logrotate.d/docker-compose
```

Add:

```text
~/draw-app/docker-compose.yml {
    weekly
    rotate 4
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose logs [service-name]

# Common issues:
# - Port already in use: sudo lsof -i :3000
# - Environment variables missing: cat .env
# - Database connection failed: Check DATABASE_URL
```

### WebSocket Not Working

```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Common issues:
# - Location uses trailing slash: Use /ws not /ws/
# - Missing Upgrade headers
# - SSL certificate issues
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Manual renewal
sudo certbot renew --force-renewal

# Check nginx config
sudo nginx -t
```

---

## Security Hardening

### Additional Nginx Security Headers

Add to your nginx config:

```nginx
# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self';" always;

# X-XSS Protection
add_header X-XSS-Protection "1; mode=block" always;
```

### Rate Limiting

Add rate limiting to nginx config:

```nginx
http {
    # Define rate limit zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:1m rate=5r/s;

    server {
        # Apply to API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
        }

        # Apply to login
        location /api/signin {
            limit_req zone=login burst=10 nodelay;
        }
    }
}
```

---

## Monitoring

### Basic Health Checks

Create a health check endpoint in your services:

```bash
# Add to crontab
*/5 * * * * curl -f https://draw.rasim.online/api/health || echo "Service down"
```

### Resource Monitoring

```bash
# Docker stats
docker stats

# System resources
htop

# Disk usage
df -h
```

---

## Rollback

If deployment fails:

```bash
# List Docker images
docker images

# Rollback to previous image
docker compose pull
docker compose up -d

# Or use specific tag
docker-compose pull draw-frontend:previous-tag
docker-compose up -d
```

---

## Quick Reference

### Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart draw-frontend

# Rebuild service
docker compose up -d --build draw-frontend

# SSH into container
docker exec -it draw-app-backend-dev sh
```

### File Locations

| File           | Path                                     |
| -------------- | ---------------------------------------- |
| Docker Compose | ~/draw-app/docker-compose.yml            |
| Nginx Config   | /etc/nginx/sites-available/draw-app      |
| SSL Certs      | /etc/letsencrypt/live/draw.rasim.online/ |
| App Logs       | `docker compose logs`                    |
| Nginx Logs     | /var/log/nginx/                          |


## Local development 
docker compose -f docker-compose.dev.yml up