import { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

const colors = {
  background: '#DFE0E2',
  muted: '#B8BCC3',
  accent: '#787A84',
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, login, logout } = useAuth();

  const handleAuthSuccess = (userData) => {
    login(userData);
    // You can redirect to dashboard or profile setup here
    console.log('Authentication successful:', userData);
  };

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.accent }}>
            Welcome to SkillBridge!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully signed in. Redirecting to dashboard...
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={logout}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Out
            </button>
            <Link
              to="/"
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: colors.background }}>
      <div className="w-full max-w-md mx-auto px-4">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/src/assets/skillbridgelogo.png" 
              alt="SkillBridge logo" 
              className="h-16 w-16 rounded-lg object-cover" 
            />
            <span className="text-3xl font-bold" style={{ color: colors.accent }}>
              SkillBridge
            </span>
          </div>
          <p className="text-gray-600 text-lg">
            {isLogin ? 'Sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        {/* Form Container with Smooth Transition */}
        <div className="transition-all duration-300 ease-in-out">
          {isLogin ? (
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to SkillBridge's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
