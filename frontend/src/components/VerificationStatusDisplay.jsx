import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verificationAPI } from '../services/api';
import { 
  FaTrophy, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaFileAlt,
  FaGithub,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaEye
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

const VerificationStep = ({ step, title, description, status, isActive, isCompleted, icon: Icon, action }) => {
  const getStepColors = () => {
    if (isCompleted) {
      return {
        bg: 'bg-green-100',
        border: 'border-green-300',
        text: 'text-green-800',
        icon: 'text-green-600'
      };
    } else if (isActive) {
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-300',
        text: 'text-blue-800',
        icon: 'text-blue-600'
      };
    } else {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-600',
        icon: 'text-gray-400'
      };
    }
  };

  const colors = getStepColors();

  return (
    <div className={`flex items-start space-x-4 p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors.bg}`}>
        {isCompleted ? (
          <FaCheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
        <p className={`text-sm ${colors.text} opacity-80`}>{description}</p>
        
        {action && isActive && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>
      
      <div className="flex-shrink-0">
        {isCompleted && (
          <FaCheckCircle className="w-5 h-5 text-green-600" />
        )}
      </div>
    </div>
  );
};

const VerificationBadge = ({ status, level, rating }) => {
  const getBadgeColors = () => {
    switch (status) {
      case 'Expert':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          text: 'text-purple-800',
          icon: 'text-purple-600'
        };
      case 'Intermediate':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-800',
          icon: 'text-blue-600'
        };
      case 'Beginner':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: 'text-green-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        };
    }
  };

  const colors = getBadgeColors();

  return (
    <div className={`p-6 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${colors.text}`}>Verification Status</h3>
        <FaTrophy className={`w-6 h-6 ${colors.icon}`} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${colors.text} opacity-80`}>Level:</span>
          <span className={`font-semibold ${colors.text}`}>{status}</span>
        </div>
        
        {rating > 0 && (
          <div className="flex items-center justify-between">
            <span className={`text-sm ${colors.text} opacity-80`}>Rating:</span>
            <div className="flex items-center space-x-1">
              <FaStar className="w-4 h-4 text-yellow-500" />
              <span className={`font-semibold ${colors.text}`}>{rating}/5.0</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function VerificationStatusDisplay() {
  const { isAuthenticated } = useAuth();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchVerificationStatus();
    }
  }, [isAuthenticated]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the backend endpoint might not be ready
      // const response = await verificationAPI.getVerificationStatus();
      // setVerificationData(response.data);
      
      // Mock verification data
      const mockVerificationData = {
        status: 'pending', // pending, in_progress, completed, failed
        level: 'Unverified', // Unverified, Beginner, Intermediate, Expert
        rating: 0.0,
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
      console.error('Error fetching verification status:', error);
      setError('Failed to load verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getVerificationSteps = () => {
    if (!verificationData) return [];
    
    return verificationData.steps.map(step => {
      let isCompleted = false;
      let isActive = false;
      
      switch (step.id) {
        case 'resume_upload':
          isCompleted = verificationData.resume_status === 'uploaded';
          isActive = !isCompleted && verificationData.status === 'pending';
          break;
        case 'github_analysis':
          isCompleted = verificationData.github_status === 'connected';
          isActive = !isCompleted && verificationData.resume_status === 'uploaded';
          break;
        case 'skills_test':
          isCompleted = verificationData.test_status === 'completed';
          isActive = !isCompleted && verificationData.github_status === 'connected';
          break;
        case 'verification_review':
          isCompleted = verificationData.admin_review_status === 'approved';
          isActive = !isCompleted && verificationData.test_status === 'completed';
          break;
      }
      
      return {
        ...step,
        isCompleted,
        isActive
      };
    });
  };

  const getCurrentStep = () => {
    const steps = getVerificationSteps();
    return steps.find(step => step.isActive) || steps.find(step => !step.isCompleted);
  };

  const getActionButton = (step) => {
    if (step.id === 'skills_test' && step.isActive) {
      return (
        <Link
          to="/verification/test"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlay className="w-4 h-4 mr-2" />
          Take Test
        </Link>
      );
    }
    
    if (step.id === 'resume_upload' && step.isActive) {
      return (
        <Link
          to="/profile/edit"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaFileAlt className="w-4 h-4 mr-2" />
          Upload Resume
        </Link>
      );
    }
    
    if (step.id === 'github_analysis' && step.isActive) {
      return (
        <Link
          to="/profile/edit"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaGithub className="w-4 h-4 mr-2" />
          Connect GitHub
        </Link>
      );
    }
    
    return null;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <FaExclamationTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">Unable to load verification status</p>
        </div>
      </div>
    );
  }

  const steps = getVerificationSteps();
  const currentStep = getCurrentStep();
  const progressPercentage = (steps.filter(step => step.isCompleted).length / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Verification Progress</h2>
        <span className="text-sm text-gray-500">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Verification Badge */}
      <VerificationBadge 
        status={verificationData.level}
        rating={verificationData.rating}
      />

      {/* Current Status */}
      {currentStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FaArrowRight className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">Next Step: {currentStep.title}</h3>
              <p className="text-sm text-blue-700">{currentStep.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <VerificationStep
            key={step.id}
            step={step}
            title={step.title}
            description={step.description}
            status={step.status}
            isActive={step.isActive}
            isCompleted={step.isCompleted}
            icon={step.icon}
            action={getActionButton(step)}
          />
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
        <p className="text-sm text-gray-600 mb-3">
          If you encounter any issues during the verification process, please contact our support team.
        </p>
        <Link
          to="/support"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Contact Support →
        </Link>
      </div>
    </div>
  );
}
