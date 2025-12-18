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
  FaFileUpload,
  FaSave,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle
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

const ExperienceLevelSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">Select Experience Level</option>
    <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
    <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
    <option value="Senior Level (5-8 years)">Senior Level (5-8 years)</option>
    <option value="Expert Level (8+ years)">Expert Level (8+ years)</option>
  </select>
);

const VerificationTagSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="Unverified">Unverified</option>
    <option value="Beginner">Beginner</option>
    <option value="Intermediate">Intermediate</option>
    <option value="Expert">Expert</option>
  </select>
);

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    bio: '',
    skills: '',
    experience_level: '',
    portfolio_links: '',
    github_url: '',
    verification_tag: 'Unverified',
    star_rating: 0.0
  });

  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  // const fetchProfile = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await authAPI.getProfile();
  //     if (response.ok) {
  //       const profileData = await response.json();
  //       setFormData({
  //         full_name: profileData.full_name || '',
  //         location: profileData.location || '',
  //         bio: profileData.bio || '',
  //         skills: profileData.skills || '',
  //         experience_level: profileData.experience_level || '',
  //         portfolio_links: profileData.portfolio_links || '',
  //         github_url: profileData.github_url || '',
  //         verification_tag: profileData.verification_tag || 'Unverified',
  //         star_rating: profileData.star_rating || 0.0
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching profile:', error);
  //     setMessage({ type: 'error', text: 'Failed to load profile data' });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchProfile = async () => {
  try {
    setLoading(true);

    const response = await authAPI.getProfile();

    
    const profile = response.data.profile;

    setFormData({
      full_name: profile.full_name || '',
      location: profile.location || '',
      bio: profile.bio || '',
      skills: profile.skills || '',
      experience_level: profile.experience_level || '',
      portfolio_links: profile.portfolio_links || '',
      github_url: profile.github_url || '',
      verification_tag: profile.verification_tag || 'Unverified',
      star_rating: profile.star_rating || 0.0
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    setMessage({ type: 'error', text: 'Failed to load profile data' });
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setResumeFile(file);
    } else {
      setMessage({ type: 'error', text: 'Please select a valid PDF or DOCX file' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      // const response = await authAPI.updateProfile(submitData);
      
      // if (response.ok) {
      //   setMessage({ type: 'success', text: 'Profile updated successfully!' });
      //   setTimeout(() => {
      //     navigate('/dashboard');
      //   }, 2000);
      const response = await authAPI.updateProfile(submitData);

      if (response.message === "Profile updated successfully") {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        setFormData(prev => ({
          ...prev,
          ...response.data
        }));

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }

      else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving your profile' });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
            {formData.full_name ? 'Edit Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-lg text-gray-600">
            {formData.full_name ? 'Update your professional information' : 'Tell us about yourself and your skills'}
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <FaExclamationTriangle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaBriefcase className="w-4 h-4 inline mr-2" />
                Experience Level
              </label>
              <ExperienceLevelSelect
                value={formData.experience_level}
                onChange={(value) => handleInputChange('experience_level', value)}
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
              />
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCode className="w-4 h-4 inline mr-2" />
                Skills & Technologies
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, Python, UI/UX Design, Project Management (separate with commas)"
              />
              <p className="text-sm text-gray-500 mt-1">
                List your key skills and technologies, separated by commas
              </p>
            </div>

            {/* Portfolio Links */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaLink className="w-4 h-4 inline mr-2" />
                Portfolio Links
              </label>
              <textarea
                value={formData.portfolio_links}
                onChange={(e) => handleInputChange('portfolio_links', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-portfolio.com, https://behance.net/your-profile (one per line)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add links to your portfolio, projects, or work samples
              </p>
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaGithub className="w-4 h-4 inline mr-2" />
                GitHub Profile
              </label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/username"
              />
            </div>

            {/* Verification Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Level
              </label>
              <VerificationTagSelect
                value={formData.verification_tag}
                onChange={(value) => handleInputChange('verification_tag', value)}
              />
            </div>

            {/* Resume Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaFileUpload className="w-4 h-4 inline mr-2" />
                Resume/CV
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <FaFileUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {resumeFile ? resumeFile.name : 'Click to upload your resume (PDF or DOCX)'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Max file size: 5MB
                  </p>
                </label>
              </div>
              {resumeFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {resumeFile.name} selected
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center px-8 py-3 rounded-lg font-semibold transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
