const API_BASE_URL = 'http://localhost:8000/api';


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


export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    window.location.href = '/auth';
    return null;
  }

  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
};


const apiRequest = async (endpoint, options = {}) => {
  let token = getToken();

  const makeRequest = async (accessToken) => {
  const isFormData = options.body instanceof FormData;

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });
};


  let response = await makeRequest(token);


  if (response.status === 401) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) throw new Error('Session expired');
    response = await makeRequest(newAccess);
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};


export const authAPI = {
  register: async (userData) => {
    return apiRequest('/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest('/accounts/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

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


  getProfile: async () => {
    return apiRequest('/accounts/profile/');
  },

  updateProfile: async (profileData, method = 'PATCH') => {
    return apiRequest('/accounts/profile/update/', {
      method,
      body: profileData, 
    });
  },


  getProfileById: async (userId) => {
    return apiRequest(`/accounts/profile/${userId}/`);
  },
};


export const projectAPI = {
  getProjects: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/projects/?${queryParams}` : '/projects/';
    return apiRequest(endpoint);
  },

  getProjectById: async (projectId) => {
    return apiRequest(`/projects/${projectId}/`);
  },

  applyToProject: async (projectId, applicationData) => {
    return apiRequest(`/projects/${projectId}/apply/`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  getAppliedProjects: async () => {
    return apiRequest('/projects/applied/');
  },

  getProjectApplicants: async (projectId) => {
    return apiRequest(`/projects/${projectId}/applicants/`);
  },

  createProject: async (projectData) => {
    return apiRequest('/projects/create/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  getClientProjects: async () => {
    return apiRequest('/projects/');
  },
};


export const verificationAPI = {
  getVerificationStatus: async () => {
    return apiRequest('/verification/status/');
  },

  startVerification: async () => {
    return apiRequest('/verification/start/', { method: 'POST' });
  },

  submitTest: async (testId, answers) => {
    return apiRequest(`/verification/test/${testId}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },

  getVerificationHistory: async () => {
    return apiRequest('/verification/history/');
  },

  getRecommendation: async () => {
    return apiRequest('/verification/recommendation/');
  },
};


export default authAPI;
