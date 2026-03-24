import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, FileText, Loader2, AlertTriangle, Camera, X, Image, ArrowDown, Sparkles } from 'lucide-react';
import PlatformSelect from '../components/PlatformSelect';
import { apiPost, getToken } from '../utils/api';

const PLATFORM_TIPS = {
  instagram: {
    emoji: '📸',
    name: 'Instagram',
    tip: 'Go to Insights → Content → See All. Screenshot your reach, engagement, and follower growth charts.',
    what: 'Reels performance, engagement rate drops, shadowban signals, hashtag effectiveness',
  },
  facebook: {
    emoji: '📘',
    name: 'Facebook',
    tip: 'Go to your Page → Insights → Overview. Screenshot your reach, engagement, and post performance charts.',
    what: 'Page reach decline, post engagement drops, News Feed suppression, Reels performance, group visibility',
  },
  youtube: {
    emoji: '🎬',
    name: 'YouTube',
    tip: 'Go to YouTube Studio → Analytics. Screenshot your Overview, Reach, and Engagement tabs.',
    what: 'Watch time patterns, CTR drops, Shorts vs Long-form performance, subscriber conversion',
  },
  tiktok: {
    emoji: '🎵',
    name: 'TikTok',
    tip: 'Go to Creator Tools → Analytics. Screenshot your Overview and Content tabs.',
    what: 'FYP distribution, watch-through rate, follower activity times, content originality score',
  },
  twitter: {
    emoji: '𝕏',
    name: 'X / Twitter',
    tip: 'Go to Analytics (analytics.twitter.com) or click Analytics on any tweet.',
    what: 'Impression trends, engagement rate, follower quality, reply-to-impression ratio',
  },
  linkedin: {
    emoji: '💼',
    name: 'LinkedIn',
    tip: 'Go to your profile → Analytics, or Company Page → Analytics tab.',
    what: 'Post impressions, profile views, SSI score, content type performance',
  },
};

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
const TEXT_EXTS = ['.csv', '.txt', '.json', '.pdf'];

function isImageFile(file) {
  return IMAGE_TYPES.includes(file.type) || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({ data: base64, mediaType: file.type || 'image/png' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Audit() {
  const [platform, setPlatform] = useState('');
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]); // { file, preview, base64Data }
  const [manualData, setManualData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const imageInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Free Algorithm Audit — Why Is My Reach Dropping? Shadowban Checker | ReachRadar AI';
    if (!getToken()) navigate('/login', { state: { from: '/audit' } });
  }, []);

  const handleFiles = (fileList) => {
    for (const f of fileList) {
      if (isImageFile(f)) {
        if (images.length >= 5) continue; // max 5 images
        const preview = URL.createObjectURL(f);
        setImages(prev => [...prev, { file: f, preview }]);
      } else {
        setFile(f);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async () => {
    if (!platform) {
      setError('Please select a platform');
      return;
    }
    if (!file && !manualData.trim() && images.length === 0) {
      setError('Please upload screenshots, a file, or paste your analytics data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let analyticsText = manualData;

      // Read text file content
      if (file) {
        analyticsText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      // Convert images to base64
      let imageData = [];
      if (images.length > 0) {
        imageData = await Promise.all(images.map(img => fileToBase64(img.file)));
      }

      const body = { platform };
      if (analyticsText) body.manualData = analyticsText;
      if (imageData.length > 0) body.images = imageData;

      const data = await apiPost('/audit/analyze', body);
      // Save audit to database for dashboard history
      apiPost('/audit/save', {
        platform,
        risk_score: data.risk_score,
        risk_level: data.risk_level,
        full_report: data,
      }).catch(() => {});
      navigate('/results', { state: { audit: data, platform } });
    } catch (err) {
      if (err.message?.includes('Upgrade to Pro')) {
        setError('upgrade');
      } else {
        setError(err.message || 'Audit failed. Please try again.');
      }
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
        Upload screenshots, analytics exports, or paste your data. AI reads it all.
      </p>

      {/* Step 1: Platform */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          1. Select Platform
        </label>
        <PlatformSelect selected={platform} onChange={setPlatform} />
      </div>

      {/* Platform Selected Tip */}
      {platform && PLATFORM_TIPS[platform] && (
        <div className="mb-8 animate-fade-in">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{PLATFORM_TIPS[platform].emoji}</span>
              <div>
                <h3 className="font-semibold text-white">{PLATFORM_TIPS[platform].name} Selected</h3>
                <p className="text-xs text-indigo-300">Here's what we'll analyze</p>
              </div>
              <Sparkles className="ml-auto text-indigo-400 animate-pulse" size={20} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs font-medium text-yellow-300 mb-1">📋 How to get your data:</p>
                <p className="text-xs text-gray-300">{PLATFORM_TIPS[platform].tip}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs font-medium text-green-300 mb-1">🔍 What we'll check:</p>
                <p className="text-xs text-gray-300">{PLATFORM_TIPS[platform].what}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-indigo-400 text-sm animate-bounce">
              <ArrowDown size={16} /> Now upload your data below
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Upload */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          2. Upload Analytics Data
        </label>

        {/* Screenshot upload */}
        <div className="mb-4">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-indigo-400/30 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 transition flex items-center justify-center gap-3 text-indigo-300"
          >
            <Camera size={24} />
            <div className="text-left">
              <p className="font-medium">Upload Screenshots / Photos</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP — screenshots of your analytics dashboard (max 5)</p>
            </div>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img.preview}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-white/10"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px]">
                  {img.file.name.slice(0, 12)}
                </div>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={() => imageInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400/30 hover:text-indigo-400 transition"
              >
                <Camera size={16} />
                <span className="text-[10px] mt-1">Add more</span>
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-gray-500">or upload a file</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* File upload zone */}
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} !p-6`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.txt,.json,.pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="ml-2 text-gray-400 hover:text-red-400"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm mb-1">
                Drag & drop CSV, TXT, JSON, or images
              </p>
              <p className="text-xs text-gray-600">Max 10MB per file</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-gray-500">or paste manually</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <textarea
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:border-indigo-400 focus:outline-none transition resize-none"
          placeholder={`Paste your analytics data here...\n\nExample: Followers: 15,000 | Avg Reach: 2,300 | Engagement Rate: 3.2% | Posts/week: 5`}
          value={manualData}
          onChange={(e) => setManualData(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && error === 'upgrade' ? (
        <div className="p-6 mb-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
          <p className="text-white font-semibold mb-2">Free trial used!</p>
          <p className="text-gray-400 text-sm mb-4">Upgrade to Pro for unlimited audits, pre-post checker, AI image improver, and more.</p>
          <Link to="/pricing" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition">
            View Pro Plans
          </Link>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      ) : null}

      {/* What you're submitting */}
      {(images.length > 0 || file || manualData.trim()) && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg text-xs text-gray-400 flex flex-wrap gap-3">
          {images.length > 0 && (
            <span className="flex items-center gap-1"><Image size={12} className="text-indigo-400" /> {images.length} screenshot{images.length > 1 ? 's' : ''}</span>
          )}
          {file && (
            <span className="flex items-center gap-1"><FileText size={12} className="text-indigo-400" /> {file.name}</span>
          )}
          {manualData.trim() && (
            <span className="flex items-center gap-1"><FileText size={12} className="text-indigo-400" /> Pasted data ({manualData.length} chars)</span>
          )}
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
            {images.length > 0 ? 'Reading screenshots & analyzing... (30-90 seconds)' : 'Analyzing your data... (30-60 seconds)'}
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
