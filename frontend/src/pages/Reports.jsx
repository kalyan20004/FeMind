import { useState } from 'react';
import { generateReport } from '../api/client';
import FMBroGuide from '../components/FMBroGuide';

export default function Reports({ onBack, isDark }) {
  const [assetId, setAssetId] = useState('BF_FAN_12');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const ASSETS = ['BF_FAN_12', 'PUMP_CW_03', 'CONVEYOR_A1', 'MOTOR_BF_01', 'COOLER_BF_05'];

  const handleAction = async (action) => {
    setLoading(true);
    setActionType(action);
    setError(null);
    try {
      const res = await generateReport({ asset_id: assetId });
      
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      
      if (action === 'download') {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `FeMind_Report_${assetId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else if (action === 'view') {
        setPdfUrl(url);
      }
      
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} report. Please try again.`);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-76px)] flex flex-col lg:flex-row items-center justify-center gap-16 py-12 px-8 max-w-7xl mx-auto ${isDark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Left Column: Form */}
      <div className="w-full max-w-xl flex-shrink-0">
        <div className="flex items-center gap-4 mb-8 border-b pb-4 border-slate-700/50">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Structured Reports</h1>
            <p className="text-sm text-slate-400 mt-1">Generate ISO-compliant maintenance PDF exports.</p>
          </div>
        </div>

        <div className={`p-8 rounded-2xl shadow-2xl border backdrop-blur-xl ${isDark ? 'bg-slate-900/50 border-slate-700/50 shadow-black/50' : 'bg-white/80 border-slate-200 shadow-slate-200/50'}`}>
          <div className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1 text-slate-400">Target Asset</label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner border
                  ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className={`p-5 rounded-xl border ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm leading-relaxed">
                  The generated report will capture the current health score, active telemetry anomalies, failure cascade predictions, and financial risk calculations for the selected asset.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleAction('view')}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none border ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'}`}
              >
                {loading && actionType === 'view' ? (
                  <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-white/30' : 'border-slate-800/30'}`}></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
                View Report
              </button>

              <button
                onClick={() => handleAction('download')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {loading && actionType === 'download' ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Illustration or PDF Viewer */}
      <div className="hidden lg:block w-full max-w-lg h-[600px]">
        {pdfUrl ? (
          <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-500 bg-white">
            <iframe src={pdfUrl} className="w-full h-full border-none" title="Report Viewer" />
          </div>
        ) : (
          <div className="relative group h-full flex items-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src="/reports-illustration.png" 
              alt="Data Reports Illustration" 
              className="relative w-full rounded-3xl shadow-2xl border border-slate-700/50 object-cover transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
      </div>

      <FMBroGuide 
        isDark={isDark} 
        pageId="reports"
        message={
          <>
            Welcome to Structured Reports! 📊<br/><br/>
            Instantly generate ISO-compliant PDF exports of asset health and failure risks here.
          </>
        } 
      />
    </div>
  );
}
