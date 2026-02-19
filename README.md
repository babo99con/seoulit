# HIS Workspace (Frontend + Backend)

병원관리 시스템(HIS) 프론트/백엔드 통합 개발 문서입니다.

## 실행 포트

- 프론트엔드(Next.js): `3001`
- 백엔드(Spring Boot in Docker): `8081`
- Oracle DB(Docker): `1521`

## 빠른 실행(통합 Docker Compose)

루트 디렉토리에서 아래 한 줄로 프론트/백엔드/DB/Redis/MinIO를 모두 실행합니다.

```bash
cd D:\portfolio-react
docker compose up -d --build
```

중지/정리는 아래 명령으로 진행합니다.

```bash
docker compose down
```

### 접속

- 로컬 브라우저: `http://localhost:3001/login`
- 같은 네트워크 다른 PC: `http://<노트북IP>:3001/login`

## 기본 계정

- 관리자: `admin / admin1234`
- 의사: `doctor / doctor1234`
- 간호: `nurse / nurse1234`
- 원무: `reception / reception1234`

## 변경 이력 (날짜별)

### 2026-02-13

- Docker 통합 실행 기준 정리(프론트/백엔드/Oracle/Redis/MinIO)
- 기본 HIS 메뉴/역할별 화면 골격(원무/의사/간호/관리) 정리
- 진료 모듈 기본 CRUD + 이력 조회 흐름 구축

### 2026-02-16

- 인증/권한 처리 보강
  - JWT 필터 개선(헤더 + 쿠키 토큰 처리)
  - 로그인/로그아웃/내 정보(`/api/auth/login`, `/logout`, `/me`) 안정화
  - 미인증 접근 시 로그인 라우팅 정리
- 회원가입 신청 + 관리자 승인 플로우 추가
  - 로그인 화면 `회원가입 신청` 모달
  - 승인 전 로그인 차단
  - 관리자 화면에서 가입 승인/반려 처리
- 소셜 가입 본인확인 흐름 도입
  - `/api/auth/oauth/{provider}/register/start`
  - OAuth 성공 시 verify token 발급/소비

### 2026-02-17

- 소셜 가입 인증 확장/환경화
  - Google 가입 인증 연동 및 콜백 안정화
  - OAuth 키 하드코딩 제거, `.env` 기반 주입으로 정리
  - `docker-compose.yml`은 변수 참조만 유지, `.env.example` 제공
- 진료 작성 UX 고도화
  - 구조화 진료기록 작성 다이얼로그
  - 빠른 템플릿/빠른 문구 칩
- 펜차트/이미지 첨부 기능 추가
  - 기본 템플릿(얼굴/상체/하체) 제공
  - 진료 중 드로잉 저장, 이미지 업로드/삭제/다운로드
  - MinIO 영구 저장 + 진료별 첨부 조회 API
  - 마이그레이션: `05_migrate_medical_encounter_asset.sql`
- 다중 진단(복수 진단코드) 지원
  - 1건 진료에 여러 진단코드 저장
  - 주진단(primary) 지정/변경
  - 진단코드 검색 API 추가: `/api/medical/encounters/diagnosis-codes`
  - 마이그레이션: `06_migrate_medical_encounter_diagnosis.sql`

## 업데이트 로그 (요약표)

| 날짜 | 추가/변경 | 이전 대비 영향 |
|---|---|---|
| 2026-02-13 | 통합 Docker 실행 구성, 역할별 기본 화면(원무/의사/간호/관리), 진료 기본 CRUD + 변경 이력 | HIS 기본 동작 가능한 초기 버전 확보 |
| 2026-02-16 | JWT 인증 안정화(헤더+쿠키), 로그인/로그아웃/내정보 정비, 회원가입 신청/관리자 승인·반려, 소셜 가입 본인확인 시작 | 단순 계정 로그인에서 운영형 가입 승인 플로우로 확장 |
| 2026-02-17 | 구글 가입 인증 안정화, OAuth 키 `.env` 전환, 구조화 진료작성 도우미, 펜차트/이미지 첨부+MinIO 영구저장, 다중 진단코드/주진단, 진단코드 검색 API | 텍스트 중심 진료에서 시각첨부+복수진단 기반 실무형 진료기록으로 고도화 |

## 현재 주요 기능

### 인증/회원

- 로그인/로그아웃/내 정보 조회
- 회원가입 신청 -> 관리자 승인/반려 -> 승인 후 로그인
- 소셜 가입 본인확인(구글 연동 완료, provider 확장 구조)

### 진료

- 진료 목록/상세/수정/비활성/활성
- 변경 이력 조회
- 펜차트/첨부 이미지 저장(진료별)
- 다중 진단코드(주진단 포함) 관리

### 원무

- 접수/이력/예약/응급/입원 화면 및 API 연동

## 운영/보안 메모

- 민감값(소셜 키, JWT 키 등)은 `.env`에서 관리하고 Git에 커밋하지 않습니다.
- 키 노출 이력이 있을 경우 즉시 재발급(rotate)하세요.
- 향후 백엔드 레플리카 확장 시 인증은 "공통 키 + Redis/DB 상태 공유" 전제로 운영합니다.

## 의사 화면 사용법

1. 로그인 후 대시보드에서 `의사` 카드 클릭
2. 진료 목록에서 환자 행 클릭
3. 우측 슬라이드 패널에서 상세 확인/수정
4. `변경 이력` 탭에서 이력 확인
5. 필요 시 비활성 처리 또는 활성 복구

## 외부 PC에서 시연할 때

같은 네트워크라면 아래처럼 접속 가능합니다.

- `http://<노트북IP>:3001`

예: `http://192.168.1.64:3001`

주의:

- 윈도우 방화벽에서 `3001`, `8081` 인바운드 허용 필요
- 백엔드는 노트북에서 Docker로 실행 중이어야 함
- 프론트는 기본적으로 백엔드 주소를 `http(s)://<현재접속호스트>:8081` 로 자동 계산
- 고정 주소가 필요하면 `.env`에 `NEXT_PUBLIC_AUTH_API_BASE_URL`, `NEXT_PUBLIC_PATIENTS_API_BASE_URL` 지정
- 첨부 파일(MinIO)까지 외부 PC에서 열려면 `.env`의 `MINIO_PUBLIC_URL`을 `http://<노트북IP>:9000` 으로 지정

### 외부 접속 체크리스트

1. `.env` 확인
   - `MINIO_PUBLIC_URL=http://<노트북IP>:9000`
   - (필요 시) `APP_OAUTH_REDIRECT_SUCCESS=http://<노트북IP>:3001/login`
   - (필요 시) `APP_OAUTH_REDIRECT_FAILURE=http://<노트북IP>:3001/login`
2. 컨테이너 재시작(백엔드 설정 반영)
   - `docker compose up -d --build backend frontend`
3. 외부 PC에서 접속
   - `http://<노트북IP>:3001/login`
4. 네이버 개발자센터 Callback URL 확인
   - `http://<노트북IP>:8081/login/oauth2/code/naver`

## 점검 명령어

```bash
# 전체 컨테이너 상태
docker ps

# 백엔드 로그
docker logs --tail 200 hospital-backend

# 프론트 로그
docker logs --tail 200 hospital-frontend

# 프론트 빌드 검증
cd D:\portfolio-react
npm run build
```

## 현재 구조

- 루트(`D:\portfolio-react`): Next.js 프론트
- 백엔드(`D:\portfolio-react\backend`): Spring Boot + Oracle/Redis/MinIO Docker 구성
