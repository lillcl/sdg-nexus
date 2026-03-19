import os
from dotenv import load_dotenv

# Load .env from backend root
_base = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(_base, '.env'))
load_dotenv()

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "changeme-please-use-random-in-prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = ""  # Optional — leave empty to use Supabase only

    ai_provider: str = "ollama"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gpt-oss:20b"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    supabase_url: str = "https://pmqvoluuqmurruedohic.supabase.co"
    supabase_key: str = ""
    supabase_service_key: str = ""
    database_password: str = ""
    newsapi_key: str = ""

    # DeepSeek
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"

    # Google Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    # Groq (OpenAI-compatible, fast free tier)
    # Use existing OpenAI provider: set AI_PROVIDER=openai, OPENAI_BASE_URL=https://api.groq.com/openai/v1
    # OPENAI_API_KEY=gsk_... OPENAI_MODEL=llama-3.1-70b-versatile

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
