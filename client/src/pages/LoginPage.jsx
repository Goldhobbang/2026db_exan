import {useState} from 'react'
import styled from 'styled-components';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn } = useOutletContext(); // Layout에서 전달된 상태 변경 함수
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = location.state?.redirectTo || '/';

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsLoggedIn(true); // 전역 로그인 상태 변경
        alert('로그인되었습니다.');
        navigate(redirectTo);
      } else {
        // 💡 1. 백엔드 응답 메시지에 '등록' 또는 '존재하지' 않는 회원이라는 문구가 포함되어 있거나 
        // 💡 2. 특정 status(예: 404)일 때 회원가입 페이지로 이동 처리
        if (response.status === 404 || data.message?.includes('등록') || data.message?.includes('존재')) {
          alert('등록된 회원이 없습니다. 회원가입 페이지로 이동합니다.');
          navigate('/signup'); // 👈 회원가입 라우트 경로로 이동
        } else {
          alert(data.message || '로그인 실패');
        }
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      alert('서버 통신 중 에러가 발생했습니다.');
    }
  };

  return (
    <Container>
      <Title>로그인</Title>
      <Form onSubmit={handleLogin}>
        <Input 
          type="email" 
          placeholder="학교 이메일 입력" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Input 
          type="password" 
          placeholder="비밀번호 입력" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <SubmitButton type="submit">로그인</SubmitButton>
      </Form>
    </Container>
  );
};

export default LoginPage;

// 🎨 styled-components 정의
const Container = styled.div`
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #212529;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  padding: 14px;
  background-color: #FF6F0F;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
`;