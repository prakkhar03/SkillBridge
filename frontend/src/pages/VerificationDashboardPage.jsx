import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verificationAPI } from '../services/api';
import VerificationStatusDisplay from '../components/VerificationStatusDisplay';
import { 
  FaArrowLeft, 
  FaTrophy, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaFileAlt,
  FaGithub,
  FaPlay,
  FaEye,
  FaStar,
  FaChartLine
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

const VerificationMetrics = ({ verificationData }) => {
  if (!verificationData) return null;

  const metrics = [
    {
      label: 'Overall Progress',
      value: `${Math.round((verificationData.steps?.filter(step => step.status === 'completed').length / verificationData.steps?.length) * 100) || 0}%`,
      icon: FaChartLine,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Resume Status',
      value: verificationData.resume_status === 'uploaded' ? 'Uploaded' : 'Pending',
      icon: FaFileAlt,
      color: verificationData.resume_status === 'uploaded' ? 'text-green-600' : 'text-yellow-600',
      bgColor: verificationData.resume_status === 'uploaded' ? 'bg-green-100' : 'bg-yellow-100'
    },
    {
      label: 'GitHub Status',
      value: verificationData.github_status === 'connected' ? 'Connected' : 'Pending',
      icon: FaGithub,
      color: verificationData.github_status === 'connected' ? 'text-green-600' : 'text-yellow-600',
      bgColor: verificationData.github_status === 'connected' ? 'bg-green-100' : 'bg-yellow-100'
    },
    {
      label: 'Test Status',
      value: verificationData.test_status === 'completed' ? 'Completed' : 'Not Started',
      icon: FaPlay,
      color: verificationData.test_status === 'completed' ? 'text-green-600' : 'text-yellow-600',
      bgColor: verificationData.test_status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className={`w-12 h-12 rounded-full ${metric.bgColor} flex items-center justify-center mx-auto mb-3`}>
            <metric.icon className={`w-6 h-6 ${metric.color}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{metric.label}</h3>
          <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

const VerificationTimeline = ({ verificationData }) => {
  if (!verificationData?.steps) return null;

  const getStepIcon = (step) => {
    switch (step.id) {
      case 'resume_upload':
        return FaFileAlt;
      case 'github_analysis':
        return FaGithub;
      case 'skills_test':
        return FaPlay;
      case 'verification_review':
        return FaEye;
      default:
        return FaCheckCircle;
    }
  };

  const getStepStatus = (step) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'pending') return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Verification Timeline</h3>
      <div className="space-y-6">
        {verificationData.steps.map((step, index) => {
          const Icon = getStepIcon(step);
          const status = getStepStatus(step);
          
          return (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'completed' ? 'bg-green-100' : 
                status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {status === 'completed' ? (
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Icon className={`w-5 h-5 ${
                    status === 'current' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  status === 'completed' ? 'text-green-800' :
                  status === 'current' ? 'text-blue-800' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  status === 'completed' ? 'text-green-700' :
                  status === 'current' ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
                
                {/* Action Button for Current Step */}
                {status === 'current' && (
                  <div className="mt-3">
                    {step.id === 'skills_test' && (
                      <button
                        onClick={() => window.location.href = '/verification/test'}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaPlay className="w-4 h-4 mr-2" />
                        Take Test
                      </button>
                    )}
                    {step.id === 'resume_upload' && (
                      <button
                        onClick={() => window.location.href = '/profile/edit'}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaFileAlt className="w-4 h-4 mr-2" />
                        Upload Resume
                      </button>
                    )}
                    {step.id === 'github_analysis' && (
                      <button
                        onClick={() => window.location.href = '/profile/edit'}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaGithub className="w-4 h-4 mr-2" />
                        Connect GitHub
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Step Status */}
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  status === 'completed' ? 'bg-green-100 text-green-800' :
                  status === 'current' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {status === 'completed' ? 'Completed' :
                   status === 'current' ? 'Current' : 'Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BenefitsSection = () => (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <FaTrophy className="w-6 h-6 text-purple-600 mr-3" />
      Benefits of Verification
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex items-start space-x-3">
        <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-800">Increased Credibility</h4>
          <p className="text-sm text-gray-600">Build trust with clients through verified skills</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-800">Better Opportunities</h4>
          <p className="text-sm text-gray-600">Access to higher-paying and more prestigious projects</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-800">Priority Matching</h4>
          <p className="text-sm text-gray-600">Get matched with projects that fit your verified skills</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-800">Professional Recognition</h4>
          <p className="text-sm text-gray-600">Earn badges and recognition for your expertise</p>
        </div>
      </div>
    </div>
  </div>
);

export default function VerificationDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchVerificationData();
    }
  }, [isAuthenticated]);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the backend endpoint might not be ready
      // const response = await verificationAPI.getVerificationStatus();
      // setVerificationData(response.data);
      
      // Mock verification data
      const mockVerificationData = {
        status: 'in_progress',
        level: 'Intermediate',
        rating: 3.8,
        steps: [
          {
            id: 'resume_upload',
            title: 'Resume Upload',
            description: 'Upload your professional resume for analysis',
            status: 'completed',
            icon: FaFileAlt
          },
          {
            id: 'github_analysis',
            title: 'GitHub Analysis',
            description: 'Connect your GitHub profile for code review',
            status: 'completed',
            icon: FaGithub
          },
          {
            id: 'skills_test',
            title: 'Skills Assessment',
            description: 'Complete the technical skills test',
            status: 'pending',
            icon: FaPlay
          },
          {
            id: 'verification_review',
            title: 'Verification Review',
            description: 'Admin review and final verification',
            status: 'pending',
            icon: FaEye
          }
        ],
        resume_status: 'uploaded',
        github_status: 'connected',
        test_status: 'not_started',
        admin_review_status: 'pending'
      };
      
      setVerificationData(mockVerificationData);
      setError('');
    } catch (error) {
      console.error('Error fetching verification data:', error);
      setError('Failed to load verification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your verification dashboard.</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.accent }}>
            Verification Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your verification progress and unlock new opportunities
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Verification Metrics */}
        <VerificationMetrics verificationData={verificationData} />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Verification Timeline */}
        <VerificationTimeline verificationData={verificationData} />

        {/* Detailed Verification Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Detailed Status</h3>
          <VerificationStatusDisplay />
        </div>
      </div>
    </div>
  );
}
