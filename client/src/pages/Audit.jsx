import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, AlertTriangle } from 'lucide-react';
import PlatformSelect from '../components/PlatformSelect';
import { apiPost } from '../utils/api';

export default function Audit() {
  const [platform, setPlatform] = useState('');
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!platform) {
      setError('Please select a platform');
      return;
    }
    if (!file && !manualData.trim()) {
      setError('Please upload a file or paste your analytics data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let data;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('platform', platform);
        data = await apiPost('/audit/analyze', formData, true);
      } else {
        data = await apiPost('/audit/analyze', { platform, manualData });
      }

      setResult(data);
      // Navigate to results with data in state
      navigate('/results', { state: { audit: data, platform } });
    } catch (err) {
      setError(err.message || 'Audit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        Run Your <span className="gradient-text">Algorithm Audit</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Upload your analytics export or paste your data. AI does the rest.
      </p>

      {/* Step 1: Platform */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          1. Select Platform
        </label>
        <PlatformSelect selected={platform} onChange={setPlatform} />
      </div>

      {/* Step 2: Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          2. Upload Analytics Data
        </label>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.txt,.json,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">
                Drag & drop your analytics export here
              </p>
              <p className="text-sm text-gray-600">
                Supports CSV, TXT, JSON, PDF (max 10MB)
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-gray-500">or paste manually</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <textarea
          className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:border-indigo-400 focus:outline-none transition resize-none"
          placeholder={`Paste your analytics data here...\n\nExample: Followers: 15,000 | Avg Reach: 2,300 | Engagement Rate: 3.2% | Posts/week: 5 | Watch time avg: 45s | Comments/post: 12 | Shares/post: 3 | Content type: 60% Reels, 30% Stories, 10% Posts`}
          value={manualData}
          onChange={(e) => setManualData(e.target.value)}
          disabled={!!file}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2 glow"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing your data... (30-60 seconds)
          </>
        ) : (
          'Analyze My Algorithm Risk'
        )}
      </button>

      <p className="text-center text-xs text-gray-600 mt-3">
        Your data is processed securely and never shared. First audit is free.
      </p>
    </div>
  );
}
