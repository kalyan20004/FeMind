import { useState, useRef } from 'react';
import { queryKnowledge, getMaintenancePlan, diagnosePhoto, submitFeedback } from '../api/client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FMBroGuide from '../components/FMBroGuide';

export default function Copilot({ onBack }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello, I am FeMind. Ask me about any equipment issue, upload a photo, or request a maintenance plan.' }
  ]);
  const [input, setInput] = useState('');
  const [assetId, setAssetId] = useState('BF_FAN_12');
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastDiagnosis, setLastDiagnosis] = useState('');
  const fileRef = useRef();

  const ASSETS = ['BF_FAN_12', 'PUMP_CW_03', 'CONVEYOR_A1', 'MOTOR_BF_01', 'COOLER_BF_05'];

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await queryKnowledge({
        query: input,
        asset_id: assetId,
        conversation_history: messages.slice(-6),
      });

      // Fix encoding issue by explicitly replacing broken em-dash artifacts if any exist
      let answer = res.data.answer.replace(/â€”/g, '—').replace(/Â/g, '');
      setLastDiagnosis(answer);
      setMessages([...history, { role: 'assistant', content: answer }]);
      setShowFeedback(true);
    } catch (err) {
      setMessages([...history, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, { role: 'user', type: 'image', imageUrl: imageUrl, content: `[Photo uploaded: ${file.name}]` }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('asset_id', assetId);
    formData.append('asset_type', 'centrifugal_fan');

    try {
      const res = await diagnosePhoto(formData);
      const diagnosis = res.data.diagnosis.replace(/â€”/g, '—').replace(/Â/g, '');
      setLastDiagnosis(diagnosis);
      setMessages(prev => [...prev, { role: 'assistant', content: diagnosis }]);
      setShowFeedback(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Photo diagnosis failed. Please try a clearer image.' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (correct) => {
    await submitFeedback({
      session_id: `session_${Date.now()}`,
      asset_id: assetId,
      predicted_fault: lastDiagnosis.substring(0, 100),
      actual_fault: correct ? lastDiagnosis.substring(0, 100) : 'Unknown — under investigation',
      diagnosis_correct: correct,
      engineer_notes: '',
    });
    setShowFeedback(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: correct
        ? 'Feedback recorded. Your confirmation helps FeMind learn. This diagnosis is now part of our institutional knowledge.'
        : 'Noted. Your correction will improve future diagnoses. FeMind learns from every engineer interaction.'
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] bg-transparent">
      {/* Header */}
      <div className="bg-slate-900/40 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="text-slate-400 hover:text-white mr-2 flex items-center gap-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-white tracking-wide">FeMind Copilot</h1>
        <select
          value={assetId}
          onChange={e => setAssetId(e.target.value)}
          className="text-sm border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-800/80 text-white outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
        >
          {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-xs font-mono font-medium text-slate-500 ml-auto bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 shadow-inner">Context: <span className="text-blue-400">{assetId}</span></span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-lg
              ${msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white whitespace-pre-wrap shadow-blue-500/20 rounded-tr-sm border border-blue-500/50'
                : 'bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-tl-sm shadow-black/20'}`}>
              {msg.role === 'user' ? (
                <>
                  {msg.type === 'image' && msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Uploaded" className="max-w-xs md:max-w-sm h-auto rounded-lg mb-3 shadow-md border border-white/20" />
                  )}
                  {msg.content}
                </>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-slate-300" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-slate-300" {...props} />,
                    li: ({node, ...props}) => <li className="" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 mt-5 text-white tracking-tight" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-4 text-white tracking-tight border-b border-slate-700/50 pb-1" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-3 text-indigo-300 tracking-wide" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-slate-400 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              FeMind is analyzing...
            </div>
          </div>
        )}

        {/* Feedback buttons */}
        {showFeedback && !loading && (
          <div className="flex justify-start gap-3 mt-2 pl-2">
            <span className="text-xs font-medium text-slate-500 self-center uppercase tracking-wider">Was this correct?</span>
            <button onClick={() => sendFeedback(true)}
              className="text-xs font-bold tracking-wide px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              Yes, Correct
            </button>
            <button onClick={() => sendFeedback(false)}
              className="text-xs font-bold tracking-wide px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]">
              No, Incorrect
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-t border-slate-800 px-6 py-5">
        <div className="flex gap-3 items-end max-w-5xl mx-auto">
          <button
            onClick={() => fileRef.current.click()}
            className="flex-shrink-0 px-4 py-3 border border-slate-700 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all bg-slate-800/50 shadow-sm"
            title="Upload photo for diagnosis"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            placeholder="Ask about equipment, request a maintenance plan, or upload a photo..."
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-200 placeholder-slate-500 transition-all shadow-inner"
            rows={1}
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold tracking-wide hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50"
          >
            Send Message
          </button>
        </div>
      </div>
      
      <FMBroGuide 
        isDark={true} 
        pageId="copilot"
        message={
          <>
            Welcome to the FeMind Copilot! 🤖<br/><br/>
            Ask me anything about your plant's equipment or upload a photo for instant AI diagnosis.
          </>
        } 
      />
    </div>
  );
}
