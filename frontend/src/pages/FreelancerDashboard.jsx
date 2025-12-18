import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { verificationAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { BentoGrid, BentoGridItem } from '../ui/layout/BentoGrid';
import ScrollReveal from '../ui/utils/ScrollReveal';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  FaUserEdit,
  FaCheckCircle,
  FaChartLine,
  FaTrophy,
  FaSearch,
  FaBriefcase,
  FaRocket,
  FaCode
} from 'react-icons/fa';
const parseGeminiJSON = (raw) => {
  try {
    if (!raw || typeof raw !== "string") return null;


    let cleaned = raw.trim();

    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1);
    }

  
    cleaned = cleaned
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini JSON parse failed:", err, raw);
    return null;
  }
};
const getProfileSteps = (profile, user, isEmailVerified) => {
  return [
    {
      title: "Account Created",
      description: "Your account has been successfully registered",
      completed: !!user,
    },
    {
      title: "Email Verified",
      description: "Verify your email address to continue",
      completed: isEmailVerified === true, 
    },
    {
      title: "Profile Completed",
      description: "Fill out your professional profile",
      completed:
        !!profile?.full_name &&
        !!profile?.bio &&
        !!profile?.skills &&
        !!profile?.experience_level &&
        !!profile?.location,
    },
    {
      title: "Skills Assessment",
      description: "Complete skills verification test",
      completed: profile?.verification_tag !== "Unverified",
    },
  ];
};


const OnboardingStep = ({ step, title, description, isActive, isCompleted }) => (
  <div className={`flex items-start space-x-3 p-4 rounded-lg border transition-all duration-300 ${isActive ? 'border-cyan-500/50 bg-cyan-500/10' :
    isCompleted ? 'border-green-500/50 bg-green-500/10' :
      'border-white/10 bg-white/5'
    }`}>
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' :
      isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
        'bg-gray-700 text-gray-400'
      }`}>
      {isCompleted ? (
        <FaCheckCircle className="w-4 h-4" />
      ) : (
        <span className="text-sm font-bold">{step}</span>
      )}
    </div>
    <div className="flex-1">
      <h3 className={`font-semibold ${isActive ? 'text-cyan-400' :
        isCompleted ? 'text-green-400' :
          'text-gray-400'
        }`}>
        {title}
      </h3>
      <p className={`text-xs ${isActive ? 'text-cyan-300/80' :
        isCompleted ? 'text-green-300/80' :
          'text-gray-500'
        }`}>
        {description}
      </p>
    </div>
  </div>
);

const VerificationStatus = ({ status, rating }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Expert': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' };
      case 'Intermediate': return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' };
      case 'Beginner': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
    }
  };

  const statusColors = getStatusColor(status);

  return (
    <div className={`p-4 rounded-lg border ${statusColors.bg} ${statusColors.border} backdrop-blur-sm h-full flex flex-col justify-center`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold ${statusColors.text}`}>Verification Status</h3>
        <FaTrophy className={`w-6 h-6 ${statusColors.text}`} />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${statusColors.text} opacity-80`}>Level:</span>
          <span className={`font-bold text-lg ${statusColors.text}`}>{status}</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div className={`h-full ${statusColors.text.replace('text', 'bg')} opacity-80`} style={{ width: `${(rating / 5) * 100}%` }}></div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${statusColors.text} opacity-80`}>Rating:</span>
          <div className="flex items-center space-x-1">
            <span className={`font-bold ${statusColors.text}`}>{rating}/5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FreelancerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStage, setOnboardingStage] = useState(0);
  const [geminiRec, setGeminiRec] = useState(null);
  const [recLoading, setRecLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);



const steps = getProfileSteps(profile, user, isEmailVerified);

const completedSteps = steps.filter(step => step.completed).length;
const progressPercentage = Math.round(
  (completedSteps / steps.length) * 100
);



  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setProfile({});
          setOnboardingStage(0);
        }
      }, 10000);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, loading]);

