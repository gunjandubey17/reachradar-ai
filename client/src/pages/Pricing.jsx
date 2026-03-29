import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { apiPost, getUser, setUser } from '../utils/api';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    desc: 'For trying the core tools',
    features: [
      'Your first 5 audits are free',
      'Your first 5 pre-post checks are free',
      '1 daily post idea',
      'Risk score + red flags',
      'Basic fix suggestions',
    ],
    cta: 'Get Started',
    href: '/daily-ideas',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: 1.99,
    period: '/month',
    desc: 'For creators posting every day',
    features: [
      'Unlimited audits',
      'Unlimited pre-post checks',
      '3 daily post ideas every day',
      'Reach score on daily ideas',
      'Saved history + streak tracking',
      'AI Image Improver',
    ],
    cta: 'Start Pro',
    highlight: true,
    icon: Zap,
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 9.99,
    period: '/year',
    desc: 'Lowest price for the full toolkit',
    originalPrice: 23.88,
    features: [
      'Everything in Pro Monthly',
      '3 daily post ideas every day',
      'Saved history + streak tracking',
      'Priority support',
      'Early access to new features',
      'Best annual value',
    ],
    cta: 'Get Yearly Pro',
    icon: Crown,
    badge: 'BEST VALUE',
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Pricing() {
  const [loading, setLoading] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const user = getUser();
  const navigate = useNavigate();

  const handleCheckout = async (planId) => {
    if (!user) {
      navigate('/register', { state: { from: '/pricing' } });
      return;
    }

    setLoading(planId);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load payment gateway');

      const order = await apiPost('/payments/create-order', { planId });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'ReachRadar AI',
        description: order.planName,
        order_id: order.orderId,
        prefill: { email: user.email },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          try {
            const result = await apiPost('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            });
            if (result.success) {
              const updatedUser = { ...user, plan: 'pro' };
              setUser(updatedUser);
              alert('Payment successful! You are now a Pro member.');
              navigate('/dashboard');
            }
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => setLoading(''),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        alert('Payment failed: ' + (response.error?.description || 'Please try again'));
        setLoading('');
      });
      rzp.open();
    } catch (err) {
      alert(err.message || 'Payment failed. Please try again.');
      setLoading('');
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
          <Sparkles size={14} /> One subscription. Full toolkit.
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold mb-4">Simple, <span className="gradient-text">transparent</span> pricing</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Daily ideas are included in the current Pro subscription. No extra add-on, no separate payment.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`rounded-2xl p-6 relative cursor-pointer ${selectedPlan === plan.id ? 'bg-gradient-to-b from-indigo-500/20 to-purple-500/10 border-2 border-indigo-400/40 glow scale-[1.01]' : 'glass border border-white/5 hover:border-white/15'}`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-xs font-bold">{plan.badge}</div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                {plan.icon && <plan.icon size={20} className="text-indigo-400" />}
                {plan.name}
              </h3>
              <p className="text-sm text-gray-400">{plan.desc}</p>
            </div>

            <div className="mb-6">
              {plan.originalPrice && <span className="text-lg text-gray-500 line-through mr-2">${plan.originalPrice}</span>}
              <span className="text-4xl font-black">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
              {plan.period && <span className="text-gray-400">{plan.period}</span>}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {plan.id === 'free' ? (
              <Link to={plan.href} className={`block w-full py-3 text-center rounded-xl font-medium transition ${selectedPlan === plan.id ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/10 hover:bg-white/15'}`}>
                {plan.cta}
              </Link>
            ) : (
              <button onClick={() => handleCheckout(plan.id)} disabled={loading === plan.id} className={`w-full py-3 rounded-xl font-medium transition ${selectedPlan === plan.id ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/10 hover:bg-white/15'}`}>
                {loading === plan.id ? 'Processing...' : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 mt-8">Payments processed securely via Razorpay. Daily ideas are included in Pro, not sold separately.</p>
    </div>
  );
}
