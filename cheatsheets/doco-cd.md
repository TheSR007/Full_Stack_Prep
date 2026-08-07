# doco-cd GitOps Cheatsheet & Setup Guide

A production-grade reference guide for configuring doco-cd continuous delivery runner with GitHub private repository authentication, real-time Webhooks, and background Polling fallback.

---

## 1. Architecture Overview

`doco-cd` is a lightweight GitOps continuous delivery runner for Docker Compose.
It monitors a target Git repository for commits (via push Webhooks or periodic Polling), pulls pre-built images from Docker Hub, and executes zero-downtime rolling updates (`docker compose pull && docker compose up -d`).

```
+-------------------+      +-------------------+      +-------------------+
|  GitHub Actions   | ---> |    Docker Hub     |      |  GitHub Repo      |
|  CI Pipeline      |      |  (Pre-built Imgs) |      | (docker-compose)  |
+-------------------+      +-------------------+      +-------------------+
                                     ^                          ^
                                     | (Pulls Images)           | (Push Webhook / Polls)
                                     +----------+   +-----------+
                                                |   |
                                        +-------------------+
                                        |      doco-cd      |
                                        | (Deployment Host) |
                                        +-------------------+
```

---

## 2. Step 1: Create GitHub Fine-Grained Access Token (PAT)

For private repository access:
1. Go to GitHub **Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens**.
2. Click **Generate new token**.
3. Token Name: `doco-cd-server-pull-token`.
4. Repository Access: **Only select repositories** -> Select your private repository.
5. Permissions:
   - **Repository Permissions**: `Contents` -> `Read-only`.
6. Copy the generated token (e.g. `github_pat_11...`).

---

## 3. Step 2: CI-Driven Webhook Triggering (via GitHub Actions)

The GitHub Actions CI pipeline (`update-compose-tags` job) triggers `doco-cd` via cURL AFTER unit tests pass, Docker images are built and pushed, and `docker-compose.yml` tags are bumped:

```yaml
      - name: Trigger doco-cd Deployment Webhook
        run: |
          if [ -n "${{ secrets.DOCO_CD_SERVER_URL }}" ]; then
            echo "Sending deployment trigger to doco-cd server..."
            BODY='{"ref":"refs/heads/'${{ github.ref_name }}'","repository":{"full_name":"'${{ github.repository }}'"}}'
            if [ -n "${{ secrets.WEBHOOK_SECRET }}" ]; then
              SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "${{ secrets.WEBHOOK_SECRET }}" | sed 's/(stdin)= //')
              curl -s -X POST "${{ secrets.DOCO_CD_SERVER_URL }}" \
                -H "Content-Type: application/json" \
                -H "X-Hub-Signature-256: sha256=${SIG}" \
                -d "$BODY"
            fi
          fi
```

Repository Secrets Required:
- `DOCO_CD_SERVER_URL`: `https://<SERVER_IP>:8088/`
- `WEBHOOK_SECRET`: `<YOUR_WEBHOOK_SECRET>`

---

## 4. Step 3: In-Repo Deployment Spec (`.doco-cd.yaml`)

Place `.doco-cd.yaml` in the root of your repository:

```yaml
name: "docker-compose-stack"
repository_url: "https://github.com/TheSR007/docker-compose-stack.git"
reference: "master"
working_dir: .
compose_files:
    - "docker-compose.yml"
env_files:
    - ".env"
remove_orphans: true
prune_images: true
```

---

## 5. Step 4: Host Server `doco-cd` Compose File (`docker-compose.doco-cd.yml`)

On the deployment host server, create `docker-compose.doco-cd.yml` configuring **both** Webhook and Polling:

```yaml
services:
  doco-cd:
    container_name: devops-doco-cd
    image: ghcr.io/kimdre/doco-cd:latest
    restart: unless-stopped
    ports:
      - "8088:80"        # Webhook endpoint
      - "9120:9120"    # Prometheus Metrics endpoint
    environment:
      TZ: UTC
      LOG_LEVEL: info
      GIT_ACCESS_TOKEN: "${GIT_ACCESS_TOKEN}"
      WEBHOOK_SECRET: "${WEBHOOK_SECRET}"
      POLL_CONFIG: |
        - url: https://github.com/TheSR007/docker-compose-stack.git
          reference: master
          interval: 60
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/data
    healthcheck:
      test: [ "CMD", "/doco-cd", "healthcheck" ]
      start_period: 15s
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  doco_cd_data:
```

Server `.env` file:

```env
GIT_ACCESS_TOKEN=github_pat_11...
WEBHOOK_SECRET=my_doco_webhook_secret_99
```

---

## 6. Step 5: Start & Verify doco-cd Service

```bash
# Start doco-cd container on server
docker compose -f docker-compose.doco-cd.yml up -d

# View live deployment logs
docker compose -f docker-compose.doco-cd.yml logs -f
```
