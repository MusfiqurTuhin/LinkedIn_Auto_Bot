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

def init_db(db_url='sqlite:///data/posts.db'):
    engine = create_engine(db_url)
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine)
