const API_BASE_URL = 'http://localhost:8000/api';

// JWT Token management
export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Create a proper error object with the backend message
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // If it's already our custom error, re-throw it
    if (error.status) {
      throw error;
    }
    // Otherwise, create a generic error
    const genericError = new Error(error.message || 'Network error occurred');
    genericError.status = 500;
    throw genericError;
  }
};

// Authentication API calls
export const authAPI = {
  // User registration
  register: async (userData) => {
    return apiRequest('/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  login: async (credentials) => {
    return apiRequest('/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // User logout
  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await apiRequest('/accounts/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    clearTokens();
  },

  // Get user profile
  getProfile: async () => {
    return apiRequest('/accounts/profile/');
  },

  // Update user profile
  updateProfile: async (profileData, method = 'PATCH') => {
    return apiRequest('/accounts/profile/update/', {
      method,
      body: JSON.stringify(profileData),
    });
  },
};

// Project API calls
export const projectAPI = {
  // Get all available projects
  getProjects: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/projects/?${queryParams}` : '/projects/';
    return apiRequest(endpoint);
  },

  // Get project details by ID
  getProjectById: async (projectId) => {
    return apiRequest(`/projects/${projectId}/`);
  },

  // Apply to a project
  applyToProject: async (projectId, applicationData) => {
    return apiRequest(`/projects/${projectId}/apply/`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Get user's applied projects
  getAppliedProjects: async () => {
    return apiRequest('/projects/applied/');
  },

  // Get project applicants (for clients)
  getProjectApplicants: async (projectId) => {
    return apiRequest(`/projects/${projectId}/applicants/`);
  },

  // Create a new project (for clients)
  createProject: async (projectData) => {
    return apiRequest('/projects/create/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Get projects posted by the current client
  getClientProjects: async () => {
    return apiRequest('/projects/'); // Backend handles filtering based on role/user
  },
};

// Verification API calls
export const verificationAPI = {
  // Get verification status
  getVerificationStatus: async () => {
    return apiRequest('/verification/status/');
  },

  // Start verification process
  startVerification: async () => {
    return apiRequest('/verification/start/', {
      method: 'POST',
    });
  },

  // Submit skills test
  submitTest: async (testId, answers) => {
    return apiRequest(`/verification/test/${testId}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  // Get test results
  getTestResults: async (testId) => {
    return apiRequest(`/verification/test/${testId}/results/`);
  },

  // Upload resume
  uploadResume: async (formData) => {
    return apiRequest('/verification/resume/upload/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  },

  // Connect GitHub profile
  connectGitHub: async (githubUsername) => {
    return apiRequest('/verification/github/connect/', {
      method: 'POST',
      body: JSON.stringify({ github_username: githubUsername }),
    });
  },

  // Get GitHub analysis results
  getGitHubAnalysis: async () => {
    return apiRequest('/verification/github/analysis/');
  },

  // Get verification history
  getVerificationHistory: async () => {
    return apiRequest('/verification/history/');
  }
};

export default authAPI;
