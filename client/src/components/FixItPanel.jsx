import { useState } from 'react';
import { Wand2, Loader2, Copy, Check, Calendar, Type, User, Hash, Heart, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { apiPost } from '../utils/api';

const FIX_TYPES = [
  { id: 'content_calendar', label: '30-Day Content Calendar', icon: Calendar, desc: 'Full month of post ideas with titles, hooks, descriptions & timing' },
  { id: 'titles_descriptions', label: 'Titles & Descriptions', icon: Type, desc: '10 optimized titles, SEO descriptions, thumbnail concepts & hook scripts' },
  { id: 'viral_hooks', label: '50 Viral Hooks & Scripts', icon: Flame, desc: 'Ready-to-use opening lines, scripts & storytelling frameworks' },
  { id: 'hashtag_strategy', label: 'Hashtag Strategy', icon: Hash, desc: 'Custom hashtag sets, rotation strategy & banned hashtag list' },
  { id: 'bio_profile', label: 'Profile & Bio Optimization', icon: User, desc: 'Ready-to-paste bio, display name, pinned content strategy' },
  { id: 'engagement_recovery', label: 'Engagement Recovery Plan', icon: Heart, desc: 'Comment templates, DM scripts, collab pitches & posting schedule' },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white">
      {copied ? <><Check size={12} className="text-green-400" /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}

function ContentCalendarResult({ data }) {
  const [openWeek, setOpenWeek] = useState(0);
  return (
    <div>
      {data.strategy_notes && <p className="text-sm text-gray-300 mb-4 p-3 bg-indigo-500/10 rounded-lg">{data.strategy_notes}</p>}
      {data.weeks?.map((week, wi) => (
        <div key={wi} className="mb-3">
          <button onClick={() => setOpenWeek(openWeek === wi ? -1 : wi)} className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/[0.08] transition">
            <span className="font-medium text-sm">Week {week.week}: {week.theme}</span>
            {openWeek === wi ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openWeek === wi && (
            <div className="mt-2 space-y-3 pl-2">
              {week.posts?.map((post, pi) => (
                <div key={pi} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">{post.day}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{post.content_type}</span>
                      {post.best_time && <span className="text-xs text-gray-500">{post.best_time}</span>}
                    </div>
                    <CopyButton text={`${post.title}\n\n${post.description}\n\n${post.hashtags?.map(h => h.startsWith('#') ? h : '#' + h).join(' ') || ''}`} />
                  </div>
                  <p className="font-medium text-sm text-white mb-1">{post.title}</p>
                  {post.hook && <p className="text-xs text-yellow-300 mb-2">Hook: "{post.hook}"</p>}
                  <p className="text-xs text-gray-400 whitespace-pre-line mb-2">{post.description}</p>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((h, hi) => (
                        <span key={hi} className="text-xs text-indigo-400">{h.startsWith('#') ? h : '#' + h}</span>
                      ))}
                    </div>
                  )}
                  {post.notes && <p className="text-xs text-gray-500 mt-2 italic">{post.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TitlesResult({ data }) {
  return (
    <div>
      {data.keyword_strategy && <p className="text-sm text-gray-300 mb-4 p-3 bg-indigo-500/10 rounded-lg">{data.keyword_strategy}</p>}
      {data.title_formulas?.length > 0 && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 mb-2">REUSABLE TITLE FORMULAS:</p>
          {data.title_formulas.map((f, i) => <p key={i} className="text-sm text-yellow-300 mb-1">"{f}"</p>)}
        </div>
      )}
      <div className="space-y-4">
        {data.items?.map((item, i) => (
          <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500">#{item.number} — {item.niche_topic}</span>
              <CopyButton text={`Title: ${item.title_options?.[0]}\n\nDescription:\n${item.description}\n\nHook: ${item.hook_script}\n\nKeywords: ${item.tags_keywords?.join(', ')}`} />
            </div>
            <div className="space-y-1 mb-3">
              {item.title_options?.map((t, ti) => (
                <p key={ti} className="text-sm"><span className="text-gray-500 text-xs mr-1">Option {ti + 1}:</span> <span className="text-white font-medium">{t}</span></p>
              ))}
            </div>
            {item.hook_script && (
              <div className="mb-2 p-2 bg-yellow-500/10 rounded text-xs text-yellow-300">
                Hook: "{item.hook_script}"
              </div>
            )}
            <p className="text-xs text-gray-400 whitespace-pre-line mb-2">{item.description}</p>
            {item.thumbnail_concept && (
              <div className="p-2 bg-purple-500/10 rounded text-xs text-purple-300 mb-2">
                Thumbnail: {item.thumbnail_concept}
              </div>
            )}
            {item.tags_keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags_keywords.map((k, ki) => (
                  <span key={ki} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{k}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ViralHooksResult({ data }) {
  return (
    <div>
      {data.hook_formulas?.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-xs font-semibold text-yellow-400 mb-2">HOOK FORMULAS:</p>
          {data.hook_formulas.map((f, i) => <p key={i} className="text-sm text-yellow-300 mb-1">"{f}"</p>)}
        </div>
      )}
      <div className="grid gap-3">
        {data.hooks?.map((hook, i) => (
          <div key={i} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-xs text-gray-500 mr-2">#{hook.number}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{hook.content_type}</span>
              </div>
              <CopyButton text={hook.hook_text} />
            </div>
            <p className="text-sm font-medium text-white mt-2 mb-1">"{hook.hook_text}"</p>
            <p className="text-xs text-gray-500 mb-1">{hook.why_it_works}</p>
            {hook.full_script_outline && <p className="text-xs text-gray-400">{hook.full_script_outline}</p>}
          </div>
        ))}
      </div>
      {data.cta_templates?.length > 0 && (
        <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
          <p className="text-xs font-semibold text-green-400 mb-2">CTA TEMPLATES:</p>
          {data.cta_templates.map((c, i) => <p key={i} className="text-sm text-green-300 mb-1">"{c}"</p>)}
        </div>
      )}
    </div>
  );
}

function GenericResult({ data }) {
  // Render any JSON result in a readable way
  const renderValue = (val, depth = 0) => {
    if (typeof val === 'string') return <p className="text-sm text-gray-300">{val}</p>;
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-1 ml-2">
          {val.map((item, i) => (
            <li key={i} className="text-sm text-gray-300">
              {typeof item === 'string' ? (
                <span className="flex items-start gap-1"><span className="text-indigo-400">-</span> {item}</span>
              ) : (
                <div className="bg-white/[0.03] rounded p-3 my-1">{renderValue(item, depth + 1)}</div>
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof val === 'object' && val !== null) {
      return (
        <div className={`space-y-2 ${depth > 0 ? 'ml-2' : ''}`}>
          {Object.entries(val).filter(([k]) => k !== 'type' && k !== 'title').map(([key, v]) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-gray-300">{String(val)}</p>;
  };

  return (
    <div className="space-y-3">
      <CopyButton text={JSON.stringify(data, null, 2)} />
      {renderValue(data)}
    </div>
  );
}

export default function FixItPanel({ platform, auditSummary, redFlags }) {
  const [loading, setLoading] = useState('');
  const [results, setResults] = useState({});
  const [expandedFix, setExpandedFix] = useState('');

  const handleFixIt = async (fixType) => {
    if (results[fixType]) {
      setExpandedFix(expandedFix === fixType ? '' : fixType);
      return;
    }

    setLoading(fixType);
    setExpandedFix(fixType);

    try {
      const data = await apiPost('/audit/fix-it', {
        platform,
        fixType,
        auditSummary: auditSummary || '',
        redFlag: redFlags?.map(f => typeof f === 'object' ? f.flag : f).join('; ') || '',
      });
      setResults(prev => ({ ...prev, [fixType]: data }));
    } catch (err) {
      setResults(prev => ({ ...prev, [fixType]: { error: err.message } }));
    } finally {
      setLoading('');
    }
  };

  const renderResult = (fixType, data) => {
    if (data.error) return <p className="text-red-400 text-sm">{data.error}</p>;

    switch (fixType) {
      case 'content_calendar': return <ContentCalendarResult data={data} />;
      case 'titles_descriptions': return <TitlesResult data={data} />;
      case 'viral_hooks': return <ViralHooksResult data={data} />;
      default: return <GenericResult data={data} />;
    }
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Wand2 className="text-purple-400" size={20} />
        Fix It For Me — AI Auto-Generator
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        Don't just know what to fix — let AI generate the actual content, scripts, and strategies ready to copy-paste.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {FIX_TYPES.map((fix) => {
          const isLoading = loading === fix.id;
          const hasResult = !!results[fix.id];
          const isExpanded = expandedFix === fix.id;

          return (
            <button
              key={fix.id}
              onClick={() => handleFixIt(fix.id)}
              disabled={isLoading}
              className={`text-left p-4 rounded-xl border transition ${
                isExpanded
                  ? 'border-purple-400/40 bg-purple-500/10'
                  : hasResult
                    ? 'border-green-400/30 bg-green-500/5 hover:bg-green-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                ) : hasResult ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <fix.icon size={16} className="text-purple-400" />
                )}
                <span className="text-sm font-medium">{fix.label}</span>
              </div>
              <p className="text-xs text-gray-500">{isLoading ? 'Generating... (30-60s)' : fix.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Expanded Result */}
      {expandedFix && results[expandedFix] && (
        <div className="mt-4 p-5 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm gradient-text">
              {results[expandedFix].title || FIX_TYPES.find(f => f.id === expandedFix)?.label}
            </h3>
            <button onClick={() => setExpandedFix('')} className="text-xs text-gray-400 hover:text-white">
              Collapse
            </button>
          </div>
          {renderResult(expandedFix, results[expandedFix])}
        </div>
      )}
    </div>
  );
}
