from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

Base = declarative_base()

class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True)
    scheduled_date = Column(DateTime, nullable=False)
    content_text = Column(Text, nullable=False)
    image_path = Column(String, nullable=True)
    image_prompt = Column(Text, nullable=True)
    status = Column(String, default='pending') # pending, posted, failed
    linkedin_post_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

import os

def init_db(db_url='sqlite:///data/posts.db'):
    # Check if we are passing a default sqlite path and need to verify write access
    if 'sqlite:///' in db_url:
        path = db_url.replace('sqlite:///', '')
        directory = os.path.dirname(path)
        
        # If directory is specified but doesn't exist or isn't writable
        if directory and not os.path.exists(directory):
            try:
                os.makedirs(directory, exist_ok=True)
            except OSError:
                # Assuming read-only filesystem (e.g., Vercel), fallback to /tmp
                db_url = 'sqlite:////tmp/posts.db'
        elif directory and not os.access(directory, os.W_OK):
             db_url = 'sqlite:////tmp/posts.db'

    engine = create_engine(db_url)
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)
