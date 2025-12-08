from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.database import init_db
from src.generator import ContentGenerator
import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB connection (reusing existing logic)
db_url = os.getenv('DATABASE_URL', 'sqlite:///data/posts.db')
Session = init_db(db_url)

class GenerateRequest(BaseModel):
    topic: str
    days: int = 5

class ScheduleRequest(BaseModel):
    posts: list[dict]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "LinkedIn Auto Bot API is running"}

from typing import Annotated
from fastapi import Header

@app.post("/generate")
def generate_carousel(request: GenerateRequest, x_gemini_api_key: Annotated[str | None, Header()] = None):
    session = Session()
    try:
        generator = ContentGenerator(session, api_key=x_gemini_api_key)
        # We need to refactor generator to return data directly
        # For now, assuming refactor is done or doing it next
        result = generator.generate_json(request.topic, request.days)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

class IdeasRequest(BaseModel):
    topic: str

@app.post("/generate-ideas")
def generate_ideas(request: IdeasRequest, x_gemini_api_key: Annotated[str | None, Header()] = None):
    session = Session()
    try:
        generator = ContentGenerator(session, api_key=x_gemini_api_key)
        result = generator.generate_ideas(request.topic)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.post("/schedule")
def schedule_posts(request: ScheduleRequest):
    # Logic to save to DB
    return {"status": "implemented soon"}

class ImageRequest(BaseModel):
    prompt: str
    slide_index: int = 0
    slide_content: str = ""  # The actual slide text for better matching

@app.post("/generate-image")
def generate_image(request: ImageRequest, x_gemini_api_key: Annotated[str | None, Header()] = None):
    """Generate a relevant business image based on slide content."""
    import urllib.parse
    import re
    
    # Create unique seed
    unique_seed = hash(request.prompt + str(request.slide_index)) % 10000
    
    # Try Gemini first (if API key available)
    if x_gemini_api_key:
        session = Session()
        try:
            generator = ContentGenerator(session, api_key=x_gemini_api_key)
            image_data = generator.generate_image(request.prompt)
            if image_data:
                return {"success": True, "source": "gemini", "image": image_data}
        except Exception as e:
            print(f"Gemini failed: {e}")
        finally:
            session.close()
    
    # Combine prompt and content for better keyword extraction
    full_text = f"{request.prompt} {request.slide_content}".lower()
    
    # Business-relevant keyword mapping
    keyword_map = {
        'erp': 'enterprise,software,dashboard',
        'odoo': 'business,software,erp',
        'automation': 'automation,technology,modern',
        'software': 'software,technology,laptop',
        'business': 'business,office,professional',
        'sales': 'sales,growth,chart',
        'marketing': 'marketing,digital,social',
        'finance': 'finance,money,investment',
        'hr': 'human-resources,team,office',
        'manufacturing': 'manufacturing,factory,industry',
        'inventory': 'warehouse,logistics,supply',
        'crm': 'customer,service,support',
        'analytics': 'analytics,data,dashboard',
        'cloud': 'cloud,server,technology',
        'digital': 'digital,technology,innovation',
        'transform': 'transformation,change,growth',
        'growth': 'growth,success,chart',
        'team': 'team,collaboration,meeting',
        'success': 'success,achievement,milestone',
        'future': 'future,innovation,technology',
        'strategy': 'strategy,planning,business',
        'solution': 'solution,problem-solving,innovation'
    }
    
    # Find matching keywords
    matched_keywords = []
    for key, value in keyword_map.items():
        if key in full_text:
            matched_keywords.extend(value.split(','))
    
    # If no matches, use default business keywords
    if not matched_keywords:
        matched_keywords = ['business', 'technology', 'professional', 'modern']
    
    # Take up to 4 unique keywords
    unique_keywords = list(dict.fromkeys(matched_keywords))[:4]
    keyword_query = ','.join(unique_keywords)
    
    # Pollinations with enhanced prompt
    enhanced_prompt = f"Professional business photo: {request.prompt}, corporate, modern office, high quality"
    pollinations_url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(enhanced_prompt)}?width=600&height=600&nologo=true&seed={unique_seed}"
    
    # Unsplash with business keywords
    unsplash_url = f"https://source.unsplash.com/600x600/?{urllib.parse.quote(keyword_query)}&sig={unique_seed}"
    
    # Unsplash collection fallback (business/tech themed collections)
    business_collections = ['3330445', '1163637', '317099', '2476111']  # Business, Tech, Office, Startup
    collection_id = business_collections[request.slide_index % len(business_collections)]
    unsplash_collection_url = f"https://source.unsplash.com/collection/{collection_id}/600x600/?sig={unique_seed}"
    
    return {
        "success": False,
        "source": "fallback",
        "fallback_url": pollinations_url,
        "unsplash_url": unsplash_url,
        "collection_url": unsplash_collection_url,
        "keywords": keyword_query,
        "message": "Using relevant business images"
    }
