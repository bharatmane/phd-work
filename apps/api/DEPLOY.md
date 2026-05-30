# Deployment Guide — IRAF-XADL API

## VPS Setup (one time)

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Install Nginx
sudo apt install nginx -y

# 3. Copy the checkpoint file to the VPS
scp iraf_xadl_augmented.pt user@your-vps:/opt/iraf/iraf_xadl_augmented.pt
```

## Deploy the API

```bash
# On the VPS — clone the repo
git clone https://github.com/your-username/phd-work.git
cd phd-work/apps/api

# Build the Docker image
docker build -t iraf-api .

# Run it (mounts the checkpoint from /opt/iraf/)
docker run -d \
  --name iraf-api \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /opt/iraf/iraf_xadl_augmented.pt:/app/artifacts/iraf_xadl_augmented.pt \
  iraf-api
```

## Deploy the React frontend

```bash
# On your local machine — build the React app
cd phd-work/apps/web
echo "VITE_API_URL=https://your-vps-domain.com/api" > .env.production
npm run build

# Copy dist/ to VPS
scp -r dist/ user@your-vps:/var/www/phd-work/
```

## Configure Nginx

```bash
# On VPS
sudo cp /path/to/phd-work/apps/api/nginx.conf /etc/nginx/sites-available/phd-work
sudo ln -s /etc/nginx/sites-available/phd-work /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Update the API (after code changes)

```bash
# On VPS
cd phd-work && git pull
cd apps/api
docker build -t iraf-api .
docker stop iraf-api && docker rm iraf-api
docker run -d --name iraf-api --restart unless-stopped \
  -p 8000:8000 \
  -v /opt/iraf/iraf_xadl_augmented.pt:/app/artifacts/iraf_xadl_augmented.pt \
  iraf-api
```
