import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, precision_score, recall_score, f1_score
import xgboost as xgb
import lightgbm as lgb
import joblib
import json
import logging
import os
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

PROJECT_ROOT = Path(__file__).resolve().parent

class PredictIQModelPipeline:
    def __init__(self, data_path: str | Path | None = None, model_dir: str | Path | None = None):
        self.data_path = Path(data_path) if data_path else PROJECT_ROOT / "hospital_telemetry_historical.csv"
        self.model_dir = Path(model_dir) if model_dir else PROJECT_ROOT / "models"
        self.df = None
        self.models = {}
        self.evaluation_results = {}
        
        # Ward capacities from previous generation
        self.ward_capacities = {
            'occ_icu': 50,
            'occ_er': 50,
            'occ_general': 250,
            'occ_surgical': 100,
            'occ_pediatrics': 50
        }
        
        if not self.model_dir.exists():
            self.model_dir.mkdir(parents=True)

    def load_data(self):
        logging.info(f"Loading data from {self.data_path}...")
        try:
            self.df = pd.read_csv(self.data_path)
            self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
            self.df.set_index('timestamp', inplace=True)
        except Exception as e:
            logging.error(f"Failed to load data: {e}. Please ensure the telemetry generator has been run.")
            raise

    def feature_engineering(self):
        logging.info("Engineering features for ML Pipeline...")
        df = self.df.copy()
        
        # Time-based features
        df['day_of_week'] = df.index.dayofweek
        df['hour_of_day'] = df.index.hour
        
        # 1. Features for Bed Occupancy Forecaster (Targeting General Ward as primary example)
        # Historical occupancy features
        for lag in [1, 2, 3, 6, 12, 24]:
            df[f'occ_general_lag_{lag}h'] = df['occ_general'].shift(lag)
            df[f'er_arrivals_lag_{lag}h'] = df['er_arrivals'].shift(lag)
            
        # Discharge Velocity: Rate of change in occupancy over last 4 hours
        df['discharge_velocity_4h'] = (df['occ_general'].shift(4) - df['occ_general']) / 4.0
        
        # Rolling averages
        df['occ_general_rolling_mean_12h'] = df['occ_general'].rolling(window=12).mean()
        
        # Define Targets: Occupancy 4h, 12h, 24h in advance
        df['target_occ_4h'] = df['occ_general'].shift(-4)
        df['target_occ_12h'] = df['occ_general'].shift(-12)
        df['target_occ_24h'] = df['occ_general'].shift(-24)
        
        # 2. Features for Inventory Stock-Out Risk Predictor (e.g., IV Fluids)
        # We predict the upcoming 24h average hourly burn rate, to calculate days until stockout
        df['med_iv_fluids_rolling_mean_24h'] = df['med_iv_fluids'].rolling(window=24).mean()
        df['target_iv_fluids_burn_next_24h'] = df['med_iv_fluids'].shift(-24).rolling(window=24).mean()
        
        # Drop NaNs caused by shifting
        self.df_processed = df.dropna().copy()
        logging.info(f"Feature engineering complete. Usable rows: {len(self.df_processed)}")

    def train_bed_occupancy_models(self):
        logging.info("Training Bed Occupancy & Surge Forecasters (XGBoost)...")
        features = [
            'occ_general_lag_1h', 'occ_general_lag_2h', 'occ_general_lag_6h', 'occ_general_lag_24h',
            'er_arrivals_lag_1h', 'er_arrivals_lag_6h', 'discharge_velocity_4h',
            'occ_general_rolling_mean_12h', 'day_of_week', 'hour_of_day'
        ]
        
        X = self.df_processed[features]
        
        for horizon in [4, 12, 24]:
            y = self.df_processed[f'target_occ_{horizon}h']
            
            # Time-series split (no random shuffle) to prevent data leakage
            train_size = int(len(X) * 0.8)
            X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
            y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]
            
            # Using XGBoost for forecasting
            model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42)
            model.fit(X_train, y_train)
            
            self.models[f'occupancy_xgb_{horizon}h'] = model
            
            # Evaluate Model
            preds = model.predict(X_test)
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            mae = mean_absolute_error(y_test, preds)
            
            # Evaluate Surge Alerts (Precision/Recall for Occupancy > 90% capacity)
            capacity = self.ward_capacities['occ_general']
            surge_threshold = capacity * 0.90
            
            y_test_surge = (y_test > surge_threshold).astype(int)
            preds_surge = (preds > surge_threshold).astype(int)
            
            # Handle cases where no surges exist in test set to avoid ill-defined metrics
            if sum(y_test_surge) > 0:
                precision = precision_score(y_test_surge, preds_surge, zero_division=0)
                recall = recall_score(y_test_surge, preds_surge, zero_division=0)
            else:
                precision = 0.0
                recall = 0.0
                
            self.evaluation_results[f'occupancy_{horizon}h'] = {
                'RMSE': round(rmse, 2),
                'MAE': round(mae, 2),
                'Surge_Precision': round(precision, 2),
                'Surge_Recall': round(recall, 2)
            }
            logging.info(f"Occupancy Model (+{horizon}h) trained. RMSE: {rmse:.2f}, MAE: {mae:.2f}")

    def train_inventory_stockout_model(self):
        logging.info("Training Inventory Burn Rate Predictor (LightGBM)...")
        features = [
            'med_iv_fluids_rolling_mean_24h', 'occ_general_lag_1h', 'occ_er', 'occ_surgical',
            'outbreak_risk_index', 'day_of_week'
        ]
        
        X = self.df_processed[features]
        y = self.df_processed['target_iv_fluids_burn_next_24h']
        
        train_size = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
        y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]
        
        model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.05, max_depth=5, random_state=42)
        model.fit(X_train, y_train)
        
        self.models['inventory_lgbm_iv_fluids'] = model
        
        preds = model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        self.evaluation_results['inventory_iv_fluids'] = {'RMSE': round(rmse, 2)}
        logging.info(f"Inventory Burn Rate Model trained. RMSE: {rmse:.2f}")

    def serialize_models(self):
        logging.info(f"Serializing models to {self.model_dir} directory...")
        for name, model in self.models.items():
            path = os.path.join(self.model_dir, f"{name}.joblib")
            joblib.dump(model, path)
            
        with open(os.path.join(self.model_dir, 'evaluation_metrics.json'), 'w') as f:
            json.dump(self.evaluation_results, f, indent=4)
            
        logging.info("Serialization complete.")

