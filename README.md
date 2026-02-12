# hospital
병원 통합 서비스(나머지 리포 통합된 git)

## Docker 실행 (백엔드 + Oracle + Redis + MinIO)

### 1) 실행
```bash
docker compose up -d --build
```

### 2) 접속 정보
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/swagger-ui.html`
- Oracle XE: `localhost:1521` (service: `XEPDB1`)
  - app user: `hospital / 1111`
  - schema users: `CMH / 1111`, `LHS / 1111`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001` (`minioadmin / minioadmin123`)

### 3) 중지
```bash
docker compose down
```

### 4) DB까지 완전 초기화
```bash
docker compose down -v
```

> Oracle 초기화 SQL은 `docker/oracle/init` 하위 스크립트가 **DB 볼륨 첫 생성 시 1회** 실행됩니다.

## Docker Hub 배포/사용

### 1) 이미지 빌드 + 푸시 (개발 PC)
```bash
docker login
docker build -t <dockerhub-id>/hospital-backend:latest .
docker push <dockerhub-id>/hospital-backend:latest
```

예시:
```bash
docker build -t myid/hospital-backend:latest .
docker push myid/hospital-backend:latest
```

### 2) 집 PC에서 이미지 내려받아 실행
`docker-compose.hub.yml` 사용:
```bash
docker login
set BACKEND_IMAGE=<dockerhub-id>/hospital-backend:latest
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d
```

PowerShell이면:
```powershell
$env:BACKEND_IMAGE="<dockerhub-id>/hospital-backend:latest"
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d
```
