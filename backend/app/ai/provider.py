from abc import ABC, abstractmethod
from typing import AsyncGenerator
from app.core.config import settings

class AIProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, system: str = "") -> str:
        pass

    @abstractmethod
    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        pass


# ── Ollama (local, default) ───────────────────────────────────────────
class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model

    async def generate(self, prompt: str, system: str = "") -> str:
        import httpx
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": False}
            )
            r.raise_for_status()
            return r.json()["message"]["content"]

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        import httpx, json
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST", f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": True}
            ) as r:
                async for line in r.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            chunk = data.get("message", {}).get("content", "")
                            if chunk:
                                yield chunk
                        except Exception:
                            continue


# ── OpenAI (also works with any OpenAI-compatible API) ───────────────
class OpenAIProvider(AIProvider):
    """
    Works with:
      - OpenAI: set OPENAI_API_KEY, OPENAI_MODEL=gpt-4o-mini (or any model)
      - OpenAI-compatible APIs (LM Studio, vLLM, Together, etc.):
          set OPENAI_BASE_URL=http://localhost:1234/v1
          set OPENAI_MODEL=<model-name>
    """
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        self.base_url = settings.openai_base_url

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _body(self, prompt: str, system: str, stream: bool):
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return {"model": self.model, "messages": messages, "stream": stream}

    async def generate(self, prompt: str, system: str = "") -> str:
        import httpx
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=self._body(prompt, system, stream=False),
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        import httpx, json
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=self._headers(),
                json=self._body(prompt, system, stream=True),
            ) as r:
                async for line in r.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(payload)
                        chunk = data["choices"][0]["delta"].get("content", "")
                        if chunk:
                            yield chunk
                    except Exception:
                        continue


# ── Anthropic ────────────────────────────────────────────────────────
class AnthropicProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.anthropic_api_key
        self.model = settings.anthropic_model

    def _headers(self):
        return {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }

    async def generate(self, prompt: str, system: str = "") -> str:
        import httpx
        body = {"model": self.model, "max_tokens": 2048, "messages": [{"role": "user", "content": prompt}]}
        if system:
            body["system"] = system
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post("https://api.anthropic.com/v1/messages", headers=self._headers(), json=body)
            r.raise_for_status()
            return r.json()["content"][0]["text"]

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        import httpx, json
        body = {"model": self.model, "max_tokens": 2048, "stream": True, "messages": [{"role": "user", "content": prompt}]}
        if system:
            body["system"] = system
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream("POST", "https://api.anthropic.com/v1/messages", headers=self._headers(), json=body) as r:
                async for line in r.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    try:
                        data = json.loads(line[6:])
                        if data.get("type") == "content_block_delta":
                            chunk = data.get("delta", {}).get("text", "")
                            if chunk:
                                yield chunk
                    except Exception:
                        continue


# [factory moved to bottom]


# ── DeepSeek (OpenAI-compatible API) ─────────────────────────────────
class DeepSeekProvider(AIProvider):
    """
    DeepSeek chat API — OpenAI-compatible.
    Set DEEPSEEK_API_KEY and optionally DEEPSEEK_MODEL (default: deepseek-chat)
    """
    def __init__(self):
        self.api_key = settings.deepseek_api_key
        self.model = settings.deepseek_model
        self.base_url = "https://api.deepseek.com/v1"

    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    def _body(self, prompt: str, system: str, stream: bool):
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        return {"model": self.model, "messages": messages, "stream": stream}

    async def generate(self, prompt: str, system: str = "") -> str:
        import httpx
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(f"{self.base_url}/chat/completions",
                headers=self._headers(), json=self._body(prompt, system, False))
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        import httpx, json
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream("POST", f"{self.base_url}/chat/completions",
                headers=self._headers(), json=self._body(prompt, system, True)) as r:
                async for line in r.aiter_lines():
                    if not line or not line.startswith("data: "): continue
                    payload = line[6:]
                    if payload.strip() == "[DONE]": break
                    try:
                        data = json.loads(payload)
                        chunk = data["choices"][0]["delta"].get("content", "")
                        if chunk: yield chunk
                    except Exception: continue


# ── Google Gemini ────────────────────────────────────────────────────
class GeminiProvider(AIProvider):
    """
    Google Gemini via Generative Language REST API.
    Set GEMINI_API_KEY and optionally GEMINI_MODEL (default: gemini-1.5-flash)
    """
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self._base = "https://generativelanguage.googleapis.com/v1beta/models"

    def _url(self, stream: bool) -> str:
        action = "streamGenerateContent" if stream else "generateContent"
        return f"{self._base}/{self.model}:{action}?key={self.api_key}"

    def _body(self, prompt: str, system: str) -> dict:
        body: dict = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}
        if system:
            body["systemInstruction"] = {"parts": [{"text": system}]}
        return body

    async def generate(self, prompt: str, system: str = "") -> str:
        import httpx
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(self._url(False), json=self._body(prompt, system))
            r.raise_for_status()
            return r.json()["candidates"][0]["content"]["parts"][0]["text"]

    async def stream(self, prompt: str, system: str = "") -> AsyncGenerator[str, None]:
        import httpx, json
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream("POST", self._url(True) + "&alt=sse",
                    json=self._body(prompt, system)) as r:
                async for line in r.aiter_lines():
                    if not line or not line.startswith("data: "): continue
                    try:
                        data = json.loads(line[6:])
                        chunk = data["candidates"][0]["content"]["parts"][0]["text"]
                        if chunk: yield chunk
                    except Exception: continue


# ── Updated Factory ───────────────────────────────────────────────────
def get_ai_provider() -> AIProvider:
    p = settings.ai_provider.lower()
    if p == "openai":     return OpenAIProvider()
    elif p == "anthropic": return AnthropicProvider()
    elif p == "deepseek":  return DeepSeekProvider()
    elif p == "gemini":    return GeminiProvider()
    else:                  return OllamaProvider()

ai = get_ai_provider()
