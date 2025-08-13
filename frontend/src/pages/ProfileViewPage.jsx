import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { 
  FaUser, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaCode, 
  FaLink, 
  FaGithub, 
  FaFileAlt,
  FaEdit,
  FaArrowLeft,
  FaStar,
  FaTrophy,
  FaDownload,
  FaExternalLinkAlt
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

const ProfileSection = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
    <div className="flex items-center mb-4">
      <Icon className="w-6 h-6 text-blue-600 mr-3" />
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const SkillTag = ({ skill }) => (
  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">
    {skill.trim()}
  </span>
);

const VerificationBadge = ({ status, rating }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Expert': return { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800', 
        border: 'border-purple-300',
        icon: '🏆'
      };
      case 'Intermediate': return { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-300',
        icon: '⭐'
      };
      case 'Beginner': return { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        border: 'border-green-300',
        icon: '🌱'
      };
      default: return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-300',
        icon: '❓'
      };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${config.bg} ${config.border}`}>
      <span className="text-lg mr-2">{config.icon}</span>
      <span className={`font-semibold ${config.text}`}>{status}</span>
      {rating > 0 && (
        <div className="flex items-center ml-3">
          <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
          <span className={`font-semibold ${config.text}`}>{rating}/5.0</span>
        </div>
      )}
    </div>
  );
};

export default function ProfileViewPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = () => {
    if (profile?.resume) {
      // Create a temporary link to download the resume
      const link = document.createElement('a');
      link.href = profile.resume;
      link.download = `resume_${profile.full_name || 'profile'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openExternalLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <FaUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">It looks like you haven't created your profile yet.</p>
          <button
            onClick={() => navigate('/profile/edit')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const skills = profile.skills ? profile.skills.split(',').filter(skill => skill.trim()) : [];
  const portfolioLinks = profile.portfolio_links ? profile.portfolio_links.split('\n').filter(link => link.trim()) : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.accent }}>
                {profile.full_name || 'Your Profile'}
              </h1>
              <p className="text-lg text-gray-600">
                Professional profile and portfolio
              </p>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Info */}
          <ProfileSection title="Basic Information" icon={FaUser} className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <p className="text-lg font-semibold text-gray-800">
                  {profile.full_name || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-lg text-gray-800">
                    {profile.location || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Experience Level</label>
                <div className="flex items-center">
                  <FaBriefcase className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-lg text-gray-800">
                    {profile.experience_level || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Verification Status</label>
                <VerificationBadge 
                  status={profile.verification_tag || 'Unverified'} 
                  rating={profile.star_rating || 0.0}
                />
              </div>
            </div>
          </ProfileSection>

          {/* Quick Stats */}
          <ProfileSection title="Quick Stats" icon={FaTrophy}>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
                <div className="text-sm text-gray-600">Skills Listed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{portfolioLinks.length}</div>
                <div className="text-sm text-gray-600">Portfolio Links</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.resume ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Resume Uploaded</div>
              </div>
            </div>
          </ProfileSection>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <ProfileSection title="Professional Bio" icon={FaUser} className="mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              {profile.bio}
            </p>
          </ProfileSection>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <ProfileSection title="Skills & Technologies" icon={FaCode} className="mb-8">
            <div className="flex flex-wrap">
              {skills.map((skill, index) => (
                <SkillTag key={index} skill={skill} />
              ))}
            </div>
          </ProfileSection>
        )}

        {/* Portfolio & Links */}
        {(portfolioLinks.length > 0 || profile.github_url) && (
          <ProfileSection title="Portfolio & Links" icon={FaLink} className="mb-8">
            <div className="space-y-4">
              {profile.github_url && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaGithub className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-800 font-medium">GitHub Profile</span>
                  </div>
                  <button
                    onClick={() => openExternalLink(profile.github_url)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="mr-2">View Profile</span>
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {portfolioLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaLink className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-800 font-medium">
                      Portfolio Link {index + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => openExternalLink(link)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span className="mr-2">Visit</span>
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </ProfileSection>
        )}

        {/* Resume Section */}
        {profile.resume && (
          <ProfileSection title="Resume/CV" icon={FaFileAlt} className="mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaFileAlt className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-gray-800 font-medium">Resume Document</span>
              </div>
              <button
                onClick={handleDownloadResume}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </ProfileSection>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/profile/edit')}
            className="flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
