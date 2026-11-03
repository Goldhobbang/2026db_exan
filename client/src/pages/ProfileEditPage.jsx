import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const ProfileEditPage = ({ setIsLoggedIn }) => {
  const nav = useNavigate();
  const [p, setP] = useState({ email: '', nickname: '', phone_number: '', entry_year: '', student_id: '', currentPassword: '' });
  const [withdrawPw, setWithdrawPw] = useState('');
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { nav('/login'); return; }
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then((d) => setP((prev) => ({ ...prev, ...d }))).catch(() => {});
  }, [nav]);
  const on = (e) => setP((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword: p.currentPassword, nickname: p.nickname, phone_number: p.phone_number, student_id: p.student_id }) });
    const d = await res.json().catch(() => ({}));
    alert(d.message || (res.ok ? '수정 완료' : '실패'));
    if (res.ok) nav('/');
  };
  const withdraw = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/me', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ password: withdrawPw }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { alert('탈퇴 완료'); localStorage.clear(); setIsLoggedIn(false); nav('/', { replace: true }); } else alert(d.message || '실패');
  };
  return (<div><form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}><h2>프로필 수정</h2>
    <input value={p.email} disabled /><input value={p.entry_year} disabled />
    <input name="nickname" value={p.nickname} onChange={on} required />
    <input name="phone_number" value={p.phone_number} onChange={on} required />
    <input name="student_id" value={p.student_id} onChange={on} required />
    <input name="currentPassword" type="password" value={p.currentPassword} onChange={on} placeholder="현재 비밀번호" required />
    <button type="submit">저장</button></form>
    <button onClick={() => setShowModal(true)} style={{ marginTop: 16 }}>회원 탈퇴</button>
    {showModal && (<div><input type="password" value={withdrawPw} onChange={(e) => setWithdrawPw(e.target.value)} placeholder="비밀번호" /><button onClick={withdraw}>탈퇴하기</button><button onClick={() => setShowModal(false)}>취소</button></div>)}</div>);
};
export default ProfileEditPage;
