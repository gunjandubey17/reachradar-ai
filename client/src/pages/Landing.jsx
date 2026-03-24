import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Shield, TrendingDown, Zap, FileText, Eye, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Reach Drop Diagnosis',
    desc: 'Find out exactly why your reach dropped — shadowban, algorithm penalty, or content suppression. Get a 0-100 risk score.',
  },
  {
    icon: TrendingDown,
    title: 'Hidden Algorithm Penalties',
    desc: 'Detect the top 5 red flags the algorithm is penalizing you for — things platforms never tell you in your analytics dashboard.',
  },
  {
    icon: Zap,
    title: 'Revenue Impact Calculator',
    desc: 'See how much money you\'re losing every month from low engagement, suppressed reach, and algorithm penalties.',
  },
  {
    icon: FileText,
    title: 'Fix Plan + PDF Report',
    desc: '6-step personalized action plan to fix your algorithm issues. Download as PDF and start recovering your reach today.',
  },
  {
    icon: Eye,
    title: 'Pre-Post Content Checker',
    desc: 'Scan your post BEFORE you publish — get a virality score, safety check, and optimization tips to beat the algorithm.',
  },
  {
    icon: BarChart3,
    title: 'All Platforms Supported',
    desc: 'Instagram, Facebook, YouTube, TikTok, X, LinkedIn — check for shadowbans, reach drops, and algorithm issues on any platform.',
  },
];

const stats = [
  { value: '73%', label: 'of creators experienced sudden reach drops in 2026' },
  { value: '5x', label: 'stricter algorithm penalties for AI content' },
  { value: '<2min', label: 'to find out why your views are dropping' },
];

export default function Landing() {
  useEffect(() => {
    document.title = 'ReachRadar AI — Why Is My Reach Dropping? Free Algorithm Audit & Shadowban Checker (2026)';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'Find out why your Instagram reach dropped, if you\'re shadowbanned on TikTok, or why your YouTube views suddenly decreased. Free AI-powered algorithm audit with fix plan for creators.'
    );
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
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
            if you're shadowbanned, and how to fix it — in under 2 minutes.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-10">
            Works for Instagram, Facebook, YouTube, TikTok, X & LinkedIn. Free shadowban checker + engagement analysis + fix plan.
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
          Why your <span className="gradient-text">views are not growing</span>
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">
          Platforms never tell you why your engagement dropped or if you're shadowbanned. Our AI does — and shows you how to fix it.
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

      {/* Platform-specific SEO section */}
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

      {/* How it works */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload Your Analytics', desc: 'Screenshot or export your analytics from Instagram, Facebook, YouTube, TikTok, X, or LinkedIn.' },
              { step: '2', title: 'AI Finds the Problem', desc: 'Our AI checks your data against 2026 algorithm rules — detects shadowbans, reach drops, and hidden penalties.' },
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

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Stop losing <span className="text-red-400">views and followers</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Instagram, Facebook, YouTube, and TikTok algorithms changed drastically in 2026.
          Find out if your account is affected — before you lose more reach.
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

      {/* FAQ Section — SEO */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Why is my Instagram reach dropping suddenly?',
              a: 'Instagram reach drops in 2026 are caused by unlabeled AI content (instant shadowban), recycled Reels from TikTok (zero distribution), engagement pod detection, or follow/unfollow spam. Upload your analytics to ReachRadar AI — our AI pinpoints the exact cause and gives you a step-by-step fix plan.',
            },
            {
              q: 'Why are my YouTube views suddenly dropping?',
              a: 'YouTube views drop when watch time falls below 40%, AI content is unlabeled, Shorts are recycled, or comments are disabled (50% reach penalty). YouTube\'s 2026 "Authenticity Score" also affects recommendations. ReachRadar AI scans your analytics and tells you exactly which penalties are active.',
            },
            {
              q: 'Why are my TikTok views stuck at 0?',
              a: 'TikTok views at 0 means your content failed the initial algorithm review. Common causes: AI slop detection, low Creative Originality Score, posting more than 5 times per day, or recycled content. Our AI checks for FYP suppression and shows you how to recover.',
            },
            {
              q: 'Why is my Facebook Page reach declining?',
              a: 'Facebook Page organic reach dropped significantly in 2026. The algorithm now prioritizes Reels and video over static posts, penalizes engagement bait and link-heavy content, and detects AI-generated posts. Upload your Facebook Page Insights to ReachRadar AI to find out which penalties are affecting your Page.',
            },
            {
              q: 'How do I check if I\'m shadowbanned on Instagram?',
              a: 'Upload your Instagram analytics screenshots to ReachRadar AI. Our AI analyzes your engagement patterns, reach metrics, and content against Instagram\'s 2026 algorithm rules. You get a 0-100 risk score — anything above 50% means you likely have a shadowban or suppression.',
            },
            {
              q: 'How do I beat the Instagram algorithm in 2026?',
              a: 'Create original content (not recycled from TikTok), label AI-generated content, post consistently, avoid engagement pods, and use Instagram\'s Original Content Bonus. ReachRadar AI audits your account and gives you a personalized strategy based on your data.',
            },
            {
              q: 'How to go viral on TikTok?',
              a: 'Going viral on TikTok in 2026 requires: watch-through rate above 50%, original content, strong hook in the first 2 seconds, trending sounds, and posting 1-3 times daily (not more). Use our Pre-Post Checker to scan your content for a virality score before publishing.',
            },
            {
              q: 'Why is my content not showing in Instagram Explore?',
              a: 'Content gets blocked from Explore due to low engagement rate, shadowban penalties, recycled content detection, or hashtag spam. ReachRadar AI identifies which specific penalty is blocking your Explore reach and gives you the exact fix.',
            },
            {
              q: 'Why is YouTube not recommending my videos?',
              a: 'YouTube stops recommending videos when your Authenticity Score drops, watch time is below 40%, CTR is low, or AI content is unlabeled. The 2026 algorithm also penalizes disabled comments and recycled Shorts. Run a free audit to find out.',
            },
            {
              q: 'How to grow on Instagram in 2026?',
              a: 'Instagram growth in 2026 depends on original Reels, high engagement rate, consistent posting schedule, and avoiding algorithm penalties. ReachRadar AI audits your account to find hidden growth blockers and gives you a strategy tailored to your niche and content genre.',
            },
            {
              q: 'How to increase YouTube subscribers?',
              a: 'Subscriber growth depends on watch time, CTR, and recommendation algorithm performance. If your videos aren\'t being recommended, you won\'t grow. ReachRadar AI checks if algorithm penalties are blocking your growth and tells you what to fix first.',
            },
            {
              q: 'Is ReachRadar AI free?',
              a: 'Yes! You can run a full algorithm audit for free. Upload your analytics from any platform, get your risk score, hidden penalties, revenue impact estimate, and a downloadable PDF fix plan — all at no cost.',
            },
            {
              q: 'What social media platforms does ReachRadar AI support?',
              a: 'We support Instagram, Facebook, YouTube, TikTok, X (Twitter), and LinkedIn. Each platform is audited against its specific 2026 algorithm rules. You can also use the Pre-Post Checker to scan content before publishing on any platform.',
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>ReachRadar AI &copy; 2026. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms</Link>
            <a href="mailto:hello@reachradarai.com" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
