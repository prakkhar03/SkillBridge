import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FaBriefcase,
    FaCode,
    FaDollarSign,
    FaClock,
    FaArrowLeft,
    FaCheckCircle,
    FaBuilding,
    FaRocket,
    FaShieldAlt
} from 'react-icons/fa';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../ui/utils/ScrollReveal';

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const data = await projectAPI.getProjectById(projectId);
            setProject(data);
            // Check if user already applied
            if (user && data.applicants?.includes(user.id)) {
                setApplied(true);
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            setError('Project not found or connection error.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/auth');
            return;
        }

        try {
            setApplying(true);
            await projectAPI.applyToProject(projectId, {});
            setApplied(true);
            alert('Application submitted successfully!');
        } catch (err) {
            console.error('Error applying:', err);
            alert(err.message || 'Failed to submit application.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-deep-violet">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
        </div>
    );

    if (error || !project) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-deep-violet text-white px-4">
            <h2 className="text-3xl font-bold mb-4">{error || 'Project not found'}</h2>
            <button
                onClick={() => navigate('/projects')}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center"
            >
                <FaArrowLeft className="mr-2" /> Back to Jobs
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-deep-violet text-white pt-40 px-4 md:px-8 pb-12">
            <div className="max-w-5xl mx-auto">
                <ScrollReveal>
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center mb-8"
                        >
                            <FaArrowLeft className="mr-3" /> Back
                        </button>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold aurora-text mb-4 leading-tight">{project.title}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <span className="flex items-center"><FaBuilding className="mr-2 text-neon-cyan" /> {project.client_company?.company_name || 'Verified Client'}</span>
                                    <span className="flex items-center"><FaClock className="mr-2 text-neon-cyan" /> {new Date(project.created_at).toLocaleDateString()}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${project.project_type === 'fixed'
                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                            : 'bg-green-500/10 text-green-400 border-green-500/30'
                                        }`}>
                                        {project.project_type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end justify-center">
                                <div className="text-3xl font-bold text-white mb-2">${project.budget}{project.project_type === 'hourly' && <span className="text-sm font-normal text-gray-500">/hr</span>}</div>
                                {user?.role === 'freelancer' && (
                                    <button
                                        disabled={applied || applying}
                                        onClick={handleApply}
                                        className={`w-full md:w-auto px-12 py-4 rounded-xl font-bold transition-all shadow-2xl uppercase tracking-widest ${applied
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                                : 'bg-gradient-to-r from-neon-cyan to-electric-purple text-white hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]'
                                            }`}
                                    >
                                        {applied ? (
                                            <span className="flex items-center justify-center"><FaCheckCircle className="mr-2" /> APPLIED</span>
                                        ) : applying ? (
                                            'SUBMITTING...'
                                        ) : (
                                            <span className="flex items-center justify-center"><FaRocket className="mr-2" /> APPLY NOW</span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                    <div className="lg:col-span-2 space-y-8">
                        <ScrollReveal delay={0.1}>
                            <div className="holo-card p-8 rounded-2xl border-none">
                                <h2 className="text-2xl font-bold mb-6 flex items-center tracking-wide uppercase">
                                    <FaBriefcase className="mr-3 text-neon-cyan" /> Project Description
                                </h2>
                                <div className="text-gray-300 leading-relaxed space-y-4 font-light text-lg">
                                    {project.description.split('\n').map((para, i) => para ? <p key={i}>{para}</p> : <br key={i} />)}
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <div className="holo-card p-8 rounded-2xl border-none">
                                <h2 className="text-2xl font-bold mb-6 flex items-center tracking-wide uppercase">
                                    <FaCode className="mr-3 text-neon-cyan" /> Required Skills
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {project.skills_required?.split(',').map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-white/5 text-gray-200 text-sm rounded-xl border border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
                                        >
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    <div className="space-y-8">
                        <ScrollReveal delay={0.3}>
                            <div className="holo-card p-8 rounded-2xl border-none bg-gradient-to-br from-white/5 to-neon-cyan/5">
                                <h3 className="text-xl font-bold mb-6 flex items-center uppercase tracking-widest text-neon-cyan">
                                    <FaShieldAlt className="mr-3" /> Trust & Safety
                                </h3>
                                <ul className="space-y-4 text-sm text-gray-400">
                                    <li className="flex items-start">
                                        <FaCheckCircle className="mr-3 text-green-400 mt-1 flex-shrink-0" />
                                        Verified Client Details
                                    </li>
                                    <li className="flex items-start">
                                        <FaCheckCircle className="mr-3 text-green-400 mt-1 flex-shrink-0" />
                                        Escrow-backed Payment
                                    </li>
                                    <li className="flex items-start">
                                        <FaCheckCircle className="mr-3 text-green-400 mt-1 flex-shrink-0" />
                                        SkillBridge Dispute Resolution
                                    </li>
                                </ul>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.4}>
                            <div className="holo-card p-8 rounded-2xl border-none">
                                <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">About the Client</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Company</p>
                                        <p className="text-white font-medium">{project.client_company?.company_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Industry</p>
                                        <p className="text-white font-medium">{project.client_company?.industry || 'Technology'}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
    );
}
