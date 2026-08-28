import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Code2,
  Globe,
  ExternalLink,
  Github,
  Layers,
  Send,
  Sparkles,
  Award,
  Terminal,
  Cpu,
  Mail,
  MapPin,
  CheckCircle,
} from "lucide-react";

export const PortfolioView: React.FC = () => {
  const { projects, skills, siteConfig, addNotification } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const projectCategories = ["All", "Game Development", "3D Art & Shaders", "Engine Tools", "Full-Stack Web"];

  const filteredProjects = projects.filter(
    (p) => selectedCategory === "All" || p.category === selectedCategory
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setMessageSent(true);
    addNotification({
      title: "📬 Contact Message Sent",
      message: `Message from ${contactName} received. We will get back to you soon!`,
      type: "system",
    });

    setContactName("");
    setContactEmail("");
    setContactMessage("");
    setTimeout(() => setMessageSent(false), 5000);
  };

  return (
    <div id="portfolio-view-page" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* 1. Developer Bio & Intro Hero */}
      <div className="relative rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Avatar with orange glow */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-1 bg-gradient-to-tr from-orange-500 via-red-500 to-amber-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Developer Avatar"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>

          {/* Bio Info */}
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>LEAD GAME ARCHITECT & GRAPHICS PROGRAMMER</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-mono uppercase tracking-tight">
              NK Spider
            </h1>

            <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
              Specialized in Unreal Engine 5, custom HLSL shader pipelines, multithreaded engine architecture, and high-performance game hosting infrastructure. Creator of {projects.length}+ commercial releases and author of real-time rendering toolkits.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-mono text-white/50">
              <span className="flex items-center gap-1 text-orange-400">
                <MapPin className="w-4 h-4" /> Global / Remote
              </span>
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <CheckCircle className="w-4 h-4" /> Available for Contract & Studios
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Skills Section */}
      <div id="portfolio-skills-section" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-bold">Proficiency Breakdown</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
              Technical Arsenal & Skills
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.07] backdrop-blur-md transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-white/50">{skill.category}</span>
                <span className="text-xs font-bold font-mono text-orange-400">{skill.percentage}%</span>
              </div>
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-tight">{skill.name}</h4>
              <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Featured Showcase Projects */}
      <div id="portfolio-projects-section" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-bold">Engineering Showcase</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase">
              Engine & Game Projects
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {projectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    : "bg-black/30 text-white/60 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.07] backdrop-blur-md transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
                <img
                  src={proj.thumbnail}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-black/40" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-black/70 border border-white/10 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                  {proj.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-2 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Tech stack */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-black/40 text-white/40 text-[10px] font-mono border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/40">{proj.date}</span>
                  <div className="flex items-center gap-2">
                    {proj.sourceCodeUrl && (
                      <a
                        href={proj.sourceCodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs flex items-center gap-1 border border-white/10 transition-colors"
                        title="Source Code"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1 shadow-[0_0_12px_rgba(249,115,22,0.2)] transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Contact Form */}
      <div id="portfolio-contact-section" className="rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-bold">Direct Transmission</span>
          <h2 className="text-3xl font-black text-white font-mono uppercase">
            Let's Build Something Legendary
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Have a game project inquiry, custom shader requirement, or engine optimization request? Drop a message below.
          </p>

          {messageSent ? (
            <div className="mt-8 p-6 rounded-2xl bg-green-950/60 border border-green-500/40 text-green-300 font-mono text-sm flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span>Your message has been transmitted successfully!</span>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-8 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-white/50 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-white/50 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="marcus@studio.com"
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-white/50 block mb-1">Project Details / Inquiry</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your studio requirement or timeline..."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-white hover:bg-orange-500 hover:text-white text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
