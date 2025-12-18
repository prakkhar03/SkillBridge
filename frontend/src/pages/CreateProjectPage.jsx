import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaTimes, FaBriefcase, FaCode, FaDollarSign, FaAlignCenter } from 'react-icons/fa';
import { projectAPI } from '../services/api';
import ScrollReveal from '../ui/utils/ScrollReveal';

export default function CreateProjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills_required: '',
        budget: '',
        project_type: 'fixed'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await projectAPI.createProject(formData);
            alert('Project created successfully!');
            navigate('/dashboard');
        } catch (err) {
            console.error('Error creating project:', err);
            alert('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-deep-violet text-white pt-40 px-4 md:px-8 pb-12">
            <div className="max-w-3xl mx-auto">
                <ScrollReveal>
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold aurora-text">Post a New Project</h1>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <FaTimes className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <div className="holo-card p-8 rounded-2xl border-none">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center">
                                    <FaBriefcase className="mr-2 text-neon-cyan" /> Project Title
                                </label>
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Build a Modern React E-commerce Site"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all text-white placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center">
                                    <FaAlignCenter className="mr-2 text-neon-cyan" /> Detailed Description
                                </label>
                                <textarea
                                    required
                                    name="description"
                                    rows="6"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the project goals, requirements, and deliverables..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all text-white placeholder:text-gray-600"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center">
                                        <FaCode className="mr-2 text-neon-cyan" /> Required Skills
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="skills_required"
                                        value={formData.skills_required}
                                        onChange={handleChange}
                                        placeholder="e.g. React, Node.js, Tailwind"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all text-white placeholder:text-gray-600"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Comma-separated list of skills</p>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center">
                                        <FaAlignCenter className="mr-2 text-neon-cyan" /> Project Type
                                    </label>
                                    <select
                                        name="project_type"
                                        value={formData.project_type}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all text-white"
                                    >
                                        <option value="fixed">Fixed Price</option>
                                        <option value="hourly">Hourly Rate</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center">
                                    <FaDollarSign className="mr-2 text-neon-cyan" /> Budget (USD)
                                </label>
                                <input
                                    required
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="e.g. 5000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all text-white placeholder:text-gray-600"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-neon-cyan to-electric-purple text-white font-bold py-4 rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    <FaRocket className={`${loading ? 'animate-bounce' : ''}`} />
                                    <span>{loading ? 'LAUNCHING...' : 'LAUNCH PROJECT'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
