import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const CURRENT_YEAR = new Date().getFullYear();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

const getUserId = (req) => req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;
const signToken = (userId, email, nickname) =>
  jwt.sign({ id: userId, email, nickname }, process.env.JWT_SECRET ?? 'fallback_secret_key', { expiresIn: '7d' });

// POST /api/users/signup — bcrypt 필수
router.post('/signup', async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '');
  const nickname = String(req.body.nickname ?? '').trim();
  const phone_number = String(req.body.phone_number ?? '').replace(/\D/g, '');
  const entry_year = Number(req.body.entry_year);
  const student_id = String(req.body.student_id ?? '').trim();
  if (!email || !password || !nickname || !phone_number || !entry_year || !student_id) {
    return res.status(400).json({ message: '모든 필수 정보를 입력해 주세요.' });
  }
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.', field: 'email' });
  if (password.length < 8) return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.', field: 'password' });
  if (!PHONE_PATTERN.test(phone_number)) return res.status(400).json({ message: '올바른 휴대폰 번호 형식이 아닙니다.', field: 'phone_number' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nickname, phone_number, entry_year, student_id],
    );
    const token = signToken(result.insertId, email, nickname);
    return res.status(201).json({ message: '회원가입이 완료되었습니다.', token, user: { id: result.insertId, email, nickname } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '이미 등록된 회원 정보입니다.' });
    console.error('signup:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  try {
    const [rows] = await db.query('SELECT id, email, password, nickname FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: '등록된 회원 정보가 없습니다.' });
    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    const token = signToken(rows[0].id, rows[0].email, rows[0].nickname);
    return res.json({ message: '로그인 성공', token, user: { id: rows[0].id, email: rows[0].email, nickname: rows[0].nickname } });
  } catch (error) {
    console.error('login:', error);
    return res.status(500).json({ message: '서버 에러' });
  }
});

// GET /api/users/me — password 제외
router.get('/me', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
  const [users] = await db.query(
    'SELECT id, email, nickname, phone_number, entry_year, student_id FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  return res.json(users[0]);
});

// PUT /api/users/me — 본인확인 후 수정
router.put('/me', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const { currentPassword, nickname, phone_number, student_id } = req.body;
  if (!currentPassword) return res.status(400).json({ message: '현재 비밀번호를 입력해 주세요.' });
  const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  const ok = await bcrypt.compare(currentPassword, users[0].password);
  if (!ok) return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
  await db.query('UPDATE users SET nickname = ?, phone_number = ?, student_id = ? WHERE id = ?',
    [nickname, phone_number, student_id, userId]);
  return res.json({ message: '프로필이 수정되었습니다.' });
});

// DELETE /api/users/me — 탈퇴
router.delete('/me', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: '비밀번호를 입력해 주세요.' });
  const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
  if (users.length === 0) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  const ok = await bcrypt.compare(password, users[0].password);
  if (!ok) return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
  await db.query('DELETE FROM users WHERE id = ?', [userId]);
  return res.json({ message: '회원 탈퇴가 완료되었습니다.' });
});

export default router;
