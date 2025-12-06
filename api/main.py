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
