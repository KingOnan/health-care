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
