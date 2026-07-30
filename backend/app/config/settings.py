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

    # JWT 인증
    jwt_secret_key: str
    jwt_algorithm: str
    jwt_access_token_expire_minutes: int

    # CORS 허용 origin (쉼표로 여러 개 구분 가능)
    cors_allowed_origins: str

    # 업로드 파일(사진 등) 저장 경로
    upload_dir: str


settings = Settings()  # type: ignore[call-arg]  # 값은 .env에서 자동으로 채워짐
