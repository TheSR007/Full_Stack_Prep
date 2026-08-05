# GitHub Actions CI/CD Cheatsheet & Comprehensive Pipeline Guide

A production-grade reference guide explaining GitHub Actions CI/CD workflows, path-filtered microservice execution, container security scanning, and GitOps tag automation.

---

## 1. Complete Production Workflow Reference (`ci.yml`)

```yaml
name: Multi-Tier Microservices CI/CD Pipeline

on:
  push:
    branches: [master, main]
  pull_request:
    types: [closed]
    branches: [master, main]

permissions:
  contents: write

jobs:
  # Stage 1: Path Filtering
  filter:
    name: Detect Changed Services
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action == 'closed' && github.event.pull_request.merged == true)
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.changes.outputs.frontend }}
      api-gateway: ${{ steps.changes.outputs.api-gateway }}
      api-go-user: ${{ steps.changes.outputs.api-go-user }}
      api-fastapi-worker: ${{ steps.changes.outputs.api-fastapi-worker }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - name: Check Service File Changes
        id: changes
        uses: dorny/paths-filter@v4
        with:
          filters: |
            frontend:
              - 'frontend-nextjs/**'
              - '.github/workflows/ci.yml'
            api-gateway:
              - 'api-gateway/**'
              - '.github/workflows/ci.yml'
            api-go-user:
              - 'api-go-user/**'
              - '.github/workflows/ci.yml'
            api-fastapi-worker:
              - 'api-fastapi-worker/**'
              - '.github/workflows/ci.yml'

  # Stage 2: Microservice Pipelines (Decoupled & Parallel)
  frontend-nextjs:
    name: Frontend Service Pipeline
    needs: filter
    if: needs.filter.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v7

      - name: Set Short SHA
        id: vars
        run: echo "short_sha=$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_OUTPUT

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "22"

      - name: Run Unit Tests
        run: |
          cd frontend-nextjs
          npm ci || npm install
          npm test

      - name: Lint Frontend
        run: |
          cd frontend-nextjs
          npm run lint

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Build Local Image for Security Scan
        uses: docker/build-push-action@v7
        with:
          context: ./frontend-nextjs
          target: production
          load: true
          tags: local/frontend-nextjs:${{ steps.vars.outputs.short_sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Run Trivy Security Scan (Critical Gate)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: "local/frontend-nextjs:${{ steps.vars.outputs.short_sha }}"
          format: "table"
          exit-code: "1"
          ignore-unfixed: true
          vuln-type: "os,library"
          severity: "CRITICAL"

      - name: Log in to Docker Hub
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        uses: docker/login-action@v4
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Push Docker Image to Docker Hub
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
        uses: docker/build-push-action@v7
        with:
          context: ./frontend-nextjs
          target: production
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/fullstack-prep:frontend-nextjs-${{ steps.vars.outputs.short_sha }}
            ${{ secrets.DOCKERHUB_USERNAME }}/fullstack-prep:frontend-nextjs-latest
          cache-from: type=gha

  # Stage 3: Compose Tag Updates ([skip ci])
  update-compose-tags:
    name: Update Compose Tags ([skip ci])
    needs:
      - filter
      - frontend-nextjs
      - api-gateway
      - api-go-user
      - api-fastapi-worker
    if: |
      always() && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master') &&
      (
        (needs.filter.outputs.frontend          == 'true' && needs.frontend-nextjs.result    == 'success') ||
        (needs.filter.outputs.api-gateway       == 'true' && needs.api-gateway.result        == 'success') ||
        (needs.filter.outputs.api-go-user       == 'true' && needs.api-go-user.result        == 'success') ||
        (needs.filter.outputs.api-fastapi-worker == 'true' && needs.api-fastapi-worker.result == 'success')
      )
    runs-on: ubuntu-latest
    steps:
      - name: Determine Token
        id: token
        run: |
          if [ -n "${{ secrets.BUMP_TOKEN }}" ]; then
            echo "token=BUMP_TOKEN" >> "$GITHUB_OUTPUT"
          else
            echo "token=GITHUB_TOKEN" >> "$GITHUB_OUTPUT"
          fi

      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 0
          token: ${{ steps.token.outputs.token == 'BUMP_TOKEN' && secrets.BUMP_TOKEN || secrets.GITHUB_TOKEN }}

      - name: Update Image Tags in Compose File
        run: |
          SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-7)

          if [ "${{ needs.filter.outputs.frontend }}" = 'true' ] && [ "${{ needs.frontend-nextjs.result }}" = 'success' ]; then
            sed -i -E "s|(:frontend-nextjs-).*|\1${SHORT_SHA}|g" docker-compose.yml
          fi

      - name: Commit and Push Compose Tag Update ([skip ci])
        run: |
          TOKEN="${{ steps.token.outputs.token == 'BUMP_TOKEN' && secrets.BUMP_TOKEN || secrets.GITHUB_TOKEN }}"
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docker-compose.yml
          if ! git diff --quiet HEAD; then
            git commit -m "ci: update docker compose image tags [skip ci]"
            git remote set-url origin "https://x-access-token:${TOKEN}@github.com/${{ github.repository }}.git"
            git push origin HEAD:${{ github.ref_name }}
          fi
```

