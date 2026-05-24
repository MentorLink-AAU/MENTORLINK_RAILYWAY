# Railway setup (MentorLink)

Deploy **three app services + MySQL**. Do not use the repository root (`/`) as a service.

## Why builds fail

| Symptom | Cause |
|---------|--------|
| `concurrently: Permission denied` | Root Directory is `/` and Railway runs `npm start` (local dev only). |
| `Set Railway Root Directory to backend...` | Config file is `/railway.toml` (removed) or build runs from repo root. |

**Fix:** set **Root Directory** and **Config file path** on each service (below).

---

## 1. MySQL

1. In the Railway project: **+ New** → **Database** → **MySQL**.
2. Open the MySQL service → **Variables** (or **Connect**).
3. On the **backend** service, add variable references to MySQL (Railway UI: **Add variable reference** → select MySQL → `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`).

---

## 2. Backend (Spring Boot)

1. **+ New** → **GitHub Repo** → same repo (or **Empty Service** + connect repo).
2. Open the service → **Settings**:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Config file** (Config-as-code) | `/backend/railway.toml` |

Railpack also reads `backend/railpack.json`. Set **`RAILPACK_JDK_VERSION=17`** on this service (Java 17 project).

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

- [ ] Root Directory is **not** empty (not repo root unless you know what you're doing).
- [ ] Config file path is **`/backend/railway.toml`**, **`/frontend/railway.toml`**, or **`/backend/nlp-summarization/railway.toml`**.
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
