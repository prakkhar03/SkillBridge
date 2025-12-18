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
    FaTrashAlt
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
                            <h1 className="text-5xl font-bold aurora-text mb-2">Client Dashboard</h1>
                            <p className="text-gray-400 text-lg font-light">Manage your projects and discover top talent.</p>
                        </div>
                        <Link
                            to="/projects/create"
                            className="bg-gradient-to-r from-neon-cyan to-electric-purple p-[2px] rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all group"
                        >
                            <div className="bg-deep-violet rounded-[10px] px-8 py-3 flex items-center space-x-2 group-hover:bg-transparent transition-colors">
                                <FaPlus className="w-4 h-4 text-neon-cyan group-hover:text-white" />
                                <span className="font-bold tracking-wide group-hover:text-white">POST NEW PROJECT</span>
                            </div>
                        </Link>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <ScrollReveal delay={0.1}>
                        <StatCard
                            title="Total Projects"
                            value={stats.total}
                            icon={FaBriefcase}
                            colorClass="text-electric-purple"
                        />
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <StatCard
                            title="Active Postings"
                            value={stats.active}
                            icon={FaCheckCircle}
                            colorClass="text-neon-cyan"
                        />
                    </ScrollReveal>
                    <ScrollReveal delay={0.3}>
                        <StatCard
                            title="Total Applicants"
                            value={stats.totalApplicants}
                            icon={FaUsers}
                            colorClass="text-hot-pink"
                        />
                    </ScrollReveal>
                </div>

                <ScrollReveal delay={0.4}>
                    <div className="holo-card rounded-2xl overflow-hidden border-none">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <h2 className="text-2xl font-bold flex items-center">
                                <FaChartLine className="mr-3 text-neon-cyan" />
                                Recent Projects
                            </h2>
                            <div className="text-sm text-gray-400">
                                Sorted by most recent
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="py-4 px-4">Project Title</th>
                                        <th className="py-4 px-4 text-center">Type</th>
                                        <th className="py-4 px-4 text-center">Applicants</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.length > 0 ? (
                                        projects.map(project => (
                                            <ProjectRow
                                                key={project.id}
                                                project={project}
                                                onAction={(type, p) => console.log(type, p)}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <FaBriefcase className="w-16 h-16 text-gray-700 mb-4" />
                                                    <p className="text-gray-500 text-xl font-medium">No projects posted yet.</p>
                                                    <Link to="/projects/create" className="text-neon-cyan hover:underline mt-2 flex items-center">
                                                        Post your first project <FaPlus className="ml-2 w-3 h-3" />
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
            </div>
        </div>
    );
}
