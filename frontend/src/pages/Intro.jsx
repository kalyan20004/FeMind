import React from 'react';
import FMBroGuide from '../components/FMBroGuide';

export default function Intro({ onComplete, onStartTour, isDark, setDarkMode }) {
  const features = [
    {
      title: "Real-time Telemetry",
      desc: "Live ingestion of vibration and temperature data from Blast Furnace equipment.",
      icon: "📊",
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "RAG Copilot",
      desc: "Chat with an AI grounded perfectly in your plant's internal SOPs and manuals.",
      icon: "🤖",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Vision Diagnosis",
      desc: "Upload photos of damaged components for instant severity and fault analysis.",
      icon: "📸",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Financial Cost Engine",
      desc: "Calculates Expected Value risk to recommend whether to stop now or run to failure.",
      icon: "💰",
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#0b1121] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.15),rgba(255,255,255,0))] px-6 py-12 flex flex-col items-center justify-center text-center transition-colors duration-300">
      
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setDarkMode(!isDark)}
          className={`p-3 text-lg rounded-full transition-colors shadow-lg ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-black/20' : 'bg-white text-slate-700 hover:bg-slate-100 shadow-slate-200/50 border border-slate-200'}`}
          title="Toggle Dark Mode"
        >
          {isDark ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Decorative Symbols */}
      <div className="hidden xl:flex absolute left-16 top-1/3 opacity-50 dark:opacity-20 hover:opacity-100 dark:hover:opacity-100 transition-all duration-500 flex-col items-center justify-center w-32 h-32 border-2 border-slate-300 dark:border-slate-500/50 rounded-2xl bg-slate-200/60 dark:bg-slate-800/30 backdrop-blur-sm shadow-xl dark:shadow-[0_0_30px_rgba(100,116,139,0.2)] transform -rotate-6 hover:scale-110">
        <span className="text-sm font-mono text-slate-500 dark:text-slate-400 absolute top-2 left-3">26</span>
        <span className="text-5xl font-black text-slate-800 dark:text-slate-200">Fe</span>
        <span className="text-xs uppercase tracking-widest mt-1 text-slate-600 dark:text-slate-400 font-bold">Iron</span>
      </div>

      <div className="hidden xl:flex absolute right-16 top-1/3 opacity-50 dark:opacity-20 hover:opacity-100 dark:hover:opacity-100 transition-all duration-500 flex-col items-center justify-center w-32 h-32 border-2 border-pink-300 dark:border-pink-500/30 rounded-2xl bg-pink-100/60 dark:bg-pink-900/10 backdrop-blur-sm shadow-xl dark:shadow-[0_0_30px_rgba(236,72,153,0.2)] transform rotate-6 hover:scale-110">
        <span className="text-6xl drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">🧠</span>
        <span className="text-xs uppercase tracking-widest mt-2 text-pink-600 dark:text-pink-300 font-bold">Mind</span>
      </div>

      <div className="max-w-4xl mx-auto">
        <img src="/logo.jpg" alt="FeMind Logo" className="w-32 h-32 rounded-3xl shadow-xl shadow-blue-500/20 mb-8 mx-auto transform hover:scale-105 transition-transform object-cover" />
        
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">FeMind</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          The next generation of institutional intelligence for Tata Steel. 
          FeMind combines predictive machine learning with advanced Generative AI to completely eliminate unplanned downtime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          {features.map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:-translate-y-1 shadow-sm hover:shadow-xl dark:hover:bg-slate-800/80 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg text-white`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onComplete}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Access Dashboard
          </button>
        </div>
      </div>

      <FMBroGuide 
        isDark={isDark} 
        pageId="intro"
        message={
          <>
            Welcome to FeMind! 👋<br/><br/>
            I am FMBro. Click 'Access Dashboard' to begin monitoring your plant's equipment in real-time.
          </>
        } 
      />
    </div>
  );
}
