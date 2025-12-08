import os
import google.generativeai as genai
from datetime import datetime, timedelta
import json
from src.database import Post

class ContentGenerator:
    def __init__(self, session, api_key=None):
        self.session = session
        final_api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not final_api_key:
            raise ValueError("GEMINI_API_KEY not provided and not found in environment variables")
        genai.configure(api_key=final_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_json(self, context, days):
        """Generates content and returns it as a list of dicts, without saving to DB."""
        # Calculate start date (tomorrow)
        start_date = datetime.now() + timedelta(days=1)

        prompt = f"""
        You are a generic-defying LinkedIn Ghostwriter.
        Based on the following user context/topic, generate a content calendar for {days} days.
        
        USER TOPIC/CONTEXT:
        {context}

        For each day, provide:
        1. The post content: STRICTLY UNDER 15 WORDS. Punchy, viral, one powerful sentence. NO FLUFF.
        2. "image_prompt": Create a HIGHLY REALISTIC, professional photography prompt. Include:
           - Subject directly related to the topic (e.g., for tech: developer at laptop, for fitness: athlete training)
           - Cinematic lighting (golden hour, soft studio light, dramatic shadows)
           - Quality modifiers: "photorealistic, 8k uhd, DSLR, professional photography, hyper-detailed, sharp focus"
           - Style: "modern, clean composition, minimal background, depth of field"
        
        Themes:
        - Day 1: The Hook (Contrarian)
        - Day 2: The Value (Industry Secret)
        - Day 3: The Story (Personal/Vulnerable)
        - Day 4: The Data (Hard Facts)
        - Day 5: The Future (Visionary)

        Output strictly valid JSON in the following format:
        [
            {{
                "day_offset": 1,
                "content": "Design is not just what it looks like...",
                "image_prompt": "Cinematic shot of a minimalist bauhaus chair, dramatic lighting, 8k resolution",
                "layout": "classic",
                "data_points": []
            }},
            ...
        ]
        Do not include markdown formatting like ```json. Just the raw JSON string.
        """

        response = self.model.generate_content(prompt)
        
        try:
            # Clean up potential markdown formatting
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.endswith('```'):
                text = text[:-3]
            
            posts_data = json.loads(text)
            return posts_data
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print("Raw response:", response.text)
            raise e
            
    def generate_ideas(self, topic, count=10):
        """Generates viral content ideas based on a topic."""
        prompt = f"""
        You are a viral social media strategist.
        Generate {count} unique, high-engagement content ideas/hooks for the topic: "{topic}".
        
        Themes to cover:
        - Contrarian views
        - How-to guides
        - Listicles
        - Personal stories
        - Industry secrets
        
        Output strictly valid JSON in the following format:
        [
            {{
                "id": 1,
                "hook": "The hook/title of the post",
                "virality_score": 95,
                "type": "Educational"
            }},
            ...
        ]
        Do not include markdown.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.endswith('```'):
                text = text[:-3]
            
            return json.loads(text)
        except Exception as e:
            print(f"Error generating ideas: {e}")
            raise e

    def generate_bulk(self, days, context_file):
        with open(context_file, 'r') as f:
            context = f.read()
        
        posts_data = self.generate_json(context, days)
        
        # Calculate start date (tomorrow)
        start_date = datetime.now() + timedelta(days=1)

        for post_data in posts_data:
            post_date = start_date + timedelta(days=post_data['day_offset'] - 1)
            # Set time to 9 AM default
            post_date = post_date.replace(hour=9, minute=0, second=0, microsecond=0)
            
            new_post = Post(
                scheduled_date=post_date,
                content_text=post_data['content'],
                image_prompt=post_data['image_prompt'],
                status='pending'
            )
            self.session.add(new_post)
        
        self.session.commit()
        print(f"Successfully scheduled {len(posts_data)} posts.")

    def generate_image(self, prompt: str) -> str:
        """
        Generates an image using Gemini's image generation model.
        Returns base64 encoded image data.
        """
        try:
            # Use Gemini's image generation model
            # Try gemini-2.5-flash first (supports image generation in response_modalities)
            image_model = genai.GenerativeModel(
                'gemini-1.5-flash',
                generation_config=genai.GenerationConfig(
                    response_modalities=['image', 'text']
                )
            )
            
            enhanced_prompt = f"""Generate a high-quality, professional image:
            {prompt}
            
            Style: Photorealistic, clean, modern, professional photography, 8K quality, 
            dramatic lighting, sharp focus, depth of field."""
            
            response = image_model.generate_content(enhanced_prompt)
            
            # Extract image from response
            for part in response.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    import base64
                    image_data = base64.b64encode(part.inline_data.data).decode('utf-8')
                    mime_type = part.inline_data.mime_type
                    return f"data:{mime_type};base64,{image_data}"
            
            # If no image in response, return None
            return None
            
        except Exception as e:
            print(f"Gemini image generation failed: {e}")
            return None
