import { useState, useMemo } from 'react';
import FMBroGuide from '../components/FMBroGuide';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const floatingLogos = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 2.5 + 1.5}rem`, // Slightly larger base size
      rotate: `${Math.random() * 360}deg`,
      duration: `${Math.random() * 15 + 15}s`, // Slower revolving
      delay: `-${Math.random() * 20}s`,
      opacity: Math.random() * 0.08 + 0.03, // Slightly higher opacity
      orbit: Math.random() * 60 + 20 // Random orbit radius
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hardcoded authentication for demo purposes
    if (username.toLowerCase() === 'admin' && password === 'tata123') {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1121] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.2),rgba(255,255,255,0))] px-4 relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl mix-blend-screen animate-pulse" style={{animationDelay: '2s'}}></div>

      {/* Revolving FM Logos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {floatingLogos.map(logo => (
          <div 
            key={logo.id}
            className="absolute select-none text-indigo-300"
            style={{
              top: logo.top,
              left: logo.left,
              opacity: logo.opacity,
            }}
          >
            <div 
              className="font-black"
              style={{
                fontSize: logo.fontSize,
                WebkitTextStroke: '2px currentColor', // Makes text thicker
                animation: `revolve-bg ${logo.duration} linear infinite`,
                animationDelay: logo.delay,
                '--orbit-radius': `${logo.orbit}px` // Custom CSS variable for keyframes
              }}
            >
              FM
            </div>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <img src="/logo.jpg" alt="FeMind Logo" className="w-24 h-24 rounded-2xl shadow-xl shadow-blue-500/20 mb-4 transform hover:scale-105 transition-transform object-cover" />
          <h1 className="text-3xl font-black text-white tracking-tight">FeMind</h1>
          <p className="text-indigo-200 mt-2">Intelligent • Autonomous • Reliable</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Employee ID / Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => {setUsername(e.target.value); setError(false);}}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                placeholder="Enter your ID"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Access Token</label>
              <input 
                type="password" 
                value={password}
                onChange={e => {setPassword(e.target.value); setError(false);}}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium text-center animate-pulse bg-red-500/10 py-2 rounded-lg border border-red-500/20">Invalid Employee ID or Access Token.</p>
            )}

            <div className="text-center mb-4">
              <p className="text-xs text-slate-400 font-medium">Demo Credentials:</p>
              <p className="text-xs font-mono text-indigo-400 mt-1"><span className="text-slate-500">ID:</span> admin <span className="text-slate-500 ml-2">Pass:</span> tata123</p>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
            >
              Secure Login
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-xs text-slate-500">Authorized Personnel Only</p>
            <p className="text-[10px] text-slate-600 mt-1">Hackathon Demo Mode Active</p>
          </div>
        </div>
      </div>
      
      <FMBroGuide 
        isDark={true} 
        pageId="login"
        message={
          <>
            Hi! Introducing myself as <strong>FMBro</strong>! 🤖<br/><br/>
            I am your intelligent assistant here to help you monitor asset health, prevent downtime, and predict equipment failures.<br/><br/>
            Let's start our journey by logging in!
          </>
        } 
      />
    </div>
  );
}
