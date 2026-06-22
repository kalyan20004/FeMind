import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Copilot from './pages/Copilot';
import Login from './pages/Login';
import Intro from './pages/Intro';
import InstallGuide from './pages/InstallGuide';
import Tour from './components/Tour';

import Reports from './pages/Reports';

export default function App() {
  const [page, setPage] = useState('login'); // login, intro, dashboard, copilot, reports, installguide
  const [runTour, setRunTour] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default dark

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const tourSteps = [
    {
      target: '.tour-asset-cards',
      content: 'Step 1: These are the live equipment cards. They update in real-time based on SCADA sensor feeds. Notice the glowing indicators for health status.',
    },
    {
      target: '.tour-alerts',
      content: 'Step 2: When the Isolation Forest anomaly detector finds an issue, it triggers a Critical Alert here instantly.',
    },
    {
      target: '.tour-cascade',
      content: 'Step 3: This is the Failure Cascade. Our LangGraph agent calculates exactly how a single failure will spread to other machines over time.',
    },
    {
      target: '.tour-decision',
      content: 'Step 4: The Cost Engine calculates the Expected Financial Value of stopping now versus running to failure, proving the ROI of the software.',
    },
    {
      target: '.tour-copilot-btn',
      content: 'Step 5: Click here to access the RAG Copilot. You can ask it questions or upload photos for instant AI diagnosis!',
    },
    {
      target: '.tour-reports-btn',
      content: 'Step 6: Use the Structured Reports page to generate PDF exports of current asset health and financial risk.',
    },
    {
      target: '.tour-installguide-btn',
      content: 'Step 7: Check out the Hardware Install Guide to see exactly how these sensors and agents are deployed in the real world.',
    }
  ];

  const startTour = () => {
    setPage('dashboard');
    setTimeout(() => setRunTour(true), 500); // Wait for dashboard to mount
  };

  if (page === 'login') return <Login onLogin={() => setPage('intro')} />;
  if (page === 'intro') return <Intro onComplete={() => setPage('dashboard')} onStartTour={startTour} isDark={darkMode} setDarkMode={setDarkMode} />;
  if (page === 'installguide') return <InstallGuide onBack={() => setPage('dashboard')} isDark={darkMode} />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b1121] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.15),rgba(255,255,255,0))] text-slate-200' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      
      <Tour run={runTour} steps={tourSteps} onClose={() => setRunTour(false)} />

      {/* Navigation */}
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4 flex items-center gap-6 shadow-xl transition-colors duration-300
        ${darkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white/80 border-slate-200'}`}>
        
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('intro')}>
          <img src="/logo.jpg" alt="FeMind Logo" className="w-10 h-10 rounded-lg shadow-md object-cover transform hover:scale-105 transition-transform" />
          <span className={`font-black tracking-tight text-xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>FeMind</span>
        </div>
        
        <span className={`hidden sm:block text-xs uppercase tracking-widest border-l pl-6 ml-2 font-medium
          ${darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-300'}`}>
          Tata Steel Intelligence
        </span>
        
        <div className="ml-auto flex items-center gap-4">
          <button 
            onClick={() => { setPage('dashboard'); setTimeout(() => setRunTour(true), 100); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-sm ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            User Manual
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            title="Toggle Dark Mode"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>

          {['intro', 'dashboard', 'copilot', 'reports', 'installguide'].map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`text-sm px-5 py-2 rounded-lg capitalize font-medium transition-all duration-300 ${p === 'reports' ? 'tour-reports-btn' : p === 'installguide' ? 'tour-installguide-btn' : ''}
                ${page === p 
                  ? (darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'bg-blue-100 text-blue-700 border border-blue-200')
                  : (darkMode ? 'text-slate-400 border border-transparent hover:text-white hover:bg-slate-800/50' : 'text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-100')}`}
            >
              {p === 'installguide' ? 'Install Guide' : p === 'intro' ? 'Home' : p}
            </button>
          ))}

          <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

          <button 
            onClick={() => setPage('login')}
            className={`text-sm px-4 py-2 rounded-lg font-bold transition-all ${darkMode ? 'text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30' : 'text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200'}`}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="relative">
        {page === 'dashboard' && <Dashboard onNavigate={(p) => setPage(p)} isDark={darkMode} onStartTour={() => setTimeout(() => setRunTour(true), 100)} />}
        {page === 'copilot' && <Copilot onBack={() => setPage('dashboard')} isDark={darkMode} />}
        {page === 'reports' && <Reports onBack={() => setPage('dashboard')} isDark={darkMode} />}
      </main>
    </div>
  );
}
