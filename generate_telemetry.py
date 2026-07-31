import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from faker import Faker
import time
import typing
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

PROJECT_ROOT = Path(__file__).resolve().parent

class PredictIQDataGenerator:
    """
    Lead Data Scientist / Healthcare Operations Data Generator
    Builds realistic, time-series synthetic hospital telemetry data 
    for training and testing PredictIQ.
    """
    
    def __init__(self, start_date_str: str = '2023-10-01', days: int = 90, total_beds: int = 500):
        self.start_date = pd.to_datetime(start_date_str)
        self.days = days
        self.total_beds = total_beds
        self.hours = self.days * 24
        
        # Bed allocation
        self.beds = {
            'ICU': int(total_beds * 0.10),         # 50 beds
            'ER': int(total_beds * 0.10),          # 50 beds
            'General': int(total_beds * 0.50),     # 250 beds
            'Surgical': int(total_beds * 0.20),    # 100 beds
            'Pediatrics': int(total_beds * 0.10)   # 50 beds
        }
        
        self.faker = Faker()
        np.random.seed(42)
        random.seed(42)

    def generate_historical_data(self) -> pd.DataFrame:
        """Generates 90 days of hourly telemetry data with injected anomalies."""
        logging.info(f"Generating {self.days} days of telemetry data starting from {self.start_date.strftime('%Y-%m-%d')}...")
        
        # 1. Base Timestamp Setup
        timestamps = [self.start_date + timedelta(hours=i) for i in range(self.hours)]
        df = pd.DataFrame({'timestamp': timestamps})
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['hour_of_day'] = df['timestamp'].dt.hour
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

        # 2. Patient Inflow / ER Arrivals (Circadian rhythm & Friday night spikes)
        def calculate_er_arrivals(row):
            hour = row['hour_of_day']
            dow = row['day_of_week']
            
            # Base diurnal pattern
            if 2 <= hour <= 6:     # Graveyard
                rate = np.random.normal(5, 2)
            elif 8 <= hour <= 18:  # Active day
                rate = np.random.normal(25, 6)
            else:                  # Evening
                rate = np.random.normal(15, 4)
                
            # Friday night / Weekend ER spike (trauma, substance-related, etc.)
            if dow in [4, 5] and (hour >= 20 or hour <= 3):
                rate += np.random.normal(20, 8)
                
            return max(0, int(rate))
            
        df['er_arrivals'] = df.apply(calculate_er_arrivals, axis=1)

        # Random spike anomalies (e.g., mass casualty events or large accidents)
        spike_indices = np.random.choice(df.index, size=int(self.hours * 0.005), replace=False)
        df.loc[spike_indices, 'er_arrivals'] += np.random.randint(40, 80, size=len(spike_indices))

        # 3. Weather / Local Outbreak Risk Index (0.0 to 1.0)
        # Baseline risk fluctuates slightly. Winter surge (flu season) drives it up.
        base_risk = np.random.uniform(0.1, 0.3, self.hours)
        
        # Simulate Winter flu surge for ~14 days (Days 45 to 59)
        flu_surge_start = 45 * 24
        flu_surge_end = 59 * 24
        base_risk[flu_surge_start:flu_surge_end] += np.random.uniform(0.4, 0.6, flu_surge_end - flu_surge_start)
        
        # Smooth risk index
        df['outbreak_risk_index'] = pd.Series(base_risk).rolling(window=24, min_periods=1).mean()
        df['outbreak_risk_index'] = np.clip(df['outbreak_risk_index'], 0.0, 1.0).round(3)

        # Apply flu surge impact to ER arrivals
        df.loc[flu_surge_start:flu_surge_end, 'er_arrivals'] = (
            df.loc[flu_surge_start:flu_surge_end, 'er_arrivals'] * np.random.uniform(1.3, 1.6)
        ).astype(int)

        # 4. Bed Occupancy across wards
        # Correlate ER occ to arrivals, slightly lagged
        df['occ_er'] = np.clip(df['er_arrivals'] * 1.2 + np.random.normal(10, 5, self.hours), 0, self.beds['ER']).astype(int)
        
        # Monday morning elective surgery surge
        def calculate_surgical_occ(row):
            base = np.random.normal(self.beds['Surgical'] * 0.7, 5) # 70% average occupancy
            # Monday (0) between 8 AM and 12 PM
            if row['day_of_week'] == 0 and 8 <= row['hour_of_day'] <= 12:
                base += np.random.normal(25, 4) # Surge to near 100% capacity
            return min(self.beds['Surgical'], max(0, int(base)))
            
        df['occ_surgical'] = df.apply(calculate_surgical_occ, axis=1)
        
        df['occ_icu'] = np.clip(np.random.normal(self.beds['ICU'] * 0.8, 5, self.hours), 0, self.beds['ICU']).astype(int)
        
        # General ward and Pediatrics - baseline with flu surge impact
        gen_base = np.random.normal(self.beds['General'] * 0.75, 15, self.hours)
        gen_base[flu_surge_start:flu_surge_end] += np.random.normal(40, 10, flu_surge_end - flu_surge_start)
        df['occ_general'] = np.clip(gen_base, 0, self.beds['General']).astype(int)
        
        ped_base = np.random.normal(self.beds['Pediatrics'] * 0.6, 8, self.hours)
        ped_base[flu_surge_start:flu_surge_end] += np.random.normal(15, 5, flu_surge_end - flu_surge_start)
        df['occ_pediatrics'] = np.clip(ped_base, 0, self.beds['Pediatrics']).astype(int)

        # 5. Medicine Burn Rates (5 critical pharmaceuticals)
        # Units are arbitrary standardized doses per hour
        df['med_icu_sedatives'] = df['occ_icu'] * np.random.normal(1.2, 0.15, self.hours)
        
        # Antibiotics and IV fluids spike hard during flu surge (stock-out risk)
        df['med_antibiotics'] = (df['occ_general'] * 0.8 + df['occ_pediatrics'] * 0.5 + df['occ_icu'] * 1.0) * np.random.normal(1.0, 0.1, self.hours)
        df['med_iv_fluids'] = (df['occ_er'] + df['occ_surgical'] + df['occ_general'] * 0.5) * np.random.normal(2.0, 0.3, self.hours)
        
        # During flu surge, demand spikes even harder per patient (severe cases)
        df.loc[flu_surge_start:flu_surge_end, 'med_antibiotics'] *= np.random.uniform(1.5, 2.0)
        df.loc[flu_surge_start:flu_surge_end, 'med_iv_fluids'] *= np.random.uniform(1.4, 1.8)

        df['med_analgesics'] = (df['occ_er'] + df['occ_surgical'] + df['occ_general']) * np.random.normal(1.5, 0.2, self.hours)
        df['med_cardiac'] = (df['occ_icu'] + df['occ_general'] * 0.3) * np.random.normal(1.0, 0.1, self.hours)
        
        # Ensure no negative med burns and round
        med_cols = ['med_icu_sedatives', 'med_antibiotics', 'med_iv_fluids', 'med_analgesics', 'med_cardiac']
        for col in med_cols:
            df[col] = np.clip(df[col], 0, None).round(2)

        # 6. Active Staffing Levels vs Scheduled Shifts
        # Base schedules: Days (7A-7P) require more staff, Nights (7P-7A) require less
        def calculate_scheduled_staff(row):
            return 140 if 7 <= row['hour_of_day'] < 19 else 90
            
        df['staff_scheduled'] = df.apply(calculate_scheduled_staff, axis=1)
        
        # Active staff = Scheduled - Call outs
        # Call outs increase on weekends and during outbreak (staff get sick too)
        call_outs = np.random.poisson(3, self.hours) # Base call-out rate
        call_outs += df['is_weekend'].values * np.random.poisson(2, self.hours)
        
        # Severe call-outs during the flu surge (staff infection)
        flu_call_outs = np.random.poisson(8, flu_surge_end - flu_surge_start)
        call_outs[flu_surge_start:flu_surge_end] += flu_call_outs
        
        df['staff_active'] = np.clip(df['staff_scheduled'] - call_outs, 0, None).astype(int)

        # 7. Cleanup
        # Drop temporary features used for calculations
        df = df.drop(columns=['day_of_week', 'hour_of_day', 'is_weekend'])
        
        logging.info("Data generation complete.")
        return df

    def export_to_csv(self, df: pd.DataFrame, filename: str | None = None):
        """Exports the generated DataFrame to a CSV file."""
        output = Path(filename) if filename else PROJECT_ROOT / "hospital_telemetry_historical.csv"
        if not output.is_absolute():
            output = PROJECT_ROOT / output
        df.to_csv(output, index=False)
        logging.info(f"Historical data successfully exported to {output}")

