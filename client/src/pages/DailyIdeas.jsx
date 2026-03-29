import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarRange, Flame, Loader2, Sparkles, Target } from 'lucide-react';
import { apiGet, apiPost, getToken, getUser, setUser } from '../utils/api';

const nicheOptions = ['fitness', 'comedy', 'business', 'personal', 'fashion', 'education', 'food', 'lifestyle'];
const goalOptions = ['followers', 'engagement', 'sales'];

export default function DailyIdeas() {
  const [user, setCurrentUser] = useState(getUser());
  const [niche, setNiche] = useState('fitness');
  const [goal, setGoal] = useState('followers');
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Daily Post Ideas | ReachRadar AI';
    if (!getToken()) {
      navigate('/login', { state: { from: '/daily-ideas' } });
      return;
    }

    Promise.all([
      apiGet('/auth/me').catch(() => null),
      apiGet('/daily-ideas/today').catch(() => null),
    ])
      .then(([meData, ideaData]) => {
        if (meData?.user) {
          setUser(meData.user);
          setCurrentUser(meData.user);
        }
        if (ideaData?.today) {
          setToday(ideaData.today);
          setHistory(ideaData.history || []);
          setStreak(ideaData.streak || 0);
          setNiche(ideaData.today.niche || 'fitness');
          setGoal(ideaData.today.goal || 'followers');
        } else if (ideaData) {
          setHistory(ideaData.history || []);
          setStreak(ideaData.streak || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const postLimit = user?.plan === 'pro' ? 3 : 1;
  const planLabel = user?.plan === 'pro' ? 'Pro' : 'Free';
  const canGenerateToday = !today;

  const introCopy = useMemo(() => {
    if (user?.plan === 'pro') {
      return 'Pro includes 3 daily ideas, reach scores, streak tracking, and saved history under your current subscription.';
    }
    return 'Free includes 1 daily idea. Upgrade to Pro for 3 daily posts, reach scores, and saved history.';
  }, [user?.plan]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await apiPost('/daily-ideas/generate', { niche, goal });
      setToday(data.today || null);
      setHistory(data.history || []);
      setStreak(data.streak || 0);
    } catch (err) {
      setError(err.message || 'Failed to generate daily ideas.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <Sparkles size={14} /> Daily Content Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-3">Your posts for today</h1>
          <p className="text-gray-400 max-w-2xl">Pick a niche and goal. ReachRadar gives you a tight daily mix instead of endless content ideas.</p>
        </div>
        <div className="glass rounded-2xl px-5 py-4 border border-white/10 min-w-[220px]">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-2">{planLabel} plan</p>
          <div className="text-3xl font-black text-white">{postLimit}</div>
          <p className="text-sm text-gray-400">post{postLimit > 1 ? 's' : ''} generated per day</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[340px_1fr] gap-6">
        <div className="glass rounded-3xl p-6 border border-white/10 h-fit">
          <div className="flex items-center gap-2 mb-4 text-sm text-indigo-300">
            <Target size={16} /> Daily setup
          </div>
          <p className="text-sm text-gray-400 mb-6">{introCopy}</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Niche</label>
              <select value={niche} onChange={(e) => setNiche(e.target.value)} disabled={!canGenerateToday || generating} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition capitalize">
                {nicheOptions.map((option) => <option key={option} value={option} className="bg-slate-900 capitalize">{option}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} disabled={!canGenerateToday || generating} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-indigo-400 focus:outline-none transition capitalize">
                {goalOptions.map((option) => <option key={option} value={option} className="bg-slate-900 capitalize">{option}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-2 text-indigo-300 text-xs uppercase tracking-[0.18em] mb-2"><CalendarRange size={14} /> Today</div>
              <div className="text-2xl font-black">{postLimit}</div>
              <p className="text-xs text-gray-500">Idea slot{postLimit > 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-2 text-orange-300 text-xs uppercase tracking-[0.18em] mb-2"><Flame size={14} /> Streak</div>
              <div className="text-2xl font-black">{streak}</div>
              <p className="text-xs text-gray-500">day{streak === 1 ? '' : 's'} in a row</p>
            </div>
          </div>

          {error && (
            <div className="mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">{error}</div>
          )}

          <button onClick={handleGenerate} disabled={!canGenerateToday || generating || loading} className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 rounded-xl font-semibold transition flex items-center justify-center gap-2">
            {generating && <Loader2 size={16} className="animate-spin" />}
            {today ? 'Already generated for today' : generating ? 'Generating...' : `Generate ${postLimit} post${postLimit > 1 ? 's' : ''}`}
          </button>

          {!today && (
            <p className="text-xs text-gray-500 mt-3">You only get one set per day. That constraint is intentional so users actually post.</p>
          )}

          {user?.plan === 'free' && (
            <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="font-medium text-white mb-1">Want the full version?</p>
              <p className="text-sm text-gray-400 mb-3">Pro unlocks 3 daily posts, reach scores, and saved idea history without buying anything extra.</p>
              <Link to="/pricing" className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition">View Pro</Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="glass rounded-3xl p-12 text-center text-gray-400">Loading today's content engine...</div>
          ) : today ? (
            <>
              <div className="glass rounded-3xl p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-2">{today.idea_date}</p>
                    <h2 className="text-2xl font-bold text-white">{today.post_limit || today.posts?.length || postLimit} posts for today</h2>
                    <p className="text-gray-400 text-sm mt-1 capitalize">Niche: {today.niche} · Goal: {today.goal}</p>
                  </div>
                  {today.strategy_note && (
                    <div className="max-w-sm rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-gray-300">
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300 mb-2">Strategy note</p>
                      {today.strategy_note}
                    </div>
                  )}
                </div>

                <div className="grid gap-4">
                  {(today.posts || []).map((post, index) => (
                    <div key={`${post.idea}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-indigo-300 mb-2">Post {index + 1} · {post.bucket_label || post.bucket}</p>
                          <h3 className="text-xl font-bold text-white">{post.idea}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">{post.format}</span>
                          {user?.plan === 'pro' && post.reach_score != null && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Reach Score {post.reach_score}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-[220px_1fr] gap-4">
                        <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-pink-300 mb-2">Hook</p>
                          <p className="text-lg font-semibold text-white">{post.hook}</p>
                        </div>
                        <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 mb-2">Caption</p>
                          <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{post.caption}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {user?.plan === 'pro' && history.length > 1 && (
                <div className="glass rounded-3xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4">Saved history</h3>
                  <div className="space-y-3">
                    {history.slice(1).map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                          <div>
                            <p className="text-sm font-semibold text-white">{entry.idea_date}</p>
                            <p className="text-xs text-gray-500 capitalize">{entry.niche} · {entry.goal}</p>
                          </div>
                          <div className="text-xs text-gray-500">{entry.posts?.length || 0} posts saved</div>
                        </div>
                        <div className="grid gap-2">
                          {(entry.posts || []).slice(0, 3).map((post, index) => (
                            <div key={`${entry.id}-${index}`} className="text-sm text-gray-300 border border-white/10 rounded-xl px-3 py-2 bg-black/20">
                              <span className="text-indigo-300 font-medium mr-2">{post.format}</span>
                              {post.idea}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass rounded-3xl p-12 text-center border border-white/10">
              <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No posts generated yet</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Choose your niche and goal, then generate today's set. The engine rotates proven content buckets so you get structure, not random prompts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
