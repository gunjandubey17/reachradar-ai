import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, Shield, TrendingUp, AlertTriangle, Link2, Camera, X, Copy, Check, Sparkles, ChevronDown, ChevronUp, Image, ArrowDown, Pencil } from 'lucide-react';
import PlatformSelect from '../components/PlatformSelect';
import ImageImprover from '../components/ImageImprover';
import { apiPost, getToken } from '../utils/api';

const PRECHECK_TIPS = {
  instagram: { emoji: '📸', name: 'Instagram', tip: 'Describe your Reel, Story, or Post. Include your niche and target audience for best results.', formats: 'Reels, Carousels, Stories, Single Posts' },
  facebook: { emoji: '📘', name: 'Facebook', tip: 'Describe your Facebook post, Reel, or video. Include your Page niche and target audience.', formats: 'Posts, Reels, Videos, Stories, Group Posts' },
  youtube: { emoji: '🎬', name: 'YouTube', tip: 'Describe your video topic, length, and style. Paste the YouTube link if published.', formats: 'Shorts, Long-form, Livestreams, Community Posts' },
  tiktok: { emoji: '🎵', name: 'TikTok', tip: 'Describe your TikTok concept — the hook, trend, or story. Include your niche.', formats: 'TikTok Videos, Duets, Stitches, Stories' },
  twitter: { emoji: '𝕏', name: 'X / Twitter', tip: 'Describe your tweet or thread topic. Include key points you want to make.', formats: 'Tweets, Threads, Polls, Quote Tweets' },
  linkedin: { emoji: '💼', name: 'LinkedIn', tip: 'Describe your post topic and professional angle. LinkedIn favors thought leadership.', formats: 'Text Posts, Carousels, Articles, Videos' },
};

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

function isImageFile(file) {
  return IMAGE_TYPES.includes(file.type);
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

function CopyBlock({ label, text }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
        <button onClick={handleCopy} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 transition text-indigo-300">
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{text}</p>
    </div>
  );
}

