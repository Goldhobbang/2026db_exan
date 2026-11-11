import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
const CATS = ['전체', '운동', '음악', '코딩', '미술', '봉사', '기타'];
const Home = () => {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [cat, setCat] = useState('전체');
  const [keyword, setKeyword] = useState('');
  useEffect(() => {
    const q = cat === '전체' ? '' : `?category=${encodeURIComponent(cat)}`;
    fetch(`/api/clubs${q}`).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => setRows([]));
  }, [cat]);
  const k = keyword.trim().toLowerCase();
  const list = k ? rows.filter((c) => [c.name, c.description, c.location, c.owner_nickname].some((v) => String(v ?? '').toLowerCase().includes(k))) : rows;
  return (<div>
    <Search value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="동아리명, 소개, 장소, 개설자로 검색" />
    <Nav>{CATS.map((c) => (<Chip key={c} $on={cat === c} onClick={() => setCat(c)}>{c}</Chip>))}</Nav>
    {list.length === 0 && <Empty>등록된 공고가 없습니다.</Empty>}
    {list.map((c) => (<Card key={c.id} onClick={() => nav(`/club/${c.id}`)}><b>{c.name}</b><span>{c.category} · {c.owner_nickname} · 지원 {c.applicant_count}/{c.max_members} · {c.status === 'RECRUITING' ? '모집중' : '마감'}</span></Card>))}</div>);
};
export default Home;
const Search = styled.input`margin-bottom: 12px;`;
const Nav = styled.nav`display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;`;
const Chip = styled.button`padding: 6px 12px; border-radius: 16px; border: 1px solid ${(p) => (p.$on ? '#6741d9' : '#ddd')}; background: ${(p) => (p.$on ? '#6741d9' : '#fff')}; color: ${(p) => (p.$on ? '#fff' : '#333')}; &:hover { background: ${(p) => (p.$on ? '#5f3dc4' : '#f3f0ff')}; }`;
const Card = styled.div`background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 14px; margin-bottom: 8px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: border-color .15s; &:hover { border-color: #6741d9; } span { color: #868e96; font-size: 13px; }`;
const Empty = styled.p`color: #868e96; text-align: center; padding: 24px 0;`;
