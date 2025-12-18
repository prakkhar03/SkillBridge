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
import ClientDashboard from "./pages/ClientDashboard";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProfileEditPage from "./pages/ProfileEditPage";
import ProfileViewPage from "./pages/ProfileViewPage";
import ProjectListingPage from "./pages/ProjectListingPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AppliedProjectsPage from "./pages/AppliedProjectsPage";
import SkillsAssessmentPage from "./pages/SkillsAssessmentPage";
import VerificationDashboardPage from "./pages/VerificationDashboardPage";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Footer } from "./ui/landingPage/Footer";
import SmoothScroll from "./ui/utils/SmoothScroll";
import ParticleBackground from "./ui/utils/ParticleBackground";
import { Navbar } from "./ui/landingPage/NavBar";
import PageTransition from "./ui/utils/PageTransition";

export default function App() {
  return (
    <>
      <ParticleBackground
        layer="behind"
        backgroundColor="#0F0720"
        particleColor="rgba(0, 240, 255, 0.5)"
        strokeColor="rgba(255, 0, 153, 0.3)"
        maxParticles={120}
        speedFactor={0.4}
      />
      <Router>
        <div className="min-h-screen relative">
          <Navbar />
          <SmoothScroll>
            <PageTransition>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardSwitcher />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/create"
                  element={
                    <ProtectedRoute>
                      <CreateProjectPage />
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
                  path="/profile/:userId?"
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
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectDetailPage />
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
            </PageTransition>
          </SmoothScroll>
          <Footer />
        </div>
      </Router>
    </>
  );
}

const DashboardSwitcher = () => {
  const { user } = useAuth();
  return user?.role === "client" ? <ClientDashboard /> : <FreelancerDashboard />;
};
