import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Link } from 'react-router-dom';
// import VerificationStatusDisplay from '../components/VerificationStatusDisplay';
import { 
  FaUserEdit, 
  FaEye, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaChartLine,
  FaTrophy,
  FaFileAlt,
  FaStar,
  FaSearch,
  FaBriefcase,
  FaPlay
} from 'react-icons/fa';

const colors = {
  background: "#DFE0E2",
  muted: "#B8BCC3",
  accent: "#787A84",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6"
};

// const OnboardingStep = ({ step, title, description, status, isActive, isCompleted }) => (
const OnboardingStep = ({ step, title, description, isActive, isCompleted }) => (
  <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
    isActive ? 'border-blue-300 bg-blue-50' : 
    isCompleted ? 'border-green-300 bg-green-50' : 
    'border-gray-200 bg-gray-50'
  }`}>
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
      isCompleted ? 'bg-green-500 text-white' :
      isActive ? 'bg-blue-500 text-white' :
      'bg-gray-300 text-gray-600'
    }`}>
      {isCompleted ? (
        <FaCheckCircle className="w-5 h-5" />
      ) : (
        <span className="text-sm font-semibold">{step}</span>
      )}
    </div>
    <div className="flex-1">
      <h3 className={`font-semibold ${
        isActive ? 'text-blue-900' :
        isCompleted ? 'text-green-900' :
        'text-gray-700'
      }`}>
        {title}
      </h3>
      <p className={`text-sm ${
        isActive ? 'text-blue-700' :
        isCompleted ? 'text-green-700' :
        'text-gray-600'
      }`}>
        {description}
      </p>
    </div>
  </div>
);

