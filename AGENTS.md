# EasyCRM — Frontend

## Overview

This is the **frontend-only** half of the EasyCRM application, split out from a two-tier Bento stack project (Next.js + Vercel + Postgres). It is a React/Next.js dashboard that consumes the EasyCRM REST API running separately as a backend service.

## Architecture

```
Browser → Nginx (port 8080)
              └─ proxy_pass → Next.js server (port 3001, managed by pm2)
                                  └─ /api/* rewrites → Backend API (http://localhost:8888)
```

All API calls in the codebase use the relative path `/api/*`. Next.js rewrites those at the server level to `http://localhost:8888/api/*`, so there are no CORS issues and no backend URLs in client-side code.

### Dev mode (no Nginx)

```
Browser → Next.js dev server (port 3000)
              └─ /api/* rewrites → Backend API (http://localhost:8888)
```

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Bundler | Turbopack (via `--turbopack` flag) |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Virtual lists | TanStack Virtual v3 |
| Charts | Recharts v2 |
| Global state | Zustand v4 |
| Icons | Lucide React |
| Language | TypeScript 5 |

## Backend API

The backend Express/Node.js API runs **separately** at `http://localhost:8888`.

It must be started before the frontend. All frontend API requests are proxied through Next.js — the frontend never calls the backend URL directly.

## Key Files

| File | Purpose |
|---|---|
| `next.config.ts` | Proxy rewrite: `/api/*` → `http://localhost:8888/api/*` |
| `.env.local` | Sets `NEXT_PUBLIC_API_URL=http://localhost:8888` |
| `lib/api.ts` | Typed API client — all fetch calls, uses `/api` base path |
| `lib/types.ts` | Shared TypeScript types (Contact, Deal, Company, etc.) |
| `lib/utils.ts` | Utility helpers |
| `app/layout.tsx` | Root layout with dark mode and Providers |
| `app/providers.tsx` | TanStack Query + Zustand provider wrappers |
| `app/page.tsx` | Home / dashboard entry point |
| `app/dashboard/` | Dashboard route and sub-pages |
| `components/` | Shared UI components |
| `stores/` | Zustand store definitions |

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8888` | Backend base URL used in the Next.js rewrite |

## Running Locally

**Prerequisites:** Backend API must be running on port 8888.

```bash
# Install dependencies
npm install

# Start the frontend dev server (connects to local backend on :8888)
npm run dev:local

# Or use the standard dev command (same result — .env.local is auto-loaded)
npm run dev
```

The app will be available at `http://localhost:3000`.

## npm Scripts

| Command | Description |
|---|---|
| `dev` | Start dev server with Turbopack (default Next.js port) |
| `dev:local` | Start dev server on port 3000 with Turbopack (explicit local-backend mode) |
| `build` | Production build |
| `start` | Start production server |
| `lint` | Run ESLint |

## Nginx Deployment (Local)

The app is deployed through Homebrew Nginx as a reverse proxy to the Next.js production server.

### URL

```
http://localhost:8080
```

### Key paths

| Path | Purpose |
|---|---|
| `/opt/homebrew/etc/nginx/sites-available/easycrmlocal` | Nginx server block config |
| `/opt/homebrew/etc/nginx/sites-enabled/easycrmlocal` | Symlink that activates the site |
| `/opt/homebrew/var/www/easycrmlocal/` | Nginx www directory (conventional; app runs from project dir) |
| `/opt/homebrew/var/log/nginx/easycrmlocal.access.log` | Access log |
| `/opt/homebrew/var/log/nginx/easycrmlocal.error.log` | Error log |

### Process management (pm2)

The Next.js production server runs on port **3001** under pm2:

```bash
# Check status
pm2 status

# View logs
pm2 logs easycrmlocal

# Restart after a code change (requires rebuild first)
npm run build && pm2 restart easycrmlocal

# Stop
pm2 stop easycrmlocal

# Start (if not running)
pm2 start npm --name "easycrmlocal" --cwd "/opt/homebrew/var/www/easycrmlocal" -- start -- -p 3001

# Persist pm2 across reboots
pm2 startup   # follow the printed command
pm2 save
```

### Nginx commands

```bash
# Test config
/opt/homebrew/bin/nginx -t

# Reload (pick up config changes without dropping connections)
/opt/homebrew/bin/nginx -s reload

# Full restart
brew services restart nginx
```

### Deploying code changes

```bash
cd /Users/lioneljones/DevProjects/Programming/AIProjects/easycrmlocal

# 1. Build in the source directory
npm run build

# 2. Sync built files to the www deployment directory (excludes node_modules and .git)
rsync -a --exclude='node_modules' --exclude='.git' \
  /Users/lioneljones/DevProjects/Programming/AIProjects/easycrmlocal/ \
  /opt/homebrew/var/www/easycrmlocal/

# 3. Restart the pm2 process
pm2 restart easycrmlocal
```

### Auto-start on reboot

Both services are configured to start automatically when the machine boots — no manual steps needed.

| Service | Auto-start file |
|---|---|
| Nginx | `~/Library/LaunchAgents/homebrew.mxcl.nginx.plist` |
| pm2 | `~/Library/LaunchAgents/pm2.lioneljones.plist` |

macOS starts Nginx (port 8080) and pm2 (which resurrects Next.js on port 3001) at login. `http://localhost:8080` will be available within a few seconds of logging in.

If pm2's process list ever needs to be re-saved after changes:
```bash
pm2 save
```

### Prerequisites

- Backend API must be running on port **8888** for API calls to succeed.
- pm2 must be running (`pm2 status` to verify).
- Nginx must be running on port 80 & 8080 (`brew services list | grep nginx`).

