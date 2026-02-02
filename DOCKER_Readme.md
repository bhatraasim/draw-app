
# Docker Setup for Turborepo Draw App

This setup includes Dockerfiles for all three services in your turborepo: `draw-frontend`, `http-backend`, and `ws-backend`, along with MongoDB.

## 📁 File Structure

```
project-root/
├── docker/
│   ├── DockerFile.backend    # HTTP Backend service
│   ├── DockerFile.frontend   # Draw Frontend (Next.js)
│   └── DockerFile.ws          # WebSocket Backend service
├── docker-compose.yml         # Orchestration for all services
└── .dockerignore              # Files to exclude from Docker builds
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Build and start all services:**
   ```bash
   docker-compose up -d --build
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

### Building Individual Services

**Backend:**
```bash
docker build -f docker/DockerFile.backend -t draw-app-backend .
docker run -p 8080:8080 --env-file apps/http-backend/.env draw-app-backend
```

**Frontend:**
```bash
docker build -f docker/DockerFile.frontend -t draw-app-frontend .
docker run -p 3000:3000 --env-file apps/draw-frontend/.env draw-app-frontend
```

**WebSocket:**
```bash
docker build -f docker/DockerFile.ws -t draw-app-ws .
docker run -p 8081:8081 --env-file apps/ws-backend/.env draw-app-ws
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each app directory:

**apps/http-backend/.env:**
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://admin:password123@mongodb:27017/drawapp?authSource=admin
# Add your other environment variables
```

**apps/ws-backend/.env:**
```env
NODE_ENV=production
PORT=8081
MONGODB_URI=mongodb://admin:password123@mongodb:27017/drawapp?authSource=admin
# Add your other environment variables
```

**apps/draw-frontend/.env:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8081
# Add your other environment variables
```

### MongoDB Configuration

The docker-compose.yml includes MongoDB with:
- **Username:** admin
- **Password:** password123
- **Database:** drawapp
- **Port:** 27017

**⚠️ Change these credentials before deploying to production!**

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js Draw Application |
| HTTP Backend | 8080 | REST API Server |
| WebSocket | 8081 | WebSocket Server |
| MongoDB | 27017 | Database |

## 🏗️ Build Process

Each Dockerfile uses multi-stage builds:

1. **Base Stage:** Sets up Node.js and pnpm
2. **Builder Stage:** Installs dependencies and builds the app
3. **Runner Stage:** Creates minimal production image

Benefits:
- ✅ Smaller final image size
- ✅ Faster builds with layer caching
- ✅ Security (non-root user)
- ✅ Optimized for turborepo monorepo structure

## 🔍 Troubleshooting

### Build Issues

If you encounter build errors, try:

1. **Clear Docker cache:**
   ```bash
   docker builder prune -a
   ```

2. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache
   ```

### Connection Issues

If services can't connect:

1. **Check network:**
   ```bash
   docker network ls
   docker network inspect draw-app-network
   ```

2. **Check service health:**
   ```bash
   docker-compose ps
   ```

### MongoDB Issues

Access MongoDB shell:
```bash
docker exec -it draw-app-mongodb mongosh -u admin -p password123
```

## 🚢 Preparing for CI/CD

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend
        run: docker build -f docker/DockerFile.backend -t myregistry/backend:${{ github.sha }} .
      
      - name: Build Frontend
        run: docker build -f docker/DockerFile.frontend -t myregistry/frontend:${{ github.sha }} .
      
      - name: Build WebSocket
        run: docker build -f docker/DockerFile.ws -t myregistry/ws:${{ github.sha }} .
```

## 📝 Next Steps for Production

- [ ] Update MongoDB credentials
- [ ] Set up proper environment variable management
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Set up SSL certificates
- [ ] Configure health checks
- [ ] Set up logging and monitoring
- [ ] Implement secrets management
- [ ] Configure resource limits

## 💡 Tips

- Always use `.dockerignore` to exclude unnecessary files
- Keep images small by using Alpine base images
- Run containers as non-root users
- Use multi-stage builds for optimization
- Leverage Docker layer caching
- Use health checks in docker-compose

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs [service-name]`
2. Verify environment variables
3. Ensure MongoDB is healthy
4. Check network connectivity between services