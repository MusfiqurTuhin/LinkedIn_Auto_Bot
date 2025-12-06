import time
import schedule
from datetime import datetime
from src.database import Post
from src.linkedin_client import LinkedInClient

class BotScheduler:
    def __init__(self, session):
        self.session = session
        self.client = LinkedInClient()

    def job(self):
        print(f"Checking for posts at {datetime.now()}...")
        # Find posts that are due and pending
        # We check for posts scheduled <= now and status is pending
        now = datetime.now()
        posts = self.session.query(Post).filter(
            Post.status == 'pending',
            Post.scheduled_date <= now
        ).all()

        for post in posts:
            print(f"Posting post ID {post.id}...")
            try:
                success = self.client.post_content(post.content_text, post.image_path)
                if success:
                    post.status = 'posted'
                    post.linkedin_post_id = 'mock_id_123' # In real app, get from API
                    print(f"Successfully posted ID {post.id}")
                else:
                    post.status = 'failed'
                    print(f"Failed to post ID {post.id}")
            except Exception as e:
                print(f"Error posting ID {post.id}: {e}")
                post.status = 'failed'
            
            self.session.commit()

    def start(self):
        # Check every minute
        schedule.every(1).minutes.do(self.job)
        
        # Also run once immediately on startup
        self.job()

        while True:
            schedule.run_pending()
            time.sleep(10)
