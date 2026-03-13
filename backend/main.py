import csv
import math
import time
import threading
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Master storage for all your logic results
live_data = {
    "count": 0,
    "risk": "LOW",
    "resources": {},
    "ttf": "N/A",
    "report": "",
    "alerts": []
}

# --- 1. YOUR EXACT LOGIC FUNCTIONS ---
def classify_risk(count, capacity):
    ratio = count / capacity
    if ratio < 0.5: return "LOW"
    elif ratio < 0.8: return "MEDIUM"
    else: return "HIGH"

def resource_needs(count):
    return {
        "water": count * 3,
        "meals": count * 3,
        "blankets": count,
        "medical": int(count / 10),
        "volunteers": math.ceil(count / 15)
    }

def time_to_full(count, capacity, intake_rate=15):
    remaining = capacity - count
    if intake_rate <= 0 or remaining <= 0: return "N/A"
    hours = remaining / intake_rate
    return f"{hours:.1f} hours"

def generate_report(shelter_list):
    report_segments = []
    for s in shelter_list:
        name = s['name']
        count = s['count']
        cap = s['capacity']
        if count >= cap:
            status = "CRITICAL, redirect all"
        else:
            risk = classify_risk(count, cap)
            status = f"{risk}, needs {count * 3}L water"
        report_segments.append(f"{name}: {count}/{cap}, {status}")
    return ". ".join(report_segments) + "."

# --- 2. THE BACKGROUND INTEGRATOR ---
def csv_worker():
    global live_data
    # Initialize your shelter objects
    shelter_alpha = {"name": "Shelter Alpha", "count": 0, "capacity": 60}
    shelter_beta  = {"name": "Shelter Beta",  "count": 45, "capacity": 120}
    shelter_gamma = {"name": "Shelter Gamma", "count": 110, "capacity": 110}
    all_shelters = [shelter_alpha, shelter_beta, shelter_gamma]

    while True:
        try:
            with open('shelter_data_aggressive.csv', mode='r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    current_count = int(row['count'])
                    
                    # Run your logic functions
                    shelter_alpha['count'] = current_count
                    res = resource_needs(current_count)
                    ttf = time_to_full(current_count, shelter_alpha['capacity'])
                    report = generate_report(all_shelters)
                    risk = classify_risk(current_count, shelter_alpha['capacity'])
                    
                    # Update the master dictionary for Navya
                    live_data["count"] = current_count
                    live_data["risk"] = risk
                    live_data["resources"] = res
                    live_data["ttf"] = ttf
                    live_data["report"] = report # This can be used in SituationReport.jsx
                    
                    # Add to alert feed
                    new_alert = {
                        "time": datetime.now().strftime("%H:%M"),
                        "message": f"Alpha update: {current_count} ppl. Status: {risk}",
                        "status": risk
                    }
                    live_data["alerts"].insert(0, new_alert)
                    live_data["alerts"] = live_data["alerts"][:10]
                    
                    print(f"Syncing Frame {row['frame']}: Count {current_count}")
                    time.sleep(0.5) # Speed it up for the demo!
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(2)

threading.Thread(target=csv_worker, daemon=True).start()

@app.get("/api/dashboard")
def get_dashboard():
    return live_data
