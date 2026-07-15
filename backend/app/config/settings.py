from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # DB
    database_url: str

    # 타임존 (날짜 판정은 항상 KST 고정)
    timezone: str

    # 혈압 정상 기준 (mmHg)
    blood_pressure_systolic_normal_max: int
    blood_pressure_diastolic_normal_max: int

    # 혈당 정상 기준 (mg/dL)
    blood_sugar_fasting_normal_max: int
    blood_sugar_post_meal_normal_max: int


settings = Settings()  # type: ignore[call-arg]  # 값은 .env에서 자동으로 채워짐