def telemetry_stream_generator(df: pd.DataFrame, interval_seconds: float = 1.0) -> typing.Generator[dict, None, None]:
    """
    Simulates real-time live ingestion of the historical telemetry data.
    Yields one row (hour of data) at a time, formatted as a dictionary, pausing between yields.
    
    Args:
        df (pd.DataFrame): The historical telemetry dataframe.
        interval_seconds (float): Delay between streaming each record.
        
    Yields:
        dict: A dictionary representation of the row.
    """
    logging.info(f"Starting real-time telemetry ingestion stream (interval: {interval_seconds}s)...")
    for index, row in df.iterrows():
        # Convert pandas timestamp to string for JSON/streaming compatibility
        record = row.to_dict()
        record['timestamp'] = record['timestamp'].isoformat()
        
        # In a real-world scenario, this might push to Kafka, AWS Kinesis, or WebSockets
        yield record
        time.sleep(interval_seconds)

if __name__ == "__main__":
    # 1. Initialize the Generator
    generator = PredictIQDataGenerator(start_date_str="2023-11-01", days=90)
    
    # 2. Generate Data
    telemetry_df = generator.generate_historical_data()
    
    # 3. Export to CSV
    output_filename = str(PROJECT_ROOT / "hospital_telemetry_historical.csv")
    generator.export_to_csv(telemetry_df, filename=output_filename)
    
    # 4. Demonstrate the Live Ingestion Stream (first 5 records)
    print("\n--- Live Ingestion Stream Simulation ---")
    live_stream = telemetry_stream_generator(telemetry_df, interval_seconds=0.2)
    
    try:
        for i in range(5):
            live_record = next(live_stream)
            print(f"Ingested Record {i+1}: {live_record}")
    except StopIteration:
        pass
    print("----------------------------------------")
