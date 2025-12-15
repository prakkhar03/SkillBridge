import React from "react";

const steps = [
    {
        id: 1,
        number: "01",
        title: "Create Profile",
        description: "Sign up and build your professional identity. Showcase your skills, portfolio, and experience to stand out.",
    },
    {
        id: 2,
        number: "02",
        title: "Find Opportunities",
        description: "Browse curated projects or get matched automatically with jobs that fit your expertise and rates.",
    },
    {
        id: 3,
        number: "03",
        title: "Collaborate & Earn",
        description: "Work efficiently with clients using our built-in tools and get paid securely upon project completion.",
    },
];

export default function HowItWorksSection() {
    return (
        <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-electric-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        How It <span className="text-hot-pink">Works</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Your journey to success is simple and streamlined. Here's how you get started.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent"></div>

                    {steps.map((step) => (
                        <div key={step.id} className="relative flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-full bg-deep-violet border-2 border-neon-cyan/30 flex items-center justify-center text-3xl font-bold text-neon-cyan mb-8 z-10 group-hover:border-hot-pink group-hover:text-hot-pink transition-colors duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)] group-hover:shadow-[0_0_30px_rgba(255,0,153,0.4)]">
                                {step.number}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed max-w-xs">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