const fetchProfile = async () => {
  try {
    const response = await authAPI.getProfile();
    const userData = response.data;
    setProfile(userData.profile);
    setOnboardingStage(userData.onboarding_stage || 0);
    setIsEmailVerified(userData.verified === true);

  } catch (error) {
    console.error("Failed to fetch profile", error);
    setProfile(null);
    setOnboardingStage(0);
  } finally {
    setLoading(false);
  }
};
const fetchRecommendation = async () => {
  try {
    const res = await verificationAPI.getRecommendation();

    const parsed = parseGeminiJSON(res);
    setGeminiRec(parsed);


    console.log("Parsed Gemini:", parsed); 

    setGeminiRec(parsed);
  } catch (err) {
    console.error("Failed to fetch Gemini recommendation", err);
    setGeminiRec(null);
  } finally {
    setRecLoading(false);
  }
};


useEffect(() => {
  if (isAuthenticated) {
    fetchProfile();
    fetchRecommendation();
  }
}, [isAuthenticated]);


  // const steps = [
  //   { step: 1, title: "Account Created", description: "Your account has been successfully registered", status: "completed" },
  //   { step: 2, title: "Email Verified", description: "Verify your email address to continue", status: onboardingStage >= 1 ? "completed" : "pending" },
  //   { step: 3, title: "Profile Completed", description: "Fill out your professional profile", status: onboardingStage >= 2 ? "completed" : "pending" },
  //   { step: 4, title: "Skills Assessment", description: "Complete skills verification test", status: onboardingStage >= 3 ? "completed" : "pending" }
  // ];

  // const currentStep = steps.findIndex(step => step.status === "pending") + 1;
  // const progressPercentage = 100;

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-deep-violet">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hot-pink mx-auto mb-4"></div>
        <p className="text-hot-pink text-lg">Authentication required</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-deep-violet">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan mx-auto mb-4"></div>
        <p className="text-neon-cyan">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep-violet text-white p-4 md:p-8 pt-40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-12 mt-24">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome back, <span className="aurora-text">{profile?.full_name || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-xl text-gray-400 font-light">
              Your command center for <span className="text-neon-cyan">projects</span>, <span className="text-electric-purple">skills</span>, and <span className="text-hot-pink">growth</span>.
            </p>
          </div>
        </ScrollReveal>

        {/* Onboarding Progress - Full Width */}
        <ScrollReveal delay={0.2}>
          <div className="holo-card rounded-2xl p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Onboarding Progress</h2>
                <p className="text-gray-400 text-sm">Complete these steps to unlock full potential</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-3xl font-bold text-neon-cyan">{Math.round(progressPercentage)}%</span>
                <div className="w-48 h-3 bg-gray-800 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-electric-purple transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <OnboardingStep
                  key={step.step}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                  isActive={step.status === "pending" && index === currentStep - 1}
                  isCompleted={step.status === "completed"}
                />
              ))}
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <OnboardingStep
                key={index}               
                step={index + 1}           
                title={step.title}
                description={step.description}
                isActive={!step.completed} 
                isCompleted={step.completed} 
              />
            ))}
          </div>

          </div>
        </ScrollReveal>

        {/* Bento Grid Layout */}
        <ScrollReveal delay={0.4}>
          <BentoGrid className="mb-12">
            {/* Profile Management - Large Item */}
            <BentoGridItem
              title="Profile Management"
              description="Update your professional persona"
              header={
                <div className="flex flex-1 w-full h-full min-h-[8rem] rounded-xl bg-gradient-to-br from-electric-purple/20 to-deep-violet items-center justify-center group-hover:bg-electric-purple/30 transition-colors">
                  <FaUserEdit className="w-16 h-16 text-electric-purple drop-shadow-[0_0_10px_rgba(112,0,255,0.5)]" />
                </div>
              }
              className="md:col-span-1 holo-card border-none"
              icon={<FaUserEdit className="h-4 w-4 text-gray-400" />}
              onClick={() => { }}
            />

            {/* Project Discovery - Large Item */}
            <BentoGridItem
              title="Project Discovery"
              description="Find your next big opportunity"
              header={
                <div className="flex flex-1 w-full h-full min-h-[8rem] rounded-xl bg-gradient-to-br from-neon-cyan/20 to-deep-violet items-center justify-center group-hover:bg-neon-cyan/30 transition-colors">
                  <FaSearch className="w-16 h-16 text-neon-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                </div>
              }
              className="md:col-span-1 holo-card border-none"
              icon={<FaSearch className="h-4 w-4 text-gray-400" />}
            />

            {/* Verification Status - Vertical Item */}
            {/* <BentoGridItem
              title="Verification"
              description="Your current skill standing"
              header={
                <VerificationStatus
                  status={profile?.verification_tag || "Unverified"}
                  rating={profile?.star_rating || 0.0}
                />
              }
              className="md:col-span-1 md:row-span-2 holo-card border-none"
              icon={<FaTrophy className="h-4 w-4 text-gray-400" />}
            /> */}
          <BentoGridItem
  title="Skill-Bridge Recommendation"
  description="Generated by AI verified by skills"
  header={
    <div className="p-5 rounded-lg border border-purple-500/30 bg-purple-500/10 h-full overflow-y-auto text-sm space-y-4">

      {recLoading ? (
        <p className="text-purple-300">Analyzing your profile…</p>
      ) : geminiRec ? (
        <>
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-semibold">AI Rating</span>
            <span className="text-xl font-bold text-purple-400">
              {geminiRec.star_rating} / 5
            </span>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
            {geminiRec.recommended_tags}
          </div>
          <div>
            <h4 className="text-green-400 font-semibold mb-1">Strengths</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {geminiRec.strengths.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-semibold mb-1">Weaknesses</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {geminiRec.weaknesses.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-gray-400">No recommendation available yet.</p>
      )}
    </div>
  }
  className="md:col-span-1 md:row-span-2 holo-card border-none"
  icon={<FaRocket className="h-4 w-4 text-purple-400" />}
/>


            {/* Quick Stats - Horizontal Item */}
            <BentoGridItem
              title="Quick Stats"
              description="At a glance overview"
              header={
                <div className="grid grid-cols-2 gap-3 w-full h-full">
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5 hover:border-neon-cyan/30 transition-colors">
                    <div className="text-3xl font-bold text-neon-cyan">{profile?.skills ? profile.skills.split(',').length : 0}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Skills</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center border border-white/5 hover:border-hot-pink/30 transition-colors">
                    <div className="text-3xl font-bold text-hot-pink">0</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Applied</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl text-center col-span-2 border border-white/5 hover:border-electric-purple/30 transition-colors flex flex-col justify-center">
                    <div className="text-xl font-bold text-electric-purple">{profile?.experience_level || "N/A"}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Experience Level</div>
                  </div>
                </div>
              }
              className="md:col-span-1 holo-card border-none"
              icon={<FaChartLine className="h-4 w-4 text-gray-400" />}
            />

            {/* Skills Verification */}
            <BentoGridItem
              title="Skill Test"
              description="Prove your expertise"
              header={
                <div className="flex flex-1 w-full h-full min-h-[8rem] rounded-xl bg-gradient-to-br from-hot-pink/20 to-deep-violet items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-hot-pink/20 blur-2xl group-hover:blur-3xl transition-all opacity-50"></div>
                  <FaRocket className="w-12 h-12 text-hot-pink relative z-10 drop-shadow-[0_0_15px_rgba(255,0,153,0.6)] group-hover:scale-110 transition-transform duration-300" />
                </div>
              }
              className="md:col-span-1 holo-card border-none"
              icon={<FaRocket className="h-4 w-4 text-gray-400" />}
            />
          </BentoGrid>
        </ScrollReveal>

        {/* Action Links */}
        <ScrollReveal delay={0.6}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Link to="/profile/edit" className="glass-pill p-6 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
              <FaUserEdit className="w-8 h-8 mb-3 text-electric-purple group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold tracking-wide">EDIT PROFILE</span>
            </Link>
            <Link to="/projects" className="glass-pill p-6 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
              <FaSearch className="w-8 h-8 mb-3 text-neon-cyan group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold tracking-wide">BROWSE JOBS</span>
            </Link>
            <Link to="/verification/test" className="glass-pill p-6 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
              <FaCode className="w-8 h-8 mb-3 text-hot-pink group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold tracking-wide">SKILL TEST</span>
            </Link>
            <Link to="/projects/applied" className="glass-pill p-6 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all">
              <FaBriefcase className="w-8 h-8 mb-3 text-white group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold tracking-wide">APPLICATIONS</span>
            </Link>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
