import { useState, useEffect } from 'react';
import { getAssetHealth, getActiveAlerts, getCascade, getCostAnalysis } from '../api/client';
import AssetCard from '../components/AssetCard';
import CascadeGraph from '../components/CascadeGraph';
import DecisionPanel from '../components/DecisionPanel';
import AlertBanner from '../components/AlertBanner';
import FMBroGuide from '../components/FMBroGuide';

export default function Dashboard({ onNavigate, isDark, onStartTour }) {
  const [assets, setAssets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [cascade, setCascade] = useState(null);
  const [costAnalysis, setCostAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Poll every 30 seconds (simulates real-time)
    const interval = setInterval(loadData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    try {
      const [healthRes, alertRes] = await Promise.all([
        getAssetHealth(),
        getActiveAlerts(),
      ]);
      setAssets(healthRes.data.assets);
      setAlerts(alertRes.data.alerts);
      setLoading(false);
      if (!selectedAsset && healthRes.data.assets.length > 0) {
        handleAssetClick(healthRes.data.assets[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setLoading(false);
    }
  };

  const handleAssetClick = async (asset) => {
    setSelectedAsset(asset);
    try {
      const [cascadeRes, costRes] = await Promise.all([
        getCascade(asset),
        getCostAnalysis({
          asset_id: asset.asset_id,
          failure_probability: asset.health_score < 50 ? 0.47 : 0.12,
          rul_days: 18,
        }),
      ]);
      setCascade(cascadeRes.data);
      setCostAnalysis(costRes.data);
    } catch (err) {
      console.error('Failed to load asset details', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500 text-lg animate-pulse">Initializing FeMind Systems...</div>;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Plant Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-medium">Real-time equipment health monitoring · Blast Furnace Area</p>
          </div>
          {/* Navigation to Copilot if needed */}
          <button 
            onClick={() => onNavigate && onNavigate('copilot')}
            className="tour-copilot-btn hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-all text-sm font-medium"
          >
            Open Copilot
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="tour-alerts mb-6">
            {alerts.map((alert, i) => (
              <AlertBanner key={i} alert={alert} />
            ))}
          </div>
        )}

        {/* Asset Cards Grid */}
        <div className="tour-asset-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {assets.map(asset => (
            <AssetCard
              key={asset.asset_id}
              asset={asset}
              selected={selectedAsset?.asset_id === asset.asset_id}
              onClick={() => handleAssetClick(asset)}
            />
          ))}
        </div>

        {/* Detail Panel — shows when an asset is selected */}
        {selectedAsset && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="tour-cascade">{cascade && <CascadeGraph cascade={cascade} />}</div>
            <div className="tour-decision">{costAnalysis && <DecisionPanel analysis={costAnalysis} assetId={selectedAsset.asset_id} />}</div>
          </div>
        )}
      </div>

      <FMBroGuide 
        isDark={isDark} 
        pageId="dashboard"
        message={
          <>
            Welcome to the dashboard! 👋<br/><br/>
            For a basic understanding, please visit our <button onClick={() => { if(onStartTour) onStartTour(); }} className="text-blue-500 font-bold hover:underline">User Manual</button>.
          </>
        } 
      />
    </div>
  );
}
