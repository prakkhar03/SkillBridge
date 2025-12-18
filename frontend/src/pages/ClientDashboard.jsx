import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FaPlus,
    FaBriefcase,
    FaUsers,
    FaCheckCircle,
    FaClock,
    FaChartLine,
    FaEllipsisV,
    FaEye,
    FaEdit,
    FaTrashAlt,
    FaStar,
    FaTimes,
    FaEnvelope,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScrollReveal from '../ui/utils/ScrollReveal';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="holo-card p-6 rounded-2xl flex items-center space-x-4 border-none hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all">
        <div className={`p-4 rounded-xl ${colorClass}/20`}>
            <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const ApplicantModal = ({ project, applicants, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <ScrollReveal className="h-full">
                <div className="holo-card rounded-3xl border-none flex flex-col h-full bg-deep-violet shadow-2xl overflow-hidden max-h-[90vh]">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div>
                            <h2 className="text-2xl font-bold aurora-text mb-1">Applicants</h2>
                            <p className="text-gray-400 text-sm font-light">for <span className="text-white font-medium">{project.title}</span></p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto space-y-6">
                        {applicants.length > 0 ? (
                            applicants.map((applicant) => (
                                <div key={applicant.id} className="holo-card p-6 rounded-2xl border-white/5 hover:border-neon-cyan/30 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl rounded-full"></div>
                                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {applicant.profile?.full_name?.charAt(0) || applicant.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">{applicant.profile?.full_name || 'Anonymous User'}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${applicant.profile?.verification_tag === 'Expert' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                    applicant.profile?.verification_tag === 'Intermediate' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                    }`}>
                                                    {applicant.profile?.verification_tag || 'Unverified'}
                                                </span>
                                                {applicant.profile?.star_rating > 0 && (
                                                    <div className="flex items-center text-yellow-400 text-sm">
                                                        <FaStar className="mr-1" /> {applicant.profile.star_rating}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400 mb-4 font-light leading-relaxed max-w-2xl line-clamp-2">
                                                {applicant.profile?.bio || 'No bio provided.'}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center"><FaEnvelope className="mr-2 text-neon-cyan/50" /> {applicant.email}</span>
                                                <span className="flex items-center"><FaMapMarkerAlt className="mr-2 text-neon-cyan/50" /> {applicant.profile?.location || 'Remote'}</span>
                                                <span className="flex items-center"><FaBriefcase className="mr-2 text-neon-cyan/50" /> {applicant.profile?.experience_level || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-center md:self-auto">
                                            <Link
                                                to={`/profile/${applicant.id}`}
                                                className="px-6 py-2 bg-white/5 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 uppercase tracking-widest"
                                            >
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                                        {applicant.profile?.skills?.split(',').map((skill, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 text-[10px] text-gray-400 rounded-md border border-white/5">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <FaUsers className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-30" />
                                <p className="text-gray-500 text-lg font-light tracking-wide uppercase">No applications received yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end">
                        <button onClick={onClose} className="px-8 py-3 bg-neon-cyan text-deep-violet font-black text-xs rounded-xl hover:opacity-90 transition-opacity uppercase tracking-widest shadow-lg">
                            Close Panel
                        </button>
                    </div>
                </div>
            </ScrollReveal>
        </div>
    </div>
);

const ProjectRow = ({ project, onAction }) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
        <td className="py-6 px-4">
            <div className="flex flex-col">
                <span className="text-white font-bold text-lg group-hover:text-neon-cyan transition-colors">{project.title}</span>
                <span className="text-gray-500 text-sm mt-1">Posted on {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
        </td>
        <td className="py-6 px-4 text-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.project_type === 'fixed'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                {project.project_type === 'fixed' ? 'Fixed Price' : 'Hourly'}
            </span>
        </td>
        <td className="py-6 px-4 text-center">
            <div className="flex items-center justify-center space-x-2">
                <FaUsers className="text-gray-400" />
                <span className="text-white font-medium">{project.applicants?.length || 0}</span>
            </div>
        </td>
        <td className="py-6 px-4 text-center">
            <span className={`inline-flex items-center space-x-1 ${project.is_open ? 'text-green-400' : 'text-hot-pink'}`}>
                {project.is_open ? <FaCheckCircle className="w-3 h-3" /> : <FaClock className="w-3 h-3" />}
                <span className="text-sm font-semibold">{project.is_open ? 'Active' : 'Closed'}</span>
            </span>
        </td>
        <td className="py-6 px-4 text-right">
            <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onAction('view', project)}
                    className="p-2 hover:bg-neon-cyan/20 rounded-lg text-gray-400 hover:text-neon-cyan transition-colors"
                    title="View Details"
                >
                    <FaEye />
                </button>
                <button
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Edit Project"
                >
                    <FaEdit />
                </button>
                <button
                    className="p-2 hover:bg-hot-pink/20 rounded-lg text-gray-400 hover:text-hot-pink transition-colors"
                    title="Delete Project"
                >
                    <FaTrashAlt />
                </button>
            </div>
        </td>
    </tr>
);

export default function ClientDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    useEffect(() => {
        fetchClientProjects();
    }, []);

    const fetchClientProjects = async () => {
        try {
            setLoading(true);
            const data = await projectAPI.getClientProjects();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching client projects:', err);
            setError('Failed to load your projects.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplicants = async (project) => {
        try {
            setSelectedProject(project);
            setLoadingApplicants(true);
            const data = await projectAPI.getProjectApplicants(project.id);
            setApplicants(data);
        } catch (err) {
            console.error('Error fetching applicants:', err);
            alert('Failed to load applicants.');
        } finally {
            setLoadingApplicants(false);
        }
    };

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.is_open).length,
        totalApplicants: projects.reduce((acc, p) => acc + (p.applicants?.length || 0), 0)
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-deep-violet">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-deep-violet text-white pt-40 px-4 md:px-8 pb-12">
            <div className="max-w-7xl mx-auto">
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <h1 className="text-5xl font-bold aurora-text mb-2 tracking-tight">Client Hub</h1>
                            <p className="text-gray-400 text-lg font-light tracking-wide">Orchestrate your vision. Connect with <span className="text-neon-cyan font-medium">elite talent</span>.</p>
                        </div>
                        <Link
                            to="/projects/create"
                            className="bg-gradient-to-r from-neon-cyan to-electric-purple p-[2px] rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all group"
                        >
                            <div className="bg-deep-violet rounded-[10px] px-8 py-4 flex items-center space-x-3 group-hover:bg-transparent transition-colors">
                                <FaPlus className="w-4 h-4 text-neon-cyan group-hover:text-white" />
                                <span className="font-black text-xs tracking-[0.2em] group-hover:text-white">POST NEW PROJECT</span>
                            </div>
                        </Link>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <ScrollReveal delay={0.1}>
                        <StatCard
                            title="Total Ecosystem"
                            value={stats.total}
                            icon={FaBriefcase}
                            colorClass="text-electric-purple"
                        />
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <StatCard
                            title="Active Pulsar"
                            value={stats.active}
                            icon={FaCheckCircle}
                            colorClass="text-neon-cyan"
                        />
                    </ScrollReveal>
                    <ScrollReveal delay={0.3}>
                        <StatCard
                            title="Potential Matches"
                            value={stats.totalApplicants}
                            icon={FaUsers}
                            colorClass="text-hot-pink"
                        />
                    </ScrollReveal>
                </div>

                <ScrollReveal delay={0.4}>
                    <div className="holo-card rounded-2xl overflow-hidden border-none shadow-2xl">
                        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                            <h2 className="text-2xl font-bold flex items-center uppercase tracking-widest text-gray-200">
                                <FaChartLine className="mr-4 text-neon-cyan" />
                                Project Matrix
                            </h2>
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                                Synchronized Life Feed
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black">
                                    <tr>
                                        <th className="py-6 px-10">Project Identity</th>
                                        <th className="py-6 px-4 text-center">Protocol</th>
                                        <th className="py-6 px-4 text-center">Applicants</th>
                                        <th className="py-6 px-4 text-center">Status</th>
                                        <th className="py-6 px-10 text-right">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {projects.length > 0 ? (
                                        projects.map(project => (
                                            <ProjectRow
                                                key={project.id}
                                                project={project}
                                                onAction={(type, p) => {
                                                    if (type === 'view') handleViewApplicants(p);
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-32 text-center bg-white/5">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                                        <FaBriefcase className="w-10 h-10 text-gray-700" />
                                                    </div>
                                                    <p className="text-gray-400 text-2xl font-light tracking-wide uppercase">No active projects detected.</p>
                                                    <Link to="/projects/create" className="text-neon-cyan hover:glow mt-4 flex items-center font-bold tracking-widest uppercase text-xs">
                                                        Initialize first node <FaPlus className="ml-3 w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ScrollReveal>

                {selectedProject && (
                    <ApplicantModal
                        project={selectedProject}
                        applicants={applicants}
                        onClose={() => setSelectedProject(null)}
                    />
                )}

                {loadingApplicants && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md">
                        <div className="text-center">
                            <div className="w-16 h-16 border-t-2 border-b-2 border-neon-cyan rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-neon-cyan font-black text-xs uppercase tracking-[0.3em]">Syncing Applicant Data...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
