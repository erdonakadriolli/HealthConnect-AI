import sys
import json
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parents[1]
backend_dir = root_dir / "backend"
sys.path.append(str(backend_dir))

try:
    print("Importing FastAPI app from main...")
    from main import app
    
    print("Generating OpenAPI schema...")
    openapi_schema = app.openapi()
    
    docs_dir = root_dir / "docs"
    docs_dir.mkdir(exist_ok=True)
    
    json_path = docs_dir / "openapi.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2)
    print(f"[SUCCESS] Saved OpenAPI JSON to {json_path}")
except Exception as e:
    import traceback
    print("[ERROR] Failed to export OpenAPI schema:")
    traceback.print_exc()
    sys.exit(1)
