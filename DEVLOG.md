# 개발 일지 (DEVLOG)

> [TASKS/TASKS-01.md](TASKS/TASKS-01.md) 체크리스트를 진행하면서, 각 항목이 **무엇인지**와 **무엇을 했는지**를 기록하는 개발 일지.
> Python이 처음이라 헷갈렸던 개념 위주로, 나중에 다시 봤을 때 이해되도록 적는다.

---

## 0. 프로젝트 셋업

### Python 가상환경 생성

- What : 프로젝트 전용 독립 Python 공간
- Why : 패키지 버전 충돌 방지
- Do
  - `pyenv local 3.11.9`로 버전 고정
  - `python -m venv venv`로 생성
  - VSCode 인터프리터로 지정
- Note : `venv/`는 용량 크고 재사용 불가하므로 Git에 커밋하지 않음

### requirements.txt 초기화

- What : 프로젝트 필요 패키지·버전 목록 파일
- Why : 다른 환경에서도 동일하게 재현 설치 가능하게 하기 위함
- Do
  - `pip install fastapi "uvicorn[standard]"`로 설치
  - `pip freeze > requirements.txt`로 저장
- Note : 지금은 1차에 필요한 패키지만. LangChain/DB 등은 해당 단계에서 추가
- Spring : `pom.xml`/`build.gradle` 의존성 목록과 동일 역할

### FastAPI 기본 프로젝트 구조 생성

- What : routers/services/repositories/schemas/models/config 폴더 분리
- Why : 라우터에 비즈니스 로직이 뒤섞이지 않게 계층 분리
- Do
  - `app/` 아래 각 폴더 + `__init__.py` 생성
  - `main.py`에 최소 FastAPI 앱 + `/health` 엔드포인트 작성
- Note : 지금은 빈 껍데기. `config` 내용은 다음 항목에서 채움
- 검증 : `uvicorn app.main:app --reload` 실행 후 `/health`에서 `{"status":"ok"}` 응답 확인
- Spring : Controller-Service-Repository-DTO-Entity 계층 구조와 동일

### pydantic-settings 기반 config 모듈 작성

- What : DB 접속 정보, 혈압/혈당 기준값 등을 모아둔 `Settings` 클래스
- Why : 기준값 하드코딩 방지, 나중에 값만 바꿔서 대응 가능하게
- Do
  - `pip install pydantic-settings`
  - `app/config/settings.py`에 `Settings(BaseSettings)` 작성, `settings` 인스턴스 export
- Note : DB는 MySQL로 결정 (`mysql+pymysql://...`). 값은 하드코딩하지 않고 전부 `.env`에서만 관리 (기본값 있으면 값이 두 곳에 있어 헷갈림)
- Spring : `application.yml` + `@ConfigurationProperties`와 동일 역할

### .env, .env.example, .gitignore 작성

- What : 실제 비밀값(.env) / 값 없는 견본(.env.example) / Git 추적 제외 목록(.gitignore)
- Why : 비밀값이 Git 히스토리에 남아 유출되는 것 방지
- Do
  - 루트에 `.gitignore` 작성 (`backend/venv/`, `.env` 등 제외)
  - `backend/.env.example`, `backend/.env` 작성 (settings.py 필드에 대응하는 키)
- Note : `.env`는 Git에 안 올라가고 `.env.example`만 커밋됨
- Spring : `application-local.yml`(gitignore 대상) vs 값 없는 견본 파일 구분과 동일

### black / ruff / mypy 설정 파일 작성

- What : 포맷터(black) / 린터(ruff) / 타입 체커(mypy)
- Why : 스타일 통일, 잠재적 버그 사전 발견, 타입 힌트 검증
- Do
  - `pip install black ruff mypy`
  - `backend/pyproject.toml`에 세 도구 설정 작성
  - `black app` / `ruff check app` / `mypy app` 실행해 통과 확인
- Note : mypy가 `Settings()` 호출을 오인식해서 에러 남 → `# type: ignore[call-arg]`로 처리 (pydantic-settings의 알려진 제약)
- Spring : black=IntelliJ 자동 포맷/Spotless, ruff=Checkstyle/PMD, mypy=`javac`가 공짜로 해주는 타입 검사를 Python에서 흉내

### 자동 실행 트리거 추가 (에디터 + pre-commit)

- What : 저장 시 자동 포맷(에디터), 커밋 시 자동 검사(pre-commit)
- Why : 규칙 파일만 있으면 사람이 깜빡하고 안 돌릴 수 있음. 자동 트리거로 실수 방지
- Do
  - `.vscode/settings.json` — 인터프리터 지정, 저장 시 black 포맷 + import 정리
  - `.vscode/extensions.json` — 추천 확장(black/ruff/mypy) 목록
  - `.gitignore`에서 `.vscode/` 제외 항목 삭제 (팀 공용 설정이라 커밋해야 함)
  - `pip install pre-commit`, `.pre-commit-config.yaml` 작성
- Note : `pre-commit install`(실제 훅 연결)은 Git 저장소 초기화 이후에 진행 (git이 있어야 훅을 걸 수 있음)
- Spring : `.vscode/settings.json`은 팀 공유 IDE 설정, pre-commit은 Git 훅으로 커밋 전 강제 검사
