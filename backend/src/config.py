from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Money Journey API"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
