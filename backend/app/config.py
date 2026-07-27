from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str
    openai_api_key: str
    allowed_origins: str = "http://localhost:5173"

    class Config():
        env_file = ".env"


settings = Settings()
