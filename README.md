# Employee App (Full CRUD, Barebones)

Minimal student-style app that supports **Create, Read, Update, Delete** for employees.

## Stack
- **Backend:** Express + JSON file storage (no DB setup). Endpoints: GET/POST/PUT/DELETE
- **Frontend:** Vite + React + Axios, single-file UI
- **Dev Proxy:** Vite proxies `/api` → `http://localhost:4000`

## Run locally
### 1) Backend
```
cd backend
cp .env.example .env   # optional
npm install
npm run dev            # → http://localhost:4000
```
Test:
```
curl http://localhost:4000/
curl http://localhost:4000/api/employees
```

### 2) Frontend
```
cd ../frontend
npm install
npm run dev            # → http://localhost:5173
```

## Notes
- Data is saved to `backend/data/employees.json` (auto-created with two seed employees).
- Keep it simple for grading; later swap file ops in `server.js` for a real DB if needed.
