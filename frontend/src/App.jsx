import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import FreelancerDashboard from './pages/FreelancerDashboard'
import ProfileEditPage from './pages/ProfileEditPage'
import ProfileViewPage from './pages/ProfileViewPage'
import ProtectedRoute from './components/ProtectedRoute'
import { Footer } from './ui/landingPage/Footer'
import SmoothScroll from "./ui/utils/SmoothScroll";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: 'black' }}>
          <SmoothScroll>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <FreelancerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/view" element={
            <ProtectedRoute>
              <ProfileViewPage />
            </ProtectedRoute>
          } />
        </Routes>
          </SmoothScroll>
        <Footer />
      </div>
    </Router>
  )
}
