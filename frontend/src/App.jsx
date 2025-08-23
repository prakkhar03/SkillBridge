import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ProfileEditPage from "./pages/ProfileEditPage";
import ProfileViewPage from "./pages/ProfileViewPage";
import ProjectListingPage from "./pages/ProjectListingPage";
import AppliedProjectsPage from "./pages/AppliedProjectsPage";
import SkillsAssessmentPage from "./pages/SkillsAssessmentPage";
import VerificationDashboardPage from "./pages/VerificationDashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Footer } from "./ui/landingPage/Footer";
import SmoothScroll from "./ui/utils/SmoothScroll";
import ParticleBackground from "./ui/utils/ParticleBackground";
import { Navbar } from "./ui/landingPage/NavBar";

export default function App() {
  return (
    <>
      <ParticleBackground
        backgroundColor="black"
        particleColor="rgba(255,255,255,0.9)"
        strokeColor="rgba(0,255,255,0.6)"
        glowColor="rgba(100,200,255,0.2)"
        maxParticles={500}
        trailOpacity={0.1}
        sizeRange={[1, 3]}
        speedFactor={0.8}
      />
      <Router>
        <div className="min-h-screen relative">
          <Navbar />
          <SmoothScroll>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <FreelancerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <ProfileEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/view"
                element={
                  <ProtectedRoute>
                    <ProfileViewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectListingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/applied"
                element={
                  <ProtectedRoute>
                    <AppliedProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verification/test"
                element={
                  <ProtectedRoute>
                    <SkillsAssessmentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verification/dashboard"
                element={
                  <ProtectedRoute>
                    <VerificationDashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SmoothScroll>
          <Footer />
        </div>
      </Router>
    </>
  );
}
