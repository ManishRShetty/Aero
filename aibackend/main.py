import time
import base64
import cv2
import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from torchvision import transforms

from model import load_trained_model, process_and_predict

app = FastAPI(title="Emotion Game Backend", version="1.0.0")

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup computation device and load your specific weight file
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "best_resnet18_fer2013.pth"
model = load_trained_model(MODEL_PATH, device)

# ImageNet standard preprocessing pipeline
transform_pipeline = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

class PredictRequest(BaseModel):
    image_base64: str
    timestamp: int

class PredictResponse(BaseModel):
    action: str
    confidence: float
    processing_time_ms: int
    probabilities: dict

@app.post("/api/v1/predict", response_model=PredictResponse)
async def predict_emotion(payload: PredictRequest):
    start_time = time.time()
    
    try:
        # 1. Clean base64 prefix if attached
        img_data = payload.image_base64
        if "," in img_data:
            img_data = img_data.split(",")[1]

        # 2. Decode base64 to OpenCV frame
        img_bytes = base64.b64decode(img_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image from base64 string.")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Detect face and smile using OpenCV Haar Cascades
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        happy_prob = 0.05
        neutral_prob = 0.90
        surprise_prob = 0.05
        action = "NONE"

        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            roi_gray = gray[y:y+h, x:x+w]
            
            # Detect smile within the face ROI
            # minNeighbors=20 prevents false positives (smirks). Lower it if it's too hard to trigger.
            smiles = smile_cascade.detectMultiScale(roi_gray, scaleFactor=1.8, minNeighbors=20)
            
            if len(smiles) > 0:
                happy_prob = 0.95
                neutral_prob = 0.03
                action = "JUMP"
            
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "action": action,
            "confidence": round(happy_prob, 3),
            "processing_time_ms": processing_time_ms,
            "probabilities": {
                "smile": round(happy_prob, 3),
                "neutral": round(neutral_prob, 3),
                "surprise": round(surprise_prob, 3)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def root():
    return {
        "name": "Aero Flappy Bird AI Backend",
        "status": "online",
        "device": str(device),
        "predict_endpoint": "/api/v1/predict",
        "health_endpoint": "/health"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "device": str(device), "model_loaded": True}