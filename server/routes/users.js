import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const CURRENT_YEAR = new Date().getFullYear();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

const DUPLICATE_MESSAGES = {
  email: '이미 가입된 이메일입니다.',
  phone_number: '이미 등록된 전화번호입니다.',
  student_id: '같은 입학년도의 학번으로 이미 가입된 계정이 있습니다.'
};

// 요청 본문을 검증하기 좋은 형태로 정리 (전화번호는 숫자만 저장)
const normalizeSignupInput = (body = {}) => {
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const nickname = String(body.nickname ?? '').trim();
  const phoneNumber = String(body.phone_number ?? '').replace(/\D/g, '');
  const entryYear = Number(body.entry_year);
  const studentId = String(body.student_id ?? '').trim();

  return { email, password, nickname, phoneNumber, entryYear, studentId };
};

// 학번은 "10315" 또는 "1-3-15" 형식을 모두 허용
const isValidStudentId = (studentId) => {
  if (!/^[0-9-]+$/.test(studentId) || studentId.length > 10) return false;
  if (/^-|-$|--/.test(studentId)) return false;

  const digits = studentId.replace(/-/g, '');
  return digits.length >= 4 && digits.length <= 10;
};

const validateSignupInput = ({ email, password, nickname, phoneNumber, entryYear, studentId }) => {
  const errors = {};

  if (!email) {
    errors.email = '이메일을 입력해 주세요.';
  } else if (email.length > 100 || !EMAIL_PATTERN.test(email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.';
  }

  if (!password) {
    errors.password = '비밀번호를 입력해 주세요.';
  } else if (password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다.';
  } else if (Buffer.byteLength(password, 'utf8') > 72) {
    errors.password = '비밀번호가 너무 깁니다. (최대 72바이트)';
  }

  if (!nickname) {
    errors.nickname = '닉네임을 입력해 주세요.';
  } else if (nickname.length < 2 || nickname.length > 20) {
    errors.nickname = '닉네임은 2자 이상 20자 이하로 입력해 주세요.';
  }

  if (!phoneNumber) {
    errors.phone_number = '전화번호를 입력해 주세요.';
  } else if (!PHONE_PATTERN.test(phoneNumber)) {
    errors.phone_number = '올바른 휴대폰 번호 형식이 아닙니다.';
  }

  if (!Number.isInteger(entryYear)) {
    errors.entry_year = '입학년도를 선택해 주세요.';
  } else if (entryYear < 1980 || entryYear > CURRENT_YEAR) {
    errors.entry_year = `입학년도는 1980년부터 ${CURRENT_YEAR}년 사이여야 합니다.`;
  }

  if (!studentId) {
    errors.student_id = '학번을 입력해 주세요.';
  } else if (!isValidStudentId(studentId)) {
    errors.student_id = '학번은 4~10자리 숫자 또는 1-3-15 형식으로 입력해 주세요.';
  }

  return errors;
};

// 중복 회원 검사 (이메일 / 전화번호 / 입학년도+학번)
const findDuplicateField = (users, { email, phoneNumber, entryYear, studentId }) => {
  if (users.some((user) => String(user.email).toLowerCase() === email)) return 'email';
  if (users.some((user) => String(user.phone_number).replace(/\D/g, '') === phoneNumber)) {
    return 'phone_number';
  }
  if (users.some((user) => Number(user.entry_year) === entryYear && user.student_id === studentId)) {
    return 'student_id';
  }
  return null;
};

// 1. 회원가입 API (가입 성공 시 자동 로그인을 위한 토큰 즉시 반환)
// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const input = normalizeSignupInput(req.body);
  const errors = validateSignupInput(input);

  if (Object.keys(errors).length > 0) {
    const firstField = Object.keys(errors)[0];
    return res.status(400).json({
      message: errors[firstField],
      field: firstField,
      errors
    });
  }

  const { email, password, nickname, phoneNumber, entryYear, studentId } = input;

  try {
    const [existingUsers] = await db.query(
      `SELECT email, phone_number, entry_year, student_id
       FROM users
       WHERE email = ? OR phone_number = ? OR (entry_year = ? AND student_id = ?)`,
      [email, phoneNumber, entryYear, studentId]
    );

    const duplicateField = findDuplicateField(existingUsers, input);
    if (duplicateField) {
      return res.status(409).json({
        message: DUPLICATE_MESSAGES[duplicateField],
        field: duplicateField,
        errors: { [duplicateField]: DUPLICATE_MESSAGES[duplicateField] }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nickname, phoneNumber, entryYear, studentId]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { userId, email, nickname },
      process.env.JWT_SECRET ?? 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: { id: userId, email, nickname }
    });

  } catch (error) {
    // 동시 가입 요청 등으로 UNIQUE 제약에 걸린 경우
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 등록된 회원 정보입니다.' });
    }
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
  }
});

// 2. 로그인 API
// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, email, password, nickname FROM users WHERE email = ?',
      [email]
    );

    // 회원이 아닌 경우 (404 상태코드 -> 프론트에서 회원가입 이동 유도)
    if (rows.length === 0) {
      return res.status(404).json({ message: '등록된 회원 정보가 없습니다.' });
    }

    const [user] = rows;
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, nickname: user.nickname },
      process.env.JWT_SECRET ?? 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: '로그인 성공',
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname }
    });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});


// 💡 authenticateToken 미들웨어 적용
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user에는 토큰 생성 시 넣었던 정보(예: { id: 1, email: '...' })가 들어있습니다.
    const userId = req.user.id; 

    const [users] = await db.query(
      'SELECT id, email, nickname, phone_number, entry_year, student_id, password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('GET /me 에러:', error);
    res.status(500).json({ message: '프로필 정보 조회 실패' });
  }
});

// 💡 2. 프로필 정보 수정 (PUT /api/users/me)
router.put('/me', authenticateToken, async (req, res) => {
  const { currentPassword, nickname, phone_number, entry_year, student_id } = req.body;
  const userId = req.user.id || req.user.userId;

  try {
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    await pool.query(
      'UPDATE users SET nickname = ?, phone_number = ?, entry_year = ?, student_id = ? WHERE id = ?',
      [nickname, phone_number, entry_year, student_id, userId]
    );

    res.json({ message: '프로필 정보가 수정되었습니다.' });
  } catch (error) {
    console.error('PUT /api/users/me 500 에러 원인:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

export default router;