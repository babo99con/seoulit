# HIS Workspace (Frontend + Backend)

병원관리 시스템(HIS) 프론트/백엔드 통합 개발 문서입니다.

## 실행 포트

- 프론트엔드(Next.js): `3001`
- 백엔드(Spring Boot in Docker): `8081`
- Oracle DB(Docker): `1521`

## 빠른 실행(초보자용)

### 1) 백엔드/DB 실행

```bash
cd D:\portfolio-react\backend
docker compose up -d --build
```

### 2) 프론트 실행

```bash
cd D:\portfolio-react
npm install
npm run dev
```

### 3) 접속

- 브라우저: `http://localhost:3001/login`

## 기본 계정

- 관리자: `admin / admin1234`
- 의사: `doctor / doctor1234`
- 간호: `nurse / nurse1234`
- 원무: `reception / reception1234`

## 이번 작업 핵심 반영 내용

### 1) 인증/권한

- JWT 로그인/인증 흐름 정리
- 로그인 없이 직접 URL 접근 시 로그인 페이지로 리다이렉트
- 역할 기반 API 권한 적용(의사/간호/관리자 등)

### 2) 원무(접수) 기능

- 접수 목록/상세/수정/이력/예약/응급/입원 흐름 정비
- CORS 및 API 연동 안정화

### 3) 진료 기능(신규 강화)

- 진료 목록 조회
- 진료 단건 조회
- 진료 수정
- 진료 비활성 처리/활성 복구
- 진료 변경 이력 조회

### 4) UI/UX 개선

- 네이브바/사이드바 단순화
- 사이드바 접기/펼치기 토글 추가
- 진료 상세를 우측 슬라이드 패널로 전환
- 진료 상세 탭(진료 상세 / 변경 이력) 분리
- 목록 화면에 실무형 정보(요약 카드, 상태 칩, 정렬 옵션) 추가

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

## 점검 명령어

```bash
# 백엔드 컨테이너 상태
docker ps

# 백엔드 로그
docker logs --tail 200 hospital-backend

# 프론트 빌드 검증
cd D:\portfolio-react
npm run build
```

## 현재 구조

- 루트(`D:\portfolio-react`): Next.js 프론트
- 백엔드(`D:\portfolio-react\backend`): Spring Boot + Oracle/Redis/MinIO Docker 구성
