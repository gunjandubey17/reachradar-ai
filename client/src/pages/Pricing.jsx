import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Crown } from 'lucide-react';
import { apiPost, getUser } from '../utils/api';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    desc: 'Try it out',
    features: [
      '1 free audit',
      'Risk score + red flags',
      'Basic fix suggestions',
      'Single platform',
    ],
    cta: 'Get Started',
    href: '/audit',
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 9,
    period: '/month',
    desc: 'For active creators',
    features: [
      'Unlimited audits',
      'All 5 platforms',
      'PDF report downloads',
      'Pre-post safety checker',
      'Virality predictor',
      'Trend alerts',
    ],
    cta: 'Start Pro',
    highlight: true,
    icon: Zap,
  },
  {
    id: 'lifetime_early',
    name: 'Lifetime',
    price: 49,
    period: ' one-time',
    desc: 'First 500 users only',
    originalPrice: 79,
    features: [
      'Everything in Pro',
      'Lifetime access forever',
      'Priority support',
      'Early access to new features',
      'No recurring charges',
      'Lock in before price doubles',
    ],
    cta: 'Get Lifetime Access',
    highlight: false,
    icon: Crown,
    badge: 'BEST VALUE',
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState('');
  const user = getUser();

  const handleCheckout = async (planId) => {
    if (!user) {
      window.location.href = '/register';
      return;
    }

    setLoading(planId);
    try {
      const { url } = await apiPost('/payments/create-checkout', { planId });
      if (url) window.location.href = url;
    } catch (err) {
      alert(err.message || 'Payment failed. Is Stripe configured?');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">
          Simple, <span className="gradient-text">transparent</span> pricing
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Start free. Upgrade when you need unlimited audits and the full toolkit.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 relative ${
              plan.highlight
                ? 'bg-gradient-to-b from-indigo-500/20 to-purple-500/10 border-2 border-indigo-400/40 glow'
                : 'glass'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold">
                {plan.badge}
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                {plan.icon && <plan.icon size={20} className="text-indigo-400" />}
                {plan.name}
              </h3>
              <p className="text-sm text-gray-400">{plan.desc}</p>
            </div>

            <div className="mb-6">
              {plan.originalPrice && (
                <span className="text-lg text-gray-500 line-through mr-2">${plan.originalPrice}</span>
              )}
              <span className="text-4xl font-black">
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
              </span>
              {plan.period && <span className="text-gray-400">{plan.period}</span>}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <Link
                to={plan.href}
                className="block w-full py-3 text-center rounded-xl bg-white/10 hover:bg-white/15 font-medium transition"
              >
                {plan.cta}
              </Link>
            ) : (
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl font-medium transition ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                {loading === plan.id ? 'Redirecting...' : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 mt-8">
        Payments processed securely via Stripe. Cancel anytime for monthly plans.
      </p>
    </div>
  );
}
