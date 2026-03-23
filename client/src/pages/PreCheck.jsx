import { useState } from 'react';
import { Eye, Loader2, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import PlatformSelect from '../components/PlatformSelect';
import { apiPost } from '../utils/api';

export default function PreCheck() {
  const [platform, setPlatform] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    if (!platform) return setError('Select a platform');
    if (!content.trim()) return setError('Enter your post content');

    setLoading(true);
    setError('');

    try {
      const data = await apiPost('/audit/pre-check', { content, platform });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => {
    if (s >= 75) return 'text-green-400';
    if (s >= 50) return 'text-yellow-400';
    if (s >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        <span className="gradient-text">Pre-Post</span> Safety Checker
      </h1>
      <p className="text-gray-400 mb-8">
        Check any post before you publish — get a safety & virality score instantly.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Platform</label>
        <PlatformSelect selected={platform} onChange={setPlatform} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Your Post Content
        </label>
        <textarea
          className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-600 focus:border-indigo-400 focus:outline-none transition resize-none"
          placeholder="Paste your caption, tweet, post text, or video description here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="text-xs text-gray-600 mt-1">{content.length} characters</div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <button
        onClick={handleCheck}
        disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
          </>
        ) : (
          <>
            <Eye size={20} /> Check Post Safety
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-10 space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6 text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-sm text-gray-400 mb-1">Safety Score</div>
              <div className={`text-4xl font-black ${scoreColor(result.safety_score)}`}>
                {result.safety_score}
              </div>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-gray-400 mb-1">Virality Score</div>
              <div className={`text-4xl font-black ${scoreColor(result.virality_score)}`}>
                {result.virality_score}
              </div>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="glass rounded-2xl p-5">
              <p className="text-gray-300 text-sm">{result.summary}</p>
            </div>
          )}

          {/* Risk flags */}
          {result.risk_flags?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-300">
                <AlertTriangle size={16} /> Risk Flags
              </h3>
              <ul className="space-y-2">
                {result.risk_flags.map((f, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">*</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Virality boosters */}
          {result.virality_boosters?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-green-300">Virality Boosters</h3>
              <ul className="space-y-2">
                {result.virality_boosters.map((b, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">+</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Suggestions</h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.type === 'safety' ? 'bg-green-400/10 text-green-400' : 'bg-purple-400/10 text-purple-400'}`}>
                      {s.type}
                    </span>
                    <p className="text-sm text-gray-300 mt-2">{s.suggestion}</p>
                    {s.impact && <p className="text-xs text-gray-500 mt-1">Impact: {s.impact}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimized version */}
          {result.optimized_version && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 gradient-text">Optimized Version</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap bg-white/5 rounded-lg p-4">
                {result.optimized_version}
              </p>
            </div>
          )}

          {/* Best time & hashtags */}
          <div className="grid grid-cols-2 gap-4">
            {result.best_posting_time && (
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Best Posting Time</div>
                <div className="text-sm font-medium">{result.best_posting_time}</div>
              </div>
            )}
            {result.recommended_hashtags?.length > 0 && (
              <div className="glass rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-1">Recommended Hashtags</div>
                <div className="text-sm font-medium text-indigo-300">
                  {result.recommended_hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
