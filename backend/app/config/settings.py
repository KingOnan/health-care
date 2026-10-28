from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # DB
    database_url: str
    database_echo: bool = False  # True면 실행되는 모든 SQL을 로그에 출력 (개발용)

    # 타임존 (날짜 판정은 항상 KST 고정)
    timezone: str

    # 혈압 판정 기준 (mmHg) — 저혈압 경계 / 정상 상한 / 주의 상한
    blood_pressure_systolic_low_boundary: int
    blood_pressure_diastolic_low_boundary: int
    blood_pressure_systolic_normal_max: int
    blood_pressure_diastolic_normal_max: int
    blood_pressure_systolic_caution_max: int
    blood_pressure_diastolic_caution_max: int

    # 혈당 판정 기준 (mg/dL) — 저혈당 경계(공복·식후 공통) / 정상 상한 / 주의 상한
    blood_sugar_low_boundary: int
    blood_sugar_fasting_normal_max: int
    blood_sugar_post_meal_normal_max: int
    blood_sugar_fasting_caution_max: int
    blood_sugar_post_meal_caution_max: int

    # JWT 인증
    jwt_secret_key: str
    jwt_algorithm: str
    jwt_access_token_expire_minutes: int

    # CORS 허용 origin (쉼표로 여러 개 구분 가능)
    cors_allowed_origins: str

    # 업로드 파일(사진 등) 저장 경로
    upload_dir: str

    # 공공데이터 API 키 — 공공데이터포털(의약품 허가정보) / 식품안전나라(건강기능식품 품목분류정보)
    data_go_kr_api_key: str
    food_safety_api_key: str


settings = Settings()  # type: ignore[call-arg]  # 값은 .env에서 자동으로 채워짐
