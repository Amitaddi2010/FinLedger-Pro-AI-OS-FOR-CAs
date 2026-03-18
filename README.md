# FinLedger Pro — AI Operating System for CAs

Built specifically for Chartered Accountants to monitor multi-company financial health, powered by Groq LLM intelligence.

## Architecture
- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Backend**: Node.js, Express, MongoDB
- **AI Engine**: Groq SDK (Llama 3 70B) for structured JSON insights

## Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`
- A [Groq API Key](https://console.groq.com/keys)

## Setup Instructions

### 1. Database
Ensure your local MongoDB is running (`mongod`). The backend connects to `mongodb://127.0.0.1:27017/finledger_pro`.

### 2. Backend Config
1. Navigate to the `backend/` directory.
2. Copy `.env.example` to `.env` and fill in your `GROQ_API_KEY`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
The backend will run on `http://localhost:5000`.

### 3. Frontend Config
1. Navigate to the `frontend/` directory.
2. Install dependencies and start:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
The frontend will run on `http://localhost:5173`.

## Usage Flow
1. Open `http://localhost:5173`.
2. As this is a fresh database, use your API client (e.g. Postman) to register the first CA user since the login screen expects an existing user (we haven't built a UI register page to save time, assume Admin creates CAs):
   - **POST** `http://localhost:5000/api/auth/register`
   - Body (JSON):
     ```json
     {
       "name": "CA Jane Doe",
       "email": "ca@finledger.com",
       "password": "password123"
     }
     ```
3. Log in with `ca@finledger.com` / `password123`.
4. Click **Connect Company** / Add Company (+ icon in Portfolio via API for now, or use Postman).
   - **POST** `http://localhost:5000/api/companies`
   - Headers: Include cookie generated from login (Postman handles automatically)
   - Body (JSON):
     ```json
     {
       "name": "Stark Industries",
       "registrationNumber": "SI-10029",
       "industry": "Defense & Tech",
       "annualRevenueTarget": 5000000,
       "annualProfitTarget": 1500000
     }
     ```
5. Select the company in the sidebar header to switch to it.
6. Navigate to **Data Ingestion** to upload a CSV with columns: `Date, Description, Amount, Type, Category`. Type must be INCOME or EXPENSE.
7. Navigate to **Command Center** to view the actuals vs prorata predictions, and click **Run Auto-Intelligence** to get the Groq LLM's assessment.
8. Go to **AI Console** and ask natural language questions about the company's ledger.
