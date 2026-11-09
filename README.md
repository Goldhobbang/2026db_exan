# 동아리 모집 (club-recruit)
동아리 모집 공고를 등록하고 지원할 수 있는 웹 앱입니다.
- client: Vite+React (5173)
- server: Express API (5001)
- DB: MySQL `club_recruit_20512` (schema: server/database/schema.sql)
## 실행
```powershell
# DB
Get-Content server/database/schema.sql -Raw | & mysql -h 127.0.0.1 -u root
# API
cd server; npm install; npm run dev
# 프론트 (새 터미널)
cd client; npm install; npm run dev
```
`server/.env`는 `.env.example` 복사 후 값 채우기.
