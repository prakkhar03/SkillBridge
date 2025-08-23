import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verificationAPI } from '../services/api';
import { 
  FaArrowLeft, 
  FaClock, 
  FaCheckCircle, 
  FaTimes,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaSave,
  FaPlay,
  FaPause,
  FaStop
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

const QuestionCard = ({ question, questionIndex, answer, onAnswerChange, isAnswered }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
          Question {questionIndex + 1}
        </span>
        {isAnswered && (
          <FaCheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>
      <span className="text-sm text-gray-500">
        {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Text Answer'}
      </span>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-800 mb-4">
      {question.question}
    </h3>
    
    {question.type === 'multiple_choice' ? (
      <div className="space-y-3">
        {question.options?.map((option, optionIndex) => (
          <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name={`question-${questionIndex}`}
              value={option}
              checked={answer === option}
              onChange={(e) => onAnswerChange(questionIndex, e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    ) : (
      <textarea
        value={answer || ''}
        onChange={(e) => onAnswerChange(questionIndex, e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

const Timer = ({ timeLeft, isRunning, onPause, onResume, onStop }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaClock className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">Time Remaining</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-2xl font-bold ${
            timeLeft <= 300 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {formatTime(timeLeft)}
          </span>
          {isRunning ? (
            <button
              onClick={onPause}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaPause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaPlay className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onStop}
            className="p-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <FaStop className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              timeLeft <= 300 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(timeLeft / 1800) * 100}%` }} // Assuming 30 minutes (1800 seconds)
          ></div>
        </div>
      </div>
    </div>
  );
};

const ProgressIndicator = ({ currentQuestion, totalQuestions, answeredQuestions }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-700">Progress</span>
      <span className="text-sm font-medium text-gray-700">
        {currentQuestion + 1} of {totalQuestions}
      </span>
    </div>
    
    {/* Progress Bar */}
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
        style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
      ></div>
    </div>
    
    {/* Question Status */}
    <div className="flex items-center justify-between mt-3">
      <span className="text-sm text-gray-600">
        Answered: {answeredQuestions} / {totalQuestions}
      </span>
      <span className="text-sm text-gray-600">
        Remaining: {totalQuestions - answeredQuestions}
      </span>
    </div>
  </div>
);

export default function SkillsAssessmentPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0 && testStarted) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, testStarted]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the backend endpoint might not be ready
      // const response = await verificationAPI.startVerification();
      // setTestData(response.data);
      
      // Mock test data
      const mockTestData = {
        test_id: 'test_001',
        questions: [
          {
            id: 1,
            type: 'multiple_choice',
            question: 'What is the primary purpose of React hooks?',
            options: [
              'To manage component state and side effects',
              'To create new components',
              'To style components',
              'To handle routing'
            ],
            correct_answer: 'To manage component state and side effects'
          },
          {
            id: 2,
            type: 'multiple_choice',
            question: 'Which of the following is NOT a valid JavaScript data type?',
            options: [
              'undefined',
              'null',
              'void',
              'symbol'
            ],
            correct_answer: 'void'
          },
          {
            id: 3,
            type: 'text',
            question: 'Explain the concept of closure in JavaScript and provide a practical example.',
            correct_answer: 'A closure is a function that has access to variables in its outer scope.'
          },
          {
            id: 4,
            type: 'multiple_choice',
            question: 'What does CSS Grid primarily help with?',
            options: [
              'Creating animations',
              'Layout and positioning',
              'Color schemes',
              'Typography'
            ],
            correct_answer: 'Layout and positioning'
          },
          {
            id: 5,
            type: 'multiple_choice',
            question: 'Which HTTP method is typically used for creating new resources?',
            options: [
              'GET',
              'POST',
              'PUT',
              'DELETE'
            ],
            correct_answer: 'POST'
          }
        ],
        time_limit: 1800, // 30 minutes
        instructions: 'This test assesses your knowledge of web development fundamentals. Answer all questions to the best of your ability. You can review and change your answers before submitting.'
      };
      
      setTestData(mockTestData);
      setTimeLeft(mockTestData.time_limit);
      setError('');
    } catch (error) {
      console.error('Error fetching test data:', error);
      setError('Failed to load the skills assessment test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleStartTest = () => {
    setTestStarted(true);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    if (window.confirm('Are you sure you want to stop the test? This action cannot be undone.')) {
      navigate('/dashboard');
    }
  };

  const handleTimeUp = () => {
    setIsRunning(false);
    alert('Time is up! Your test will be submitted automatically.');
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      
      // For now, we'll simulate the submission
      // const response = await verificationAPI.submitTest(testData.test_id, answers);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful submission
      alert('Test submitted successfully! You will be notified of your results soon.');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to take the skills assessment.</p>
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
          <p className="text-gray-600">Loading skills assessment...</p>
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Not Available</h2>
          <p className="text-gray-600 mb-6">Unable to load the skills assessment test.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
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
              Skills Assessment Test
            </h1>
            <p className="text-lg text-gray-600">
              Test your knowledge and skills to get verified on SkillBridge
            </p>
          </div>

          {/* Test Instructions */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <FaQuestionCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Instructions</h2>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Test Format</h3>
                  <p className="text-gray-600">This test contains {testData.questions.length} questions covering various aspects of web development.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaClock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Time Limit</h3>
                  <p className="text-gray-600">You have {Math.floor(testData.time_limit / 60)} minutes to complete the test.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">Important Notes</h3>
                  <p className="text-gray-600">Once you start the test, the timer will begin and cannot be paused for extended periods.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleStartTest}
                className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto space-x-2"
              >
                <FaPlay className="w-5 h-5" />
                <span>Start Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Skills Assessment Test</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Exit Test
            </button>
          </div>
        </div>

        {/* Timer and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Timer
              timeLeft={timeLeft}
              isRunning={isRunning}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
            />
          </div>
          <div>
            <ProgressIndicator
              currentQuestion={currentQuestion}
              totalQuestions={testData.questions.length}
              answeredQuestions={getAnsweredQuestionsCount()}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Current Question */}
        <QuestionCard
          question={testData.questions[currentQuestion]}
          questionIndex={currentQuestion}
          answer={answers[currentQuestion]}
          onAnswerChange={handleAnswerChange}
          isAnswered={answers[currentQuestion]}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentQuestion === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {testData.questions.length}
            </span>
            
            {currentQuestion === testData.questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4 mr-2 inline" />
                    Submit Test
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
