# Draw App - Production Documentation

A real-time collaborative drawing application built with pnpm + Turborepo monorepo, featuring Next.js frontends and Node/TypeScript backends with WebSocket support.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Service Overview](#service-overview)
4. [Development Setup](#development-setup)
5. [Production Deployment](#production-deployment)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [WebSocket Protocol](#websocket-protocol)
9. [Database Schema](#database-schema)
10. [Nginx Configuration](#nginx-configuration)
11. [SSL/HTTPS Setup](#sslhttps-setup)
12. [CI/CD Pipeline](#cicd-pipeline)
13. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Architecture Overview

```
                                    Internet
                                        |
                                        v
                            +-------------------+
                            |   Nginx (443)     |  Reverse Proxy + SSL
                            +-------------------+
                                        |
                    +-------------------+-------------------+
                    |                   |                   |
                    v                   v                   v
            +-------------+     +-------------+     +-------------+
            |  Frontend   |     | HTTP API    |     |  WebSocket |
            | (Next.js)   |     | (Express)   |     |   Server   |
            |  Port 3000  |     | Port 3001   |     |  Port 8080 |
            +-------------+     +-------------+     +-------------+
                    |                   |                   |
                    +-------------------+-------------------+
                                        |
                                        v
                                +---------------+
                                |   MongoDB     |
                                |   Port 27017  |
                                +---------------+
```

### Data Flow

1. **Frontend (Next.js)**: Serves the UI and handles user interactions
2. **HTTP Backend (Express)**: Handles REST API requests (authentication, room management)
3. **WebSocket Server**: Handles real-time communication (shape sync, chat)
4. **MongoDB**: Stores user data, rooms, and chat/shape history

---

## Technology Stack

| Component       | Technology         | Version |
| --------------- | ------------------ | ------- |
| Package Manager | pnpm               | 10.x    |
| Monorepo        | Turborepo          | 2.x     |
| Frontend        | Next.js            | 16.x    |
| UI Library      | React              | 19.x    |
| HTTP Server     | Express            | -       |
| WebSocket       | ws                 | -       |
| Database        | MongoDB (Mongoose) | -       |
| Validation      | Zod                | -       |
| Authentication  | JWT                | -       |
| Docker          | Docker Compose     | -       |
| Reverse Proxy   | Nginx              | 1.24.x  |
| SSL             | Let's Encrypt      | -       |

---

## Service Overview

| Service       | Port  | Description                 | Image               |
| ------------- | ----- | --------------------------- | ------------------- |
| draw-frontend | 3000  | Next.js drawing application | `draw-app-frontend` |
| http-backend  | 3001  | REST API server             | `draw-app-backend`  |
| ws-backend    | 8080  | WebSocket server            | `draw-app-ws`       |
| MongoDB       | 27017 | Database (dev only)         | mongo               |

---

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 10
- Docker & Docker Compose (for local development)
- MongoDB (local or Atlas)

### Local Development with Docker

```bash
# Clone and install dependencies
git clone <repository-url>
cd draw-app
pnpm install

# Start all services in development mode
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access services
# Frontend: http://localhost:3000
# HTTP API: http://localhost:3001
# WebSocket: ws://localhost:8080
```

### Local Development without Docker

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Or start individual services
pnpm --filter draw-frontend dev  # Port 3000
pnpm --filter http-backend dev   # Port 3001
pnpm --filter ws-backend dev     # Port 8080
```

### Environment Variables (Development)

Create `.env` file in root:

```env
DATABASE_URL=mongodb://localhost:27017/draw-app
JWT_SECRET=your-development-secret-min-32-chars
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

## Production Deployment

### Prerequisites

- Ubuntu server (recommended) with SSH access
- Domain name with DNS configured
- Docker and Docker Compose installed
- Nginx installed on host

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Deploy Application

```bash
# SSH to your server
ssh user@your-server-ip

# Clone repository
git clone <repository-url> draw-app
cd draw-app

# Create production environment file
nano .env
```

### Step 3: Production Environment Variables

```env
# Database (Atlas or local)
DATABASE_URL=mongodb+srv://admin:password@cluster0.xxx.mongodb.net/draw-app

# Authentication (min 32 characters)
JWT_SECRET=your-production-secret-at-least-32-characters-long

# Frontend URL (your domain)
FRONTEND_URL=https://draw.rasim.online

# Public URLs (HTTPS for production)
NEXT_PUBLIC_API_URL=https://draw.rasim.online/api
NEXT_PUBLIC_WS_URL=wss://draw.rasim.online/ws

# Docker Hub credentials (if using pre-built images)
DOCKERHUB_USERNAME=your-username
```

### Step 4: Deploy with Docker Compose

```bash
# Pull latest images and start
docker compose pull
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## Environment Variables

### Required Variables

| Variable              | Service                  | Description                           | Example                         |
| --------------------- | ------------------------ | ------------------------------------- | ------------------------------- |
| `DATABASE_URL`        | http-backend, ws-backend | MongoDB connection string             | `mongodb+srv://...`             |
| `JWT_SECRET`          | http-backend, ws-backend | Secret for JWT signing (min 32 chars) | `your-secret-key`               |
| `FRONTEND_URL`        | http-backend             | Allowed frontend origin               | `https://draw.rasim.online`     |
| `NEXT_PUBLIC_API_URL` | draw-frontend            | HTTP API URL                          | `https://draw.rasim.online/api` |
| `NEXT_PUBLIC_WS_URL`  | draw-frontend            | WebSocket URL                         | `wss://draw.rasim.online/ws`    |
| `PORT`                | all                      | Service port                          | `3000`, `3001`, `8080`          |
| `NODE_ENV`            | all                      | Environment                           | `production`                    |

### Docker-Specific Variables

| Variable             | Default | Description                    |
| -------------------- | ------- | ------------------------------ |
| `DOCKERHUB_USERNAME` | raaasim | Docker Hub username for images |

---

## API Documentation

### Authentication Endpoints

#### POST /api/signup

Create a new user account.

```bash
curl -X POST https://draw.rasim.online/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

#### POST /api/signin

Authenticate user and receive JWT token.

```bash
curl -X POST https://draw.rasim.online/api/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Room Endpoints

#### POST /api/room

Create a new room (requires authentication).

```bash
curl -X POST https://draw.rasim.online/api/room \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"slug": "my-room"}'
```

#### GET /api/room/:slug

Get room details.

```bash
curl https://draw.rasim.online/api/room/my-room
```

---

## WebSocket Protocol

### Connection

Connect to WebSocket server with JWT token:

```
wss://draw.rasim.online/ws?token=<jwt_token>
```

### Message Types

#### Incoming Messages

```typescript
// Join a room
{ type: 'join_room', roomId: string }

// Leave a room
{ type: 'leave_room', roomId: string }

// Send chat/shape
{ type: 'chat', roomId: string, message: string, tempId: string }

// Delete shape
{ type: 'delete', roomId: string, shapeId: string }
```

#### Outgoing Messages

```typescript
// Chat/shape broadcast
{
  type: 'chat',
  tempId: string,
  message: string,  // JSON stringified shape
  roomId: string
}

// Delete broadcast
{
  type: 'delete',
  shapeId: string,
  roomId: string
}
```

### WebSocket Error Codes

| Code | Meaning                          |
| ---- | -------------------------------- |
| 1000 | Normal closure                   |
| 1008 | Policy violation (invalid token) |
| 1011 | Unexpected server error          |

---

## Database Schema

### User Model

```typescript
// packages/db/src/models/User.ts
interface IUser {
  email: string;
  password: string;
  name: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Room Model

```typescript
// packages/db/src/models/Room.ts
interface IRoom {
  slug: string; // Unique room identifier
  adminId: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Chat/Shape Model

```typescript
// packages/db/src/models/Chat.ts
interface IChat {
  message: string; // JSON stringified shape
  userId: string; // Sender user ID
  roomId: string; // Room identifier
  createdAt: Date;
}
```

### Indexes

```typescript
// Room indexes
RoomSchema.index({ slug: 1 }, { unique: true });

// Chat indexes
ChatSchema.index({ roomId: 1, createdAt: -1 });
ChatSchema.index({ roomId: 1, _id: 1 });
```

---

## Nginx Configuration

### Production Nginx Setup

```nginx
server {
    server_name draw.rasim.online;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy no-referrer-when-downgrade;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
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

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/draw.rasim.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/draw.rasim.online/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

### Apply Nginx Configuration

```bash
sudo nano /etc/nginx/sites-enabled/draw-app
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Certbot (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d draw.rasim.online -d www.draw.rasim.online

# Test auto-renewal
sudo certbot renew --dry-run

# Check renewal status
sudo certbot certificates
```

### Manual Certificate Generation

```bash
# Create directories
sudo mkdir -p /var/www/certbot /etc/letsencrypt/live/draw.rasim.online

# Generate certificate
sudo certbot certonly --webroot -w /var/www/certbot \
  -d draw.rasim.online \
  -d www.draw.rasim.online \
  --email your-email@example.com \
  --agree-tos --no-eff-email

# Certificate paths
# Certificate: /etc/letsencrypt/live/draw.rasim.online/fullchain.pem
# Private key: /etc/letsencrypt/live/draw.rasim.online/privkey.pem
```

### Auto-Renewal

Certbot automatically sets up renewal via systemd timer or cron job. Verify:

```bash
# Check timer
sudo systemctl list-timers | grep certbot

# Or check cron
sudo crontab -l | grep certbot
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

The repository includes three CI/CD workflows:

1. **cd_frontend.yml** - Deploys frontend
2. **cd_backend.yml** - Deploys HTTP backend
3. **cd_ws.yml** - Deploys WebSocket server

### Workflow Flow

```
Push to main
    |
    v
Build Docker image
    |
    v
Push to Docker Hub
    |
    v
SSH to VM
    |
    v
Pull latest image
    |
    v
Restart service
```

### Required Secrets

Configure in GitHub repository Settings > Secrets:

| Secret               | Description             |
| -------------------- | ----------------------- |
| `DOCKERHUB_USERNAME` | Docker Hub username     |
| `DOCKERHUB_TOKEN`    | Docker Hub access token |
| `VM_HOST`            | Server IP/hostname      |
| `VM_USERNAME`        | SSH username            |
| `VM_SSH_KEY`         | Private SSH key         |
| `VM_SSH_PORT`        | SSH port (default: 22)  |

### Manual Deployment

```bash
# SSH to server
ssh user@your-server-ip

# Navigate to project
cd draw-app

# Pull latest
docker compose pull

# Restart services
docker compose up -d

# Check logs
docker compose logs -f
```

---

## Monitoring & Troubleshooting

### Log Locations

```bash
# Docker Compose logs
docker compose logs -f [service-name]

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

### Common Issues

#### Mixed Content Error

**Problem**: Browser blocks HTTP requests from HTTPS page

**Solution**: Ensure all `NEXT_PUBLIC_*` URLs use HTTPS:

```env
NEXT_PUBLIC_API_URL=https://draw.rasim.online/api
NEXT_PUBLIC_WS_URL=wss://draw.rasim.online/ws
```

#### WebSocket Connection Failed

**Problem**: `WebSocket connection to 'wss://...' failed`

**Solution**:

1. Check nginx location uses `/ws` (no trailing slash)
2. Verify WebSocket headers are set correctly
3. Check SSL certificate is valid

#### MongoDB Connection Failed

**Problem**: Cannot connect to database

**Solution**:

1. Verify `DATABASE_URL` is correct
2. Check MongoDB Atlas network settings (allow IP)
3. Verify credentials are valid

#### Docker Container Restarts

**Problem**: Containers keep restarting

**Solution**:

```bash
# Check container logs
docker compose logs [service-name]

# Inspect container
docker inspect [container-name]

# Check resource usage
docker stats
```

### Health Checks

```bash
# Check all containers
docker compose ps

# Check service health
curl http://localhost:3001/health  # If implemented
curl http://localhost:3000/api      # Frontend

# Check WebSocket
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  https://draw.rasim.online/ws
```

### Performance Optimization

1. **Enable Gzip compression** in Nginx
2. **Use CDN** for static assets
3. **Configure proper timeouts** for WebSocket
4. **Monitor memory usage** of containers
5. **Set up logging aggregation** (e.g., Loki, ELK)

---

## Security Checklist

- [ ] Change default MongoDB credentials
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure security headers in Nginx
- [ ] Set up firewall (only allow ports 80, 443, 22)
- [ ] Regular security updates on server
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting in Nginx

---

## Support

For issues and questions:

- GitHub Issues: https://github.com/bhatraasim/draw-app/issues
- Check logs: `docker compose logs -f`
- Review Nginx errors: `sudo tail -f /var/log/nginx/error.log`

---

## License

ISC
