import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// JOIN 메뉴 2: 내 지원내역 (applications JOIN clubs JOIN users)
const MyApplicationsPage = () => {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const load = () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('로그인 필요'); nav('/login'); return; }
    fetch('/api/applications/mine', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {});
  };
  useEffect(load, [nav]);
  const cancel = async (id) => {
    if (!confirm('취소할까요?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { alert('취소 완료'); load(); } else alert('실패');
  };
  return (<div><h2>내 지원내역 (JOIN: 지원+공고+개설자)</h2>{rows.map((a) => (<div key={a.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8 }}><b>{a.club_name}</b><p>{a.owner_nickname} · {a.category} · {a.status}</p><p>{a.motive}</p><button onClick={() => cancel(a.id)}>지원 취소</button></div>))}</div>);
};
export default MyApplicationsPage;
