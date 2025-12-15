import React from "react";
import { FaRobot, FaShieldAlt, FaRocket, FaGlobe } from "react-icons/fa";

const features = [
    {
        id: 1,
        icon: <FaRobot />,
        title: "AI-Powered Matching",
        description: "Our advanced algorithms connect you with the perfect talent instantly, saving you time and ensuring quality.",
    },
    {
        id: 2,
        icon: <FaShieldAlt />,
        title: "Secure Escrow",
        description: "Payments are held securely until you're 100% satisfied with the work. Trust is built-in.",
    },
    {
        id: 3,
        icon: <FaRocket />,
        title: "Rapid Delivery",
        description: "Get your projects moving faster with our streamlined workflow and verified expert freelancers.",
    },
    {
        id: 4,
        icon: <FaGlobe />,
        title: "Global Talent Pool",
        description: "Access a diverse network of top-tier professionals from around the world, ready to work.",
    },
];

export default function FeaturesSection() {
    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="aurora-text">Why Choose SkillBridge?</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Experience the future of freelancing with our cutting-edge platform features designed for success.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature) => (
                    <div key={feature.id} className="holo-card p-8 rounded-2xl group hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-4xl text-neon-cyan mb-6 group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-hot-pink transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
