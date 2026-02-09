# 🐳 LeafScan AI - Docker Deployment Guide

## Quick Start

### Pull and Run (Easiest)
```bash
# Pull the image
docker pull theroadroller/leafscan-ai:latest

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_key_here \
  -e NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url_here \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here \
  --name leafscan-ai \
  theroadroller/leafscan-ai:latest
```

Access at: `http://localhost:3000`

### Using Docker Compose (Recommended)
```bash
# 1. Create .env file from example
cp .env.docker.example .env

# 2. Edit .env and add your API keys
nano .env

# 3. Start the application
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Stop the application
docker-compose down
```

## Prerequisites

### Required API Keys
1. **Gemini API Key** - Get from: https://makersuite.google.com/app/apikey
2. **Mapbox Token** - Get from: https://account.mapbox.com/access-tokens/
3. **Supabase Credentials** - Get from: https://app.supabase.com/project/_/settings/api

## Building from Source

### Build Locally
```bash
# Navigate to project directory
cd leafscan-ai

# Build the image
docker build -t theroadroller/leafscan-ai:latest .

# Run locally
docker run -d -p 3000:3000 --env-file .env theroadroller/leafscan-ai:latest
```

### Build and Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Build for multiple platforms (optional)
docker buildx build --platform linux/amd64,linux/arm64 \
  -t theroadroller/leafscan-ai:latest \
  -t theroadroller/leafscan-ai:v1.0.0 \
  --push .

# Or build for single platform
docker build -t theroadroller/leafscan-ai:latest .
docker push theroadroller/leafscan-ai:latest
```

## Environment Variables

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIza...` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token | `pk.eyJ1...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbG...` |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |
| `PORT` | Application port | `3000` |

## Deployment Options

### 1. Local Docker
```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name leafscan-ai \
  --restart unless-stopped \
  theroadroller/leafscan-ai:latest
```

### 2. Docker Compose
See `docker-compose.yml` file included in the project.

```bash
docker-compose up -d
```

### 3. Cloud Platforms

#### AWS ECS
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name leafscan-cluster

# Create task definition (use the docker-compose.yml as reference)
# Deploy service
aws ecs create-service \
  --cluster leafscan-cluster \
  --service-name leafscan-ai \
  --task-definition leafscan-ai \
  --desired-count 1
```

#### Google Cloud Run
```bash
# Deploy to Cloud Run
gcloud run deploy leafscan-ai \
  --image theroadroller/leafscan-ai:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY,NEXT_PUBLIC_MAPBOX_TOKEN=$MAPBOX_TOKEN
```

#### DigitalOcean App Platform
```bash
# Use the Web UI or doctl
doctl apps create --spec app.yaml
```

#### Render
1. Connect your GitHub repository
2. Select "Docker" as deployment type
3. Add environment variables
4. Deploy

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## Health Checks

The container includes a health check endpoint:

```bash
# Check if container is healthy
curl http://localhost:3000/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2026-02-09T22:30:00.000Z",
  "service": "LeafScan AI",
  "version": "1.0.0"
}
```

## Monitoring

### Check Container Status
```bash
# View running containers
docker ps

# View logs
docker logs leafscan-ai

# Follow logs in real-time
docker logs -f leafscan-ai

# Check resource usage
docker stats leafscan-ai
```

### Health Check
```bash
# Docker health status
docker inspect --format='{{.State.Health.Status}}' leafscan-ai

# Manual health check
curl http://localhost:3000/api/health
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs leafscan-ai

# Common issues:
# 1. Missing environment variables
# 2. Port 3000 already in use
# 3. Invalid API keys
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Run on different port
docker run -p 8080:3000 theroadroller/leafscan-ai:latest
```

### Reset everything
```bash
# Stop and remove container
docker stop leafscan-ai
docker rm leafscan-ai

# Remove image and rebuild
docker rmi theroadroller/leafscan-ai:latest
docker pull theroadroller/leafscan-ai:latest
```

## Production Optimization

### Resource Limits
```yaml
# In docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## Scaling

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml leafscan

# Scale service
docker service scale leafscan_leafscan-ai=3
```

### Kubernetes
```yaml
# Create deployment and service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Scale
kubectl scale deployment leafscan-ai --replicas=3
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use secrets management** - Docker secrets, Kubernetes secrets, or cloud provider secrets
3. **Run as non-root user** - Already configured in Dockerfile
4. **Regular updates** - Pull latest image regularly
5. **Scan for vulnerabilities** - `docker scan theroadroller/leafscan-ai:latest`

## Updates

### Pull Latest Version
```bash
# Stop current container
docker-compose down

# Pull latest image
docker pull theroadroller/leafscan-ai:latest

# Start with new image
docker-compose up -d
```

### Zero-Downtime Updates
```bash
# Using Docker Compose
docker-compose pull
docker-compose up -d --no-deps --build leafscan-ai
```

## Backup & Restore

### Backup Data
```bash
# If using volumes for persistent data
docker run --rm \
  --volumes-from leafscan-ai \
  -v $(pwd):/backup \
  alpine tar czf /backup/leafscan-backup.tar.gz /app/data
```

### Restore Data
```bash
docker run --rm \
  --volumes-from leafscan-ai \
  -v $(pwd):/backup \
  alpine tar xzf /backup/leafscan-backup.tar.gz
```

## Support

### Docker Image
- **Docker Hub**: https://hub.docker.com/r/theroadroller/leafscan-ai
- **GitHub**: https://github.com/CElyousfi/PalntsScanner

### Issues
Report issues on GitHub or Docker Hub

### Logs
Include these when reporting issues:
```bash
docker logs leafscan-ai > logs.txt
docker inspect leafscan-ai > inspect.txt
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-09 | Initial Docker release |

---

**Made with ❤️ by the LeafScan AI team**
