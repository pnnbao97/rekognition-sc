from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    aws_access_key_id: str
    aws_secret_access_key: str
    api_upload_url: str
    api_status_url: str
    aws_region: str = "ap-southeast-1"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache
def get_settings():
    return Settings()