import { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
const SignupPage = () => {
  const nav = useNavigate();
  const { setIsLoggedIn } = useOutletContext();
  const [f, setF] = useState({ email: '', password: '', nickname: '', phone_number: '', entry_year: 2024, student_id: '' });
  const on = (e) => setF((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, entry_year: Number(f.entry_year) }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { localStorage.setItem('token', d.token); setIsLoggedIn(true); nav('/'); } else alert(d.message || '실패');
  };
  return (<form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}><h2>회원가입</h2>
    <input name="email" value={f.email} onChange={on} placeholder="이메일" required />
    <input name="password" type="password" value={f.password} onChange={on} placeholder="비밀번호 8자+" required />
    <input name="nickname" value={f.nickname} onChange={on} placeholder="닉네임" required />
    <input name="phone_number" value={f.phone_number} onChange={on} placeholder="010..." required />
    <input name="entry_year" type="number" value={f.entry_year} onChange={on} />
    <input name="student_id" value={f.student_id} onChange={on} placeholder="학번" required />
    <button type="submit">가입</button><Link to="/login">로그인</Link></form>);
};
export default SignupPage;
