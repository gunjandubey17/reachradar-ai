import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Clock, Plus, Sparkles, Flame } from 'lucide-react';
import { apiGet, getUser, setUser } from '../utils/api';

export default function Dashboard() {
  const [audits, setAudits] = useState([]);
  const [dailyIdeas, setDailyIdeas] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setCurrentUser] = useState(getUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    Promise.all([
      apiGet('/auth/me').catch(() => null),
      apiGet('/audit/history').catch(() => ({ audits: [] })),
      apiGet('/daily-ideas/today').catch(() => null),
    ])
      .then(([meData, auditData, ideasData]) => {
        if (meData?.user) {
          setUser(meData.user);
          setCurrentUser(meData.user);
        }
        setAudits(auditData?.audits || []);
        setDailyIdeas(ideasData?.today || null);
        setDailyStreak(ideasData?.streak || 0);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const riskColor = (score) => {
    if (score <= 25) return 'text-green-400';
    if (score <= 50) return 'text-yellow-400';
    if (score <= 75) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.email} &middot; {user?.plan === 'free' ? 'Free Plan' : 'Pro'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/daily-ideas" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium flex items-center gap-2 transition border border-white/10">
            <Sparkles size={16} /> Daily Ideas
          </Link>
          <Link to="/audit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium flex items-center gap-2 transition">
            <Plus size={16} /> New Audit
          </Link>
        </div>
      </div>

      {dailyIdeas ? (
        <div className="glass rounded-3xl p-6 border border-indigo-500/20 mb-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-indigo-300 mb-2">
                <Sparkles size={16} /> Today's content engine
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{dailyIdeas.posts?.length || 0} posts ready for today</h2>
              <p className="text-sm text-gray-300 capitalize">{dailyIdeas.niche} niche · {dailyIdeas.goal} goal</p>
              {dailyIdeas.strategy_note && <p className="text-sm text-gray-400 mt-2 max-w-2xl">{dailyIdeas.strategy_note}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[260px]">
              <div className="rounded-2xl bg-black/20 border border-white/10 px-4 py-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-orange-300 mb-1"><Flame size={14} /> Streak</div>
                <div className="text-2xl font-black text-white">{dailyStreak}</div>
              </div>
              <Link to="/daily-ideas" className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition">
                Open today's posts
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-3xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-indigo-300 mb-2">
                <Sparkles size={16} /> Daily content engine
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Generate today's post ideas</h2>
              <p className="text-sm text-gray-400">Get a tight daily mix of post ideas instead of random prompts.</p>
            </div>
            <Link to="/daily-ideas" className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold transition">
              Generate now
            </Link>
          </div>
        </div>
      )}

      {user?.plan === 'free' && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 border border-indigo-500/20">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-2">Free Audits</p>
            <div className="text-3xl font-black text-white mb-1">{user?.auditsRemaining ?? user?.audits_remaining ?? 5}/5</div>
            <p className="text-sm text-gray-400">Audits left before you need Pro.</p>
          </div>
          <div className="glass rounded-2xl p-5 border border-purple-500/20">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">Free Pre-Checks</p>
            <div className="text-3xl font-black text-white mb-1">{user?.prechecksRemaining ?? 5}/5</div>
            <p className="text-sm text-gray-400">Content checks left on the free plan.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : audits.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No audits yet</h2>
          <p className="text-gray-400 mb-6">Run your first algorithm audit to see your risk score.</p>
          <Link to="/audit" className="px-6 py-3 bg-indigo-600 rounded-xl font-medium">Run First Audit</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <Link key={audit.id} to={`/results/${audit.id}`} className="block glass rounded-xl p-5 hover:bg-white/[0.08] transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black ${riskColor(audit.risk_score)}`}>{audit.risk_score}</div>
                  <div>
                    <div className="font-medium capitalize">{audit.platform}</div>
                    <div className="text-xs text-gray-500">{audit.file_name || 'Algorithm Audit'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${riskColor(audit.risk_score)}`}>{audit.risk_level}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Clock size={12} />
                    {new Date(audit.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {user?.plan === 'free' && (
        <div className="mt-8 glass rounded-2xl p-6 text-center border border-indigo-500/20">
          <h3 className="font-semibold mb-2">Unlock the full toolkit</h3>
          <p className="text-gray-400 text-sm mb-4">Upgrade to Pro for unlimited audits, 3 daily post ideas, saved idea history, PDF reports, and pre-post checking.</p>
          <Link to="/pricing" className="px-6 py-2 bg-indigo-600 rounded-lg text-sm font-medium">View Plans</Link>
        </div>
      )}
    </div>
  );
}
