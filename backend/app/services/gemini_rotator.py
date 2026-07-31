import threading
import logging
from typing import List, Optional
from google import genai
from google.genai.errors import APIError
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiRotator:
    def __init__(self):
        keys = [
            settings.GEMINI_KEY_1,
            settings.GEMINI_KEY_2,
            settings.GEMINI_KEY_3,
            settings.GEMINI_KEY_4
        ]
        self.api_keys = [k for k in keys if k]
        self.current_index = 0
        self.lock = threading.Lock()
        
    def _get_next_key(self, current_key: str) -> str:
        with self.lock:
            try:
                idx = self.api_keys.index(current_key)
            except ValueError:
                idx = self.current_index
            
            # Move to next key
            self.current_index = (idx + 1) % len(self.api_keys)
            next_key = self.api_keys[self.current_index]
            logger.warning(f"[SYSTEM] Rate limit on Key {idx + 1}. Rotating to Key {self.current_index + 1}...")
            return next_key
            
    def _get_current_key(self) -> str:
        with self.lock:
            if not self.api_keys:
                raise ValueError("No Gemini API keys configured.")
            return self.api_keys[self.current_index]
            
    def generate_prediction_sync(self, prompt: str) -> str:
        """Sync version of generating prediction."""
        if not self.api_keys:
            return self._heuristic_fallback(prompt)
            
        key = self._get_current_key()
        max_retries = len(self.api_keys)
        
        for _ in range(max_retries):
            try:
                client = genai.Client(api_key=key)
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                return response.text
            except APIError as e:
                if e.code == 429 or "RESOURCE_EXHAUSTED" in str(e):
                    key = self._get_next_key(key)
                else:
                    raise
            except Exception as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    key = self._get_next_key(key)
                else:
                    raise
        
        return self._heuristic_fallback(prompt)
        
    async def generate_prediction(self, prompt: str) -> str:
        """Async version if using async clients. google.genai has async."""
        if not self.api_keys:
            return self._heuristic_fallback(prompt)
            
        key = self._get_current_key()
        max_retries = len(self.api_keys)
        
        for _ in range(max_retries):
            try:
                client = genai.Client(api_key=key)
                response = await client.aio.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                return response.text
            except APIError as e:
                if e.code == 429 or "RESOURCE_EXHAUSTED" in str(e):
                    key = self._get_next_key(key)
                else:
                    raise
            except Exception as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    key = self._get_next_key(key)
                else:
                    raise
        
        return self._heuristic_fallback(prompt)
        
    def _heuristic_fallback(self, prompt: str) -> str:
        logger.warning("All API keys exhausted. Falling back to local heuristic.")
        return '{"prediction": "High volume expected. (Heuristic Fallback)", "confidence": 0.5, "recommended_action": "Monitor closely", "wait_time_mins": 45}'

gemini_rotator = GeminiRotator()