class RecommendationEngine:
    """
    Intelligent heuristic/optimization function that takes ML model outputs 
    and generates structured JSON recommendations.
    """
    def __init__(self):
        self.ward_capacities = {'General': 250, 'ICU': 50}

    def evaluate_predictions(self, 
                             predicted_occ_4h: float, 
                             predicted_occ_12h: float, 
                             current_inventory_iv_fluids: float,
                             predicted_daily_burn_rate_iv: float) -> list:
        
        recommendations = []
        
        # Rule 1: Bed Occupancy Surge Alert
        capacity = self.ward_capacities['General']
        occupancy_ratio_4h = predicted_occ_4h / capacity
        
        if occupancy_ratio_4h > 0.90:
            confidence = min(0.99, occupancy_ratio_4h - 0.05) # Pseudo-confidence score
            rec = {
                "action": "Trigger Ward B reserve bed allocation",
                "reason": f"Predicted General Ward occupancy exceeding 90% capacity ({predicted_occ_4h:.0f}/{capacity}) in 4 hours.",
                "priority": "CRITICAL",
                "confidence_score": round(confidence, 2),
                "timestamp": datetime.now().isoformat()
            }
            recommendations.append(rec)
        elif predicted_occ_12h / capacity > 0.85:
             rec = {
                "action": "Prepare early discharge protocol for low-acuity patients",
                "reason": f"Predicted General Ward occupancy trending to 85%+ in 12 hours.",
                "priority": "HIGH",
                "confidence_score": 0.80,
                "timestamp": datetime.now().isoformat()
            }
             recommendations.append(rec)

        # Rule 2: Inventory Stock-out Alert
        # Avoid division by zero
        if predicted_daily_burn_rate_iv > 0:
            days_remaining = current_inventory_iv_fluids / predicted_daily_burn_rate_iv
        else:
            days_remaining = 999
            
        if days_remaining < 2.0:
            rec = {
                "action": "Initiate emergency stock reorder for [IV Fluids]",
                "reason": f"Inventory days remaining is critically low ({days_remaining:.1f} days) based on projected burn rates.",
                "priority": "CRITICAL",
                "confidence_score": 0.95, # High confidence on mathematical projection
                "timestamp": datetime.now().isoformat()
            }
            recommendations.append(rec)
            
        return recommendations

if __name__ == "__main__":
    # --- 1. Pipeline Execution ---
    pipeline = PredictIQModelPipeline()
    try:
        pipeline.load_data()
        pipeline.feature_engineering()
        pipeline.train_bed_occupancy_models()
        pipeline.train_inventory_stockout_model()
        pipeline.serialize_models()
        
        print("\n=== Model Evaluation Results ===")
        print(json.dumps(pipeline.evaluation_results, indent=2))
        
        # --- 2. Simulation of Recommendation Engine ---
        print("\n=== Generating Live Recommendations ===")
        engine = RecommendationEngine()
        
        # Simulate a scenario using the models' predictions on the latest available data row
        latest_features = pipeline.df_processed.iloc[-1:]
        
        pred_4h = pipeline.models['occupancy_xgb_4h'].predict(latest_features[['occ_general_lag_1h', 'occ_general_lag_2h', 'occ_general_lag_6h', 'occ_general_lag_24h', 'er_arrivals_lag_1h', 'er_arrivals_lag_6h', 'discharge_velocity_4h', 'occ_general_rolling_mean_12h', 'day_of_week', 'hour_of_day']])[0]
        pred_12h = pipeline.models['occupancy_xgb_12h'].predict(latest_features[['occ_general_lag_1h', 'occ_general_lag_2h', 'occ_general_lag_6h', 'occ_general_lag_24h', 'er_arrivals_lag_1h', 'er_arrivals_lag_6h', 'discharge_velocity_4h', 'occ_general_rolling_mean_12h', 'day_of_week', 'hour_of_day']])[0]
        pred_burn = pipeline.models['inventory_lgbm_iv_fluids'].predict(latest_features[['med_iv_fluids_rolling_mean_24h', 'occ_general_lag_1h', 'occ_er', 'occ_surgical', 'outbreak_risk_index', 'day_of_week']])[0]
        
        # Assume a critically low inventory level for the demonstration (e.g. only 1.5 days of projected inventory left)
        # Daily burn rate = predicted average hourly burn rate * 24
        projected_daily_burn = pred_burn * 24
        simulated_inventory = projected_daily_burn * 1.5  
        
        # Hardcode a high occupancy surge to trigger the ward rule for demonstration
        pred_4h_surge = 230 # 230/250 = 92%
        
        recs = engine.evaluate_predictions(
            predicted_occ_4h=pred_4h_surge,
            predicted_occ_12h=pred_12h,
            current_inventory_iv_fluids=simulated_inventory,
            predicted_daily_burn_rate_iv=projected_daily_burn 
        )
        
        print(json.dumps(recs, indent=2))
        
    except FileNotFoundError:
        print("Please generate the telemetry data first using generate_telemetry.py.")
