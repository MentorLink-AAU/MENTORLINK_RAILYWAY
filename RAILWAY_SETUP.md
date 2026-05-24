# Railway setup (MentorLink)

Deploy **MySQL + backend + frontend + NLP** (four pieces). You can start with **backend only** from the repo root, then add the other services.

## Quick start: one backend service (repo root)

If your Railway service has an **empty** Root Directory (repo root):

| Setting | Value |
|---------|--------|
| **Root Directory** | *(leave empty)* |
| **Config file** | `/railway.toml` |

Railway builds **`Dockerfile`** at the repo root (Spring Boot JAR). **Do not** set a custom Start Command.

Add **MySQL** + variables from `railway.env.example`, then **Redeploy**.

## Full stack (recommended)

Use **three app services** with subfolder roots (below). Required for the React UI and NLP service.

## Why builds failed before

| Symptom | Cause |
|---------|--------|
| `concurrently: Permission denied` | Root Directory `/` + `npm start` (local dev only). |
| `No start command detected` | Root `package.json` has no production `start` script. |
| `Railway Root Directory must be backend...` | Old root `railpack.json` guard (removed). Use root `Dockerfile` or set Root Directory to `backend`. |

---

## 1. MySQL

1. In the Railway project: **+ New** → **Database** → **MySQL**.
2. Open the MySQL service → **Variables** (or **Connect**).
3. On the **backend** service, add variable references to MySQL (Railway UI: **Add variable reference** → select MySQL → `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`).

---

## 2. Backend (Spring Boot)

**Option A — repo root (easiest):** see [Quick start](#quick-start-one-backend-service-repo-root) above.

**Option B — `backend/` folder (Maven/Railpack):**

1. **+ New** → **GitHub Repo** → same repo.
2. Open the service → **Settings**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Config file** (Config-as-code) | `/backend/railway.toml` |

Railpack reads `backend/railpack.json`. Set **`RAILPACK_JDK_VERSION=17`** on this service.

3. **Variables** (minimum):

```
JWT_SECRET=<long random string>
CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
APP_FRONTEND_URL=https://<your-frontend-domain>
NLP_SUMMARIZATION_URL=https://<your-nlp-domain>
```

Use `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` **or** the MySQL plugin references above. See `railway.env.example`.

4. **Networking** → **Generate Domain**.
5. **Deploy** → build should show `mvnw ... package` and start `java -jar target/...`.

Health check: `https://<backend-domain>/actuator/health`

---

## 3. Frontend (Vite)

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Config file** | `/frontend/railway.toml` |

**Variables** (required at **build** time):

```
VITE_API_URL=https://<your-backend-domain>
```

No trailing slash. Redeploy after changing this.

**Networking** → **Generate Domain**.

---

## 4. NLP (Flask + Docker)

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend/nlp-summarization` |
| **Config file** | `/backend/nlp-summarization/railway.toml` |

Uses **Dockerfile** (large image; first build may take several minutes).

**Networking** → **Generate Domain**. Put this URL in backend `NLP_SUMMARIZATION_URL`.

---

## 5. Wire URLs after first deploy

1. Deploy **backend** + **MySQL** first.
2. Deploy **NLP**; set backend `NLP_SUMMARIZATION_URL`.
3. Deploy **frontend** with `VITE_API_URL` = backend URL.
4. Update backend `CORS_ALLOWED_ORIGINS` and `APP_FRONTEND_URL` to the frontend URL.
5. Redeploy backend + frontend.

---

## Checklist per service

- [ ] **Backend:** either empty root + `/railway.toml` **or** `backend` + `/backend/railway.toml`.
- [ ] **Frontend/NLP:** Root Directory + config file match [sections 3–4](#3-frontend-vite) (not repo root).
- [ ] Custom **Start Command** in the UI is **empty** (let `railway.toml` define it) unless you override on purpose.
- [ ] No **Start Command** like `npm start` or `npm run start`.
- [ ] Repo does **not** track `node_modules/` (run `npm run check:deploy` locally).

## Verify before push

```bash
npm run check:deploy
npm run check:all
```

---

## Local development

From repo root (not used on Railway):

```bash
npm run start:dev
```
