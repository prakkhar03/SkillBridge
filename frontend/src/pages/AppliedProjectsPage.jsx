import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import { 
  FaArrowLeft, 
  FaClock, 
  FaCheckCircle, 
  FaTimes,
  FaEye,
  FaBriefcase,
  FaDollarSign
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

const ApplicationCard = ({ application }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <FaCheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <FaTimes className="w-5 h-5 text-red-600" />;
      case 'pending': return <FaClock className="w-5 h-5 text-yellow-600" />;
      default: return <FaClock className="w-5 h-5 text-gray-600" />;
    }
  };

  const statusColors = getStatusColor(application.status || 'pending');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{application.project?.title || 'Project Title'}</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.border}`}>
          <span className={statusColors.text}>
            {application.status === 'accepted' ? 'Accepted' : 
             application.status === 'rejected' ? 'Rejected' : 'Pending Review'}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {/* Company Info */}
        <div className="flex items-center text-gray-600">
          <FaBriefcase className="w-4 h-4 mr-2" />
          <span>{application.project?.client_company?.company_name || 'Company Name'}</span>
        </div>
        
        {/* Budget */}
        {application.project?.budget && (
          <div className="flex items-center text-gray-600">
            <FaDollarSign className="w-4 h-4 mr-2" />
            <span className="font-semibold">${application.project.budget}</span>
            {application.project.project_type === 'hourly' && <span className="ml-1">/hr</span>}
          </div>
        )}
        
        {/* Applied Date */}
        <div className="flex items-center text-gray-600">
          <FaClock className="w-4 h-4 mr-2" />
          <span>Applied on {new Date(application.applied_at || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {getStatusIcon(application.status || 'pending')}
          <span className={`ml-2 text-sm ${statusColors.text}`}>
            {application.status === 'accepted' ? 'Application accepted!' : 
             application.status === 'rejected' ? 'Application not selected' : 'Under review'}
          </span>
        </div>
        
        <Link
          to={`/projects/${application.project?.id}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaEye className="w-4 h-4 mr-2" />
          View Project
        </Link>
      </div>
    </div>
  );
};

export default function AppliedProjectsPage() {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppliedProjects();
    }
  }, [isAuthenticated]);

  const fetchAppliedProjects = async () => {
    try {
      setLoading(true);
      // For now, we'll use a mock response since the backend endpoint might not be ready
      // const response = await projectAPI.getAppliedProjects();
      // setApplications(response.data || []);
      
      // Mock data for demonstration
      const mockApplications = [
        {
          id: 1,
          status: 'pending',
          applied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          project: {
            id: '1',
            title: 'React E-commerce Website',
            budget: 2500,
            project_type: 'fixed',
            client_company: { company_name: 'TechCorp Inc.' }
          }
        },
        {
          id: 2,
          status: 'accepted',
          applied_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          project: {
            id: '2',
            title: 'Python Data Analysis Tool',
            budget: 45,
            project_type: 'hourly',
            client_company: { company_name: 'DataFlow Solutions' }
          }
        },
        {
          id: 3,
          status: 'rejected',
          applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          project: {
            id: '3',
            title: 'Mobile App UI Design',
            budget: 1800,
            project_type: 'fixed',
            client_company: { company_name: 'MobileFirst Studios' }
          }
        }
      ];
      
      setApplications(mockApplications);
      setError('');
    } catch (error) {
      console.error('Error fetching applied projects:', error);
      setError('Failed to load your applications. Please try again.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your applications.</p>
          <Link
            to="/auth"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.accent }}>
            My Applications
          </h1>
          <p className="text-lg text-gray-600">
            Track the status of your project applications
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{applications.length}</div>
            <div className="text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {applications.filter(app => app.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {applications.filter(app => app.status === 'accepted').length}
            </div>
            <div className="text-gray-600">Accepted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {applications.filter(app => app.status === 'rejected').length}
            </div>
            <div className="text-gray-600">Not Selected</div>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAppliedProjects}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <FaBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">
              Start applying to projects to see your applications here.
            </p>
            <Link
              to="/projects"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
