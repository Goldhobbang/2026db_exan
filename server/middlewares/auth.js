import jwt from 'jsonwebtoken';

// 💡 JWT 토큰 검증 미들웨어 (named export)
export const authenticateToken = (req, res, next) => {
  try {
    // 1. HTTP 헤더에서 Authorization 값 가져오기 ("Bearer <TOKEN>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. 토큰이 없는 경우 (401 Unauthorized)
    if (!token) {
      return res.status(401).json({ message: '로그인이 필요한 서비스입니다.' });
    }

    // 3. 시크릿 키 체크 (안전장치)
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error('❌ [.env 오류] JWT_SECRET 환경변수가 설정되지 않았습니다.');
      return res.status(500).json({ message: '서버 환경 설정 오류가 발생했습니다.' });
    }

    // 4. 토큰 유효성 검증
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        // 토큰이 만료되었거나 변조된 경우 (403 Forbidden)
        return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
      }

      // 5. 검증 성공 시 req.user에 사용자 정보 담아서 다음으로 전달
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('인증 미들웨어 런타임 에러:', error);
    return res.status(500).json({ message: '인증 처리 중 서버 오류가 발생했습니다.' });
  }
};