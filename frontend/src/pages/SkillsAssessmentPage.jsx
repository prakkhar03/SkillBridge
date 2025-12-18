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
          <span className={`text-2xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-blue-600'
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
            className={`h-2 rounded-full transition-all duration-300 ${timeLeft <= 300 ? 'bg-red-500' : 'bg-blue-500'
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
  const { isAuthenticated, user } = useAuth();
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [fullScreenWarning, setFullScreenWarning] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false); // Wait for start test to fetch data
    }
  }, [isAuthenticated]);

  // Secure Mode Effects
  useEffect(() => {
    if (testStarted) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          alert("WARNING: Tab switching is not allowed during the test!");
          // Optional: Auto-submit or penalize
        }
      };

      const handleContextMenu = (e) => {
        e.preventDefault();
      };

      const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
          setFullScreenWarning(prev => prev + 1);
          if (fullScreenWarning > 2) {
            handleTimeUp(); // Force submit
          } else {
            alert(`WARNING: You must stay in fullscreen mode! (${fullScreenWarning + 1}/3 warnings)`);
            // Try to re-enter
            document.documentElement.requestFullscreen().catch(() => { });
          }
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("fullscreenchange", handleFullScreenChange);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("fullscreenchange", handleFullScreenChange);
      };
    }
  }, [testStarted, fullScreenWarning]);

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
      setError('');

      // Standard React Assessment (Reliable Fallback)
      const mockTestData = {
        test_id: `test_react_${Date.now()}`,
        time_limit: 1800, // 30 minutes
        instructions: "Answer all questions. Do not exit fullscreen or switch tabs.",
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
            options: ['undefined', 'null', 'void', 'symbol'],
            correct_answer: 'void'
          },
          {
            id: 3,
            type: 'multiple_choice',
            question: 'What is the virtual DOM in React?',
            options: [
              'A direct copy of the browser DOM',
              'A lightweight representation of the real DOM in memory',
              'A server-side rendering tool',
              'A database for storing component state'
            ],
            correct_answer: 'A lightweight representation of the real DOM in memory'
          },
          {
            id: 4,
            type: 'multiple_choice',
            question: 'Which hook should be used for optimized performance by memoizing a function?',
            options: ['useEffect', 'useMemo', 'useCallback', 'useContext'],
            correct_answer: 'useCallback'
          },
          {
            id: 5,
            type: 'multiple_choice',
            question: 'Explain the concept of Lifted State in React.',
            options: [
              'Moving state to a parent component to share it between siblings',
              'Using global Redux state',
              'Passing state down through props',
              'Deleting state when a component unmounts'
            ],
            correct_answer: 'Moving state to a parent component to share it between siblings'
          }
        ]
      };

      try {
        // Try dynamic fetching first
        const skills = user?.skills || "React, JavaScript, Web Development";
        const response = await verificationAPI.getQuestions(skills);

        const finalData = (response && response.questions && response.questions.length > 0)
          ? {
            test_id: response.test_id || `test_${Date.now()}`,
            questions: response.questions,
            time_limit: response.time_limit || 1800,
            instructions: "Answer all questions. Do not exit fullscreen or switch tabs."
          }
          : mockTestData;

        setTestData(finalData);
        setTimeLeft(finalData.time_limit);
        setTestStarted(true);
        setIsRunning(true);
        enterFullScreen();

      } catch (err) {
        console.error("Dynamic generation failed, using internal fallback:", err);
        setTestData(mockTestData);
        setTimeLeft(mockTestData.time_limit);
        setTestStarted(true);
        setIsRunning(true);
        enterFullScreen();
      }

    } catch (error) {
      console.error('Critical error in fetchTestData:', error);
      setError('Failed to initialize test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (testData && currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleStartTest = () => {
    fetchTestData();
  };

  const handlePause = () => {
    // Disable pausing in secure mode?
    // setIsRunning(false);
  };

  const handleResume = () => {
    // setIsRunning(true);
  };

  const handleStop = () => {
    if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
      navigate('/dashboard');
    }
  };

  const handleTimeUp = () => {
    setIsRunning(false);
    alert('Time is up! Submitting test...');
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }

      const resultData = {
        test_id: testData.test_id,
        answers: answers,
        // user_id handled by backend token
      };

      await verificationAPI.submitTest(resultData);

      alert('Test submitted successfully! Check your dashboard for verification status.');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit test. Please check connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredQuestionsCount = () => {
    return Object.keys(answers).length;
  };

  if (!isAuthenticated) return (/* ... Auth Required ... */
    <div className="min-h-screen flex items-center justify-center bg-deep-violet">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
        <button onClick={() => navigate('/auth')} className="neon-button px-6 py-3 rounded-lg">Sign In</button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-deep-violet">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
        <p className="text-neon-cyan">Generating your personalized assessment...</p>
      </div>
    </div>
  );

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-deep-violet text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-40">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 aurora-text mt-24">
              Skills Assessment Test
            </h1>
            <p className="text-xl text-gray-300">
              Prove your expertise to earn the <span className="text-neon-cyan">Verified</span> badge.
            </p>
          </div>

          {/* Test Instructions */}
          <div className="holo-card rounded-xl p-8 mb-8">
            <div className="text-center mb-8">
              <FaQuestionCircle className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Secure Mode Assessment</h2>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white">Dynamic Questions</h3>
                  <p className="text-gray-400">Questions are generated based on your profile skills.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaClock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white">Time Limit</h3>
                  <p className="text-gray-400">You will have 30 minutes to complete the test.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-5 h-5 text-hot-pink mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-white">Secure Environment</h3>
                  <ul className="text-gray-400 list-disc list-inside">
                    <li>Fullscreen mode required</li>
                    <li>Tab switching is monitored</li>
                    <li>Right-click context menu is disabled</li>
                    <li>Multiple violations will auto-submit the test</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-red-400 mb-4">{error}</div>
              <button
                onClick={handleStartTest}
                className="neon-button px-8 py-4 text-lg font-bold rounded-full flex items-center mx-auto space-x-2"
              >
                <FaPlay className="w-5 h-5" />
                <span>Start Secure Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-violet text-white select-none mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neon-cyan">SkillBridge Assessment</h1>
          <div className="text-sm text-red-400 flex items-center gap-2">
            <FaExclamationTriangle />
            Do not exit fullscreen
          </div>
        </div>

        {/* Timer and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Timer
              timeLeft={timeLeft}
              isRunning={isRunning}
              onPause={() => { }} // Disabled
              onResume={() => { }} // Disabled
              onStop={handleStop}
            />
          </div>
          <div>
            <ProgressIndicator
              currentQuestion={currentQuestion}
              totalQuestions={testData?.questions?.length || 0}
              answeredQuestions={getAnsweredQuestionsCount()}
            />
          </div>
        </div>

        {/* Question Card - Using Holo Card style */}
        {testData && testData.questions && (
          <div className="holo-card p-6 mb-6 rounded-xl">
            <div className="flex items-start justify-between mb-6">
              <span className="bg-electric-purple/20 text-electric-purple text-sm font-semibold px-4 py-1 rounded-full border border-electric-purple/50">
                Question {currentQuestion + 1}
              </span>
              <span className="text-sm text-gray-400 uppercase">
                {testData.questions[currentQuestion].type === 'multiple_choice' ? 'Multiple Choice' : 'Text Answer'}
              </span>
            </div>

            <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
              {testData.questions[currentQuestion].question}
            </h3>

            {testData.questions[currentQuestion].type === 'multiple_choice' ? (
              <div className="space-y-4">
                {testData.questions[currentQuestion].options?.map((option, idx) => (
                  <label key={idx} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answers[currentQuestion] === option
                    ? 'border-neon-cyan bg-neon-cyan/10'
                    : 'border-white/10 hover:bg-white/5'
                    }`}>
                    <input
                      type="radio"
                      name={`q-${currentQuestion}`}
                      value={option}
                      checked={answers[currentQuestion] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                      className="w-5 h-5 text-neon-cyan bg-transparent border-gray-500 focus:ring-neon-cyan focus:ring-offset-0"
                    />
                    <span className="ml-3 text-gray-200">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none"
                rows={6}
                placeholder="Type your answer here..."
              />
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between holo-card p-6 rounded-xl">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentQuestion === 0
              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            Previous
          </button>

          {currentQuestion === (testData?.questions?.length || 0) - 1 ? (
            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-neon-cyan to-electric-purple text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
