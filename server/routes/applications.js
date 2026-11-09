import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const getUserId = (req) => req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

// POST /api/applications — 지원하기 (로그인 필수, 본인 공고 지원 불가)
router.post('/', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const { club_id, motive } = req.body;
  if (!club_id || !motive) return res.status(400).json({ message: '지원 동기를 입력해 주세요.' });
  const [clubs] = await db.query('SELECT owner_id FROM clubs_20512 WHERE id = ?', [club_id]);
  if (clubs.length === 0) return res.status(404).json({ message: '존재하지 않는 공고입니다.' });
  if (Number(clubs[0].owner_id) === Number(userId)) return res.status(400).json({ message: '본인 공고에는 지원할 수 없습니다.' });
  try {
    const [r] = await db.query('INSERT INTO applications_20512 (club_id, user_id, motive) VALUES (?, ?, ?)', [club_id, userId, motive]);
    return res.status(201).json({ message: '지원이 접수되었습니다.', applicationId: r.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '이미 지원한 공고입니다.' });
    throw e;
  }
});

// GET /api/applications/mine — 내 지원내역 JOIN (지원자 메뉴)
router.get('/mine', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const [rows] = await db.query(
    `SELECT a.id, a.status, a.motive, a.created_at,
            c.id AS club_id, c.name AS club_name, c.category, c.location,
            u.nickname AS owner_nickname
     FROM applications_20512 a
     JOIN clubs_20512 c ON a.club_id = c.id
     JOIN users_20512 u ON c.owner_id = u.id
     WHERE a.user_id = ? ORDER BY a.created_at DESC`, [userId]);
  return res.json(rows);
});

// GET /api/applications/club/:clubId — 공고별 지원자 목록 JOIN (개설자만)
router.get('/club/:clubId', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const [clubs] = await db.query('SELECT owner_id FROM clubs_20512 WHERE id = ?', [req.params.clubId]);
  if (clubs.length === 0) return res.status(404).json({ message: '존재하지 않는 공고입니다.' });
  if (Number(clubs[0].owner_id) !== Number(userId)) return res.status(403).json({ message: '개설자만 조회할 수 있습니다.' });
  const [rows] = await db.query(
    `SELECT a.id, a.status, a.motive, a.created_at,
            u.id AS user_id, u.nickname AS applicant_nickname, u.student_id, u.entry_year
     FROM applications_20512 a JOIN users_20512 u ON a.user_id = u.id
     WHERE a.club_id = ? ORDER BY a.created_at DESC`, [req.params.clubId]);
  return res.json(rows);
});

// PATCH /api/applications/:id — 승인/거절 (개설자만)
router.patch('/:id', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ message: 'APPROVED/REJECTED 중 선택' });
  const [rows] = await db.query(
    `SELECT c.owner_id FROM applications_20512 a JOIN clubs_20512 c ON a.club_id = c.id WHERE a.id = ?`, [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 지원서입니다.' });
  if (Number(rows[0].owner_id) !== Number(userId)) return res.status(403).json({ message: '개설자만 처리할 수 있습니다.' });
  await db.query('UPDATE applications_20512 SET status = ? WHERE id = ?', [status, req.params.id]);
  return res.json({ message: `지원서가 ${status === 'APPROVED' ? '승인' : '거절'}되었습니다.` });
});

// DELETE /api/applications/:id — 지원 취소 (지원자 본인만)
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const [rows] = await db.query('SELECT user_id FROM applications_20512 WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 지원서입니다.' });
  if (Number(rows[0].user_id) !== Number(userId)) return res.status(403).json({ message: '본인 지원서만 취소할 수 있습니다.' });
  await db.query('DELETE FROM applications_20512 WHERE id = ?', [req.params.id]);
  return res.json({ message: '지원이 취소되었습니다.' });
});

export default router;
