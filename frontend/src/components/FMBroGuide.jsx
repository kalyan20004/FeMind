import { useState, useEffect, useRef } from 'react';

// This persists across SPA navigation but resets completely on a hard browser refresh
const seenPages = new Set();

export default function FMBroGuide({ message, isDark, pageId }) {
  const [showGuide, setShowGuide] = useState(false);
  
  // By evaluating this in a ref on initial render, we bypass the React 18 StrictMode 
  // double-mount issue where the first mount sets it and the second mount skips it.
  const shouldShow = useRef(!seenPages.has(pageId));

  useEffect(() => {
    if (!pageId || !shouldShow.current) {
      return;
    }
    
    // Mark as seen for this application load
    seenPages.add(pageId);

    // Sequence the FMBro animation
    const bigTimer = setTimeout(() => setShowGuide('big'), 500);
    const smallTimer = setTimeout(() => setShowGuide('small'), 4000);
    const closeTimer = setTimeout(() => setShowGuide(false), 12000); // Auto close after being small

    return () => {
      clearTimeout(bigTimer);
      clearTimeout(smallTimer);
      clearTimeout(closeTimer);
    };
  }, [pageId]);

  return (
    <>
      {/* Background Blur (Only when big) */}
      <div className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[90] transition-opacity duration-1000 pointer-events-none ${showGuide === 'big' ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Guide Popup */}
      <div 
        className={`fixed z-[100] flex items-end gap-4 transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${!showGuide ? 'opacity-0 pointer-events-none -right-64 bottom-8 scale-75' : ''}
          ${showGuide === 'big' ? 'right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2 scale-[1.3] opacity-100' : ''}
          ${showGuide === 'small' ? 'right-8 bottom-8 translate-x-0 translate-y-0 scale-100 opacity-100' : ''}
        `}
      >
        <div className={`border rounded-2xl rounded-br-none p-5 max-w-[320px] relative transition-all duration-[1200ms]
          ${showGuide === 'big' ? 'bg-slate-800 border-indigo-500 shadow-[0_0_60px_rgba(79,70,229,0.5)]' : isDark ? 'bg-slate-800 border-slate-700 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-2xl shadow-slate-300'}
        `}>
          {showGuide === 'small' && (
            <button onClick={() => setShowGuide(false)} className={`absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors ${isDark ? 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300'}`}>&times;</button>
          )}
          <div className={`font-medium leading-relaxed transition-all duration-1000 ${showGuide === 'big' ? 'text-base text-white' : isDark ? 'text-sm text-slate-200' : 'text-sm text-slate-700'}`}>
            {message}
          </div>
        </div>
        
        <div className={`rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 border-2 transition-all duration-[1200ms]
          ${showGuide === 'big' ? 'w-20 h-20 text-4xl from-indigo-500 to-purple-600 shadow-[0_0_40px_rgba(79,70,229,0.8)] border-indigo-400' : 'w-14 h-14 text-2xl from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 border-transparent dark:border-slate-800'}
        `}>
          <span>🤖</span>
        </div>
      </div>
    </>
  );
}
