import json
import re
import httpx
from typing import Any, Dict
from app.config import settings

class OllamaService:
    def __init__(self, base_url: str | None = None, model: str | None = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.model = model or settings.ollama_model
        self.timeout = settings.request_timeout_seconds

    async def get_status(self) -> Dict[str, Any]:
        """
        Checks Ollama reachability and whether the target model is installed.
        Returns status dictionary: ready, model_missing, or unreachable.
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code != 200:
                    return {
                        "status": "unreachable",
                        "model": self.model,
                        "base_url": self.base_url,
                        "message": f"Ollama returned HTTP status {res.status_code}.",
                        "install_command": None,
                    }
                data = res.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                
                # Check model presence (exact match or prefix match like gemma4:e2b vs gemma4:e2b:latest)
                model_found = any(
                    self.model == m or self.model in m or m.startswith(self.model)
                    for m in models
                )
                if model_found:
                    return {
                        "status": "ready",
                        "model": self.model,
                        "base_url": self.base_url,
                        "message": f"Ollama is online and model '{self.model}' is available.",
                        "install_command": None,
                    }
                else:
                    return {
                        "status": "model_missing",
                        "model": self.model,
                        "base_url": self.base_url,
                        "message": f"Ollama is running, but model '{self.model}' is not installed.",
                        "install_command": f"ollama pull {self.model}",
                    }
        except Exception as e:
            return {
                "status": "unreachable",
                "model": self.model,
                "base_url": self.base_url,
                "message": f"Could not connect to Ollama at {self.base_url}. Ensure Ollama is running.",
                "install_command": None,
            }

    @staticmethod
    def clean_json_response(raw_text: str) -> str:
        """Strip markdown code fences and unnecessary whitespace from raw model response."""
        text = raw_text.strip()
        # Remove ```json and ``` fences if present
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fence_match:
            return fence_match.group(1).strip()
        return text

    async def chat_json(self, prompt: str, retry_on_invalid: bool = True) -> Dict[str, Any]:
        """
        Sends a single chat completion request to Ollama with format='json' and stream=False.
        Retries once if the model output fails JSON parsing.
        """
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.1
            }
        }

        async def _call() -> str:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/chat", json=payload)
                if res.status_code != 200:
                    raise RuntimeError(f"Ollama error: HTTP {res.status_code} - {res.text}")
                data = res.json()
                msg = data.get("message", {}).get("content", "")
                return msg

        try:
            content = await _call()
            cleaned = self.clean_json_response(content)
            return json.loads(cleaned)
        except Exception as first_err:
            if not retry_on_invalid:
                raise ValueError(f"Failed to generate valid JSON from model: {str(first_err)}")
            
            # Retry once with a stricter correction prompt
            correction_prompt = f"{prompt}\n\nIMPORTANT: The previous output was invalid JSON. Return ONLY the strict JSON object. No other text."
            payload["messages"] = [{"role": "user", "content": correction_prompt}]
            try:
                content = await _call()
                cleaned = self.clean_json_response(content)
                return json.loads(cleaned)
            except Exception as second_err:
                raise ValueError(
                    f"Model output validation failed after retry. Details: {str(second_err)}"
                )

ollama_service = OllamaService()
