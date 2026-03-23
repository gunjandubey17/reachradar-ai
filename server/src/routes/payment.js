import { Router } from 'express';
import Stripe from 'stripe';
import { getDB } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const PLANS = {
  monthly: {
    name: 'Pro Monthly',
    price: 900, // $9.00
    mode: 'subscription',
    audits: -1, // unlimited
  },
  lifetime_early: {
    name: 'Lifetime (Early Bird)',
    price: 4900, // $49.00
    mode: 'payment',
    audits: -1,
  },
  lifetime: {
    name: 'Lifetime',
    price: 7900, // $79.00
    mode: 'payment',
    audits: -1,
  },
};

// Create checkout session
router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: 'Payment system not configured' });
    }

    const { planId } = req.body;
    const plan = PLANS[planId];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ReachRadar AI — ${plan.name}`,
              description:
                plan.mode === 'subscription'
                  ? 'Unlimited AI audits, pre-post checker, PDF reports'
                  : 'Lifetime access to all ReachRadar AI features',
            },
            unit_amount: plan.price,
            ...(plan.mode === 'subscription' && { recurring: { interval: 'month' } }),
          },
          quantity: 1,
        },
      ],
      mode: plan.mode === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
      client_reference_id: req.user.id,
      metadata: { planId, userId: req.user.id },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook
router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: 'Payment system not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id || session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (userId) {
      const db = getDB();
      const plan = planId?.includes('lifetime') ? 'lifetime' : 'pro';

      db.prepare('UPDATE users SET plan = ?, audits_remaining = -1, stripe_customer_id = ? WHERE id = ?').run(
        plan,
        session.customer,
        userId
      );

      console.log(`User ${userId} upgraded to ${plan}`);
    }
  }

  res.json({ received: true });
});

// Get available plans
router.get('/plans', (req, res) => {
  const plans = Object.entries(PLANS).map(([id, plan]) => ({
    id,
    name: plan.name,
    price: plan.price / 100,
    mode: plan.mode,
  }));

  res.json({ plans });
});

export default router;
