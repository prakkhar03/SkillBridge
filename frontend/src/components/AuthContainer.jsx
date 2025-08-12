import { useState } from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import { useAuth } from '../context/AuthContext';

const colors = {
  background: '#DFE0E2',
  muted: '#B8BCC3',
  accent: '#787A84',
};

export default function AuthContainer({ onClose }) {
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
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
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
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center py-8" onClick={onClose}>
      <div className="w-full max-w-md mx-auto px-4" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M6.225 4.811a.75.75 0 0 1 1.06 0L12 9.525l4.715-4.714a.75.75 0 1 1 1.06 1.06L13.06 10.586l4.715 4.715a.75.75 0 1 1-1.06 1.06L12 11.646l-4.715 4.715a.75.75 0 1 1-1.06-1.06l4.714-4.715-4.714-4.714a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/src/assets/skillbridgelogo.png" 
              alt="SkillBridge logo" 
              className="h-12 w-12 rounded-lg object-cover" 
            />
            <span className="text-2xl font-bold" style={{ color: colors.accent }}>
              SkillBridge
            </span>
          </div>
          <p className="text-gray-600">
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
