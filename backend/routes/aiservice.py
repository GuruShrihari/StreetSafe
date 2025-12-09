# backend/routes/aiservice.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests
import json
import traceback

# Define the router
router = APIRouter(
    prefix="/ai",
    tags=["AI Services"]
)

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyCRPayA3os7vmk2vJpwxkmg7zVMLl5Dt5g"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# --- REQUEST MODELS ---

class ItineraryRequest(BaseModel):
    """Request model for itinerary generation"""
    destination: str
    days: int
    travel_style: str  # adventure, relaxation, cultural, budget
    interests: List[str]

class PackingListRequest(BaseModel):
    """Request model for packing list generation"""
    destination: str
    duration: int
    weather: str  # hot, cold, rainy, mixed
    activities: List[str]

# --- RESPONSE MODELS ---

class ItineraryItem(BaseModel):
    time: str
    activity: str
    location: str
    duration: str
    notes: str

class ItineraryResponse(BaseModel):
    itinerary: List[ItineraryItem]
    destination: str
    days: int

class PackingCategory(BaseModel):
    category: str
    items: List[str]

class PackingListResponse(BaseModel):
    packing_list: List[PackingCategory]
    destination: str
    duration: int

# --- HELPER FUNCTIONS ---

def call_gemini_api(prompt: str) -> str:
    """
    Calls the Gemini API with the given prompt and returns the text response.
    Includes retry logic and extended timeout.
    """
    max_retries = 2
    timeout_seconds = 60  # Increased from 30 to 60 seconds
    
    for attempt in range(max_retries):
        try:
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                }
            }
            
            print(f"[GEMINI] Attempt {attempt + 1}/{max_retries}: Calling API with prompt length: {len(prompt)}")
            print(f"[GEMINI] API URL: {GEMINI_API_URL}?key={GEMINI_API_KEY[:10]}...")
            print(f"[GEMINI] Timeout: {timeout_seconds} seconds")
            
            response = requests.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=payload,
                timeout=timeout_seconds
            )
            
            print(f"[GEMINI] Response status: {response.status_code}")
            print(f"[GEMINI] Response text: {response.text[:500]}")
            
            if response.status_code != 200:
                error_msg = response.text
                print(f"[GEMINI] Error {response.status_code}: {error_msg}")
                
                # If rate-limited on first attempt, return 429 for fallback
                if response.status_code == 429:
                    raise HTTPException(
                        status_code=429,
                        detail="API rate limited"
                    )
                
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Gemini API error {response.status_code}: {error_msg}"
                )
            
            data = response.json()
            
            if "candidates" not in data or not data["candidates"]:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid Gemini API response: no candidates"
                )
            
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            print(f"[GEMINI] Successfully received response")
            return content
            
        except requests.exceptions.Timeout as e:
            print(f"[GEMINI] Timeout on attempt {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                print(f"[GEMINI] Retrying...")
                continue
            else:
                print(f"[GEMINI] Max retries reached, using fallback")
                raise HTTPException(
                    status_code=504,
                    detail="API request timed out after retries"
                )
        except requests.exceptions.RequestException as e:
            print(f"[GEMINI] Request error on attempt {attempt + 1}: {str(e)}")
            if attempt < max_retries - 1:
                print(f"[GEMINI] Retrying...")
                continue
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"API request failed: {str(e)}"
                )
        except HTTPException:
            raise
        except (KeyError, IndexError) as e:
            print(f"[GEMINI] Response parsing error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to parse API response"
            )

def extract_json(text: str):
    """
    Extracts JSON from the response text.
    """
    # Try direct parsing first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    
    # Try extracting array
    import re
    array_match = re.search(r'\[[\s\S]*\]', text)
    if array_match:
        try:
            return json.loads(array_match.group())
        except json.JSONDecodeError:
            pass
    
    # Try extracting object
    obj_match = re.search(r'\{[\s\S]*\}', text)
    if obj_match:
        try:
            return json.loads(obj_match.group())
        except json.JSONDecodeError:
            pass
    
    raise ValueError("Could not extract JSON from response")

def get_sample_itinerary(destination: str, days: int) -> List[dict]:
    """
    Returns a sample itinerary when API is unavailable.
    """
    activities = {
        "Paris": ["Visit Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Champs-Élysées", "Notre-Dame"],
        "Tokyo": ["Senso-ji Temple", "Shibuya Crossing", "Tsukiji Market", "Mount Fuji", "Team Lab Borderless"],
        "London": ["Big Ben", "Tower of London", "British Museum", "Oxford Street", "Tower Bridge"],
        "New York": ["Statue of Liberty", "Central Park", "Times Square", "MoMA", "Brooklyn Bridge"],
        "Barcelona": ["Sagrada Familia", "Park Güell", "Las Ramblas", "Gothic Quarter", "Montjuïc"],
    }
    
    dest_activities = activities.get(destination, ["Explore local attractions", "Visit museums", "Try local cuisine", "Shopping", "Cultural experiences"])
    
    itinerary = []
    for day in range(1, days + 1):
        activity_idx = (day - 1) % len(dest_activities)
        activity = dest_activities[activity_idx]
        itinerary.append({
            "time": f"{9 + day}:00 AM",
            "activity": activity,
            "location": destination,
            "duration": "3-4 hours",
            "notes": f"Day {day} of your {days}-day journey. Enjoy exploring!"
        })
    
    return itinerary

