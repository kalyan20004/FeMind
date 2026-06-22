import React from 'react';
import FMBroGuide from '../components/FMBroGuide';

export default function InstallGuide({ onBack, isDark }) {
  const steps = [
    {
      title: '1. Hardware Integration (Sensors)',
      desc: 'FeMind supports any IIoT sensor capable of outputting data over standard industrial protocols.',
      details: [
        'Connect Vibration (RMS) and Bearing Temperature sensors to your equipment.',
        'Configure the sensors to transmit data via OPC-UA, MQTT, or Modbus TCP.',
        'Ensure the data refresh rate is at least 1Hz (1 reading per second) for optimal anomaly detection.',
      ]
    },
    {
      title: '2. Data Stream Configuration',
      desc: 'Route your live sensor data into the FeMind ingestion engine.',
      details: [
        'Open `backend/config/sensors.yaml`.',
        'Map your sensor tags to the required FeMind schema: `timestamp`, `asset_id`, `vibration_rms`, `temperature`.',
        'Start the ingestion service: `python ingestion_service.py --live`.',
      ]
    },
    {
      title: '3. Knowledge Base Upload (RAG)',
      desc: 'Ground the AI in your specific plant\'s reality by uploading your internal documentation.',
      details: [
        'Place your PDF or TXT maintenance manuals, SOPs, and historical incident reports into `backend/data/knowledge_docs/`.',
        'Run the vectorizer: `python rag/loader.py`.',
        'The system will automatically chunk and embed the documents into ChromaDB.',
      ]
    },
    {
      title: '4. Model Calibration',
      desc: 'Train the Anomaly Detector (Isolation Forest) on your baseline data.',
      details: [
        'Provide a CSV of at least 7 days of "normal" operational data.',
        'Run `python models/train_anomaly.py --data normal_baseline.csv`.',
        'The system will establish normal operating bands and set dynamic thresholds.',
      ]
    }
  ];

  return (
    <div className={`max-w-5xl mx-auto py-10 px-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
      <button 
        onClick={onBack}
        className={`mb-8 flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
      >
        &larr; Back to Dashboard
      </button>

      <div className="mb-12">
        <h1 className={`text-4xl font-black tracking-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Installation Guide</h1>
        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Follow these 4 steps to deploy FeMind to your specific plant or manufacturing facility.
        </p>
      </div>

      {/* Decorative Corner Images */}
      <img src="/corner2.png" alt="Mechanic 2" className={`hidden 2xl:block fixed top-28 right-8 w-48 opacity-70 z-0 rounded-2xl pointer-events-none transition-all duration-300 hover:scale-105 hover:opacity-100 sepia hue-rotate-[200deg] saturate-[300%] brightness-[1.2] drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`} />
      <img src="/corner3.png" alt="Mechanic 3" className={`hidden 2xl:block fixed bottom-12 left-8 w-48 opacity-70 z-0 rounded-2xl pointer-events-none transition-all duration-300 hover:scale-105 hover:opacity-100 sepia hue-rotate-[200deg] saturate-[300%] brightness-[1.2] drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] ${isDark ? 'mix-blend-screen' : 'mix-blend-multiply'}`} />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        {steps.map((step, idx) => (
          <div key={idx} className={`p-8 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl hover:bg-slate-800/90' : 'bg-white/90 backdrop-blur-xl border-slate-200 shadow-xl hover:shadow-2xl'}`}>
            <h2 className={`text-2xl font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                {idx + 1}
              </div>
              {step.title}
            </h2>
            <p className={`mb-6 text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{step.desc}</p>
            
            <ul className={`space-y-3 ml-11 list-disc ${isDark ? 'text-slate-400 marker:text-slate-600' : 'text-slate-600 marker:text-slate-300'}`}>
              {step.details.map((detail, i) => (
                <li key={i} className="pl-1">
                  <span dangerouslySetInnerHTML={{__html: detail.replace(/`([^`]+)`/g, `<code class="px-1.5 py-0.5 rounded font-mono text-sm ${isDark ? 'bg-slate-800 text-blue-300 border border-slate-700' : 'bg-slate-100 text-blue-600 border border-slate-200'}">$1</code>`)}} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className={`mt-12 p-6 rounded-xl border text-center ${isDark ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
        <p className={`font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>Need help deploying? Contact the FeMind Integration Team.</p>
      </div>

      <FMBroGuide 
        isDark={isDark} 
        pageId="installguide"
        message={
          <>
            Welcome to the Installation Guide! 🔧<br/><br/>
            Follow these steps to connect your IIoT sensors and integrate FeMind into your plant.
          </>
        } 
      />
    </div>
  );
}