const VerificationStatus = ({ status, rating }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Expert': return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
      case 'Intermediate': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
      case 'Beginner': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const statusColors = getStatusColor(status);

  return (
    <div className={`p-4 rounded-lg border ${statusColors.bg} ${statusColors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold ${statusColors.text}`}>Verification Status</h3>
        <FaTrophy className={`w-5 h-5 ${statusColors.text}`} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${statusColors.text}`}>Level:</span>
          <span className={`font-semibold ${statusColors.text}`}>{status}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${statusColors.text}`}>Rating:</span>
          <div className="flex items-center space-x-1">
            <FaStar className="w-4 h-4 text-yellow-500" />
            <span className={`font-semibold ${statusColors.text}`}>{rating}/5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FreelancerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStage, setOnboardingStage] = useState(0);
  
  console.log('FreelancerDashboard: Render - user:', user, 'isAuthenticated:', isAuthenticated);
  
  // Add error boundary
  try {
    console.log('FreelancerDashboard: Component rendering successfully');
  } catch (error) {
    console.error('FreelancerDashboard: Error during render:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error rendering dashboard</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('FreelancerDashboard: useEffect triggered - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('FreelancerDashboard: User authenticated, fetching profile...');
      fetchProfile();
      
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.log('FreelancerDashboard: Profile fetch timeout, setting default data');
          setLoading(false);
          setProfile({});
          setOnboardingStage(0);
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('FreelancerDashboard: User not authenticated yet');
    }
  }, [isAuthenticated, loading]);

  const fetchProfile = async () => {
    try {
      console.log('FreelancerDashboard: Fetching profile...');
      const response = await authAPI.getProfile();
      console.log('FreelancerDashboard: Profile response:', response);
      
      if (response.ok) {
        const profileData = await response.json();
        console.log('FreelancerDashboard: Profile data:', profileData);
        setProfile(profileData);
        setOnboardingStage(profileData.user?.onboarding_stage || 0);
      } else {
        console.warn('FreelancerDashboard: Profile fetch failed with status:', response.status);
        // Set default profile data to prevent loading state
        setProfile({});
        setOnboardingStage(0);
      }
    } catch (error) {
      console.error('FreelancerDashboard: Error fetching profile:', error);
      // Set default profile data to prevent loading state
      setProfile({});
      setOnboardingStage(0);
    } finally {
      setLoading(false);
    }
  };

  const getOnboardingSteps = () => [
    {
      step: 1,
      title: "Account Created",
      description: "Your account has been successfully registered",
      status: "completed"
    },
    {
      step: 2,
      title: "Email Verified",
      description: "Verify your email address to continue",
      status: onboardingStage >= 1 ? "completed" : "pending"
    },
    {
      step: 3,
      title: "Profile Completed",
      description: "Fill out your professional profile",
      status: onboardingStage >= 2 ? "completed" : "pending"
    },
    {
      step: 4,
      title: "Skills Assessment",
      description: "Complete skills verification test",
      status: onboardingStage >= 3 ? "completed" : "pending"
    }
  ];

  const steps = getOnboardingSteps();
  const currentStep = steps.findIndex(step => step.status === "pending") + 1;
  const progressPercentage = (onboardingStage / 3) * 100;

  // Debug: Always show some content to test rendering
  console.log('FreelancerDashboard: Rendering main content');
  
  if (!isAuthenticated) {
    console.log('FreelancerDashboard: User not authenticated, showing auth required message');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 text-lg">Authentication required</p>
          <p className="text-gray-600 mt-2">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('FreelancerDashboard: Still loading, showing loading message');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.accent }}>
            Welcome back, {profile?.full_name || user?.email}!
          </h1>
          <p className="text-lg text-gray-600">
            Complete your profile to start getting amazing projects
          </p>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Onboarding Progress</h2>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <OnboardingStep
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                status={step.status}
                isActive={step.status === "pending" && index === currentStep - 1}
                isCompleted={step.status === "completed"}
              />
            ))}
          </div>
        </div>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Profile Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaUserEdit className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Profile Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create or update your professional profile to showcase your skills and experience.
            </p>
            <div className="space-y-3">
              <Link
                to="/profile/edit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                <FaUserEdit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
              <Link
                to="/profile/view"
                className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                <FaEye className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </div>
          </div>

          {/* Project Discovery */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaSearch className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Project Discovery</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Browse available projects and find opportunities that match your skills and experience.
            </p>
            <div className="space-y-3">
              <Link
                to="/projects"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaSearch className="w-4 h-4 mr-2" />
                Browse Projects
              </Link>
              <Link
                to="/projects/applied"
                className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <FaBriefcase className="w-4 h-4 mr-2" />
                My Applications
              </Link>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaTrophy className="w-8 h-8 text-yellow-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Verification Status</h3>
            </div>
            <VerificationStatus 
              status={profile?.verification_tag || "Unverified"} 
              rating={profile?.star_rating || 0.0}
            />
          </div>

          {/* Skills Verification */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaTrophy className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Skills Verification</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Get your skills verified to increase your credibility and access better opportunities.
            </p>
            <div className="space-y-3">
              <Link
                to="/verification/test"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaPlay className="w-4 h-4 mr-2" />
                Take Skills Test
              </Link>
              <Link
                to="/verification/dashboard"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaEye className="w-4 h-4 mr-2" />
                View Status
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaChartLine className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Profile Completion</span>
                <span className="font-semibold text-gray-800">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Skills Listed</span>
                <span className="font-semibold text-gray-800">
                  {profile?.skills ? profile.skills.split(',').length : 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Experience Level</span>
                <span className="font-semibold text-gray-800">
                  {profile?.experience_level || "Not Set"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Projects Applied</span>
                <span className="font-semibold text-gray-800">
                  {/* TODO: Add API call to get applied projects count */}
                  0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-orange-500 mr-2" />
              Next Steps
            </h3>
            <div className="space-y-3">
              {onboardingStage < 1 && (
                <div className="flex items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <FaClock className="w-4 h-4 text-orange-500 mr-3" />
                  <span className="text-orange-700">Verify your email address to continue</span>
                </div>
              )}
              {onboardingStage >= 1 && onboardingStage < 2 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <FaUserEdit className="w-4 h-4 text-blue-500 mr-3" />
                  <span className="text-blue-700">Complete your professional profile</span>
                </div>
              )}
              {onboardingStage >= 2 && onboardingStage < 3 && (
                <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <FaFileAlt className="w-4 h-4 text-purple-500 mr-3" />
                  <span className="text-purple-700">Take the skills assessment test</span>
                </div>
              )}
              {onboardingStage >= 3 && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <FaCheckCircle className="w-4 h-4 text-green-500 mr-3" />
                  <span className="text-green-700">You're all set! Start applying to projects</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium text-gray-800">
                  {profile?.full_name || "Not Set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-800">
                  {profile?.location || "Not Set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bio:</span>
                <span className="font-medium text-gray-800">
                  {profile?.bio ? (profile.bio.length > 30 ? profile.bio.substring(0, 30) + "..." : profile.bio) : "Not Set"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resume:</span>
                <span className="font-medium text-gray-800">
                  {profile?.resume ? "Uploaded" : "Not Uploaded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