def get_sample_packing_list(duration: int, weather: str) -> List[dict]:
    """
    Returns a sample packing list when API is unavailable.
    """
    packing = {
        "hot": {
            "Clothing": ["T-shirts", "Shorts", "Lightweight dresses", "Sandals", "Hat"],
            "Toiletries": ["Sunscreen", "Sunglasses", "Moisturizer"],
            "Accessories": ["Water bottle", "Beach bag", "Light scarf"]
        },
        "cold": {
            "Clothing": ["Sweaters", "Winter coat", "Thermal underwear", "Boots", "Warm hat"],
            "Toiletries": ["Lip balm", "Moisturizer"],
            "Accessories": ["Scarf", "Gloves", "Hand warmer"]
        },
        "rainy": {
            "Clothing": ["Raincoat", "Waterproof jacket", "Water-resistant shoes"],
            "Toiletries": ["Waterproof bag"],
            "Accessories": ["Umbrella", "Waterproof cover for bag"]
        },
        "mixed": {
            "Clothing": ["Layers", "Comfortable pants", "Light jacket", "Comfortable shoes"],
            "Toiletries": ["Moisturizer", "Sunscreen"],
            "Accessories": ["Scarf", "Umbrella"]
        }
    }
    
    base_list = packing.get(weather, packing["mixed"])
    
    return [
        {"category": category, "items": items}
        for category, items in base_list.items()
    ] + [
        {"category": "Electronics", "items": ["Phone", "Charger", "Power bank"]},
        {"category": "Documents", "items": ["Passport", "Travel insurance", "Hotel confirmations"]},
    ]

# --- API ENDPOINTS ---

@router.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest):
    """
    Generate an AI-powered travel itinerary based on user preferences.
    Falls back to sample itinerary if API is rate-limited.
    """
    try:
        print(f"[AI] Generating itinerary for {request.destination} ({request.days} days, {request.travel_style})")
        
        prompt = f"""Create a detailed {request.days}-day {request.travel_style} travel itinerary for {request.destination}. 
        Interests: {', '.join(request.interests) if request.interests else 'General sightseeing'}. 
        
        For each day, provide specific times (e.g., 9:00 AM - 12:00 PM), activities, locations, duration, and helpful notes.
        
        Return ONLY a valid JSON array (no extra text before or after) with objects like this format:
        [
            {{"time": "9:00 AM", "activity": "activity name", "location": "place", "duration": "3 hours", "notes": "optional notes"}},
            {{"time": "1:00 PM", "activity": "next activity", "location": "another place", "duration": "2 hours", "notes": "tips"}}
        ]"""
        
        try:
            response_text = call_gemini_api(prompt)
            print(f"[AI] Raw response: {response_text[:200]}...")
            
            itinerary_data = extract_json(response_text)
            
            if not isinstance(itinerary_data, list):
                raise ValueError("Response is not a list")
            
            # Validate and convert to ItineraryItem objects
            items = []
            for item in itinerary_data:
                items.append(ItineraryItem(
                    time=item.get("time", ""),
                    activity=item.get("activity", ""),
                    location=item.get("location", ""),
                    duration=item.get("duration", ""),
                    notes=item.get("notes", "")
                ))
            
            return ItineraryResponse(
                itinerary=items,
                destination=request.destination,
                days=request.days
            )
        
        except HTTPException as e:
            # If API is rate-limited or times out, use fallback
            if e.status_code in [429, 504]:
                print(f"[AI] API unavailable ({e.status_code}). Using sample itinerary.")
                sample_data = get_sample_itinerary(request.destination, request.days)
                items = [ItineraryItem(**item) for item in sample_data]
                return ItineraryResponse(
                    itinerary=items,
                    destination=request.destination,
                    days=request.days
                )
            raise
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AI] Error generating itinerary: {str(e)}")
        print(f"[AI] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )

@router.post("/generate-packing-list", response_model=PackingListResponse)
async def generate_packing_list(request: PackingListRequest):
    """
    Generate an AI-powered packing list based on trip details.
    Falls back to sample packing list if API is rate-limited.
    """
    try:
        print(f"[AI] Generating packing list for {request.destination} ({request.duration} days, {request.weather})")
        
        prompt = f"""Create a comprehensive packing list for a {request.duration}-day trip to {request.destination}.
        Weather: {request.weather}
        Activities: {', '.join(request.activities) if request.activities else 'General sightseeing'}
        
        Organize items by category (Clothing, Toiletries, Electronics, Documents, Accessories, etc.).
        
        Return ONLY a valid JSON array (no extra text before or after) with this format:
        [
            {{"category": "Clothing", "items": ["item1", "item2", "item3"]}},
            {{"category": "Toiletries", "items": ["item4", "item5"]}}
        ]"""
        
        try:
            response_text = call_gemini_api(prompt)
            print(f"[AI] Raw response: {response_text[:200]}...")
            
            packing_data = extract_json(response_text)
            
            if not isinstance(packing_data, list):
                raise ValueError("Response is not a list")
            
            # Validate and convert to PackingCategory objects
            categories = []
            for category in packing_data:
                categories.append(PackingCategory(
                    category=category.get("category", ""),
                    items=category.get("items", [])
                ))
            
            return PackingListResponse(
                packing_list=categories,
                destination=request.destination,
                duration=request.duration
            )
        
        except HTTPException as e:
            # If API is rate-limited or times out, use fallback
            if e.status_code in [429, 504]:
                print(f"[AI] API unavailable ({e.status_code}). Using sample packing list.")
                sample_data = get_sample_packing_list(request.duration, request.weather)
                categories = [PackingCategory(**item) for item in sample_data]
                return PackingListResponse(
                    packing_list=categories,
                    destination=request.destination,
                    duration=request.duration
                )
            raise
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AI] Error generating packing list: {str(e)}")
        print(f"[AI] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate packing list: {str(e)}"
        )

@router.get("/health")
async def ai_health():
    """
    Health check for AI services.
    """
    return {
        "status": "healthy",
        "services": ["itinerary-builder", "packing-assistant"],
        "models": ["gemini-2.5-flash"]
    }
