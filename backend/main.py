from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from typing import List, Optional
import time

app = FastAPI(title="EcoSegregate AI API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatMessage(BaseModel):
    message: str
    language: str = "en"

class DetectionResult(BaseModel):
    label: str
    confidence: float
    bin_type: str
    recyclable: bool
    instructions: str

from ai_engine import ai_engine
from nlp_engine import nlp_engine

# Endpoints
@app.get("/")
async def root():
    return {"message": "EcoSegregate AI API is online"}

@app.post("/detect")
async def detect_waste(file: UploadFile = File(...)):
    contents = await file.read()
    result = ai_engine.process_image(contents)
    return result

@app.post("/chat")
async def chat_with_guru(msg: ChatMessage):
    response = nlp_engine.get_response(msg.message, msg.language)
    return {
        "response": response,
        "language": msg.language
    }

@app.get("/analytics")
async def get_analytics():
    # In a real app, this would query a database
    return {
        "total_items": 1532,
        "composition": {
            "Plastic": 400,
            "Paper": 300,
            "Metal": 200,
            "Organic": 500,
            "E-Waste": 100
        },
        "streak": 5,
        "points": 2450
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
