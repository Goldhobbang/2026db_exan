import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '로그인이 필요한 서비스입니다.' });
    }
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error('JWT_SECRET 미설정');
      return res.status(500).json({ message: '서버 환경 설정 오류가 발생했습니다.' });
    }
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('인증 미들웨어 에러:', error);
    return res.status(500).json({ message: '인증 처리 중 서버 오류가 발생했습니다.' });
  }
};
