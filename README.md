# ESG Pulse 360

AI-powered ESG intelligence platform MVP for ASEAN equities.

## Stack

- Backend: FastAPI, Pandas, NumPy
- Frontend: React, Vite, Tailwind CSS, Recharts, Lucide React
- Storage: JSON demo dataset

## Run

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.
