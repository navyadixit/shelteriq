from datetime import datetime

# Intake rate tracking for time-to-full calculation
intake_log = []  # stores count readings over time

def calculate_intake_rate():
    """Calculate how many people arrive per hour based on recent readings"""
    if len(intake_log) < 2:
        return 8  # default assumption: 8 people per hour
    recent = intake_log[-10:]  # last 10 readings
    if len(recent) < 2:
        return 8
    change = recent[-1]["count"] - recent[0]["count"]
    time_diff = (recent[-1]["time"] - recent[0]["time"]).seconds / 3600
    if time_diff == 0:
        return 8
    rate = change / time_diff
    return max(0, rate)

def time_to_full(count, capacity):
    """Returns string like 'Est. full in 1.4 hours' or None"""
    rate = calculate_intake_rate()
    remaining = capacity - count
    if rate <= 0 or remaining <= 0:
        return None
    hours = remaining / rate
    return f"Est. full in {hours:.1f} hours"

def classify_risk(count, capacity):
    """Returns LOW, MEDIUM, or HIGH"""
    ratio = count / capacity
    if ratio < 0.5:
        return "LOW"
    elif ratio < 0.8:
        return "MEDIUM"
    else:
        return "HIGH"

def resource_needs(count):
    """Calculate all resources needed based on headcount"""
    return {
        "water_liters": count * 3,
        "meals_per_day": count * 3,
        "blankets": count,
        "medical_kits": count // 10,
        "volunteers_needed": max(1, -(-count // 15))  # ceiling division
    }

def check_alerts(shelters):
    """Generate alerts based on current shelter states"""
    alerts = []
    timestamp = datetime.now().strftime("%H:%M")

    for sid, s in shelters.items():
        ratio = s["count"] / s["capacity"]
        resources = resource_needs(s["count"])

        # 90% capacity alert
        if ratio >= 0.9:
            alerts.append({
                "time": timestamp,
                "level": "CRITICAL",
                "message": f"{s['name']} is at {int(ratio*100)}% capacity. Redirect all incoming evacuees immediately."
            })

        # 80% capacity alert
        elif ratio >= 0.8:
            alerts.append({
                "time": timestamp,
                "level": "HIGH",
                "message": f"{s['name']} crossed 80% capacity. Status HIGH. Prepare overflow area now."
            })

        # 50% capacity alert
        elif ratio >= 0.5:
            alerts.append({
                "time": timestamp,
                "level": "MEDIUM",
                "message": f"{s['name']} is at {int(ratio*100)}% capacity. Monitor intake closely."
            })

        # Volunteer shortage alert
        if s["volunteers"] < resources["volunteers_needed"]:
            shortage = resources["volunteers_needed"] - s["volunteers"]
            alerts.append({
                "time": timestamp,
                "level": "WARNING",
                "message": f"{s['name']} — volunteer shortage. Have {s['volunteers']}, need {resources['volunteers_needed']}. Deploy {shortage} more volunteers."
            })

        # Medical kit shortage alert
        if s["count"] > 0 and resources["medical_kits"] > s.get("medical_kits_available", 10):
            alerts.append({
                "time": timestamp,
                "level": "WARNING",
                "message": f"{s['name']} — medical kit shortage. {resources['medical_kits']} kits needed for current occupancy."
            })

    return alerts

def generate_situation_report(shelters):
    """Auto-generate plain text situation report"""
    timestamp = datetime.now().strftime("%H:%M %d %b %Y")
    lines = []
    lines.append(f"SITUATION REPORT — {timestamp}")
    lines.append("=" * 50)

    for sid, s in shelters.items():
        risk = classify_risk(s["count"], s["capacity"])
        resources = resource_needs(s["count"])
        ttf = time_to_full(s["count"], s["capacity"])
        ratio = int((s["count"] / s["capacity"]) * 100)

        lines.append(f"\n{s['name']}")
        lines.append(f"Occupancy: {s['count']}/{s['capacity']} ({ratio}%) — Status: {risk}")
        lines.append(f"Resources needed: {resources['water_liters']}L water, {resources['meals_per_day']} meals, {resources['blankets']} blankets, {resources['medical_kits']} medical kits")
        lines.append(f"Volunteers: {s['volunteers']} present / {resources['volunteers_needed']} needed")
        if ttf:
            lines.append(f"Time to full: {ttf}")
        if risk == "HIGH" or risk == "CRITICAL":
            lines.append(f"ACTION REQUIRED: Redirect incoming evacuees to nearest available shelter.")

    lines.append("\n" + "=" * 50)
    lines.append("END OF REPORT")
    return "\n".join(lines)

# Shelter data
shelters = {
    1: {
        "name": "Shelter Alpha — Cubbon Park Relief Camp",
        "capacity": 45,
        "count": 0,          # updated live by YOLOv8 thread
        "lat": 12.9763,
        "lng": 77.5929,
        "volunteers": 8,
        "medical_kits_available": 10,
        "zone": "Central Bengaluru"
    },
    2: {
        "name": "Shelter Beta — Lalbagh Relief Camp",
        "capacity": 60,
        "count": 45,         # static seed data
        "lat": 12.9507,
        "lng": 77.5848,
        "volunteers": 6,
        "medical_kits_available": 8,
        "zone": "South Bengaluru"
    },
    3: {
        "name": "Shelter Gamma — Kanteerava Stadium Camp",
        "capacity": 50,
        "count": 110,        # already at capacity — triggers alerts immediately
        "lat": 12.9716,
        "lng": 77.5946,
        "volunteers": 3,
        "medical_kits_available": 5,
        "zone": "Central Bengaluru"
    },
    4: {
    "name": "Shelter Delta — Yelahanka Community Hall",
    "capacity": 40,
    "count": 60,
    "lat": 13.1007,
    "lng": 77.5963,
    "volunteers": 7,
    "medical_kits_available": 12,
    "zone": "North Bengaluru"
    },

    5: {
        "name": "Shelter Epsilon — Whitefield Sports Complex",
        "capacity": 60,
        "count": 72,
        "lat": 12.9698,
        "lng": 77.7500,
        "volunteers": 9,
        "medical_kits_available": 14,
        "zone": "East Bengaluru"
    },

    6: {
        "name": "Shelter Zeta — Electronic City Convention Hall",
        "capacity": 80,
        "count": 95,
        "lat": 12.8399,
        "lng": 77.6770,
        "volunteers": 11,
        "medical_kits_available": 15,
        "zone": "South Bengaluru"
    },

    7: {
        "name": "Shelter Eta — Rajajinagar Indoor Stadium",
        "capacity": 100,
        "count": 50,
        "lat": 12.9916,
        "lng": 77.5553,
        "volunteers": 6,
        "medical_kits_available": 10,
        "zone": "West Bengaluru"
    },

    8: {
        "name": "Shelter Theta — Hebbal Lake Grounds",
        "capacity": 120,
        "count": 65,
        "lat": 13.0359,
        "lng": 77.5970,
        "volunteers": 7,
        "medical_kits_available": 9,
        "zone": "North Bengaluru"
    },

    9: {
        "name": "Shelter Iota — Koramangala Indoor Arena",
        "capacity": 75,
        "count": 88,
        "lat": 12.9279,
        "lng": 77.6271,
        "volunteers": 8,
        "medical_kits_available": 11,
        "zone": "South East Bengaluru"
    },

    10: {
        "name": "Shelter Kappa — Banashankari Community Hall",
        "capacity": 70,
        "count": 54,
        "lat": 12.9250,
        "lng": 77.5468,
        "volunteers": 6,
        "medical_kits_available": 9,
        "zone": "South West Bengaluru"
    },

    11: {
        "name": "Shelter Lambda — KR Puram Grounds",
        "capacity": 70,
        "count": 102,
        "lat": 13.0100,
        "lng": 77.6950,
        "volunteers": 10,
        "medical_kits_available": 13,
        "zone": "North East Bengaluru"
    }
}