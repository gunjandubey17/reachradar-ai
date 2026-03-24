import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Clock, TrendingDown, Plus } from 'lucide-react';
import { apiGet, getUser } from '../utils/api';

export default function Dashboard() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    apiGet('/audit/history')
      .then((data) => setAudits(data.audits || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <Link
          to="/audit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <Plus size={16} /> New Audit
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : audits.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No audits yet</h2>
          <p className="text-gray-400 mb-6">Run your first algorithm audit to see your risk score.</p>
          <Link to="/audit" className="px-6 py-3 bg-indigo-600 rounded-xl font-medium">
            Run First Audit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit) => (
            <Link
              key={audit.id}
              to={`/results/${audit.id}`}
              className="block glass rounded-xl p-5 hover:bg-white/[0.08] transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black ${riskColor(audit.risk_score)}`}>
                    {audit.risk_score}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{audit.platform}</div>
                    <div className="text-xs text-gray-500">{audit.file_name || 'Algorithm Audit'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${riskColor(audit.risk_score)}`}>
                    {audit.risk_level}
                  </div>
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
          <h3 className="font-semibold mb-2">Unlock Unlimited Audits</h3>
          <p className="text-gray-400 text-sm mb-4">
            Upgrade to Pro for unlimited audits, PDF reports, and pre-post checking.
          </p>
          <Link to="/pricing" className="px-6 py-2 bg-indigo-600 rounded-lg text-sm font-medium">
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
}
