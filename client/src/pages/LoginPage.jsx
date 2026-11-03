import { useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
const LoginPage = () => {
  const nav = useNavigate();
  const { setIsLoggedIn } = useOutletContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { localStorage.setItem('token', d.token); setIsLoggedIn(true); nav('/'); } else alert(d.message || '실패');
  };
  return (<form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}><h2>로그인</h2>
    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" required />
    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" required />
    <button type="submit">로그인</button><Link to="/signup">회원가입</Link></form>);
};
export default LoginPage;
