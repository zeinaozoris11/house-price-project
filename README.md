🏠 House Price Prediction — End-to-End ML Web App
An end-to-end Machine Learning web application that predicts house prices in India based on property features such as location, carpet area, number of bathrooms, furnishing status, and more.

The project covers the full ML product lifecycle: data cleaning → model training → API → frontend.

📐 Architecture
┌─────────────────┐        HTTP POST /predict        ┌──────────────────┐        joblib.load()        ┌──────────────────┐
│   React Frontend │  ─────────────────────────────▶  │  FastAPI Backend  │  ───────────────────────▶  │  Trained Pipeline │
│  (Vite + TS)      │  ◀─────────────────────────────  │  (Python)          │  ◀───────────────────────  │  (house_price.pkl)│
│  localhost:5173   │        JSON: predicted_price      │  localhost:8000    │        prediction            │  scikit-learn      │
└─────────────────┘                                    └──────────────────┘                              └──────────────────┘
User fills the form on the React frontend.
Frontend sends a POST /predict request to the FastAPI backend.
Backend converts the request into a one-row DataFrame and runs it through the trained scikit-learn pipeline.
Backend returns the predicted price as JSON.
Frontend displays the formatted price (₹ in Lac/Cr) on the result page.
🧰 Tech Stack
Layer	Technology
Data & Modeling	Python, Pandas, NumPy, Scikit-learn, Jupyter
Backend	FastAPI, Pydantic, Uvicorn, Joblib
Frontend	React, TypeScript, Vite, React Router
Tooling	Git, GitHub, Pytest
📁 Project Structure
house-price-project/
├── notebooks/
│   ├── house_price_model.ipynb   # Data cleaning, EDA, training, evaluation, export
│   └── locations.json            # Exported list of allowed locations
│
├── backend/
│   ├── app/
│   │   ├── main.py                       # FastAPI app, CORS, model loaded at startup
│   │   ├── api/routes/prediction.py      # GET /health, POST /predict
│   │   ├── schemas/prediction.py         # PredictionRequest / PredictionResponse
│   │   └── services/
│   │       ├── preprocessing.py          # Request → one-row DataFrame
│   │       └── inference.py              # predict_price()
│   ├── models/house_price.pkl
│   ├── tests/test_prediction.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/predictionClient.ts       # fetch wrapper (uses VITE_API_BASE_URL)
    │   ├── components/PredictionForm.tsx
    │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
    │   └── types/prediction.ts
    └── public/locations.json
📊 Dataset
House Price Dataset by Juhi Bhojani (Kaggle) — ~187,000 real property listings from India.

Download it before running the notebook:

Option A — Manual: download from the link above, unzip, and place the CSV in notebooks/data/.

Option B — Kaggle CLI:

pip install kaggle
# Place your kaggle.json token in ~/.kaggle/ (or C:\Users\<you>\.kaggle\ on Windows)
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
⚠️ The raw CSV is not committed to this repo (it's large and excluded via .gitignore). You must download it yourself before re-running the notebook.

⚙️ Setup & Run
1. Backend (FastAPI)
cd backend
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
# .venv\Scripts\activate       # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload
Runs at: http://127.0.0.1:8000 Interactive docs: http://127.0.0.1:8000/docs

Run tests:

pytest -v
2. Frontend (React + Vite)
cd frontend
npm install
npm run dev
Runs at: http://localhost:5173

⚠️ Both backend and frontend must be running at the same time for the form to work.

🔑 Environment Variables
frontend/.env

Variable	Description	Example
VITE_API_BASE_URL	Base URL of the FastAPI backend	http://localhost:8000
A .env.example is provided in frontend/ as a template.

🔌 API Reference
GET /health
Health check.

Response

{ "status": "ok" }
POST /predict
Predicts the house price from property features.

Request body

{
  "location": "Whitefield",
  "carpet_area_sqft": 1200,
  "floor_num": 3,
  "bathroom": 2,
  "balcony": 1,
  "furnishing": "Semi-Furnished",
  "transaction": "Resale",
  "ownership": "Freehold",
  "facing": "East"
}
Response

{ "predicted_price": 4500000.0 }
Example cURL

curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Whitefield",
    "carpet_area_sqft": 1200,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
📈 Model Performance
Trained and compared Linear Regression (baseline) and Random Forest Regressor on an 80/20 train/test split.

Model metrics (test set)
Model	MAE	RMSE	R²
Linear Regression	4,521,930	8,433,180	0.6191
Random Forest	1,284,225	5,534,014	0.8360
📌 Fill in the table above with the numbers printed by the mean_absolute_error, root_mean_squared_error, and r2_score cell in notebooks/house_price_model.ipynb (section 2.5 — Evaluate).

Winning model: Random Forest Regressor was chosen because it captured non-linear relationships between features (e.g. location, area) and price better than the linear baseline, resulting in lower error and higher R² on the test set.

⚠️ Version pinning: this model was trained with scikit-learn==1.7.2. The exact same version is pinned in backend/requirements.txt — a mismatch can cause the pickle to fail loading correctly.

🖼️ Screenshots
📌 Add screenshots here once you've verified the app runs end-to-end. Example:

![Home page](docs/screenshots/home.png) ![Result page](docs/screenshots/result.png)

✅ Verified End-to-End
 pytest -v passes all tests in backend/
 Manually tested: submitted the form at http://localhost:5173 and received a real predicted price from http://127.0.0.1:8000
👤 Authors
 Zeina Mohammed Ozoris Mohammed  & Doaa Gamal Mohamed Gharib 
