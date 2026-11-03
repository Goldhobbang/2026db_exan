import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const ClubCreatePage = () => {
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', category: '코딩', description: '', max_members: 10, location: '' });
  const on = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { alert('로그인 필요'); nav('/login'); return; }
    const res = await fetch('/api/clubs', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...f, max_members: Number(f.max_members) }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { alert('등록 완료'); nav('/'); } else alert(d.message || '실패');
  };
  return (<form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <h2>공고 등록 (로그인 필수)</h2>
    <input name="name" value={f.name} onChange={on} placeholder="동아리명" required />
    <select name="category" value={f.category} onChange={on}>{['운동', '음악', '코딩', '미술', '봉사', '기타'].map((c) => <option key={c} value={c}>{c}</option>)}</select>
    <textarea name="description" value={f.description} onChange={on} placeholder="소개" />
    <input name="max_members" type="number" min="1" value={f.max_members} onChange={on} />
    <input name="location" value={f.location} onChange={on} placeholder="활동 장소" required />
    <button type="submit">등록</button></form>);
};
export default ClubCreatePage;
