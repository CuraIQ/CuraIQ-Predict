"""Stream synthetic telemetry rows to the PredictIQ FastAPI ingest endpoint."""

import argparse
import logging
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import httpx
import pandas as pd

# Ensure project root is on sys.path when run as a script
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from generate_telemetry import PredictIQDataGenerator, telemetry_stream_generator

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("stream_telemetry")

DEFAULT_HOSPITAL_ID = "11111111-1111-1111-1111-111111111111"
DEFAULT_API_URL = os.getenv("PREDICTIQ_API_URL", "http://localhost:8000/api/v1/telemetry/ingest")

# Map wide CSV columns to ward-scoped metrics for the ingest API schema
WARD_METRIC_MAP = {
    "occ_icu": ("22222222-2222-2222-2222-222222222201", "bed_occupancy", "beds"),
    "occ_er": ("22222222-2222-2222-2222-222222222202", "bed_occupancy", "beds"),
    "occ_general": ("22222222-2222-2222-2222-222222222203", "bed_occupancy", "beds"),
    "occ_surgical": ("22222222-2222-2222-2222-222222222204", "bed_occupancy", "beds"),
    "occ_pediatrics": ("22222222-2222-2222-2222-222222222205", "bed_occupancy", "beds"),
}

HOSPITAL_METRIC_COLUMNS = {
    "er_arrivals": ("er_arrivals", "patients/hr"),
    "outbreak_risk_index": ("outbreak_risk_index", "index"),
    "staff_active": ("staff_active", "staff"),
    "staff_scheduled": ("staff_scheduled", "staff"),
    "med_icu_sedatives": ("med_icu_sedatives", "units/hr"),
    "med_antibiotics": ("med_antibiotics", "units/hr"),
    "med_iv_fluids": ("med_iv_fluids", "units/hr"),
    "med_analgesics": ("med_analgesics", "units/hr"),
    "med_cardiac": ("med_cardiac", "units/hr"),
}


def row_to_telemetry_records(row: dict, hospital_id: str) -> list[dict]:
    """Convert a wide telemetry row into TelemetryRecord dicts expected by the API."""
    records: list[dict] = []
    recorded_at = row.get("timestamp")
    if isinstance(recorded_at, str):
        recorded_at = datetime.fromisoformat(recorded_at.replace("Z", "+00:00")).isoformat()
    elif isinstance(recorded_at, datetime):
        recorded_at = recorded_at.astimezone(timezone.utc).isoformat()
    else:
        recorded_at = datetime.now(timezone.utc).isoformat()

    for col, (ward_id, metric_name, unit) in WARD_METRIC_MAP.items():
        if col in row and row[col] is not None:
            records.append({
                "hospital_id": hospital_id,
                "ward_id": ward_id,
                "metric_name": metric_name,
                "metric_value": float(row[col]),
                "unit": unit,
                "recorded_at": recorded_at,
            })

    for col, (metric_name, unit) in HOSPITAL_METRIC_COLUMNS.items():
        if col in row and row[col] is not None:
            records.append({
                "hospital_id": hospital_id,
                "ward_id": None,
                "metric_name": metric_name,
                "metric_value": float(row[col]),
                "unit": unit,
                "recorded_at": recorded_at,
            })

    return records


def load_dataframe(csv_path: Path | None, days: int) -> pd.DataFrame:
    """Load existing CSV or generate fresh telemetry data."""
    if csv_path and csv_path.exists():
        logger.info("Loading telemetry from %s", csv_path)
        df = pd.read_csv(csv_path)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        return df

    logger.info("Generating %d days of synthetic telemetry", days)
    generator = PredictIQDataGenerator(days=days)
    df = generator.generate_historical_data()
    out_path = PROJECT_ROOT / "hospital_telemetry_historical.csv"
    generator.export_to_csv(df, filename=str(out_path))
    return df


def post_batch(client: httpx.Client, api_url: str, records: list[dict]) -> int:
    """POST a batch of records; returns ingested count."""
    response = client.post(api_url, json={"records": records}, timeout=30.0)
    response.raise_for_status()
    return response.json()["data"]["ingested"]


def stream_to_api(
    df: pd.DataFrame,
    api_url: str,
    hospital_id: str,
    interval_seconds: float,
    max_records: int | None,
    batch_size: int,
) -> None:
    """Stream telemetry rows to the FastAPI ingest endpoint."""
    sent = 0
    batch: list[dict] = []

    with httpx.Client() as client:
        for row in telemetry_stream_generator(df, interval_seconds=0):
            batch.extend(row_to_telemetry_records(row, hospital_id))

            if len(batch) >= batch_size:
                ingested = post_batch(client, api_url, batch[:batch_size])
                sent += ingested
                batch = batch[batch_size:]
                logger.info("Ingested %d records (total sent: %d)", ingested, sent)

            if max_records and sent >= max_records:
                break

            time.sleep(interval_seconds)

        if batch:
            ingested = post_batch(client, api_url, batch)
            sent += ingested
            logger.info("Final batch ingested %d records (total sent: %d)", ingested, sent)


def main() -> None:
    parser = argparse.ArgumentParser(description="Stream telemetry to PredictIQ API")
    parser.add_argument("--csv", type=Path, default=PROJECT_ROOT / "hospital_telemetry_historical.csv")
    parser.add_argument("--api-url", default=DEFAULT_API_URL)
    parser.add_argument("--hospital-id", default=DEFAULT_HOSPITAL_ID)
    parser.add_argument("--interval", type=float, default=1.0, help="Seconds between row batches")
    parser.add_argument("--batch-size", type=int, default=14, help="Records per POST request")
    parser.add_argument("--max-records", type=int, default=50, help="Stop after N ingested records (0 = unlimited)")
    parser.add_argument("--days", type=int, default=7, help="Days to generate if CSV missing")
    args = parser.parse_args()

    df = load_dataframe(args.csv if args.csv.exists() else None, args.days)
    max_records = args.max_records if args.max_records > 0 else None

    logger.info("Streaming to %s", args.api_url)
    stream_to_api(
        df=df,
        api_url=args.api_url,
        hospital_id=args.hospital_id,
        interval_seconds=args.interval,
        max_records=max_records,
        batch_size=args.batch_size,
    )


if __name__ == "__main__":
    main()
