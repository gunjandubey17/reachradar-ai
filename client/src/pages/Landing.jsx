import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Shield,
  TrendingDown,
  Zap,
  FileText,
  Eye,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles,
  SlidersHorizontal,
  Target,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Reach Drop Diagnosis',
    desc: 'Find out exactly why your reach dropped: shadowban, algorithm penalty, or content suppression. Get a 0-100 risk score.',
  },
  {
    icon: TrendingDown,
    title: 'Hidden Algorithm Penalties',
    desc: 'Detect the top 5 red flags the algorithm is penalizing you for: things platforms never tell you in your analytics dashboard.',
  },
  {
    icon: Zap,
    title: 'Revenue Impact Calculator',
    desc: 'See how much money you are losing every month from low engagement, suppressed reach, and algorithm penalties.',
  },
  {
    icon: FileText,
    title: 'Fix Plan + PDF Report',
    desc: '6-step personalized action plan to fix your algorithm issues. Download as PDF and start recovering your reach today.',
  },
  {
    icon: Eye,
    title: 'Pre-Post Content Checker',
    desc: 'Scan your post before you publish: get a virality score, safety check, and optimization tips to beat the algorithm.',
  },
  {
    icon: BarChart3,
    title: 'All Platforms Supported',
    desc: 'Instagram, Facebook, YouTube, TikTok, X, LinkedIn: check for shadowbans, reach drops, and algorithm issues on any platform.',
  },
];

const stats = [
  { value: '73%', label: 'of creators experienced sudden reach drops in 2026' },
  { value: '5x', label: 'stricter algorithm penalties for AI content' },
  { value: '<2min', label: 'to find out why your views are dropping' },
];

const demoPlatforms = [
  { id: 'instagram', name: 'Instagram', icon: 'IG' },
  { id: 'youtube', name: 'YouTube', icon: 'YT' },
  { id: 'tiktok', name: 'TikTok', icon: 'TT' },
];

