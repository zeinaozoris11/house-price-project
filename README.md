# House Price Prediction — End-to-End ML Web App

Predicts Indian property prices from listing details (location, area, floor,
furnishing, etc.) using a scikit-learn model served through a FastAPI backend,
with a React + TypeScript frontend for entering details and viewing the result.

## Overview

- **Dataset:** [House Price by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price) (Kaggle, ~187k rows)
- **Notebook:** cleans the data, trains/evaluates Linear Regression and Random
  Forest, and exports the winning pipeline as `house_price.pkl`
- **Backend:** FastAPI service that loads the pipeline and exposes `/predict`
- **Frontend:** React form that collects property details and shows the
  predicted price

## Architecture

```
Browser (React form)
      │  POST /predict { location, carpet_area_sqft, ... }
      ▼
FastAPI backend  ──loads──▶  models/house_price.pkl (sklearn Pipeline)
      │  { predicted_price }
      ▼
Browser (Result page)
```

## Tech stack

| Layer      | Tech                                             |
|------------|---------------------------------------------------|
| Modeling   | pandas, scikit-learn (Pipeline + ColumnTransformer) |
| Backend    | FastAPI, Pydantic, Uvicorn                         |
| Frontend   | React 19, TypeScript, Vite, React Router           |

## Project structure

```
├── notebooks/
│   └── house_price_model.ipynb   # data cleaning, EDA, training, export
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, model loaded at startup
│   │   ├── api/routes/prediction.py
│   │   ├── core/config.py
│   │   ├── schemas/prediction.py
│   │   ├── services/preprocessing.py
│   │   ├── services/inference.py
│   │   └── utils/logging_config.py
│   ├── models/                   # ← put your house_price.pkl + locations.json here
│   ├── tests/test_prediction.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/predictionClient.ts
    │   ├── components/PredictionForm.tsx
    │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
    │   ├── types/prediction.ts
    │   └── App.tsx
    ├── public/                   # ← put your locations.json here too
    └── .env.example
```

## Dataset

Download `house_prices.csv` from Kaggle and place it in `notebooks/data/`:

```bash
pip install kaggle
# Get your API token: Kaggle → Settings → API → "Create New Token"
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
```

## Setup

### 1. Train the model (or reuse your existing notebook output)

Run `notebooks/house_price_model.ipynb` top to bottom. It exports:
- `house_price.pkl` — the fitted sklearn Pipeline
- `locations.json` — the list of grouped location values used during training

Copy both into `backend/models/`, and copy `locations.json` into
`frontend/public/` as well (the frontend fetches it to populate the location
dropdown).

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

Run tests:

```bash
PYTHONPATH=. pytest -q
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# → http://localhost:5173
```

## Environment variables

**backend/.env**

| Variable         | Default                          | Description                     |
|------------------|-----------------------------------|----------------------------------|
| `MODEL_PATH`     | `models/house_price.pkl`         | Path to the pickled pipeline     |
| `LOCATIONS_PATH` | `models/locations.json`          | Path to allowed locations list   |
| `CORS_ORIGINS`   | `["http://localhost:5173"]`      | Allowed frontend origins         |
| `LOG_LEVEL`      | `INFO`                            | Logging verbosity                |

**frontend/.env**

| Variable              | Default                  | Description         |
|-----------------------|---------------------------|----------------------|
| `VITE_API_BASE_URL`   | `http://localhost:8000`  | Backend base URL     |

## API reference

### `GET /health`

```json
{ "status": "ok" }
```

### `POST /predict`

Request:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "thane",
    "carpet_area_sqft": 750,
    "floor_num": 3,
    "bathroom_num": 2,
    "balcony_num": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```

Response:

```json
{ "predicted_price": 6997639.27 }
```

## Model metrics (test set)

| Model              | MAE        | RMSE       | R²     |
|---------------------|-----------|------------|--------|
| Linear Regression   | 4,521,930 | 8,433,180  | 0.6191 |
| **Random Forest**   | **1,284,225** | **5,534,014** | **0.8360** |

Random Forest was selected for deployment — it captures the non-linear
relationship between area/location/features and price much better than a
linear model.

## Notes

- The exported pipeline was trained with **scikit-learn 1.7.2** — this is
  pinned in `backend/requirements.txt` so the pickle loads correctly.
- The raw dataset CSV is not committed to this repository (see `.gitignore`);
  download it via the Kaggle CLI command above.
