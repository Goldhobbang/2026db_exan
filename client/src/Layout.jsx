import { Outlet, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
const Layout = ({ isLoggedIn, setIsLoggedIn }) => {
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem('token'); setIsLoggedIn(false); nav('/'); };
  return (<Wrap><Header><Logo onClick={() => nav('/')}>동아리모집</Logo><Nav>{isLoggedIn ? (<><Link to="/write">공고등록</Link><Link to="/mypage/clubs">내 공고</Link><Link to="/mypage/applications">내 지원</Link><Link to="/mypage/edit">프로필</Link><button onClick={logout}>로그아웃</button></>) : (<><Link to="/login">로그인</Link><Link to="/signup">회원가입</Link></>)}</Nav></Header><Main><Outlet context={{ setIsLoggedIn }} /></Main></Wrap>);
};
export default Layout;
const Wrap = styled.div`max-width: 640px; margin: 0 auto;`;
const Header = styled.header`display: flex; justify-content: space-between; padding: 16px; border-bottom: 1px solid #eee;`;
const Logo = styled.h1`font-size: 20px; color: #6741d9; cursor: pointer; margin: 0;`;
const Nav = styled.nav`display: flex; gap: 12px; align-items: center;`;
const Main = styled.main`padding: 16px;`;