const demoCopy = {
  instagram: {
    issue: 'Recycled short-form patterns are weakening distribution',
    action: 'Post one original Reel series for 7 days and stop reusing watermarked edits.',
  },
  youtube: {
    issue: 'Low retention is suppressing recommendation momentum',
    action: 'Tighten the first 15 seconds and rewrite titles around a single curiosity angle.',
  },
  tiktok: {
    issue: 'Weak watch-through is killing FYP testing',
    action: 'Shorten the setup, open with the outcome first, and cut every low-energy beat.',
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDemoAudit(platform, engagementRate, postingConsistency, originality) {
  const platformBias = {
    instagram: 10,
    youtube: 14,
    tiktok: 18,
  };

  const score = clamp(
    Math.round(
      82 -
      engagementRate * 1.2 -
      postingConsistency * 0.45 -
      originality * 0.7 +
      (platformBias[platform] || 0)
    ),
    11,
    94
  );

  const riskLevel =
    score >= 75 ? 'Critical' :
    score >= 55 ? 'High' :
    score >= 35 ? 'Medium' :
    'Low';

  const reachDrop = `${clamp(Math.round(score * 0.58), 8, 62)}%`;
  const authenticity = clamp(Math.round((originality * 0.9) + (postingConsistency * 0.18)), 24, 96);
  const consistencyLabel =
    postingConsistency >= 75 ? 'stable cadence' :
    postingConsistency >= 45 ? 'inconsistent posting' :
    'sporadic posting';

  return {
    score,
    riskLevel,
    reachDrop,
    authenticity,
    issue: demoCopy[platform].issue,
    action: demoCopy[platform].action,
    highlights: [
      `${engagementRate.toFixed(1)}% engagement suggests ${engagementRate >= 5 ? 'healthy audience response' : 'distribution friction'}.`,
      `${Math.round(originality)} / 100 originality score indicates ${originality >= 70 ? 'strong uniqueness' : 'repetition risk'}.`,
      `${Math.round(postingConsistency)} / 100 posting consistency looks like ${consistencyLabel}.`,
    ],
  };
}

export default function Landing() {
  const [demoPlatform, setDemoPlatform] = useState('instagram');
  const [engagementRate, setEngagementRate] = useState(2.8);
  const [postingConsistency, setPostingConsistency] = useState(46);
  const [originality, setOriginality] = useState(52);

  useEffect(() => {
    document.title = 'ReachRadar AI - Why Is My Reach Dropping? Free Algorithm Audit & Shadowban Checker (2026)';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Find out why your Instagram reach dropped, if you are shadowbanned on TikTok, or why your YouTube views suddenly decreased. Free AI-powered algorithm audit with fix plan for creators.'
    );
  }, []);

  const demoAudit = getDemoAudit(demoPlatform, engagementRate, postingConsistency, originality);

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-28 text-center relative">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            Why Is My Reach Dropping? Find Out in 2 Minutes
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Find out why your
            <br />
            <span className="text-red-400">views are dropping</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            AI-powered algorithm audit that tells you exactly why your reach dropped,
            if you are shadowbanned, and how to fix it in under 2 minutes.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-10">
            Works for Instagram, Facebook, YouTube, TikTok, X and LinkedIn. Free shadowban checker plus engagement analysis and fix plan.
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

      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
            <Sparkles size={14} />
            Interactive sample audit
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Try the <span className="gradient-text">audit logic</span> before you sign up
          </h2>
          <p className="text-gray-400">
            Move the sliders, switch platforms, and watch how weak engagement, inconsistent posting, and low originality affect your risk score.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-6 items-start">
          <div className="glass rounded-[28px] p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
              <SlidersHorizontal size={16} className="text-emerald-300" />
              Adjust a few signals
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {demoPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setDemoPlatform(platform.id)}
                  className={`rounded-2xl px-4 py-4 border text-left transition ${
                    demoPlatform === platform.id
                      ? 'border-emerald-400/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-2">{platform.icon}</div>
                  <div className="text-sm font-semibold">{platform.name}</div>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Engagement rate</label>
                  <span className="text-sm text-emerald-300">{engagementRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.1"
                  value={engagementRate}
                  onChange={(e) => setEngagementRate(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <p className="text-xs text-gray-500 mt-2">Lower engagement usually means lower distribution trust.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Posting consistency</label>
                  <span className="text-sm text-indigo-300">{Math.round(postingConsistency)}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={postingConsistency}
                  onChange={(e) => setPostingConsistency(Number(e.target.value))}
                  className="w-full accent-indigo-400"
                />
                <p className="text-xs text-gray-500 mt-2">Chaotic posting patterns often look like a weak content system.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Originality score</label>
                  <span className="text-sm text-pink-300">{Math.round(originality)}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={originality}
                  onChange={(e) => setOriginality(Number(e.target.value))}
                  className="w-full accent-pink-400"
                />
                <p className="text-xs text-gray-500 mt-2">Recycled or repetitive content raises suppression risk fast.</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 sm:p-8 backdrop-blur-xl">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80 mb-2">Sample output</p>
                  <h3 className="text-2xl font-bold">{demoPlatforms.find((p) => p.id === demoPlatform)?.name} risk snapshot</h3>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-black text-white">{demoAudit.score}</div>
                  <div className="text-sm text-gray-400">risk score</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                  <p className="text-xs text-gray-500 mb-1">Risk level</p>
                  <p className="text-lg font-semibold text-red-300">{demoAudit.riskLevel}</p>
                </div>
                <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                  <p className="text-xs text-gray-500 mb-1">Projected reach drop</p>
                  <p className="text-lg font-semibold text-yellow-300">{demoAudit.reachDrop}</p>
                </div>
                <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                  <p className="text-xs text-gray-500 mb-1">Authenticity</p>
                  <p className="text-lg font-semibold text-emerald-300">{demoAudit.authenticity}/100</p>
                </div>
              </div>

              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 mb-4">
                <div className="flex items-center gap-2 mb-2 text-red-300">
                  <TrendingDown size={16} />
                  <span className="text-sm font-semibold">Primary red flag</span>
                </div>
                <p className="text-sm text-gray-200">{demoAudit.issue}</p>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 mb-6">
                <div className="flex items-center gap-2 mb-2 text-emerald-300">
                  <Target size={16} />
                  <span className="text-sm font-semibold">Priority action</span>
                </div>
                <p className="text-sm text-gray-200">{demoAudit.action}</p>
              </div>

              <div className="space-y-2 mb-6">
                {demoAudit.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/audit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition"
                >
                  Run the full audit
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/pre-check"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition"
                >
                  Check content before posting
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          Why your <span className="gradient-text">views are not growing</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Platforms never tell you why your engagement dropped or if you are shadowbanned. Our AI does and shows you how to fix it.
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

      <section className="border-t border-white/5 bg-white/[0.02] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Works with <span className="gradient-text">every major platform</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Instagram', problems: 'Reach drops, Explore shadowban, Reel suppression, engagement rate drops, hashtag penalties' },
              { name: 'Facebook', problems: 'Page reach declining, News Feed suppression, post engagement dropping, Reels not performing, group visibility issues' },
              { name: 'YouTube', problems: 'Views dropping, not getting recommended, low CTR, watch time penalties, Shorts not performing' },
              { name: 'TikTok', problems: 'Views stuck at 0, not on FYP, low watch-through rate, content not going viral, algorithm suppression' },
              { name: 'X / Twitter', problems: 'Impressions dropping, tweets not showing in search, engagement rate low, account suppression' },
              { name: 'LinkedIn', problems: 'Post impressions low, content not appearing in feed, engagement dropping, reach declining' },
            ].map((p) => (
              <div key={p.name} className="glass rounded-xl p-4">
                <h3 className="font-semibold text-white mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.problems}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload Your Analytics', desc: 'Screenshot or export your analytics from Instagram, Facebook, YouTube, TikTok, X, or LinkedIn.' },
              { step: '2', title: 'AI Finds the Problem', desc: 'Our AI checks your data against 2026 algorithm rules, detects shadowbans, reach drops, and hidden penalties.' },
              { step: '3', title: 'Get Fix Plan', desc: 'Download a PDF with your risk score, exact problems, revenue impact, and a step-by-step plan to recover your reach.' },
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

      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Stop losing <span className="text-red-400">views and followers</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Instagram, Facebook, YouTube, and TikTok algorithms changed drastically in 2026.
          Find out if your account is affected before you lose more reach.
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

      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Why is my Instagram reach dropping suddenly?',
              a: 'Instagram reach drops in 2026 are caused by unlabeled AI content, recycled Reels from TikTok, engagement pod detection, or follow and unfollow spam. Upload your analytics to ReachRadar AI and the audit pinpoints the exact cause.',
            },
            {
              q: 'Why are my YouTube views suddenly dropping?',
              a: 'YouTube views drop when watch time falls below 40%, AI content is unlabeled, Shorts are recycled, or comments are disabled. ReachRadar AI scans your analytics and tells you which penalties are active.',
            },
            {
              q: 'Why are my TikTok views stuck at 0?',
              a: 'TikTok views at 0 usually means your content failed the initial algorithm review. Common causes are AI slop detection, low originality score, posting too often, or recycled content.',
            },
            {
              q: 'Why is my Facebook Page reach declining?',
              a: 'Facebook Page organic reach dropped significantly in 2026. The algorithm now prioritizes Reels and video over static posts, penalizes engagement bait and link-heavy content, and detects AI-generated posts.',
            },
            {
              q: 'How do I check if I am shadowbanned on Instagram?',
              a: 'Upload your Instagram analytics screenshots to ReachRadar AI. The audit analyzes your engagement patterns, reach metrics, and content against Instagram rules. Anything above 50 often signals suppression risk.',
            },
            {
              q: 'How do I beat the Instagram algorithm in 2026?',
              a: 'Create original content, label AI-generated content, post consistently, avoid engagement pods, and use Instagram original content bonuses. ReachRadar AI turns that into an account-specific plan.',
            },
            {
              q: 'How to go viral on TikTok?',
              a: 'Going viral on TikTok in 2026 requires watch-through rate above 50%, original content, a strong hook in the first 2 seconds, trending sounds, and controlled posting frequency.',
            },
            {
              q: 'Why is my content not showing in Instagram Explore?',
              a: 'Content gets blocked from Explore due to low engagement rate, shadowban penalties, recycled content detection, or hashtag spam. ReachRadar AI identifies which specific penalty is blocking your reach.',
            },
            {
              q: 'Why is YouTube not recommending my videos?',
              a: 'YouTube stops recommending videos when your authenticity score drops, watch time is low, CTR is weak, or AI content is unlabeled. The audit helps show which part is breaking momentum.',
            },
            {
              q: 'How to grow on Instagram in 2026?',
              a: 'Instagram growth depends on original Reels, high engagement rate, consistent posting schedule, and avoiding algorithm penalties. ReachRadar AI surfaces the hidden blockers first.',
            },
            {
              q: 'How to increase YouTube subscribers?',
              a: 'Subscriber growth depends on watch time, CTR, and recommendation performance. If your videos are not being recommended, you will not grow consistently.',
            },
            {
              q: 'Is ReachRadar AI free?',
              a: 'Yes. You can run a full algorithm audit for free and get your risk score, hidden penalties, revenue impact estimate, and downloadable PDF fix plan.',
            },
            {
              q: 'What social media platforms does ReachRadar AI support?',
              a: 'ReachRadar AI supports Instagram, Facebook, YouTube, TikTok, X, and LinkedIn. Each platform is audited against its own current algorithm rules.',
            },
          ].map((faq) => (
            <details key={faq.q} className="glass rounded-xl p-4 group cursor-pointer">
              <summary className="text-white font-medium flex items-center justify-between">
                {faq.q}
                <ArrowRight size={16} className="text-gray-500 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>ReachRadar AI &copy; 2026. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/safety-standards" className="hover:text-white transition">Safety Standards</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <a href="mailto:hello@reachradarai.com" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
