from fastapi import APIRouter
from pydantic import BaseModel
import json
from app.services.gemini_rotator import gemini_rotator
import re

router = APIRouter(tags=["Live Control"])

class StaffUpdateRequest(BaseModel):
    bed_count: int
    er_queue_count: int
    doctor_availability: int

class CustomerLiveStatus(BaseModel):
    wait_time_mins: int
    ai_status_message: str
    bed_occupancy_rate: float
    bed_count: int
    er_queue_count: int
    doctor_availability: int

# In-memory state
live_state = {
    "wait_time_mins": 25,
    "ai_status_message": "Normal Operations",
    "bed_occupancy_rate": 75.0,
    "bed_count": 75,
    "er_queue_count": 12,
    "doctor_availability": 15
}

def extract_json(text: str) -> str:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return match.group(0)
    return text

@router.post("/staff/update")
async def update_staff_telemetry(data: StaffUpdateRequest):
    prompt = f"Hospital has {data.bed_count} beds occupied (out of 100), {data.er_queue_count} patients in ER queue, and {data.doctor_availability} doctors available. Calculate the wait_time_mins based on these metrics. Return a JSON object strictly with keys 'wait_time_mins' (integer), 'ai_status_message' (string of 2-5 words describing status, e.g. 'Critical Volume' or 'Normal Operations'), and 'bed_occupancy_rate' (float)."
    
    raw_response = await gemini_rotator.generate_prediction(prompt)
    try:
        clean_json = extract_json(raw_response)
        parsed = json.loads(clean_json)
        
        live_state["wait_time_mins"] = parsed.get("wait_time_mins", 45)
        live_state["ai_status_message"] = parsed.get("ai_status_message", "Updated by AI")
        live_state["bed_occupancy_rate"] = parsed.get("bed_occupancy_rate", data.bed_count)
    except Exception as e:
        live_state["ai_status_message"] = "High volume alert"
        live_state["wait_time_mins"] = 60
        live_state["bed_occupancy_rate"] = data.bed_count
        
    live_state["bed_count"] = data.bed_count
    live_state["er_queue_count"] = data.er_queue_count
    live_state["doctor_availability"] = data.doctor_availability
        
    return live_state

@router.get("/customer/live-status", response_model=CustomerLiveStatus)
async def get_customer_status():
    return CustomerLiveStatus(**live_state)
