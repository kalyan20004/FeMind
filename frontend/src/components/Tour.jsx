import React, { useState, useEffect } from 'react';

export default function Tour({ run, steps, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!run) {
      // Cleanup highlights when closed
      document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
      return;
    }

    setCurrentStep(0);
  }, [run]);

  useEffect(() => {
    if (!run) return;

    // Remove old highlights
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    if (currentStep >= steps.length) {
      onClose();
      return;
    }

    const step = steps[currentStep];
    // We expect the target to be a standard CSS selector (e.g. '.tour-alerts')
    const target = document.querySelector(step.target);
    
    if (target) {
      target.classList.add('tour-highlight');
      
      const rect = target.getBoundingClientRect();
      const tooltip = document.getElementById('tour-tooltip');
      
      if (tooltip) {
        // Simple positioning logic
        let top = window.scrollY + rect.bottom + 20;
        let left = window.scrollX + rect.left;
        
        // Prevent tooltip from overflowing right edge
        if (left + 320 > window.innerWidth) {
          left = window.innerWidth - 340;
        }

        // If it goes off the bottom of the screen, place it above
        if (top + 200 > window.scrollY + window.innerHeight) {
          top = window.scrollY + rect.top - 200;
        }

        tooltip.style.top = top + 'px';
        tooltip.style.left = Math.max(20, left) + 'px';
      }
    } else {
      // If target not found on this page, just skip to next or close
      console.warn(`Tour target ${step.target} not found.`);
    }

    return () => {
      if (target) target.classList.remove('tour-highlight');
    };
  }, [run, currentStep, steps]);

  if (!run) return null;

  const step = steps[currentStep];
  if (!step) return null;

  return (
    <>
      <div className="tour-overlay" style={{ display: 'block' }}></div>
      <div id="tour-tooltip" className="tour-tooltip font-sans" style={{ display: 'block' }}>
        <div className="mb-6 font-medium text-sm leading-relaxed text-indigo-50">
          {step.content}
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setCurrentStep(s => s + 1)}
            className="w-full bg-slate-900 hover:bg-black text-indigo-100 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next →'}
          </button>
          
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(s => s - 1)}
              className="w-full bg-indigo-900 hover:bg-indigo-800 text-indigo-100 py-3 rounded-xl font-bold text-sm transition-colors shadow-md"
            >
              ← Prev
            </button>
          )}

          <button 
            onClick={onClose}
            className="w-full text-indigo-200/80 hover:text-white py-2 font-medium text-sm mt-1 transition-colors tracking-wider"
          >
            × Stop Tour
          </button>
        </div>
      </div>
    </>
  );
}
