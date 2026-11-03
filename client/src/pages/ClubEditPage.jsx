import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
const ClubEditPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', category: '코딩', description: '', max_members: 10, status: 'RECRUITING', location: '' });
  useEffect(() => { fetch(`/api/clubs/${id}`).then((r) => r.json()).then((c) => setF({ name: c.name || '', category: c.category || '코딩', description: c.description || '', max_members: c.max_members || 10, status: c.status || 'RECRUITING', location: c.location || '' })).catch(() => {}); }, [id]);
  const on = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clubs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...f, max_members: Number(f.max_members) }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { alert('수정 완료'); nav(`/club/${id}`); } else alert(d.message || '실패');
  };
  return (<form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><h2>공고 수정 (개설자만)</h2>
    <input name="name" value={f.name} onChange={on} required />
    <input name="location" value={f.location} onChange={on} required />
    <select name="status" value={f.status} onChange={on}><option value="RECRUITING">모집중</option><option value="CLOSED">마감</option></select>
    <textarea name="description" value={f.description} onChange={on} />
    <button type="submit">저장</button></form>);
};
export default ClubEditPage;
