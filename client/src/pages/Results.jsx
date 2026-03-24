import { useLocation, useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Download, ArrowRight, TrendingDown, DollarSign, Sparkles, ChevronDown, ChevronUp, Wrench, Clock, Target, Zap, Loader2 } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import FixItPanel from '../components/FixItPanel';
import { getToken, apiGet } from '../utils/api';
import { downloadAuditPDF } from '../utils/pdfGenerator';

export default function Results() {
  const location = useLocation();
  const { id } = useParams();
  const [audit, setAudit] = useState(location.state?.audit || null);
  const [platform, setPlatform] = useState(location.state?.platform || '');
  const [loading, setLoading] = useState(false);
  const [expandedFlags, setExpandedFlags] = useState({});
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleFlag = (i) => setExpandedFlags(prev => ({ ...prev, [i]: !prev[i] }));
  const toggleStep = (i) => setExpandedSteps(prev => ({ ...prev, [i]: !prev[i] }));

  // Fetch audit from database if accessed via URL with ID
  useEffect(() => {
    if (!audit && id) {
      setLoading(true);
      apiGet(`/audit/get/${id}`)
        .then((data) => {
          if (data.audit) {
            const report = typeof data.audit.full_report === 'string'
              ? JSON.parse(data.audit.full_report)
              : data.audit.full_report;
            setAudit(report);
            setPlatform(data.audit.platform || '');
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
        <p className="text-gray-400 mt-4">Loading audit results...</p>
      </div>
    );
  }

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

      {/* Priority Action */}
      {audit.priority_action && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-400" size={20} />
            <h2 className="font-semibold text-yellow-300">Do This RIGHT NOW</h2>
          </div>
          <p className="text-sm text-gray-200">{audit.priority_action}</p>
        </div>
      )}

      {/* Red Flags with How to Fix */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-400" size={20} />
          Top Red Flags & How to Fix
        </h2>
        <div className="space-y-3">
          {audit.top_red_flags?.map((flag, i) => {
            const isObj = typeof flag === 'object';
            const expanded = expandedFlags[i];
            const hasFix = isObj && flag.how_to_fix;
            return (
              <div key={i} className="bg-white/5 rounded-xl overflow-hidden">
                <div
                  className={`p-4 ${hasFix ? 'cursor-pointer hover:bg-white/[0.03]' : ''}`}
                  onClick={() => hasFix && toggleFlag(i)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{isObj ? flag.flag : flag}</p>
                      {isObj && flag.explanation && (
                        <p className="text-xs text-gray-400 mt-1">{flag.explanation}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isObj && flag.severity && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${severityColor[flag.severity] || ''}`}>
                          {flag.severity}
                        </span>
                      )}
                      {hasFix && (
                        expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-indigo-400" />
                      )}
                    </div>
                  </div>
                  {isObj && flag.platform && (
                    <span className="text-xs text-gray-500 mt-2 inline-block">{flag.platform}</span>
                  )}
                  {hasFix && !expanded && (
                    <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1">
                      <Wrench size={12} /> Click to see how to fix this
                    </p>
                  )}
                </div>

                {/* Expanded How to Fix */}
                {hasFix && expanded && (
                  <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-1">
                      <Wrench size={14} /> How to Fix
                    </h4>

                    {flag.how_to_fix.steps?.length > 0 && (
                      <ol className="space-y-2 mb-3">
                        {flag.how_to_fix.steps.map((step, j) => (
                          <li key={j} className="flex gap-2 text-sm text-gray-300">
                            <span className="text-green-400 font-bold flex-shrink-0">{j + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {flag.how_to_fix.tools_needed?.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Wrench size={10} /> Tools Needed
                          </div>
                          <div className="text-xs text-gray-300">
                            {flag.how_to_fix.tools_needed.join(', ')}
                          </div>
                        </div>
                      )}
                      {flag.how_to_fix.time_to_fix && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Clock size={10} /> Time to Fix
                          </div>
                          <div className="text-xs text-gray-300">{flag.how_to_fix.time_to_fix}</div>
                        </div>
                      )}
                    </div>
                    {flag.how_to_fix.expected_result && (
                      <div className="mt-3 bg-green-500/10 rounded-lg p-3">
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          <Target size={10} /> Expected Result
                        </div>
                        <div className="text-xs text-gray-300 mt-1">{flag.how_to_fix.expected_result}</div>
                      </div>
                    )}
                  </div>
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
          Step-by-Step Fix Plan
        </h2>
        {audit.recovery_timeline && (
          <div className="mb-4 p-3 bg-indigo-500/10 rounded-lg text-sm text-indigo-300 flex items-center gap-2">
            <Clock size={16} /> Recovery timeline: {audit.recovery_timeline}
          </div>
        )}
        <div className="space-y-3">
          {audit.fix_plan?.map((step, i) => {
            const isObj = typeof step === 'object';
            const expanded = expandedSteps[i];
            const hasHowTo = isObj && step.how_to;
            return (
              <div key={i} className="bg-white/5 rounded-xl overflow-hidden">
                <div
                  className={`flex gap-4 p-4 ${hasHowTo ? 'cursor-pointer hover:bg-white/[0.03]' : ''}`}
                  onClick={() => hasHowTo && toggleStep(i)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {isObj ? step.step : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{isObj ? step.action : step}</p>
                    {isObj && (
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                        {step.timeline && <span className="flex items-center gap-1"><Clock size={10} /> {step.timeline}</span>}
                        {step.impact && <span className="flex items-center gap-1"><Target size={10} /> {step.impact}</span>}
                        {step.tools && <span className="flex items-center gap-1"><Wrench size={10} /> {step.tools}</span>}
                      </div>
                    )}
                    {hasHowTo && !expanded && (
                      <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1">
                        <ChevronDown size={12} /> See detailed instructions
                      </p>
                    )}
                  </div>
                  {hasHowTo && (
                    <div className="flex-shrink-0 mt-1">
                      {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-indigo-400" />}
                    </div>
                  )}
                </div>

                {hasHowTo && expanded && (
                  <div className="px-4 pb-4 ml-12 border-t border-white/5 pt-3">
                    <h4 className="text-xs font-semibold text-indigo-400 mb-2">HOW TO DO THIS:</h4>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{step.how_to}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fix It For Me Panel */}
      <FixItPanel
        platform={platform}
        auditSummary={audit.summary}
        redFlags={audit.top_red_flags}
      />

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
        <button
          onClick={() => downloadAuditPDF(audit, platform)}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-center flex items-center justify-center gap-2 transition"
        >
          <Download size={18} /> Download PDF Report
        </button>
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
