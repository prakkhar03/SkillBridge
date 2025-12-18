const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const verificationAPI = {
    // Fetch generated questions based on profile/skills
    getQuestions: async (skills) => {
        try {
            const response = await fetch(`${API_URL}/api/verification/test/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ skills }),
            });
            if (!response.ok) throw new Error('Failed to fetch questions');
            return response.json();
        } catch (error) {
            console.error('Error getting questions:', error);
            throw error;
        }
    },

    // Submit test results
    submitTest: async (resultData) => {
        try {
            const response = await fetch(`${API_URL}/api/verification/test/${resultData.test_id}/submit/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ answers: resultData.answers }),
            });
            if (!response.ok) throw new Error('Failed to submit test');
            return response.json();
        } catch (error) {
            console.error('Error submitting test:', error);
            throw error;
        }
    }
};
