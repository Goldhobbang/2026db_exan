import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
// JOIN 메뉴 3: 공고별 지원서 조회 (applications JOIN users) + 승인/거절
const LABEL = { PENDING: '대기', APPROVED: '승인', REJECTED: '거절' };
const ClubApplicantsPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');
  const load = () => {
    if (!token) { alert('로그인 필요'); nav('/login'); return; }
    fetch(`/api/applications/club/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => { const d = await r.json().catch(() => []); if (r.ok) { setRows(Array.isArray(d) ? d : []); setMsg(''); } else setMsg(d.message || '조회 실패'); })
      .catch(() => setMsg('조회 실패'));
  };
  useEffect(load, [id]);
  const decide = async (appId, status) => {
    const res = await fetch(`/api/applications/${appId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    const d = await res.json().catch(() => ({}));
    alert(d.message || (res.ok ? '처리 완료' : '실패'));
    if (res.ok) load();
  };
  return (<div>
    <h2>지원서 조회</h2>
    {msg && <p style={{ color: '#e03131' }}>{msg}</p>}
    {!msg && rows.length === 0 && <p style={{ color: '#868e96' }}>아직 들어온 지원서가 없습니다.</p>}
    {rows.map((a) => (<Card key={a.id}>
      <Top><b>{a.applicant_nickname}</b><Badge $s={a.status}>{LABEL[a.status] || a.status}</Badge></Top>
      <Sub>학번 {a.student_id} · {a.entry_year}년 입학 · {new Date(a.created_at).toLocaleString('ko-KR')}</Sub>
      <p>{a.motive}</p>
      {a.status === 'PENDING' && (<Btns><button onClick={() => decide(a.id, 'APPROVED')}>승인</button><button className="ghost" onClick={() => decide(a.id, 'REJECTED')}>거절</button></Btns>)}
    </Card>))}
  </div>);
};
export default ClubApplicantsPage;
const Card = styled.div`background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 14px; margin-bottom: 8px; p { margin: 8px 0; }`;
const Top = styled.div`display: flex; justify-content: space-between; align-items: center;`;
const Sub = styled.span`color: #868e96; font-size: 13px;`;
const Badge = styled.span`font-size: 12px; padding: 2px 8px; border-radius: 10px; color: #fff; background: ${(p) => (p.$s === 'APPROVED' ? '#2f9e44' : p.$s === 'REJECTED' ? '#e03131' : '#868e96')};`;
const Btns = styled.div`display: flex; gap: 8px; .ghost { background: #fff; color: #e03131; border-color: #e03131; }`;
