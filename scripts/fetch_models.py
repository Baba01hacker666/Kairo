import os
import sys
import urllib.request
import json

# Agent-Friendly 3D Model Downloader
# Bypasses login-walled sites (like Sketchfab) by utilizing open raw CDNs (GitHub, KhronosGroup, etc.)
# Provides direct streaming / downloading of real .glb / .gltf models for AI agents.

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "../public/models")

# A curated catalog of high-quality, free, open-source models available via raw CDN
MODEL_CATALOG = {
    "fox": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb",
    "duck": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    "damaged_helmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    "flight_helmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF/FlightHelmet.gltf",
    "water_bottle": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF-Binary/WaterBottle.glb",
    "boombox": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb",
    "car": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/Models/CarConcept/glTF-Binary/CarConcept.glb"
}

def download_model(name):
    if name not in MODEL_CATALOG:
        print(f"Error: Model '{name}' not found in catalog. Available: {list(MODEL_CATALOG.keys())}")
        return False
        
    url = MODEL_CATALOG[name]
    ext = url.split('.')[-1]
    filename = f"{name}.{ext}"
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    
    print(f"Streaming '{name}' from CDN ({url})...")
    
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"Success! Saved to {filepath}")
        return True
    except Exception as e:
        print(f"Failed to download '{name}': {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        model_name = sys.argv[1].lower()
        if model_name == "all":
            for m in MODEL_CATALOG:
                download_model(m)
        else:
            download_model(model_name)
    else:
        print("Usage: python fetch_models.py [model_name | all]")
        print("Available models:")
        for m in MODEL_CATALOG:
            print(f" - {m}")
