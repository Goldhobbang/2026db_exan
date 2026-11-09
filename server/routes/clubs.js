import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const getUserId = (req) => req.user?.id ?? req.user?.userId ?? req.user?.user_id ?? null;

// GET /api/clubs — 전체 공고 + 개설자 JOIN (비로그인 가능)
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let q = `SELECT c.id, c.name, c.category, c.description, c.max_members, c.status, c.location, c.created_at,
             u.nickname AS owner_nickname,
             (SELECT COUNT(*) FROM applications_20512 a WHERE a.club_id = c.id AND a.status != 'REJECTED') AS applicant_count
             FROM clubs_20512 c JOIN users_20512 u ON c.owner_id = u.id`;
    const params = [];
    if (category && category !== '전체') { q += ' WHERE c.category = ?'; params.push(category); }
    q += ' ORDER BY c.created_at DESC';
    const [rows] = await db.query(q, params);
    return res.json(rows);
  } catch (e) {
    console.error('clubs list:', e);
    return res.status(500).json({ message: '서버 에러' });
  }
});

// GET /api/clubs/mine/list — 내 공고 + 지원자수 JOIN (개설자 메뉴)
router.get('/mine/list', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: '로그인 필요' });
  const [rows] = await db.query(
    `SELECT c.*, u.nickname AS owner_nickname,
            (SELECT COUNT(*) FROM applications_20512 a WHERE a.club_id = c.id AND a.status = 'PENDING') AS pending_count,
            (SELECT COUNT(*) FROM applications_20512 a WHERE a.club_id = c.id AND a.status = 'APPROVED') AS approved_count
     FROM clubs_20512 c JOIN users_20512 u ON c.owner_id = u.id
     WHERE c.owner_id = ? ORDER BY c.created_at DESC`, [userId]);
  return res.json(rows);
});

// GET /api/clubs/:id — 상세 + 개설자 JOIN
router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.*, u.nickname AS owner_nickname, u.student_id AS owner_student_id FROM clubs_20512 c
     JOIN users_20512 u ON c.owner_id = u.id WHERE c.id = ?`, [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 공고입니다.' });
  return res.json(rows[0]);
});

// POST /api/clubs — 등록 (로그인 필수, owner는 토큰)
router.post('/', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: '로그인 필요' });
  const { name, category, description, max_members, location } = req.body;
  if (!name || !category || !location) return res.status(400).json({ message: '동아리명·분야·활동장소는 필수입니다.' });
  const [r] = await db.query(
    'INSERT INTO clubs_20512 (owner_id, name, category, description, max_members, location) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, category, description ?? '', Number(max_members) || 10, location]);
  return res.status(201).json({ message: '공고가 등록되었습니다.', clubId: r.insertId });
});

// PUT /api/clubs/:id — 개설자만 수정
router.put('/:id', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const [rows] = await db.query('SELECT owner_id FROM clubs_20512 WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 공고입니다.' });
  if (Number(rows[0].owner_id) !== Number(userId)) return res.status(403).json({ message: '개설자만 수정할 수 있습니다.' });
  const { name, category, description, max_members, status, location } = req.body;
  await db.query('UPDATE clubs_20512 SET name=?, category=?, description=?, max_members=?, status=?, location=? WHERE id = ?',
    [name, category, description, Number(max_members) || 10, status || 'RECRUITING', location, req.params.id]);
  return res.json({ message: '공고가 수정되었습니다.' });
});

// DELETE /api/clubs/:id — 개설자만 삭제
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = getUserId(req);
  const [rows] = await db.query('SELECT owner_id FROM clubs_20512 WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: '존재하지 않는 공고입니다.' });
  if (Number(rows[0].owner_id) !== Number(userId)) return res.status(403).json({ message: '개설자만 삭제할 수 있습니다.' });
  await db.query('DELETE FROM clubs_20512 WHERE id = ?', [req.params.id]);
  return res.json({ message: '공고가 삭제되었습니다.' });
});

export default router;
