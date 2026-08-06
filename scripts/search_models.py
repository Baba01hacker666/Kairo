import urllib.request
import json
import sys
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "../public/models")

def search_polyhaven(query):
    print(f"Searching PolyHaven API for '{query}'...")
    url = f"https://api.polyhaven.com/assets?t=models&search={urllib.parse.quote(query)}"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Kairo-Agent/1.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            results = list(data.keys())
            
            if not results:
                print(f"No results found for '{query}'.")
                return
                
            print(f"Found {len(results)} results! Downloading first result: {results[0]}")
            download_polyhaven(results[0])
            
    except Exception as e:
        print(f"Search failed: {e}")

def download_polyhaven(asset_id):
    print(f"Fetching download links for {asset_id}...")
    url = f"https://api.polyhaven.com/files/{asset_id}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Kairo-Agent/1.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            
            # PolyHaven provides multiple formats and includes
            # GLTF is usually provided, but we need to download the .gltf file AND its included textures/bin files
            if 'gltf' not in data:
                print("No GLTF format available.")
                return
                
            # Pick a resolution (1k or 2k)
            res = '1k' if '1k' in data['gltf'] else list(data['gltf'].keys())[0]
            gltf_data = data['gltf'][res]['gltf']
            
            main_url = gltf_data['url']
            main_filename = main_url.split('/')[-1]
            
            os.makedirs(DOWNLOAD_DIR, exist_ok=True)
            
            print(f"Downloading main GLTF: {main_filename} from {main_url}")
            urllib.request.urlretrieve(main_url, os.path.join(DOWNLOAD_DIR, main_filename))
            
            # Download includes (textures, bins)
            if 'include' in gltf_data:
                for include_path, include_info in gltf_data['include'].items():
                    include_url = include_info['url']
                    # Handle subdirectories like 'textures/'
                    full_local_path = os.path.join(DOWNLOAD_DIR, include_path)
                    os.makedirs(os.path.dirname(full_local_path), exist_ok=True)
                    print(f"Downloading included file: {include_path}")
                    urllib.request.urlretrieve(include_url, full_local_path)
                    
            print(f"Success! Model and dependencies saved to {DOWNLOAD_DIR}")
            
    except Exception as e:
        print(f"Download failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        search_polyhaven(" ".join(sys.argv[1:]))
    else:
        print("Usage: python search_models.py [search_query]")
