import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ProfileEditPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    email: '',
    currentPassword: '', // 사용자가 입력하는 비밀번호
    dbPassword: '',      // DB에서 가져온 기존 비밀번호 (비교용)
    nickname: '',
    phone_number: '',
    entry_year: '',
    student_id: '',
  });

  const [loading, setLoading] = useState(true);

  // 1. 기존 프로필 정보 불러오기 (GET /api/users/me)
  useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 💡 404/500/502 에러 시 json() 실패로 인한 Crash 예방
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || `요청 실패 (상태 코드: ${response.status})`);
        return;
      }

      const data = await response.json();
      setProfile((prev) => ({
        ...prev,
        email: data.email || '',
        dbPassword: data.password || '',
        nickname: data.nickname || '',
        phone_number: data.phone_number || '',
        entry_year: data.entry_year || '',
        student_id: data.student_id || '',
      }));
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [navigate]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 비밀번호 일치 여부 확인 (DB 비밀번호가 평문이거나 암호화 비교를 프론트에서 단순 체크할 때)
  // 💡 백엔드가 암호화된 비밀번호를 반환하지 않는 경우, 입력값이 존재하는지 여부로 체크할 수 있습니다.
  const isPasswordMatch = profile.currentPassword !== '' && profile.currentPassword === profile.dbPassword;

  // 2. 프로필 수정 저장 제출 (PUT /api/users/me)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordMatch) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: profile.currentPassword,
          nickname: profile.nickname,
          phone_number: profile.phone_number,
          student_id: profile.student_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('프로필 정보가 성공적으로 수정되었습니다!');
        navigate('/');
      } else {
        alert(data.message || '수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <LoadingText>프로필 정보를 불러오는 중...</LoadingText>;
  }

  return (
    <Container>
      <Title>프로필 수정</Title>
      
      <Form onSubmit={handleSubmit}>
        {/* 학교 이메일 (수정 불가 - 읽기 전용) */}
        <FormGroup>
          <Label>학교 이메일 (수정 불가)</Label>
          <DisabledInput value={profile.email} disabled />
        </FormGroup>

        {/* 입학년도 (수정 불가 - 읽기 전용) & 학번 (수정 가능) */}
        <RowGroup>
          <FormGroup>
            <Label>입학년도 (수정 불가)</Label>
            <DisabledInput value={profile.entry_year ? `${profile.entry_year}년 입학` : ''} disabled />
          </FormGroup>

          <FormGroup>
            <Label>학번</Label>
            <Input
              name="student_id"
              value={profile.student_id}
              onChange={handleChange}
              placeholder="학번 (예: 10315)"
              required
            />
          </FormGroup>
        </RowGroup>

        {/* 닉네임 (수정 가능) */}
        <FormGroup>
          <Label>닉네임</Label>
          <Input
            name="nickname"
            value={profile.nickname}
            onChange={handleChange}
            placeholder="닉네임을 입력하세요"
            required
          />
        </FormGroup>

        {/* 전화번호 (수정 가능) */}
        <FormGroup>
          <Label>전화번호</Label>
          <Input
            name="phone_number"
            value={profile.phone_number}
            onChange={handleChange}
            placeholder="전화번호를 입력하세요"
            required
          />
        </FormGroup>

        {/* 본인 확인용 비밀번호 */}
        <FormGroup>
          <Label>현재 비밀번호 (본인 확인)</Label>
          <Input
            type="password"
            name="currentPassword"
            value={profile.currentPassword}
            onChange={handleChange}
            placeholder="현재 비밀번호를 입력하세요"
            required
          />
          {profile.currentPassword && !isPasswordMatch && (
            <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>
          )}
        </FormGroup>

        {/* 비밀번호가 일치할 때만 버튼 활성화 */}
        <SubmitButton type="submit" disabled={!isPasswordMatch}>
          수정사항 저장
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default ProfileEditPage;

// 🎨 styled-components
const Container = styled.div`
  padding: 40px 20px;
  max-width: 440px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 28px;
  color: #212529;
  text-align: center;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 60px 0;
  color: #868e96;
  font-size: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const RowGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #495057;
`;

const Input = styled.input`
  padding: 12px 14px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #FF6F0F;
  }
`;

const DisabledInput = styled.input`
  padding: 12px 14px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f8f9fa;
  color: #495057;
  cursor: not-allowed;
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: #e03131;
  margin-top: 2px;
`;

const SubmitButton = styled.button`
  padding: 14px;
  background-color: ${(props) => (props.disabled ? '#ced4da' : '#FF6F0F')};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  margin-top: 10px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? '#ced4da' : '#e55e00')};
  }
`;