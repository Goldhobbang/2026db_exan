import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
const CATS = ['전체', '운동', '음악', '코딩', '미술', '봉사', '기타'];
const Home = () => {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [cat, setCat] = useState('전체');
  useEffect(() => {
    const q = cat === '전체' ? '' : `?category=${encodeURIComponent(cat)}`;
    fetch(`/api/clubs${q}`).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => setRows([]));
  }, [cat]);
  return (<div><Nav>{CATS.map((c) => (<Chip key={c} $on={cat === c} onClick={() => setCat(c)}>{c}</Chip>))}</Nav>
    {rows.length === 0 && <p>등록된 공고가 없습니다.</p>}
    {rows.map((c) => (<Card key={c.id} onClick={() => nav(`/club/${c.id}`)}><b>{c.name}</b><span>{c.category} · {c.owner_nickname} · 지원 {c.applicant_count}/{c.max_members} · {c.status === 'RECRUITING' ? '모집중' : '마감'}</span></Card>))}</div>);
};
export default Home;
const Nav = styled.nav`display: flex; gap: 8px; margin-bottom: 12px;`;
const Chip = styled.button`padding: 6px 12px; border-radius: 16px; border: 1px solid ${(p) => (p.$on ? '#6741d9' : '#ddd')}; background: ${(p) => (p.$on ? '#6741d9' : '#fff')}; color: ${(p) => (p.$on ? '#fff' : '#333')}; cursor: pointer;`;
const Card = styled.div`border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 8px; cursor: pointer; display: flex; flex-direction: column; gap: 4px;`;
