import { Link } from 'react-router-dom';
import { Shield, TrendingDown, Zap, FileText, Eye, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Reach Risk Score',
    desc: '0-100% chance of shadowban, demonetization, or 50%+ reach drop in the next 30 days.',
  },
  {
    icon: TrendingDown,
    title: 'Hidden Killers',
    desc: 'Top 5 red flags the algorithm is penalizing you for — things you cannot see in your dashboard.',
  },
  {
    icon: Zap,
    title: 'Exact $ Impact',
    desc: 'Know exactly how much money you lose every month by not fixing your algorithm issues.',
  },
  {
    icon: FileText,
    title: 'One-Click Fix Plan',
    desc: '6-step action plan as a downloadable PDF to drop your risk score below 10%.',
  },
  {
    icon: Eye,
    title: 'Pre-Post Scanner',
    desc: 'Check any post BEFORE you publish — get a safety & virality score instantly.',
  },
  {
    icon: BarChart3,
    title: 'Multi-Platform',
    desc: 'Instagram, YouTube, TikTok, X, LinkedIn — all audited from one place.',
  },
];

const stats = [
  { value: '73%', label: 'of creators saw reach drops in 2025-26' },
  { value: '5x', label: 'stricter AI content penalties in 2026' },
  { value: '<2min', label: 'to get your full audit report' },
];

export default function Landing() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-28 text-center relative">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            The 2026 Algorithm Crackdown Is Here
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="gradient-text">Predict</span> if your next post
            <br />
            will get <span className="text-red-400">shadowbanned</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Upload your analytics. Get an AI-powered risk score, hidden penalties,
            dollar impact, and a fix plan — in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-semibold transition glow"
            >
              Run Free Audit <ArrowRight size={20} />
            </Link>
            <Link
              to="/pre-check"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-lg font-semibold transition"
            >
              Try Pre-Post Checker
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-3 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-black gradient-text">{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Everything the algorithm <span className="gradient-text">hides from you</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Platforms don't tell you why your reach dropped. We do.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition">
              <f.icon className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload Analytics', desc: 'Export your CSV from any platform or paste your data directly.' },
              { step: '2', title: 'AI Analyzes', desc: 'Our engine cross-references your data against 2026 algorithm rules.' },
              { step: '3', title: 'Get Your Report', desc: 'Risk score, red flags, dollar impact, and a step-by-step fix plan.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Don't wait for the <span className="text-red-400">reach crash</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          YouTube, Meta, TikTok are enforcing strict new rules in 2026.
          Creators who audit now will survive. Others won't.
        </p>
        <Link
          to="/audit"
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-semibold transition glow"
        >
          Run Your Free Audit Now <ArrowRight size={20} />
        </Link>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> No credit card</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> Results in 2 min</span>
          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-400" /> All platforms</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>ReachRadar AI &copy; 2026. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <a href="mailto:hello@reachradar.ai" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
