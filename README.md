# PhantomCheck AI
> *"Don't Just Believe It. Investigate It."*  
> Hackathon PS 1.7: "Fake or Phantom?"

PhantomCheck AI is a media-literacy web application that helps students and researchers investigate suspicious forwards, viral claims, and ghost sightings. Powered by a local runtime of **Google Gemma 4** via Ollama HTTP API, it extracts checkable claims, flags sensational wording without judging truth, weighs user-supplied evidence, explains uncertainty, and enforces forensic verification principles.

---

## Key Features

1. **Claim Extraction Scanner**: Analyzes text up to 5,000 characters. Gemma 4 isolates the core assertion and secondary claims, tagging entities, dates, missing information, checkability, and sensational rhetoric (highlighting that emotional rhetoric is not evidence of falsehood).
2. **Per-Claim Target Investigation**: Strict forensic rule: users select one claim at a time. Never bundle multiple claims into a single verdict.
3. **User-Provided Evidence Vault**: Allows pasting articles, notices, eyewitness statements, and notes. Clearly labeled as "User-provided evidence". Does not perform fake URL crawling; evaluates solely the user's supplied evidence.
4. **Three-Valued Forensic Verdict**: Exactly `SUPPORTED`, `CONTRADICTED`, or `UNVERIFIED`. No numeric scores or percentages. Supernatural-sounding claims or absence of evidence default to `UNVERIFIED` rather than false.
5. **Printable Forensic Report**: Pydantic-validated JSON synthesis featuring plain explanations, reviewed evidence excerpts, limitations, what would change the conclusion, and suggested independent verification steps. Exportable via clean `window.print()` ("Save as PDF").
6. **Halloween Mode**: Four clearly labeled fictional test samples (Laboratory Phantom Figure, Disappearing Students in Room 402, Emergency Class Cancellation Rumor, Abandoned Facility Activity) that execute against the real model.
7. **Audit History**: SQLite database storing past investigations, search filtering, verdicts, and deletion capabilities.
8. **Offline Media Literacy Guide**: Comprehensive 8-point manual on sourcing, reverse image lookup, official announcements, and why AI can be wrong.

---

## Architecture & Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React (Dark forensic theme with purple and cyan accents).
- **Backend**: Python 3.14+, FastAPI, Pydantic v2, HTTPX (async client), SQLAlchemy 2.0 (asyncio + aiosqlite).
- **Runtime AI**: Google Gemma 4 running locally via Ollama (`GET /api/tags`, `POST /api/chat`, JSON mode requested). No hosted models or silent fallback.
- **Security**: Ollama base URL and config remain purely backend-side. No user secrets stored. Model outputs rendered as plain text (no unescaped HTML). Local prototype without authentication.

---

## Windows Setup Guide

### 1. Prerequisites (PowerShell or CMD)
Check your installed tool versions:
```powershell
ollama --version
node --version
npm --version
python --version
```

### 2. Pull & Start Google Gemma 4 (Terminal 1)
Run in PowerShell or CMD:
```powershell
# Pull Gemma 4 locally
ollama pull gemma4:e2b

# Verify/start the model
ollama run gemma4:e2b
```

### 3. Backend Setup (Terminal 2 - PowerShell)
Navigate to the `backend` folder and start the API:
```powershell
cd backend
python -m venv .venv

# PowerShell:
.\.venv\Scripts\Activate.ps1
# (Or in CMD: .venv\Scripts\activate.bat)

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend runs at `http://localhost:8000`. Test endpoint: `http://localhost:8000/api/health`.

### 4. Frontend Setup (Terminal 3 - PowerShell)
Navigate to the `frontend` folder and launch the Vite dev server:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Verifying Frontend Uses the Real Model

1. Go to the **Model Status** tab (`/status`) in the navbar. The application directly queries the backend status endpoint `GET /api/ai/status`, which pings Ollama's `GET /api/tags`.
2. When Ollama is stopped, the app will show **Ollama Offline** and reject scans with a clear service error.
3. When Gemma 4 is pulled and running, the badge lights up as **Gemma 4 Ready**.
4. Check the browser Network tab during a scan: `POST /api/investigations/scan` executes an asynchronous JSON call to Ollama without any hardcoded mock data.

---

## Running the Automated Test Suite

Run pytest in PowerShell with `PYTHONPATH`:
```powershell
# In project root:
$env:PYTHONPATH="backend"; backend\.venv\Scripts\pytest.exe backend\tests
```
Build check for the frontend:
```powershell
cd frontend
npm run build
```

---

## 3-Minute Demo Script

1. **Step 1 — Dashboard & Sample**: Open `http://localhost:5173`. Point out the "Gemma 4 Ready" badge. Under **Halloween Mode**, click **"Sample 01: Laboratory Phantom Figure"** to load the text into the workspace.
2. **Step 2 — Scanner**: Click **"Scan & Extract Claims"**. Observe Gemma 4 isolating the core assertion ("A mysterious figure appeared in the college laboratory"), identifying missing info (date, exact lab room, footage), and flagging sensational rhetoric ("SHOCKING LEAK", "DO NOT GO").
3. **Step 3 — Baseline UNVERIFIED**: Click **"Run Forensic Verdict & Report"** without adding evidence. Gemma outputs a preliminary **UNVERIFIED** verdict, explaining that spooky rumors lack empirical proof.
4. **Step 4 — Adding Evidence**: In the Evidence Vault, add an item:
   - **Title**: *Campus Security Night Watch Blotter*
   - **Pasted Text**: *"At 00:15 AM, security inspected Lab 3B following motion sensor trigger. Custodial staff member was cleaning windows with reflective squeegee. No unauthorized persons found."*
5. **Step 5 — Re-run Verdict**: Click **"Run Forensic Verdict & Report"** again. Observe the verdict transition based on contradictory evidence.
6. **Step 6 — Export & History**: Click **"Print / Save PDF"** to display the clean print view, then view the audit record in the **History** tab.

---

## Limitations & Privacy

- **Hardware Dependency**: Local inference latency and RAM usage depend on your local GPU/CPU and Ollama parameters.
- **Privacy**: Zero user data or queries leave your machine; all claim evaluations occur locally on `localhost`.
- **Local Prototype**: Built for local demonstration without multi-tenant authentication.
