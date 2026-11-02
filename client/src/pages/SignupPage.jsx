import { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

const isValidStudentId = (studentId) => {
  if (!/^[0-9-]+$/.test(studentId) || studentId.length > 10) return false;
  if (/^-|-$|--/.test(studentId)) return false;

  const digits = studentId.replace(/-/g, '');
  return digits.length >= 4 && digits.length <= 10;
};

const validateField = (name, value) => {
  switch (name) {
    case 'email': {
      const email = value.trim();
      if (!email) return '이메일을 입력해 주세요.';
      if (!EMAIL_PATTERN.test(email)) return '올바른 이메일 형식이 아닙니다.';
      return '';
    }
    case 'password':
      if (!value) return '비밀번호를 입력해 주세요.';
      if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
      return '';
    case 'nickname': {
      const nickname = value.trim();
      if (!nickname) return '닉네임을 입력해 주세요.';
      if (nickname.length < 2 || nickname.length > 20) {
        return '닉네임은 2자 이상 20자 이하로 입력해 주세요.';
      }
      return '';
    }
    case 'phone_number': {
      const phoneNumber = value.replace(/\D/g, '');
      if (!phoneNumber) return '전화번호를 입력해 주세요.';
      if (!PHONE_PATTERN.test(phoneNumber)) return '올바른 휴대폰 번호 형식이 아닙니다.';
      return '';
    }
    case 'entry_year': {
      const entryYear = Number(value);
      if (!Number.isInteger(entryYear)) return '입학년도를 선택해 주세요.';
      if (entryYear < 1980 || entryYear > CURRENT_YEAR) {
        return `입학년도는 1980년부터 ${CURRENT_YEAR}년 사이여야 합니다.`;
      }
      return '';
    }
    case 'student_id': {
      const studentId = value.trim();
      if (!studentId) return '학번을 입력해 주세요.';
      if (!isValidStudentId(studentId)) {
        return '학번은 4~10자리 숫자 또는 1-3-15 형식으로 입력해 주세요.';
      }
      return '';
    }
    default:
      return '';
  }
};

const validateForm = (formData) => {
  return Object.keys(formData).reduce((errors, name) => {
    const error = validateField(name, formData[name]);
    if (error) errors[name] = error;
    return errors;
  }, {});
};

const SignupPage = ({ setIsLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.email || '';
  const redirectPath = location.state?.redirectTo || '/';

  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
    nickname: '',
    phone_number: '',
    entry_year: CURRENT_YEAR,
    student_id: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const payload = {
      ...formData,
      email: formData.email.trim(),
      nickname: formData.nickname.trim(),
      phone_number: formData.phone_number.trim(),
      student_id: formData.student_id.trim(),
      entry_year: Number(formData.entry_year)
    };

    const validationErrors = validateForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setServerError('입력값을 다시 확인해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) {
          setErrors((prev) => ({ ...prev, ...data.errors }));
        }
        setServerError(data.message || '회원가입에 실패했습니다.');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setIsLoggedIn(true);
      alert('회원가입이 완료되어 자동으로 로그인되었습니다.');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('회원가입 오류:', error);
      setServerError('서버와 통신할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>회원가입</Title>
      <Subtitle>학교 이메일로 School Market을 시작해 보세요.</Subtitle>

      <Form onSubmit={handleSignup} noValidate>
        {serverError && <ServerError role="alert">{serverError}</ServerError>}

        <Field>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="school@example.com"
            autoComplete="email"
            maxLength={100}
            $invalid={Boolean(errors.email)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <ErrorMessage id="email-error">{errors.email}</ErrorMessage>}
        </Field>

        <Field>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="8자 이상 입력해 주세요"
            autoComplete="new-password"
            $invalid={Boolean(errors.password)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && <ErrorMessage id="password-error">{errors.password}</ErrorMessage>}
        </Field>

        <Field>
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="2~20자로 입력해 주세요"
            autoComplete="nickname"
            maxLength={20}
            $invalid={Boolean(errors.nickname)}
            aria-invalid={Boolean(errors.nickname)}
            aria-describedby={errors.nickname ? 'nickname-error' : undefined}
          />
          {errors.nickname && <ErrorMessage id="nickname-error">{errors.nickname}</ErrorMessage>}
        </Field>

        <Field>
          <Label htmlFor="phone_number">전화번호</Label>
          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            inputMode="numeric"
            value={formData.phone_number}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="010-1234-5678"
            autoComplete="tel"
            maxLength={20}
            $invalid={Boolean(errors.phone_number)}
            aria-invalid={Boolean(errors.phone_number)}
            aria-describedby={errors.phone_number ? 'phone-error' : undefined}
          />
          {errors.phone_number && <ErrorMessage id="phone-error">{errors.phone_number}</ErrorMessage>}
        </Field>

        <RowGroup>
          <Field>
            <Label htmlFor="entry_year">입학년도</Label>
            <Select
              id="entry_year"
              name="entry_year"
              value={formData.entry_year}
              onChange={handleChange}
              onBlur={handleBlur}
              $invalid={Boolean(errors.entry_year)}
              aria-invalid={Boolean(errors.entry_year)}
              aria-describedby={errors.entry_year ? 'entry-year-error' : undefined}
            >
              {[0, 1, 2, 3].map((offset) => {
                const year = CURRENT_YEAR - offset;
                return (
                  <option key={year} value={year}>
                    {year}년 입학
                  </option>
                );
              })}
            </Select>
            {errors.entry_year && <ErrorMessage id="entry-year-error">{errors.entry_year}</ErrorMessage>}
          </Field>

          <Field>
            <Label htmlFor="student_id">학번</Label>
            <Input
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="예: 10315"
              maxLength={10}
              $invalid={Boolean(errors.student_id)}
              aria-invalid={Boolean(errors.student_id)}
              aria-describedby={errors.student_id ? 'student-id-error' : undefined}
            />
            {errors.student_id && <ErrorMessage id="student-id-error">{errors.student_id}</ErrorMessage>}
          </Field>
        </RowGroup>

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? '가입 중...' : '가입 및 시작하기'}
        </SubmitButton>

        <BottomText>
          이미 계정이 있으신가요? <LoginLink to="/login">로그인</LoginLink>
        </BottomText>
      </Form>
    </Container>
  );
};

export default SignupPage;

// 🎨 styled-components 정의
const Container = styled.div`
  padding: 40px 20px;
  max-width: 440px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #212529;
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: #868e96;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
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
  border: 1px solid ${(props) => (props.$invalid ? '#e03131' : '#dee2e6')};
  border-radius: 6px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${(props) => (props.$invalid ? '#e03131' : '#FF6F0F')};
  }
`;

const Select = styled.select`
  padding: 12px 14px;
  border: 1px solid ${(props) => (props.$invalid ? '#e03131' : '#dee2e6')};
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
  outline: none;

  &:focus {
    border-color: ${(props) => (props.$invalid ? '#e03131' : '#FF6F0F')};
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: #e03131;
`;

const ServerError = styled.div`
  padding: 12px;
  border: 1px solid #ffc9c9;
  border-radius: 6px;
  background-color: #fff5f5;
  color: #e03131;
  font-size: 13px;
  line-height: 1.5;
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
  margin-top: 4px;

  &:hover {
    background-color: ${(props) => (props.disabled ? '#ced4da' : '#e55e00')};
  }
`;

const BottomText = styled.p`
  font-size: 13px;
  color: #868e96;
  text-align: center;
`;

const LoginLink = styled(Link)`
  color: #FF6F0F;
  font-weight: 700;

  &:hover {
    text-decoration: underline;
  }
`;
