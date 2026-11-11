import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// JOIN 메뉴 1: 내 공고 + 지원자수 (clubs JOIN users + 집계)
const MyClubsPage = () => {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { alert('로그인 필요'); nav('/login'); return; }
    fetch('/api/clubs/mine/list', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {});
  }, [nav]);
  return (<div><h2>내 공고 (JOIN: 개설자+지원자수)</h2>{rows.length === 0 && <p style={{ color: '#868e96' }}>등록한 공고가 없습니다.</p>}{rows.map((c) => (<div key={c.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 14, marginBottom: 8 }}><b style={{ cursor: 'pointer' }} onClick={() => nav(`/club/${c.id}`)}>{c.name}</b><p>대기 {c.pending_count} · 승인 {c.approved_count} · {c.status === 'RECRUITING' ? '모집중' : '마감'}</p><button onClick={() => nav(`/club/${c.id}/applicants`)}>지원서 보기</button></div>))}</div>);
};
export default MyClubsPage;
