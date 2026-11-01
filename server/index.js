import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';                // 파일 및 폴더 경로를 안전하게 조작하는 Node.js 내장 모듈
import { fileURLToPath } from 'url';    // URL 형식의 경로를 OS(윈도우, 리눅스, 맥)에 맞는 일반 파일 경로 형식으로 바꿔주는 함수
import usersRouter from './routes/users.js';
import productsRouter from './routes/products.js';

const __filename = fileURLToPath(import.meta.url);  // 현재 실행 중인 파일의 URL 경로를 가져와서 실제 운영체제에서 사용하는 절대 경로로 변환함
const __dirname = path.dirname(__filename);         // 전체 파일 경로에서 파일 이름을 떼어내고, 파일이 속한 폴더(디렉터리)의 절대 경로만 추출하여 __dirname 변수에 저장

// 환경변수 및 Express 앱 초기화
dotenv.config();                                    // .env 파일에 저장된 설정값들을 process.env로 불러옵
const app = express();
const PORT = process.env.PORT;                      // .env 파일에 PORT 지정이 없으면 기본값 5000번 포트를 사용하도록 우선순위를 부여함

// 미들웨어 설정                                                         : 클라이언트의 요청이 들어왔을 때 목적지로 가기 전, 중간에서 검사·번역·인증을 대신 처리하는 일을 함
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));  // 앱을 실제 운영 서버에 배포할 때는 Vite 개발 서버의 프록시 기능을 사용할 수 없으므로 실제 배포시 React(Vite 기본 포트 5173)에서의 API 요청 승인이 필요함
app.use(express.json());                                                // React에서 보내는 JSON 형태의 요청 본문(req.body)을 백엔드에서 파싱할 수 있게 해줌  
app.use(express.urlencoded({ extended: true }));                        // HTML Form 태그 방식으로 제출되는 데이터도 함께 해석할 수 있도록 설정함
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));   // 업로드된 이미지를 웹 브라우저에서 읽을 수 있게 공개 static 설정

// 기본 루트 엔드포인트                                      : 브라우저 주소창에 http://localhost:5000 를 입력하고 엔터. Backend Server is running... 가 보이면 서버가 성공적으로 실행됨
app.get('/', (req, res) => {
  res.send('Backend Server is running...');
});

// 라우터 등록
app.use('/api/users', usersRouter);     // /api/users/login, /api/users/signup
app.use('/api/products', productsRouter); // /api/products, /api/products/:id

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});