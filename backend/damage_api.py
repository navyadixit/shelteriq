from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import transforms, models
import torch.nn as nn
from PIL import Image
import io
import math
import requests as http_requests
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load model once at startup
model = models.mobilenet_v2(pretrained=False)
model.classifier[1] = nn.Linear(model.last_channel, 3)
state = torch.load("model.pth", map_location="cpu")
model.load_state_dict(state)
model.eval()

classes = ["HIGH", "LOW", "MEDIUM"]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Cache for emergency infrastructure
infrastructure_cache = None

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return round(R * c, 1)

def fetch_infrastructure():
    global infrastructure_cache
    if infrastructure_cache:
        return infrastructure_cache

    bbox = "12.8,77.4,13.2,77.9"
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"]({bbox});
      node["amenity"="police"]({bbox});
      node["amenity"="fire_station"]({bbox});
      way["amenity"="hospital"]({bbox});
      way["amenity"="police"]({bbox});
      way["amenity"="fire_station"]({bbox});
    );
    out center;
    """
    response = http_requests.get(
        "https://overpass-api.de/api/interpreter",
        params={"data": query},
        timeout=30
    )
    data = response.json()

    result = {"hospitals": [], "police": [], "fire_stations": []}

    for element in data["elements"]:
        lat = element.get("lat") or element.get("center", {}).get("lat")
        lng = element.get("lon") or element.get("center", {}).get("lon")
        tags = element.get("tags", {})
        name = tags.get("name")
        amenity = tags.get("amenity", "")

        if not lat or not lng or not name:
            continue

        entry = {"name": name, "lat": lat, "lng": lng}

        if amenity == "hospital":
            result["hospitals"].append(entry)
        elif amenity == "police":
            result["police"].append(entry)
        elif amenity == "fire_station":
            result["fire_stations"].append(entry)

    infrastructure_cache = result
    return result

# Preloaded damage assessments
damage_assessments = [
    {
        "id": 1,
        "location_name": "Whitefield — ITPL Gate",
        "lat": 12.9866,
        "lng": 77.7373,
        "severity": "HIGH",
        "confidence": 94.2,
        "timestamp": "08:15 22 Feb",
        "nearest_hospital": {"name": "Vydehi Hospital Whitefield", "distance_km": 1.2},
        "nearest_shelter": {"name": "Shelter Alpha — Cubbon Park Relief Camp", "distance_km": 11.4}
    },
    {
        "id": 2,
        "location_name": "Hebbal — Manyata Tech Park",
        "lat": 13.0487,
        "lng": 77.6206,
        "severity": "MEDIUM",
        "confidence": 87.5,
        "timestamp": "08:32 22 Feb",
        "nearest_hospital": {"name": "Columbia Asia Hospital Hebbal", "distance_km": 2.1},
        "nearest_shelter": {"name": "Shelter Alpha — Cubbon Park Relief Camp", "distance_km": 5.3}
    },
    {
        "id": 3,
        "location_name": "Electronic City — Infosys Campus",
        "lat": 12.8452,
        "lng": 77.6630,
        "severity": "HIGH",
        "confidence": 91.8,
        "timestamp": "08:47 22 Feb",
        "nearest_hospital": {"name": "Apollo Hospital Bannerghatta Road", "distance_km": 4.7},
        "nearest_shelter": {"name": "Shelter Beta — Lalbagh Relief Camp", "distance_km": 13.2}
    }
]


@app.post("/api/damage")
async def classify_damage(
    file: UploadFile = File(...),
    location_name: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...)
):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.copy()

    tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(tensor)
        probabilities = torch.softmax(output, dim=1)
        predicted = torch.argmax(output, dim=1).item()
        confidence = probabilities[0][predicted].item() * 100

    severity = classes[predicted]

    # Find nearest hospital from real data
    infra = fetch_infrastructure()
    from shelters import shelters

    if infra["hospitals"]:
        nearest_hospital = min(infra["hospitals"], key=lambda h: calculate_distance(lat, lng, h["lat"], h["lng"]))
        nearest_hospital_dist = calculate_distance(lat, lng, nearest_hospital["lat"], nearest_hospital["lng"])
    else:
        nearest_hospital = {"name": "Unavailable"}
        nearest_hospital_dist = 0

    nearest_shelter = min(shelters.values(), key=lambda s: calculate_distance(lat, lng, s["lat"], s["lng"]))
    nearest_shelter_dist = calculate_distance(lat, lng, nearest_shelter["lat"], nearest_shelter["lng"])

    result = {
        "id": len(damage_assessments) + 1,
        "location_name": location_name,
        "lat": lat,
        "lng": lng,
        "severity": severity,
        "confidence": round(confidence, 1),
        "timestamp": datetime.now().strftime("%H:%M %d %b"),
        "nearest_hospital": {
            "name": nearest_hospital["name"],
            "distance_km": nearest_hospital_dist
        },
        "nearest_shelter": {
            "name": nearest_shelter["name"],
            "distance_km": nearest_shelter_dist
        }
    }

    damage_assessments.append(result)
    return result


@app.get("/api/damage/all")
def get_all_damage():
    priority = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    return sorted(damage_assessments, key=lambda x: priority.get(x["severity"], 3))


@app.get("/api/locations")
def get_locations():
    from locations import damage_locations
    return damage_locations


@app.get("/api/emergency-infrastructure")
async def get_emergency_infrastructure():
    try:
        data = fetch_infrastructure()
        return data
    except Exception as e:
        return {"error": str(e), "hospitals": [], "police": [], "fire_stations": []}