# PredictIQ: Hospital Operations Intelligence System

PredictIQ is an AI-powered operations dashboard that predicts hospital surges, capacity constraints, and inventory stockouts before they happen.

## Project Structure

- **`app/`**: FastAPI backend featuring async SQLAlchemy and Pydantic v2 schemas.
- **`frontend/`**: React/TypeScript frontend (built with Vite) featuring real-time WebSocket alerts, React Query for fetching, and Zustand for state management.
- **`generate_telemetry.py`**: Script to generate realistic synthetic hospital data.
- **`predict_iq_pipeline.py`**: Machine learning pipeline (XGBoost/LightGBM) to forecast bed occupancy and inventory burn rates.
- **`stream_telemetry_to_api.py`**: Streams generated telemetry data to the live API for real-time dashboard updates.

---

## 🚀 Quick Start Guide (Local Demo)

Follow these steps to run the full application locally.

### 1. Start the FastAPI Backend

Open a terminal and set up the Python environment:

```bash
# Navigate to the project root
cd /home/tcoxav/Desktop/PitchDeck

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```
The backend API documentation will be available at `http://localhost:8000/docs`.

### 2. Start the React Frontend

Open a **new** terminal window:

```bash
# Navigate to the frontend directory
cd /home/tcoxav/Desktop/PitchDeck/frontend

# Install Node modules
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```
Open `http://localhost:5173` in your browser. *(Note: If the backend is off, the dashboard will gracefully fall back to mock data.)*

### 3. Generate & Stream Live Data

To see the dashboard light up with real-time alerts, open a **third** terminal window:

```bash
# Navigate to the project root
cd /home/tcoxav/Desktop/PitchDeck

# Make sure your Python virtual environment is activated
source .venv/bin/activate

# Step 1: Generate historical baseline data (~90 days)
python generate_telemetry.py

# Step 2: Train the predictive models
python predict_iq_pipeline.py

# Step 3: Stream live telemetry to the API to trigger alerts
python stream_telemetry_to_api.py --interval 2.0
```

---

## System Architecture Verified Features

✅ **CORS Configuration**: The backend accepts requests from any origin, ensuring smooth local development.
✅ **Resilient Frontend**: If the backend goes down, the React app automatically falls back to static mock data and displays an offline banner.
✅ **Optimistic UI**: When accepting an AI recommendation, the UI updates instantly without waiting for the network, rolling back gracefully if an error occurs.
✅ **Path Independence**: Telemetry and Machine Learning scripts dynamically resolve `PROJECT_ROOT`, meaning they can be executed from any directory without throwing `FileNotFoundError`.
