import os
import requests
from dotenv import load_dotenv
from functools import lru_cache

load_dotenv()

class GPT4oClient:

    
    def __init__(self):
        self.base_url = "https://cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com/v1/chat/completions"
        self.headers = {
            "x-rapidapi-key": os.getenv("RAPIDAPI_KEY"),
            "x-rapidapi-host": "cheapest-gpt-4-turbo-gpt-4-vision-chatgpt-openai-ai-api.p.rapidapi.com",
            "Content-Type": "application/json"
        }
    
    @lru_cache(maxsize=100)  
    def generate_response(self, messages, max_tokens=200):
        payload = {
            "messages": messages,
            "model": "gpt-4o",
            "max_tokens": max_tokens,
            "temperature": 0.7,
            "frequency_penalty": 0.2
        }
        
        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except requests.exceptions.RequestException as e:
            print(f"GPT-4o API Error: {str(e)}")
            return None

# Singleton instance
gpt_client = GPT4oClient()