import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Directory for storing uploaded files and generated images
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
GENERATED_DIR = os.path.join(os.path.dirname(__file__), "generated")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)
