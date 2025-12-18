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
  FaPlay,
  FaPause,
  FaStop
} from 'react-icons/fa';

export default function SkillsAssessmentPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);

  useEffect(() => {
    if (!testStarted) return;

    const handleVisibility = () => {
      if (document.hidden) {
        alert("Tab switching is not allowed");
      }
    };

    const handleContext = e => e.preventDefault();

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setFullscreenWarnings(p => {
          if (p + 1 >= 3) {
            handleSubmitTest();
            return p + 1;
          }
          alert(`Fullscreen required (${p + 1}/3)`);
          document.documentElement.requestFullscreen().catch(() => {});
          return p + 1;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", handleContext);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", handleContext);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [testStarted]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleSubmitTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const enterFullScreen = () => {
    document.documentElement.requestFullscreen().catch(() => {});
  };

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const res = await verificationAPI.startVerification();

      setTestData({
        test_id: res.test_id,
        questions: res.questions,
        time_limit: 1800
      });

      setAnswers([]);
      setTimeLeft(1800);
      setTestStarted(true);
      setIsRunning(true);
      enterFullScreen();
    } catch {
      setError("Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, optionText) => {
    const letter = optionText.trim()[0];
    const updated = [...answers];
    updated[index] = letter;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(q => q + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(q => q - 1);
    }
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      if (document.fullscreenElement) document.exitFullscreen();

      await verificationAPI.submitTest(
        testData.test_id,
        { answers }
      );

      alert("Test submitted successfully");
      navigate('/dashboard');
    } catch {
      setError("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = answers.filter(Boolean).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-violet text-white">
        <button onClick={() => navigate('/auth')}>Sign In</button>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-deep-violet text-white pt-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Skills Assessment</h1>
          <p className="mb-8">30 minute secure test</p>
          <button onClick={fetchTestData} className="px-8 py-4 bg-cyan-500 rounded-full">
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  const q = testData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-deep-violet text-white pt-32">
      <div className="max-w-6xl mx-auto px-4">

        <div className="flex justify-between mb-6">
          <h2 className="text-xl">Question {currentQuestion + 1}/{testData.questions.length}</h2>
          <span>{answeredCount} answered</span>
        </div>

        <div className="holo-card p-6 mb-6 rounded-xl">
          <h3 className="text-lg mb-6">{q.question}</h3>

          <div className="space-y-4">
            {q.options.map((opt, idx) => (
              <label key={idx} className={`flex items-center p-4 rounded-lg border cursor-pointer ${answers[currentQuestion] === opt[0] ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10'}`}>
                <input
                  type="radio"
                  name={`q-${currentQuestion}`}
                  checked={answers[currentQuestion] === opt[0]}
                  onChange={() => handleAnswerChange(currentQuestion, opt)}
                  className="mr-3"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between holo-card p-6 rounded-xl">
          <button disabled={currentQuestion === 0} onClick={handlePrev}>
            Previous
          </button>

          {currentQuestion === testData.questions.length - 1 ? (
            <button disabled={submitting} onClick={handleSubmitTest}>
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          ) : (
            <button onClick={handleNext}>Next</button>
          )}
        </div>

      </div>
    </div>
  );
}
