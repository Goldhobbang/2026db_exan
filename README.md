# 동아리 모집 (club-recruit)
school_market 구조 참고, 주제는 동아리 모집+지원으로 새로 작성.
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
