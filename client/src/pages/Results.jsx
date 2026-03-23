import { useLocation, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Download, ArrowRight, TrendingDown, DollarSign, Sparkles } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import { getToken } from '../utils/api';

export default function Results() {
  const location = useLocation();
  const audit = location.state?.audit;
  const platform = location.state?.platform;

  if (!audit) {
    return (
      <div className="pt-24 text-center max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">No Audit Data</h1>
        <p className="text-gray-400 mb-6">Run an audit first to see your results.</p>
        <Link to="/audit" className="px-6 py-3 bg-indigo-600 rounded-xl font-medium">
          Run Audit
        </Link>
      </div>
    );
  }

  const severityColor = {
    low: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    high: 'text-orange-400 bg-orange-400/10',
    critical: 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Your <span className="gradient-text">Algorithm Audit</span> Results
        </h1>
        <p className="text-gray-400 capitalize">{platform} Account Analysis</p>
      </div>

      {/* Risk Score */}
      <div className="glass rounded-2xl p-8 mb-6 text-center glow">
        <RiskGauge score={audit.risk_score} size={240} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/5 rounded-xl p-4">
            <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">30-Day Reach Drop</div>
            <div className="text-lg font-bold text-red-300">{audit.predicted_30day_reach_drop}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <DollarSign className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Potential Loss</div>
            <div className="text-lg font-bold text-yellow-300">{audit.potential_monthly_loss}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 sm:col-span-1 col-span-2">
            <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Authenticity Score</div>
            <div className="text-lg font-bold text-indigo-300">{audit.authenticity_score}/100</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {audit.summary && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-2">Executive Summary</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{audit.summary}</p>
        </div>
      )}

      {/* Red Flags */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-400" size={20} />
          Top Red Flags
        </h2>
        <div className="space-y-3">
          {audit.top_red_flags?.map((flag, i) => {
            const isObj = typeof flag === 'object';
            return (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{isObj ? flag.flag : flag}</p>
                    {isObj && flag.explanation && (
                      <p className="text-xs text-gray-400 mt-1">{flag.explanation}</p>
                    )}
                  </div>
                  {isObj && flag.severity && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${severityColor[flag.severity] || ''}`}>
                      {flag.severity}
                    </span>
                  )}
                </div>
                {isObj && flag.platform && (
                  <span className="text-xs text-gray-500 mt-2 inline-block">{flag.platform}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fix Plan */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-400" size={20} />
          6-Step Fix Plan
        </h2>
        <div className="space-y-3">
          {audit.fix_plan?.map((step, i) => {
            const isObj = typeof step === 'object';
            return (
              <div key={i} className="flex gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {isObj ? step.step : i + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{isObj ? step.action : step}</p>
                  {isObj && (
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                      {step.timeline && <span>Timeline: {step.timeline}</span>}
                      {step.impact && <span>Impact: {step.impact}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Positive Signals */}
      {audit.positive_signals?.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="text-green-400" size={20} />
            What You're Doing Right
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {audit.positive_signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                {signal}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {audit.id && getToken() && (
          <a
            href={`/api/audit/${audit.id}/pdf`}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-center flex items-center justify-center gap-2 transition"
          >
            <Download size={18} /> Download PDF Report
          </a>
        )}
        <Link
          to="/pre-check"
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium text-center flex items-center justify-center gap-2 transition"
        >
          Check a Post Before Publishing <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