---

## Split-Out Notes

This project was extracted from a monorepo/two-tier Bento stack setup. The backend (API + Postgres) lives in a separate repository/directory and runs independently. The only coupling point is the `/api/*` proxy in `next.config.ts` and the `NEXT_PUBLIC_API_URL` env var.

To point this frontend at a different backend (e.g. staging), update `NEXT_PUBLIC_API_URL` in `.env.local`.

---

## CI/CD Infrastructure

### Jenkins

Jenkins LTS is installed via Homebrew and managed as a background service.

| Detail | Value |
|---|---|
| Version | 2.555.1 (LTS) |
| Install method | `brew install jenkins-lts` |
| Port | **8081** (8080 was already in use by Nginx) |
| URL | `http://127.0.0.1:8081` |
| JENKINS_HOME | `~/.jenkins` |
| Java runtime | `/opt/homebrew/opt/openjdk@21/bin/java` |
| Initial admin password | `dc9c1154957845bcb5e4ef458ccea6c6` |

Port 8080 is reserved for Nginx. The plist was patched at install time:
`/opt/homebrew/opt/jenkins-lts/homebrew.mxcl.jenkins-lts.plist` — `--httpPort=8081`

#### Service commands

```bash
# Start Jenkins (and register to start at login)
brew services start jenkins-lts

# Stop Jenkins
brew services stop jenkins-lts

# Restart Jenkins
brew services restart jenkins-lts

# Check status
brew services list | grep jenkins

# View logs
tail -f ~/.jenkins/logs/jenkins.log
```

#### Initial admin password

```bash
cat ~/.jenkins/secrets/initialAdminPassword
```

#### Jenkins CLI

The CLI jar lives at `~/.jenkins/jenkins-cli.jar` (or download fresh from the running instance):

```bash
curl -u admin:<password> -o /tmp/jenkins-cli.jar http://127.0.0.1:8081/jnlpJars/jenkins-cli.jar

# Run a CLI command
/opt/homebrew/opt/openjdk@21/bin/java \
  -jar /tmp/jenkins-cli.jar \
  -s http://127.0.0.1:8081 \
  -auth admin:<password> \
  <command>
```

#### Installed plugins

| Plugin | Version | Purpose |
|---|---|---|
| git | 5.10.1 | Git SCM integration |
| workflow-aggregator | 608.x | Pipeline (Declarative & Scripted) |
| pipeline-stage-view | 2.41 | Visual stage progress in UI |
| credentials-binding | 719.x | Inject credentials as env vars in pipelines |

#### Git integration

Jenkins uses the system git at `/usr/bin/git` (Apple Git 2.50.1).
The default Git tool installation resolves `git` from PATH — no manual path configuration required.

To verify from the Jenkins Script Console (`http://127.0.0.1:8081/script`):

```groovy
def proc = ["/usr/bin/git", "--version"].execute()
proc.waitFor()
println proc.text.trim()
```

---

### Pipeline: easycrm-pipeline

The declarative pipeline is defined in `Jenkinsfile` at the project root.

#### Pipeline stages

| Stage | What it does |
|---|---|
| Environment Check | Verifies node, npm, git, pm2 are on PATH |
| Build | `npm ci` + `npm run build` |
| Test | Runs `npm test` if the script exists, otherwise falls back to `npm run lint` |
| Deploy to Local Nginx | `rsync` to Nginx www dir + `pm2 restart easycrmlocal` |
| Push to Git | Commits any pending changes and pushes `main` to GitHub (requires `github-credentials`) |

#### Nginx deployment path

```
/opt/homebrew/var/www/easycrmlocal/
```

The pipeline uses `rsync` to sync the project (excluding `node_modules` and `.git`) then syncs `.next/` separately, and restarts the pm2 process.

#### Node.js version used

`/Users/lioneljones/.nvm/versions/node/v24.12.0` (Node 24.12.0) — hardcoded in the `environment` block of the Jenkinsfile. Update `NODE_HOME` there if you switch Node versions.

#### One-time setup (do this once after the Jenkins wizard)

**1. Create the Jenkins job**

```bash
cd /Users/lioneljones/DevProjects/Programming/AIProjects/easycrmlocal
.jenkins/create-job.sh <jenkins-username> <jenkins-password>
```

**2. Add a GitHub credential in Jenkins**

Go to `http://127.0.0.1:8081/credentials/store/system/domain/_/newCredentials` and add:

| Field | Value |
|---|---|
| Kind | Username with password |
| ID | `github-credentials` |
| Username | Your GitHub username |
| Password | A GitHub Personal Access Token (needs `repo` scope) |

**3. Push the Jenkinsfile to GitHub**

```bash
git add Jenkinsfile
git commit -m "ci: add Jenkinsfile"
git push
```

#### Triggering a build

- **UI:** `http://127.0.0.1:8081/job/easycrm-pipeline/build`
- **CLI:**
  ```bash
  /opt/homebrew/opt/openjdk@21/bin/java \
    -jar /tmp/jenkins-cli.jar \
    -s http://127.0.0.1:8081 \
    -auth <user>:<password> \
    build easycrm-pipeline -s -v
  ```
  (`-s` waits for completion, `-v` streams the log)

#### Relevant files

| File | Purpose |
|---|---|
| `Jenkinsfile` | Declarative pipeline definition |
| `.jenkins/job-config.xml` | Jenkins job XML — used by `create-job.sh` to register the job |
| `.jenkins/create-job.sh` | One-time helper to create the Jenkins job via CLI |