export default function PreCheck() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState('');
  const [content, setContent] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [engagementGoal, setEngagementGoal] = useState('');
  const [genre, setGenre] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showReadyMade, setShowReadyMade] = useState(true);
  const imageInputRef = useRef();

  useEffect(() => {
    document.title = 'Pre-Post Content Checker — Will My Post Go Viral? Check Before Publishing | ReachRadar AI';
    if (!getToken()) navigate('/login', { state: { from: '/pre-check' } });
  }, []);

  const addImages = (files) => {
    for (const f of files) {
      if (isImageFile(f) && images.length < 5) {
        const preview = URL.createObjectURL(f);
        setImages(prev => [...prev, { file: f, preview }]);
      }
    }
  };

  const removeImage = (idx) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleCheck = async () => {
    if (!platform) return setError('Select a platform');
    if (!content.trim() && !contentUrl.trim() && images.length === 0) {
      return setError('Describe your content — this is required for accurate, niche-specific results');
    }
    if (!content.trim() && (contentUrl.trim() || images.length > 0)) {
      // Allow but warn — URL/images alone give limited results
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const body = { platform };
      if (content.trim()) body.content = content;
      if (contentUrl.trim()) body.contentUrl = contentUrl;
      if (engagementGoal) body.engagementGoal = engagementGoal;
      if (genre) body.genre = genre;

      if (images.length > 0) {
        body.images = await Promise.all(images.map(img => fileToBase64(img.file)));
      }

      const data = await apiPost('/audit/pre-check', body);
      setResult(data);
    } catch (err) {
      if (err.message?.includes('Pro feature') || err.message?.includes('Upgrade')) {
        setError('upgrade');
      } else {
        setError(err.message);
      }
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

  const rm = result?.ready_made_content;

  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">
        <span className="gradient-text">Content</span> Analyzer & Optimizer
      </h1>
      <p className="text-gray-400 mb-8">
        Describe your content, add a URL or screenshot — AI generates optimized titles, descriptions, hooks & hashtags ready to copy-paste.
      </p>

      {/* Platform */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">1. Select Platform</label>
        <PlatformSelect selected={platform} onChange={setPlatform} />
      </div>

      {/* Platform Selected Tip */}
      {platform && PRECHECK_TIPS[platform] && (
        <div className="mb-6 animate-fade-in">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{PRECHECK_TIPS[platform].emoji}</span>
              <div>
                <h3 className="font-semibold text-white text-sm">{PRECHECK_TIPS[platform].name} Content Optimizer</h3>
                <p className="text-xs text-purple-300">Formats: {PRECHECK_TIPS[platform].formats}</p>
              </div>
              <Sparkles className="ml-auto text-purple-400 animate-pulse" size={18} />
            </div>
            <p className="text-xs text-gray-300 mb-2">{PRECHECK_TIPS[platform].tip}</p>
            <div className="flex items-center justify-center gap-2 text-purple-400 text-xs animate-bounce">
              <ArrowDown size={14} /> Describe your content below
            </div>
          </div>
        </div>
      )}

      {/* Engagement Goal & Genre */}
      {platform && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">2. Engagement Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'viral', label: 'Go Viral', icon: '🚀' },
                { id: 'growth', label: 'Grow Followers', icon: '📈' },
                { id: 'sales', label: 'Drive Sales', icon: '💰' },
                { id: 'community', label: 'Build Community', icon: '💬' },
                { id: 'brand', label: 'Brand Awareness', icon: '🎯' },
                { id: 'educate', label: 'Educate', icon: '📚' },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setEngagementGoal(engagementGoal === g.id ? '' : g.id)}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    engagementGoal === g.id
                      ? 'border-indigo-400 bg-indigo-500/20 text-white scale-105'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="mr-1">{g.icon}</span> {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content Genre</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'comedy', label: 'Comedy', icon: '😂' },
                { id: 'health', label: 'Health & Fitness', icon: '💪' },
                { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
                { id: 'education', label: 'Education', icon: '🎓' },
                { id: 'tech', label: 'Tech', icon: '💻' },
                { id: 'food', label: 'Food', icon: '🍕' },
                { id: 'music', label: 'Music', icon: '🎵' },
                { id: 'fashion', label: 'Fashion & Beauty', icon: '👗' },
                { id: 'travel', label: 'Travel', icon: '✈️' },
                { id: 'business', label: 'Business', icon: '💼' },
                { id: 'family', label: 'Family & Parenting', icon: '👨‍👩‍👧' },
                { id: 'other', label: 'Other', icon: '🎨' },
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setGenre(genre === g.id ? '' : g.id)}
                  className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    genre === g.id
                      ? 'border-purple-400 bg-purple-500/20 text-white scale-105'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <span className="mr-1">{g.icon}</span> {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Content Description — PRIMARY INPUT */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          3. Describe Your Content <span className="text-red-400">*</span>
        </label>
        <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
          <textarea
            className="w-full h-36 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 placeholder:text-gray-500 focus:border-indigo-400 focus:outline-none transition resize-none"
            placeholder={`Example: "Family vlog channel. This YouTube Short shows my toddler's first bike ride at the park. Current title is 'first ride'. Target audience is parents and family content viewers. Want to make it go viral while keeping it authentic and heartwarming."\n\nOr: "Instagram carousel post about 5 skincare tips for oily skin. I'm a dermatologist. Target: women 20-35."`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {!content.trim() && (
            <p className="text-xs text-yellow-400/80 mt-2">
              This is the most important input — without it, the AI can only guess. Even 1-2 sentences dramatically improve results.
            </p>
          )}
          <div className="text-xs text-gray-600 mt-1">{content.length} characters</div>
        </div>
      </div>

      {/* Optional extras */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          4. Optional: Add URL or Screenshots
        </label>

        {/* URL Input */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Link2 size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Post / Video URL</span>
          </div>
          <input
            type="url"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 placeholder:text-gray-600 focus:border-indigo-400 focus:outline-none transition"
            placeholder="https://youtube.com/watch?v=... or https://instagram.com/p/..."
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2 flex items-center gap-2">
          <Camera size={14} /> Screenshots / Thumbnails
        </label>
        <button
          onClick={() => imageInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-white/15 rounded-xl bg-white/[0.02] hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm text-gray-400"
        >
          <Camera size={18} />
          {images.length > 0 ? `${images.length} image${images.length > 1 ? 's' : ''} selected — click to add more` : 'Upload screenshots, thumbnails, or post images (max 5)'}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          multiple
          onChange={(e) => addImages(e.target.files)}
        />

        {images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.preview} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Summary of inputs */}
      {(contentUrl || images.length > 0 || content.trim()) && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg text-xs text-gray-400 flex flex-wrap gap-3">
          {contentUrl && <span className="flex items-center gap-1"><Link2 size={12} className="text-indigo-400" /> URL provided</span>}
          {images.length > 0 && <span className="flex items-center gap-1"><Image size={12} className="text-indigo-400" /> {images.length} image{images.length > 1 ? 's' : ''}</span>}
          {content.trim() && <span className="flex items-center gap-1"><Eye size={12} className="text-indigo-400" /> Text ({content.length} chars)</span>}
        </div>
      )}

      {error && error === 'upgrade' ? (
        <div className="p-6 mb-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
          <p className="text-white font-semibold mb-2">Pro Feature</p>
          <p className="text-gray-400 text-sm mb-4">Pre-Post Checker is available on the Pro plan. Upgrade for unlimited content checks, AI image improver, and more.</p>
          <a href="/pricing" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition">
            View Pro Plans
          </a>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      ) : null}

      <button
        onClick={handleCheck}
        disabled={loading}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl text-lg font-semibold transition flex items-center justify-center gap-2 glow"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing & generating improvements... (30-90s)</>
        ) : (
          <><Eye size={20} /> Analyze & Optimize Content</>
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
              {result.estimated_reach_boost && (
                <p className="text-sm text-green-400 mt-2 font-medium">
                  Estimated reach boost with optimized version: {result.estimated_reach_boost}
                </p>
              )}
            </div>
          )}

          {/* Current Analysis */}
          {result.current_analysis && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 text-sm">What We Found</h3>
              {result.current_analysis.title_detected && (
                <p className="text-xs text-gray-400 mb-1">Current Title: <span className="text-gray-300">{result.current_analysis.title_detected}</span></p>
              )}
              {result.current_analysis.content_type && (
                <p className="text-xs text-gray-400 mb-2">Content Type: <span className="text-gray-300">{result.current_analysis.content_type}</span></p>
              )}
              {result.current_analysis.issues_found?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.current_analysis.issues_found.map((issue, i) => (
                    <p key={i} className="text-xs text-red-300 flex items-start gap-1">
                      <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" /> {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* READY-MADE CONTENT — the star feature */}
          {rm && (
            <div className="glass rounded-2xl p-6 border border-purple-500/20 glow">
              <button
                onClick={() => setShowReadyMade(!showReadyMade)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="text-purple-400" size={20} />
                  <span className="gradient-text">Ready-Made Optimized Content</span>
                </h3>
                {showReadyMade ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <p className="text-xs text-gray-400 mt-1 mb-4">Copy-paste these directly — everything is optimized for {platform}</p>

              {showReadyMade && (
                <div className="space-y-4">
                  {/* Optimized Title */}
                  <CopyBlock label="Optimized Title" text={rm.optimized_title} />

                  {/* Alternative Titles */}
                  {rm.title_alternatives?.length > 0 && (
                    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Alternative Titles</span>
                      {rm.title_alternatives.map((t, i) => (
                        <div key={i} className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-300">{t}</p>
                          <button
                            onClick={() => { navigator.clipboard.writeText(t); }}
                            className="text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 flex-shrink-0 ml-2"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Optimized Description */}
                  <CopyBlock label="Optimized Description / Caption" text={rm.optimized_description} />

                  {/* Hook Script */}
                  <CopyBlock label="Hook (First 3-5 Seconds / Opening Line)" text={rm.hook_script} />

                  {/* CTAs */}
                  {rm.cta_options?.length > 0 && (
                    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                      <span className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Call-To-Action Options</span>
                      {rm.cta_options.map((cta, i) => (
                        <div key={i} className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-300">"{cta}"</p>
                          <button
                            onClick={() => navigator.clipboard.writeText(cta)}
                            className="text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 flex-shrink-0 ml-2"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thumbnail Concept */}
                  {rm.thumbnail_concept && (
                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                      <span className="text-xs font-semibold text-purple-400 uppercase block mb-2">Thumbnail Concept</span>
                      <p className="text-sm text-gray-300">{rm.thumbnail_concept}</p>
                    </div>
                  )}

                  {/* Pinned Comment */}
                  <CopyBlock label="Suggested Pinned Comment" text={rm.comment_pin} />

                  {/* Hashtags */}
                  {rm.hashtags?.length > 0 && (
                    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Hashtags</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(rm.hashtags.map(h => h.startsWith('#') ? h : '#' + h).join(' '))}
                          className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 transition text-indigo-300"
                        >
                          <Copy size={12} /> Copy All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rm.hashtags.map((h, i) => (
                          <span key={i} className="text-sm text-indigo-400">{h.startsWith('#') ? h : '#' + h}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags/Keywords */}
                  {rm.tags_keywords?.length > 0 && (
                    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase">SEO Tags / Keywords</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(rm.tags_keywords.join(', '))}
                          className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rm.tags_keywords.map((k, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Improvement Notes */}
          {result.content_improvement_notes && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-2 text-sm">Why These Changes Work</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{result.content_improvement_notes}</p>
            </div>
          )}

          {/* Risk flags */}
          {result.risk_flags?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-300 text-sm">
                <AlertTriangle size={16} /> Algorithm Risk Flags
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
              <h3 className="font-semibold mb-3 text-green-300 text-sm">Virality Boosters</h3>
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
              <h3 className="font-semibold mb-3 text-sm">Additional Suggestions</h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.type === 'safety' ? 'bg-green-400/10 text-green-400' :
                      s.type === 'engagement' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-purple-400/10 text-purple-400'
                    }`}>
                      {s.type}
                    </span>
                    <p className="text-sm text-gray-300 mt-2">{s.suggestion}</p>
                    {s.impact && <p className="text-xs text-gray-500 mt-1">Impact: {s.impact}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Music Recommendations */}
          {result.music_recommendations?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <span className="text-pink-400">🎵</span> Recommended Music / Audio
              </h3>
              <div className="space-y-2">
                {result.music_recommendations.map((m, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{m.song}</p>
                      <p className="text-xs text-gray-400">{m.artist}</p>
                      <p className="text-xs text-gray-500 mt-1">{m.why}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      m.type === 'trending' ? 'bg-red-400/10 text-red-400' :
                      m.type === 'viral-potential' ? 'bg-orange-400/10 text-orange-400' :
                      m.type === 'mood-match' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-purple-400/10 text-purple-400'
                    }`}>
                      {m.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Improvement */}
          {result.image_improvement && result.image_improvement.analysis && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <span className="text-cyan-400">🖼️</span> Image / Visual Improvement
              </h3>
              <p className="text-sm text-gray-300 mb-3">{result.image_improvement.analysis}</p>
              {result.image_improvement.suggestions?.length > 0 && (
                <div className="space-y-1 mb-3">
                  {result.image_improvement.suggestions.map((s, i) => (
                    <p key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400">→</span> {s}
                    </p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {result.image_improvement.color_palette && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs font-semibold text-gray-400">Color Palette</span>
                    <p className="text-xs text-gray-300 mt-1">{result.image_improvement.color_palette}</p>
                  </div>
                )}
                {result.image_improvement.text_overlay && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs font-semibold text-gray-400">Text Overlay</span>
                    <p className="text-xs text-gray-300 mt-1">{result.image_improvement.text_overlay}</p>
                  </div>
                )}
              </div>
              {result.image_improvement.composition_tip && (
                <div className="mt-3 bg-cyan-500/10 rounded-lg p-3">
                  <span className="text-xs font-semibold text-cyan-400">Composition Tip</span>
                  <p className="text-xs text-gray-300 mt-1">{result.image_improvement.composition_tip}</p>
                </div>
              )}
            </div>
          )}

          {/* Genre Strategy */}
          {result.genre_strategy && result.genre_strategy.content_format && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <span className="text-amber-400">🎯</span> Genre-Specific Strategy
              </h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-xs font-semibold text-gray-400">Best Format</span>
                  <p className="text-sm text-gray-300 mt-1">{result.genre_strategy.content_format}</p>
                </div>
                {result.genre_strategy.trending_approach && (
                  <div className="bg-amber-500/10 rounded-lg p-3">
                    <span className="text-xs font-semibold text-amber-400">What's Trending in This Genre</span>
                    <p className="text-xs text-gray-300 mt-1">{result.genre_strategy.trending_approach}</p>
                  </div>
                )}
                {result.genre_strategy.audience_psychology && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <span className="text-xs font-semibold text-gray-400">Audience Psychology</span>
                    <p className="text-xs text-gray-300 mt-1">{result.genre_strategy.audience_psychology}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {result.genre_strategy.dos?.length > 0 && (
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <span className="text-xs font-semibold text-green-400">Do's</span>
                      {result.genre_strategy.dos.map((d, i) => (
                        <p key={i} className="text-xs text-gray-300 mt-1 flex items-start gap-1"><span className="text-green-400">✓</span> {d}</p>
                      ))}
                    </div>
                  )}
                  {result.genre_strategy.donts?.length > 0 && (
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <span className="text-xs font-semibold text-red-400">Don'ts</span>
                      {result.genre_strategy.donts.map((d, i) => (
                        <p key={i} className="text-xs text-gray-300 mt-1 flex items-start gap-1"><span className="text-red-400">✗</span> {d}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Best time & posting tip */}
          {result.best_posting_time && (
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">Best Posting Time</div>
              <div className="text-sm font-medium">{result.best_posting_time}</div>
            </div>
          )}
        </div>
      )}

      {/* Image Improver */}
      {platform && (
        <ImageImprover platform={platform} genre={genre} />
      )}
    </div>
  );
}
