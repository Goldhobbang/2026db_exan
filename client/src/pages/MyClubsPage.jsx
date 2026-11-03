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
  return (<div><h2>내 공고 (JOIN: 개설자+지원자수)</h2>{rows.map((c) => (<div key={c.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8 }}><b style={{ cursor: 'pointer' }} onClick={() => nav(`/club/${c.id}`)}>{c.name}</b><p>대기 {c.pending_count} · 승인 {c.approved_count} · {c.status}</p></div>))}</div>);
};
export default MyClubsPage;