---

## 2. Detailed Step-by-Step Breakdown

### Step 1: Event Triggers & Top-Level Permissions

- `on.push`: Triggers pipeline when code is pushed directly to `master` or `main`.
- `on.pull_request`: Triggers on merged pull requests (`merged == true`).
- `permissions.contents: write`: Grants the default `GITHUB_TOKEN` permission to write commits back to the repository.

---

### Step 2: Path Filtering (`filter` Job)

The `dorny/paths-filter@v4` action inspects modified files in the commit diff.
- Outputs boolean flags (`frontend`, `api-gateway`, etc.) to `$GITHUB_OUTPUT`.
- If a commit only edits `frontend-nextjs/src/App.tsx`, `outputs.frontend` becomes `'true'` while all other service outputs remain `'false'`.
- Avoids redundant testing and image builds for unchanged services.

---

### Step 3: Decoupled Parallel Microservice Pipelines

Each service pipeline is guarded by an `if` condition checking `needs.filter.outputs.<service> == 'true'`:
- Service pipelines run in parallel.
- Isolation: If `frontend-nextjs` fails linting, `api-gateway` and `api-go-user` continue to build, scan, and push without being canceled.

#### Key Steps within Each Pipeline:

1. **Short SHA Output**:
   Generates a 7-character commit SHA (`echo "short_sha=$(echo ${{ github.sha }} | cut -c1-7)" >> $GITHUB_OUTPUT`) used for image tagging.

2. **Tool Setup**:
   Configures the appropriate runtime (`actions/setup-node@v6`, `actions/setup-go@v7`, `actions/setup-python@v7`).

3. **BuildKit Multi-Stage Build**:
   `docker/build-push-action@v7` runs with `load: true` to load the image into local Docker memory for security scanning.

4. **Trivy Container Security Gate**:
   `aquasecurity/trivy-action@master` scans the local image layer for `CRITICAL` vulnerabilities prior to registry push.

5. **Docker Hub Image Push**:
   Publishes two tags per image:
   - Short SHA tag: `${DOCKERHUB_USERNAME}/fullstack-prep:<service>-<short_sha>`
   - Latest tag: `${DOCKERHUB_USERNAME}/fullstack-prep:<service>-latest`

---

### Step 4: GitOps Compose Tag Bumping (`update-compose-tags` Job)

The final tag update job executes when all service jobs finish:
1. `if: always() && ...`: Ensures job runs even if a service pipeline failed or was skipped.
2. `needs.<service>.result == 'success'`: Evaluates which services succeeded and only updates image tags in `docker-compose.yml` for services that successfully built and pushed.
3. `sed -i -E "s|(:<service>-).*|\1${SHORT_SHA}|g" docker-compose.yml`: Replaces existing tag suffixes with the new 7-character short SHA.
4. `[skip ci]` Commit Flag: Appends `[skip ci]` to the commit message so GitHub Actions ignores the automated commit, preventing recursive CI loop execution.
5. **Token Fallback (`BUMP_TOKEN`)**: Uses Personal Access Token `BUMP_TOKEN` if present in repository secrets to bypass protected branch restrictions, falling back to `GITHUB_TOKEN`.

---

## 3. Useful GitHub CLI (`gh`) Commands

```bash
# List recent workflow runs
gh run list

# View logs for a specific run ID
gh run view <run-id> --log-failed

# Manually trigger a workflow
gh workflow run ci.yml --ref master

# View repository secret list
gh secret list
```
