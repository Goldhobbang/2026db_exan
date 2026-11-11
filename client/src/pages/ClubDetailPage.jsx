import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
const ClubDetailPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [motive, setMotive] = useState('');
  useEffect(() => { fetch(`/api/clubs/${id}`).then((r) => r.json()).then(setC).catch(() => {}); }, [id]);
  const apply = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('로그인 필요'); nav('/login'); return; }
    const res = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ club_id: id, motive }) });
    const d = await res.json().catch(() => ({}));
    alert(d.message || (res.ok ? '지원 완료' : '실패'));
  };
  const remove = async () => {
    if (!confirm('삭제할까요?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/clubs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { alert('삭제 완료'); nav('/'); } else alert(d.message || '실패');
  };
  if (!c) return <p>불러오는 중...</p>;
  return (<div><h2>{c.name}</h2><p style={{ color: '#868e96' }}>{c.category} · {c.owner_nickname} · {c.location} · {c.status === 'RECRUITING' ? '모집중' : '마감'}</p><p>{c.description}</p>
    <input value={motive} onChange={(e) => setMotive(e.target.value)} placeholder="지원 동기" style={{ marginTop: 8 }} />
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button onClick={apply}>지원하기</button><button onClick={() => nav(`/club/${id}/applicants`)}>지원서 보기</button><button onClick={() => nav(`/club/${id}/edit`)}>수정</button><button onClick={remove}>삭제</button></div></div>);
};
export default ClubDetailPage;
