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

### 2026-02-21

- 스태프 게시판(공지사항/주요일정/경조사) 백엔드 API 추가
  - 목록/검색/페이징: `GET /api/jpa/staff-board/{category}`
  - 단건 조회: `GET /api/jpa/staff-board/{category}/{id}`
  - 등록/수정/삭제: `POST|PUT|DELETE /api/jpa/staff-board/{category}`
- 게시판 DB 스키마/권한/시드 추가
  - `CMH.STAFF_BOARD_POST`, `CMH.STAFF_BOARD_POST_SEQ`
  - Oracle init 스크립트 반영:
    - `backend/docker/oracle/init/02_create_tables.sql`
    - `backend/docker/oracle/init/03_grants_to_hospital.sql`
    - `backend/docker/oracle/init/04_seed_base_data.sql`
- 스태프 보드 프론트 연동 전환(localStorage -> API)
  - 페이지: `/staff/notices`, `/staff/schedule`, `/staff/events`
  - 서버사이드 검색 + 10개 단위 페이징
  - 카드 클릭 상세 모달
  - 작성자 본인만 수정/삭제 가능
  - 삭제 PIN(4자리) 검증

### 2026-02-22

- 당직/교대표 메뉴 구조 개편
  - 사이드바에 `당직/교대표` 부모 메뉴를 두고 월간/주간/일간 하위 메뉴로 분리
  - 경로: `/board/shifts`, `/board/shifts/weekly`, `/board/shifts/daily`
- 전자결재/내부요청 사용자 동선 정리
  - 사이드바 직접 노출 제거
  - 관련 페이지 접근 시 공지 페이지로 리다이렉트 처리
- 휴가/교대 전용 DB/API 전환
  - 신규 테이블: `LEAVE_REQUEST`, `LEAVE_APPROVAL_LINE`, `SHIFT_ASSIGNMENT`
  - 마이그레이션/인덱스 스크립트 추가:
    - `backend/docker/oracle/init/09_add_indexes.sql`
    - `backend/docker/oracle/init/10_leave_shift_tables.sql`
    - `backend/docker/oracle/init/11_migrate_leave_shift_from_board.sql`
- 샘플 데이터/운영 규칙 반영
  - 2026-02-01 ~ 2026-03-07 구간에서 NIGHT=의사, DAY=간호 규칙으로 재시드
  - 임상 인력(의사/간호) 한국어 샘플 계정 추가
- 실행 안정화 점검
  - 루트 compose 기준 `docker compose up -d --build`로 서비스 재기동
  - 누락되었던 감사 로그 객체(`STAFF_AUDIT_LOG_SEQ` 등) 존재 여부 점검

## 업데이트 로그 (요약표)

| 날짜 | 추가/변경 | 이전 대비 영향 |
|---|---|---|
| 2026-02-13 | 통합 Docker 실행 구성, 역할별 기본 화면(원무/의사/간호/관리), 진료 기본 CRUD + 변경 이력 | HIS 기본 동작 가능한 초기 버전 확보 |
| 2026-02-16 | JWT 인증 안정화(헤더+쿠키), 로그인/로그아웃/내정보 정비, 회원가입 신청/관리자 승인·반려, 소셜 가입 본인확인 시작 | 단순 계정 로그인에서 운영형 가입 승인 플로우로 확장 |
| 2026-02-17 | 구글 가입 인증 안정화, OAuth 키 `.env` 전환, 구조화 진료작성 도우미, 펜차트/이미지 첨부+MinIO 영구저장, 다중 진단코드/주진단, 진단코드 검색 API | 텍스트 중심 진료에서 시각첨부+복수진단 기반 실무형 진료기록으로 고도화 |
| 2026-02-21 | 스태프 게시판 3종(공지/일정/경조사) API+DB+프론트 연동, 서버 검색/페이징, 카드 클릭 상세 모달, 소유자 수정/삭제 및 삭제 PIN | 데모용 정적 게시판에서 운영형 게시판 워크플로우로 전환 |
| 2026-02-22 | 당직/교대표 메뉴를 월간·주간·일간으로 재구성, 전자결재/내부요청 동선 정리, 휴가·교대 전용 DB/API 도입, 샘플 시프트 재시드, 도커 컴포즈 재기동 및 감사 로그 객체 점검 | 게시판 기반 임시 처리에서 전용 근무표/휴가 구조로 전환하고 운영 안정성 확보 |

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

### 스태프 게시판

- 공지사항/주요일정/경조사 목록 조회(검색/페이징)
- 카드 클릭 상세 모달 조회
- 등록/수정/삭제(본인 작성글 기준)
- 삭제 시 4자리 PIN 확인

## 운영/보안 메모

- 민감값(소셜 키, JWT 키 등)은 `.env`에서 관리하고 Git에 커밋하지 않습니다.
- 키 노출 이력이 있을 경우 즉시 재발급(rotate)하세요.
- 향후 백엔드 레플리카 확장 시 인증은 "공통 키 + Redis/DB 상태 공유" 전제로 운영합니다.

## Git 커밋/푸시 정책 메모

- 로컬 산출물/개인 로그/쿠키 파일은 커밋하지 않습니다.
- 잠금파일 정책(현재 저장소 기준): `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` 커밋 제외
- 제외 패턴은 루트 `.gitignore`를 기준으로 관리합니다.

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
