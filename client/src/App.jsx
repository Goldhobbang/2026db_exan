import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClubCreatePage from './pages/ClubCreatePage'
import ClubDetailPage from './pages/ClubDetailPage'
import ClubEditPage from './pages/ClubEditPage'
import MyClubsPage from './pages/MyClubsPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import ProfileEditPage from './pages/ProfileEditPage'
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  return (<Routes><Route element={<Layout isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
    <Route path="/signup" element={<SignupPage setIsLoggedIn={setIsLoggedIn} />} />
    <Route path="/write" element={<ClubCreatePage />} />
    <Route path="/club/:id" element={<ClubDetailPage />} />
    <Route path="/club/:id/edit" element={<ClubEditPage />} />
    <Route path="/mypage/clubs" element={<MyClubsPage />} />
    <Route path="/mypage/applications" element={<MyApplicationsPage />} />
    <Route path="/mypage/edit" element={<ProfileEditPage setIsLoggedIn={setIsLoggedIn} />} />
  </Route></Routes>);
};
export default App
