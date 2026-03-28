import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const FREE_AUDIT_LIMIT = 5;
const FREE_PRECHECK_LIMIT = 5;

// Simple JWT-like token (base64 encoded JSON with expiry)
function createToken(payload) {
  const data = { ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }; // 7 days
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

function verifyToken(token) {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

function getUserFromReq(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  return verifyToken(auth.slice(7));
}

// Simple password hashing (no bcrypt dependency needed in serverless)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'reachradar-salt-2026'));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

async function getFreePrecheckUsage(userId) {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('audits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('risk_level', 'precheck');
  if (error) return 0;
  return count || 0;
}

// Check user plan and enforce limits
async function checkUserPlan(userId) {
  if (!supabase) return { plan: 'free', allowed: true };
  const { data: user } = await supabase
    .from('users')
    .select('plan, plan_expires, audits_remaining')
    .eq('id', userId)
    .single();
  if (!user) return { plan: 'free', allowed: false };

  // Check if pro plan has expired
  if (user.plan === 'pro' && user.plan_expires) {
    if (new Date(user.plan_expires) < new Date()) {
      // Plan expired — downgrade to free
      await supabase.from('users').update({ plan: 'free', plan_period: null, plan_expires: null }).eq('id', userId);
      return {
        plan: 'free',
        auditsRemaining: user.audits_remaining ?? FREE_AUDIT_LIMIT,
        prechecksRemaining: Math.max(FREE_PRECHECK_LIMIT - await getFreePrecheckUsage(userId), 0),
      };
    }
    return { plan: 'pro', allowed: true };
  }

  if (user.plan === 'pro') return { plan: 'pro', allowed: true };

  // Free plan — check audit limit
  return {
    plan: 'free',
    auditsRemaining: user.audits_remaining ?? FREE_AUDIT_LIMIT,
    prechecksRemaining: Math.max(FREE_PRECHECK_LIMIT - await getFreePrecheckUsage(userId), 0),
  };
}

// Decrement free user's audit count
async function useFreeTrial(userId) {
  if (!supabase) return;
  await supabase.rpc('decrement_audits', { user_id_input: userId }).catch(async () => {
    // Fallback if RPC doesn't exist
    const { data: user } = await supabase.from('users').select('audits_remaining').eq('id', userId).single();
    const nextRemaining = Math.max((user?.audits_remaining ?? FREE_AUDIT_LIMIT) - 1, 0);
    await supabase.from('users').update({ audits_remaining: nextRemaining }).eq('id', userId);
  });
}

async function recordFreePrecheckUsage(userId, platform) {
  if (!supabase) return;
  await supabase.from('audits').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    platform: `precheck:${platform || 'general'}`,
    risk_score: null,
    risk_level: 'precheck',
    full_report: JSON.stringify({ type: 'precheck_usage' }),
  }).catch(() => {});
}

const AUDIT_SYSTEM_PROMPT = `You are ReachRadar AI — the world's most advanced social media algorithm auditor for 2026.

You have deep knowledge of current platform algorithm rules (as of 2026):

YOUTUBE: Heavy penalties for unlabeled AI-generated content. Shorts penalizes recycled content. Watch time < 40% = reach suppression. New "Authenticity Score" in recommendations. Comments disabled = 50% reach penalty.

INSTAGRAM / META: Automated AI content detection — unlabeled AI gets shadowbanned. Reels recycled from TikTok = zero distribution. Engagement pod detection improved. Follow/unfollow > 50/day = soft shadowban. New "Original Content Bonus".

FACEBOOK: Page organic reach continuing to decline in 2026. Reels getting priority over static posts. Engagement bait triggers suppression. AI-generated content detection active. Groups algorithm favors meaningful interaction over link sharing. Video content gets 2-3x more reach. Pages with low engagement rate get deprioritized in News Feed. Click-bait headlines penalized.

TIKTOK: AI slop detection active. "Creative Originality Score" in FYP. Mass posting (>5/day) triggers review. Watch-through rate < 50% = content death.

X / TWITTER: Premium subscribers 3x reach but stricter spam detection. Engagement bait reduces distribution. Link-in-post penalty active.

LINKEDIN: AI-written posts detected via style analysis. Engagement pods penalized. Video/carousel get 2-3x organic boost.

UNIVERSAL RISKS: Sudden volume changes = spam flag. Cross-platform identical content = duplicate penalty. Bot followers > 15% = credibility reduction. Engagement dropping > 20% MoM = deprioritization.

Analyze the user's uploaded analytics data and provide a comprehensive audit.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks. Just raw JSON.

Return this exact structure:
{
  "risk_score": <number 0-100>,
  "risk_level": "<Low|Medium|High|Critical>",
  "predicted_30day_reach_drop": "<percentage and/or number>",
  "top_red_flags": [
    {
      "flag": "<issue>",
      "severity": "<low|medium|high|critical>",
      "platform": "<platform>",
      "explanation": "<why this matters in 2026>",
      "how_to_fix": {
        "steps": ["<step 1 with exact action>", "<step 2>", "<step 3>"],
        "tools_needed": ["<specific free/paid tools like TubeBuddy, vidIQ, Canva, CapCut, etc.>"],
        "time_to_fix": "<realistic timeline>",
        "expected_result": "<what improvement to expect>"
      }
    }
  ],
  "potential_monthly_loss": "<estimated $ impact>",
  "fix_plan": [
    {"step": <n>, "action": "<very specific action with exact instructions>", "timeline": "<when>", "impact": "<expected improvement with numbers>", "tools": "<specific tools to use>", "how_to": "<detailed step-by-step instructions explaining exactly HOW to do this action>"}
  ],
  "positive_signals": ["<things done right>"],
  "virality_potential": <0-100>,
  "authenticity_score": <0-100>,
  "platform_specific_tips": {"<platform>": ["<actionable tip with how-to>"]},
  "recovery_timeline": "<realistic timeline to recover reach if all steps followed>",
  "priority_action": "<the ONE thing they should do RIGHT NOW today>",
  "summary": "<2-3 sentence summary>"
}

Be specific, data-driven, brutally honest. Reference exact numbers from their data. For EVERY red flag and fix plan step, include detailed HOW-TO instructions — don't just say what to do, explain exactly HOW to do it with specific tools, settings, and techniques. Think of yourself as a personal algorithm coach giving hands-on guidance.`;

const PRE_POST_SYSTEM_PROMPT = `You are ReachRadar AI — a pre-publish content optimizer and virality predictor for 2026.

You can analyze:
- Text content (captions, descriptions, tweets, scripts)
- URLs to existing posts/videos (extract what you can see from the URL and context)
- Screenshots/images of content, thumbnails, or analytics

Your job: analyze the content, score it, and generate READY-MADE improved versions they can copy-paste immediately.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks:
{
  "safety_score": <0-100, higher = safer from algorithm penalties>,
  "virality_score": <0-100, higher = more likely to go viral>,
  "current_analysis": {
    "title_detected": "<title if found>",
    "description_detected": "<description if found>",
    "content_type": "<video/image/text/carousel/reel/short>",
    "issues_found": ["<specific issues with current content>"]
  },
  "risk_flags": ["<algorithm risks detected>"],
  "virality_boosters": ["<elements that help distribution>"],
  "suggestions": [
    {"type": "<safety|virality|engagement>", "suggestion": "<specific suggestion>", "impact": "<expected improvement>"}
  ],
  "ready_made_content": {
    "optimized_title": "<improved title — ready to copy-paste>",
    "title_alternatives": ["<alt 1>", "<alt 2>", "<alt 3>"],
    "optimized_description": "<full improved description/caption with keywords, CTAs, line breaks — ready to paste>",
    "hook_script": "<first 3-5 seconds script for video, or opening line for text post>",
    "cta_options": ["<call-to-action option 1>", "<option 2>", "<option 3>"],
    "thumbnail_concept": "<detailed description of ideal thumbnail — colors, text overlay, composition, facial expression>",
    "tags_keywords": ["<SEO keywords/tags>"],
    "hashtags": ["<optimized hashtags>"],
    "comment_pin": "<suggested pinned comment to boost engagement>"
  },
  "music_recommendations": [
    {"song": "<song name>", "artist": "<artist>", "why": "<why this fits — mood, trend, reach boost>", "type": "<trending|mood-match|viral-potential|genre-fit>"}
  ],
  "image_improvement": {
    "analysis": "<what's good and bad about the current image/thumbnail>",
    "suggestions": ["<specific improvement 1>", "<improvement 2>", "<improvement 3>"],
    "color_palette": "<recommended colors for this niche/platform>",
    "text_overlay": "<what text to add on the image and where>",
    "composition_tip": "<framing, rule of thirds, focal point advice>"
  },
  "genre_strategy": {
    "content_format": "<best format for this genre on this platform>",
    "trending_approach": "<what's working in this genre right now>",
    "audience_psychology": "<why this genre's audience engages>",
    "dos": ["<do this>"],
    "donts": ["<avoid this>"]
  },
  "best_posting_time": "<recommended posting time with timezone reasoning>",
  "content_improvement_notes": "<detailed paragraph explaining what was wrong and why the improved version is better>",
  "estimated_reach_boost": "<estimated improvement in reach with optimized version vs original>",
  "summary": "<1-2 sentence verdict>"
}

CRITICAL RULES:
1. NEVER generate generic clickbait like "This INSANE trick will blow your mind". Be authentic — 2026 algorithms penalize clickbait.
2. When you KNOW the topic/niche, make everything specific to it.
3. If you can see the actual title/description, IMPROVE it — don't replace with something unrelated.
4. Hashtags must be RELEVANT to actual content, not generic trending tags.
5. IMPORTANT: If you have LIMITED information (just a URL with no metadata, or minimal context), you MUST STILL generate useful output. Do this:
   - Look at ANY clues: URL structure, username, platform, image content, any text visible
   - Make reasonable inferences about the content type and generate MULTIPLE options across likely niches
   - Generate 3-5 strong title templates with [TOPIC] placeholders the user can fill in
   - Provide a solid caption framework, proven hook formulas, and platform-specific hashtag strategy
   - Give genuinely useful platform-specific advice (Instagram algorithm tips, best practices, etc.)
   - NEVER just say "I can't help" or "need more info" — ALWAYS provide actionable value
6. Even with zero content info, you can ALWAYS provide: platform-specific algorithm tips, proven caption frameworks, engagement strategies, hashtag research methodology, posting time analysis, and hook formulas.
7. The goal is: the user should ALWAYS walk away with something useful they can immediately apply.`;

function parseAIResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response');
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url.replace(/\?.*$/, '');

  try {
    // Health check
    if (url === '/api/health') {
      return res.json({ status: 'ok', service: 'ReachRadar AI' });
    }

    // Auth: Register
    if (url === '/api/auth/register' && req.method === 'POST') {
      if (!supabase) return res.status(500).json({ error: 'Database not configured' });
      const { email, password, name } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      // Check if user exists
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
      if (existing) return res.status(400).json({ error: 'Email already registered' });

      const id = crypto.randomUUID();
      const password_hash = await hashPassword(password);
      const { error } = await supabase.from('users').insert({
        id, email, password_hash, name: name || null, plan: 'free', audits_remaining: FREE_AUDIT_LIMIT
      });
      if (error) return res.status(500).json({ error: 'Registration failed' });

      const token = createToken({ id, email, plan: 'free' });
      return res.json({ token, user: { id, email, name: name || null, plan: 'free' } });
    }

    // Auth: Login
    if (url === '/api/auth/login' && req.method === 'POST') {
      if (!supabase) return res.status(500).json({ error: 'Database not configured' });
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

      const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      const token = createToken({ id: user.id, email: user.email, plan: user.plan });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
    }

    // Auth: Forgot password — generate reset token
    if (url === '/api/auth/forgot-password' && req.method === 'POST') {
      if (!supabase) return res.status(500).json({ error: 'Database not configured' });
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const { data: user } = await supabase.from('users').select('id, email').eq('email', email).single();
      // Always return success to not reveal if email exists
      if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been generated.' });

      // Create reset token (valid 1 hour)
      const resetData = { id: user.id, email: user.email, type: 'reset', exp: Date.now() + 60 * 60 * 1000 };
      const resetToken = Buffer.from(JSON.stringify(resetData)).toString('base64url');

      // Store reset token in database
      await supabase.from('users').update({ reset_token: resetToken }).eq('id', user.id);

      // Return reset link (in production, you'd email this)
      const resetLink = `https://reachradarai.com/reset-password?token=${resetToken}`;
      return res.json({ success: true, message: 'Reset link generated.', resetLink });
    }

    // Auth: Reset password with token
    if (url === '/api/auth/reset-password' && req.method === 'POST') {
      if (!supabase) return res.status(500).json({ error: 'Database not configured' });
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

      // Verify reset token
      let resetData;
      try {
        resetData = JSON.parse(Buffer.from(token, 'base64url').toString());
      } catch { return res.status(400).json({ error: 'Invalid reset token' }); }

      if (resetData.type !== 'reset' || resetData.exp < Date.now()) {
        return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
      }

      // Verify token matches what's stored
      const { data: user } = await supabase.from('users').select('id, reset_token').eq('id', resetData.id).single();
      if (!user || user.reset_token !== token) {
        return res.status(400).json({ error: 'Invalid or already used reset link.' });
      }

      // Update password and clear reset token
      const newHash = await hashPassword(newPassword);
      await supabase.from('users').update({ password_hash: newHash, reset_token: null }).eq('id', resetData.id);

      return res.json({ success: true, message: 'Password reset successful. You can now log in.' });
    }

    // Auth: Get current user
    if (url === '/api/auth/me' && req.method === 'GET') {
      const tokenUser = getUserFromReq(req);
      if (!tokenUser) return res.status(401).json({ error: 'Not authenticated' });
      if (!supabase) return res.json({ user: tokenUser });

      const { data: user } = await supabase.from('users').select('id, email, name, plan, audits_remaining').eq('id', tokenUser.id).single();
      if (!user) return res.status(401).json({ error: 'User not found' });
      return res.json({ user });
    }

    // Save audit to history (if logged in)
    if (url === '/api/audit/save' && req.method === 'POST') {
      const tokenUser = getUserFromReq(req);
      if (!tokenUser) return res.status(401).json({ error: 'Not authenticated' });
      if (!supabase) return res.status(500).json({ error: 'Database not configured' });

      const { platform, risk_score, risk_level, full_report } = req.body || {};
      const { error } = await supabase.from('audits').insert({
        id: crypto.randomUUID(),
        user_id: tokenUser.id,
        platform,
        risk_score,
        risk_level,
        full_report: JSON.stringify(full_report),
      });
      if (error) return res.status(500).json({ error: 'Failed to save audit' });
      return res.json({ success: true });
    }

    // Get audit history
    if (url === '/api/audit/history' && req.method === 'GET') {
      const tokenUser = getUserFromReq(req);
      if (!tokenUser) return res.status(401).json({ error: 'Not authenticated' });
      if (!supabase) return res.json({ audits: [] });

      const { data: audits } = await supabase
        .from('audits')
        .select('id, platform, risk_score, risk_level, created_at')
        .eq('user_id', tokenUser.id)
        .neq('risk_level', 'precheck')
        .order('created_at', { ascending: false })
        .limit(20);
      return res.json({ audits: audits || [] });
    }

    // Get single audit by ID
    if (url.startsWith('/api/audit/get/') && req.method === 'GET') {
      const tokenUser = getUserFromReq(req);
      if (!tokenUser) return res.status(401).json({ error: 'Not authenticated' });
      if (!supabase) return res.status(500).json({ error: 'Database not configured' });

      const auditId = url.split('/api/audit/get/')[1];
      const { data: audit } = await supabase
        .from('audits')
        .select('*')
        .eq('id', auditId)
        .eq('user_id', tokenUser.id)
        .single();
      if (!audit) return res.status(404).json({ error: 'Audit not found' });
      return res.json({ audit });
    }

    // Audit analyze
    if (url === '/api/audit/analyze' && req.method === 'POST') {
      const user = getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Login required to run an audit' });

      // Enforce plan limits
      const planStatus = await checkUserPlan(user.id);
      if (planStatus.plan === 'free' && (planStatus.auditsRemaining ?? FREE_AUDIT_LIMIT) <= 0) {
        return res.status(403).json({ error: 'Your 5 free audits are used. Upgrade to Pro for unlimited audits.', upgrade: true });
      }

      const { platform, manualData, images } = req.body || {};

      if (!platform) {
        return res.status(400).json({ error: 'Platform is required' });
      }

      const hasText = manualData && manualData.trim();
      const hasImages = images && images.length > 0;

      if (!hasText && !hasImages) {
        return res.status(400).json({ error: 'Please upload screenshots, a file, or paste your analytics data' });
      }

      // Build message content with text and/or images
      const userContent = [];

      // Add images first (screenshots of analytics)
      if (hasImages) {
        for (const img of images) {
          // img = { data: base64string, mediaType: "image/png" }
          userContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mediaType,
              data: img.data,
            },
          });
        }
      }

      // Add text prompt
      let textPrompt = `Platform: ${platform}\n\n`;
      if (hasImages) {
        textPrompt += 'I have uploaded screenshots of my analytics dashboard. Please extract ALL visible data (numbers, metrics, graphs, dates) and perform a complete algorithm audit based on what you see.\n\n';
      }
      if (hasText) {
        textPrompt += `Additional Analytics Data:\n${manualData}`;
      }

      userContent.push({ type: 'text', text: textPrompt });

      const client = new Anthropic();
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: AUDIT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      });

      const result = parseAIResponse(message.content[0].text);
      result.id = crypto.randomUUID();

      // Decrement free trial after successful audit
      if (planStatus.plan === 'free') await useFreeTrial(user.id);

      return res.json(result);
    }

    // Pre-post check (supports text, URLs, and images)
    if (url === '/api/audit/pre-check' && req.method === 'POST') {
      const user = getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Login required to use the content checker' });

      const preCheckPlan = await checkUserPlan(user.id);
      if (preCheckPlan.plan === 'free' && (preCheckPlan.prechecksRemaining ?? FREE_PRECHECK_LIMIT) <= 0) {
        return res.status(403).json({ error: 'Your 5 free pre-post checks are used. Upgrade to unlock unlimited content checks.', upgrade: true });
      }

      const { content, platform, contentUrl, images, engagementGoal, genre } = req.body || {};

      if (!platform) {
        return res.status(400).json({ error: 'Platform is required' });
      }

      const hasText = content && content.trim();
      const hasUrl = contentUrl && contentUrl.trim();
      const hasImages = images && images.length > 0;

      if (!hasText && !hasUrl && !hasImages) {
        return res.status(400).json({ error: 'Please provide content text, a URL, or upload images' });
      }

      // Normalize URL (add https:// if missing)
      let normalizedUrl = contentUrl?.trim() || '';
      if (normalizedUrl && !normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // If URL provided, fetch real content metadata
      let urlMetadata = '';
      if (hasUrl) {
        const results = {};

        // Clean URL: remove tracking params like ?si=... ?igsh=...
        let cleanUrl = normalizedUrl.replace(/[?&](si|igsh|utm_\w+)=[^&]*/gi, '');
        cleanUrl = cleanUrl.replace(/\?$/, ''); // remove trailing ?

        // Strategy 1: Try platform-specific oEmbed first, then generic
        const oembedUrls = [];

        if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
          // YouTube's own oEmbed is most reliable (works for Shorts too)
          oembedUrls.push(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
        }
        if (cleanUrl.includes('instagram.com')) {
          const fbAppId = process.env.FACEBOOK_APP_ID;
          const fbAppSecret = process.env.FACEBOOK_APP_SECRET;
          if (fbAppId && fbAppSecret) {
            oembedUrls.push(`https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(cleanUrl)}&access_token=${fbAppId}|${fbAppSecret}`);
          }
          // Fallback to unauthenticated (may not work)
          oembedUrls.push(`https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
        }
        if (cleanUrl.includes('tiktok.com')) {
          oembedUrls.push(`https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
        }
        // Generic fallback
        oembedUrls.push(`https://noembed.com/embed?url=${encodeURIComponent(cleanUrl)}`);

        for (const oembedUrl of oembedUrls) {
          try {
            const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
            if (oembedRes.ok) {
              const oembed = await oembedRes.json();
              if (oembed.error) continue; // noembed returns {error: ...}
              if (oembed.title && !results.title) results.title = oembed.title;
              if (oembed.author_name && !results.author) results.author = oembed.author_name;
              if (oembed.author_url && !results.authorUrl) results.authorUrl = oembed.author_url;
              if (oembed.thumbnail_url && !results.thumbnail) results.thumbnail = oembed.thumbnail_url;
              if (oembed.provider_name && !results.provider) results.provider = oembed.provider_name;
              // Instagram/TikTok oEmbed includes caption in title
              if (oembed.title && (oembed.provider_name === 'Instagram' || oembed.provider_name === 'TikTok')) {
                results.caption = oembed.title;
              }
              if (results.title) break;
            }
          } catch {}
        }

        // Strategy 2: Fetch actual page with browser-like User-Agent
        try {
          const pageRes = await fetch(cleanUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(8000),
          });
          const html = await pageRes.text();

          const getTag = (name) => {
            const m = html.match(new RegExp(`<meta[^>]*(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
              || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`, 'i'));
            return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
          };

          if (!results.title) results.title = getTag('og:title') || getTag('twitter:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
          results.description = getTag('og:description') || getTag('twitter:description') || getTag('description') || '';
          if (!results.thumbnail) results.thumbnail = getTag('og:image') || '';
          results.keywords = getTag('keywords') || '';
          results.type = getTag('og:type') || '';
          results.siteName = getTag('og:site_name') || '';

          // YouTube-specific: try to extract more data from page
          if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
            // Extract channel name
            const channelMatch = html.match(/"channelName":"([^"]+)"/i) || html.match(/"ownerChannelName":"([^"]+)"/i);
            if (channelMatch) results.channel = channelMatch[1];

            // Extract view count
            const viewMatch = html.match(/"viewCount":"(\d+)"/i);
            if (viewMatch) results.views = viewMatch[1];

            // Extract publish date
            const dateMatch = html.match(/"publishDate":"([^"]+)"/i);
            if (dateMatch) results.publishDate = dateMatch[1];

            // Extract tags
            const tagsMatch = html.match(/"keywords":\[([^\]]+)\]/i);
            if (tagsMatch) {
              try { results.tags = JSON.parse('[' + tagsMatch[1] + ']'); } catch {}
            }

            // Extract category
            const catMatch = html.match(/"category":"([^"]+)"/i);
            if (catMatch) results.category = catMatch[1];

            // Extract like count
            const likeMatch = html.match(/"likeCount":"?(\d+)"?/i);
            if (likeMatch) results.likes = likeMatch[1];

            // Extract duration
            const durMatch = html.match(/"lengthSeconds":"(\d+)"/i);
            if (durMatch) results.duration = durMatch[1] + ' seconds';
          }

          // Instagram-specific
          if (normalizedUrl.includes('instagram.com')) {
            const igDesc = html.match(/"caption":\{"text":"([^"]+)"/i);
            if (igDesc) results.caption = igDesc[1];
            const igLikes = html.match(/"edge_media_preview_like":\{"count":(\d+)/i);
            if (igLikes) results.likes = igLikes[1];
          }

        } catch (fetchErr) {
          // Page fetch failed, continue with whatever we have
        }

        // Build metadata string
        const parts = [`\n\nURL ANALYZED: ${cleanUrl}`];
        if (results.title) parts.push(`Title: ${results.title}`);
        if (results.author || results.channel) parts.push(`Creator/Channel: ${results.author || results.channel}`);
        if (results.description) parts.push(`Description: ${results.description}`);
        if (results.views) parts.push(`Views: ${Number(results.views).toLocaleString()}`);
        if (results.likes) parts.push(`Likes: ${Number(results.likes).toLocaleString()}`);
        if (results.publishDate) parts.push(`Published: ${results.publishDate}`);
        if (results.duration) parts.push(`Duration: ${results.duration}`);
        if (results.category) parts.push(`Category: ${results.category}`);
        if (results.tags?.length) parts.push(`Tags: ${results.tags.join(', ')}`);
        if (results.caption) parts.push(`Caption: ${results.caption}`);
        if (results.keywords) parts.push(`Keywords: ${results.keywords}`);
        if (results.thumbnail) parts.push(`Thumbnail URL: ${results.thumbnail}`);
        if (results.type) parts.push(`Content Type: ${results.type}`);
        if (results.provider || results.siteName) parts.push(`Platform: ${results.provider || results.siteName}`);

        urlMetadata = parts.join('\n');

        if (!results.title && !results.description) {
          urlMetadata += '\n\nNOTE: Could not extract detailed metadata. Analyze based on URL and any available context.';
        }
      }

      // Build message content
      const userContent = [];

      // Add images
      if (hasImages) {
        for (const img of images) {
          userContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mediaType,
              data: img.data,
            },
          });
        }
      }

      // Build text prompt
      let textPrompt = `Platform: ${platform}\n\n`;

      if (hasUrl) {
        textPrompt += `The user shared a link to their existing content. Here is what I extracted from the page:\n${urlMetadata}\n\nIMPORTANT: Use the ACTUAL title, description, topic, and niche from this data to generate improvements. Do NOT make up random content. Improve what they already have — keep it in the same topic/niche but optimize for algorithm performance.\n\n`;
      }

      if (hasImages) {
        textPrompt += `The user uploaded screenshots/images. Look at EVERYTHING visible — text, metrics, visuals, branding, topic. Base your analysis and improvements on the ACTUAL content you see, not generic templates.\n\nFor uploaded IMAGES OF CONTENT (not analytics): Also provide IMAGE IMPROVEMENT SUGGESTIONS — analyze composition, colors, text overlay, branding, and suggest specific improvements to make the image more engaging and algorithm-friendly.\n\n`;
      }

      if (hasText) {
        textPrompt += `User's description of their content:\n${content}\n\nIMPORTANT: This is the user telling you what their content is about. Use this information as the PRIMARY source for understanding the topic, niche, and context. Generate all improvements based on THIS topic.\n\n`;
      }

      if (engagementGoal) {
        const goalMap = {
          viral: 'MAKE THIS GO VIRAL — maximize shares, saves, and reach. Use pattern-interrupt hooks, emotional triggers, and shareability tactics.',
          growth: 'GROW FOLLOWERS — focus on discoverability, follow-worthy value, and "save for later" content. Use SEO-optimized hashtags and descriptions.',
          sales: 'DRIVE SALES/CONVERSIONS — include compelling CTAs, social proof language, urgency triggers, and value propositions.',
          community: 'BUILD COMMUNITY — encourage comments, questions, and discussion. Use conversational language, polls, and "tag a friend" elements.',
          brand: 'BRAND AWARENESS — professional, memorable, and shareable. Focus on unique positioning, consistent voice, and thought leadership.',
          educate: 'EDUCATE & INFORM — clear structure, actionable takeaways, "save this" hooks. Use numbered lists, step-by-step, and expert positioning.',
        };
        textPrompt += `\nENGAGEMENT GOAL: ${goalMap[engagementGoal] || engagementGoal}\nTailor ALL suggestions (hooks, CTAs, hashtags, descriptions) to achieve this specific goal.\n\n`;
      }

      if (genre) {
        const genreMap = {
          comedy: 'COMEDY — Use humor timing, punchline structures, trending audio/meme references, relatable comedy hooks. Avoid cringe. Think observational humor.',
          health: 'HEALTH & FITNESS — Use credibility signals, transformation hooks, myth-busting, "do this not that" format. Be educational yet motivational.',
          lifestyle: 'LIFESTYLE — Aesthetic, aspirational, relatable. Use storytelling, day-in-the-life, routine-based content. Focus on visual appeal.',
          education: 'EDUCATION — Use "Things I wish I knew", "Stop doing X", numbered tips. Clear structure, quick value delivery. Authority positioning.',
          tech: 'TECH — Use demo/tutorial format, "hidden feature" hooks, comparison content. Be concise, show don\'t tell. Geek credibility.',
          food: 'FOOD — Use close-up shots, recipe hooks, ASMR elements, "you need to try this" format. Visual-first, step-by-step.',
          music: 'MUSIC — Use trending sounds, behind-the-scenes, cover vs original, reaction format. Audio quality matters most.',
          fashion: 'FASHION & BEAUTY — Use transformation hooks, "get ready with me", haul format, seasonal trends. Visual aesthetic is key.',
          travel: 'TRAVEL — Use "hidden gems", cinematic transitions, budget tips, "places you must visit". Wanderlust triggers.',
          business: 'BUSINESS — Use case studies, revenue reveals, "how I did X", contrarian takes. Data-driven, actionable advice.',
          family: 'FAMILY & PARENTING — Use heartwarming moments, relatable struggles, milestone content, "mom hack" format. Authentic and emotional.',
          other: 'GENERAL — Adapt strategy to the specific content topic described.',
        };
        textPrompt += `\nCONTENT GENRE: ${genreMap[genre] || genre}\nAdapt your strategy, hooks, and content style specifically for this genre. Use genre-specific trending formats and approaches.\n\n`;
      }

      textPrompt += `TASK: Analyze this SPECIFIC content and generate IMPROVED versions that stay true to the actual topic and niche. Every title, description, hook, and hashtag must be relevant to what this content is actually about. Do NOT generate generic clickbait or filler content. If you have the user's description of their content, use that as the primary context even if URL metadata is limited.`;

      userContent.push({ type: 'text', text: textPrompt });

      const client = new Anthropic();
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: PRE_POST_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      });

      const result = parseAIResponse(message.content[0].text);
      if (preCheckPlan.plan === 'free') await recordFreePrecheckUsage(user.id, platform);
      return res.json(result);
    }

    // Fix It For Me — generate actual deliverables
    if (url === '/api/audit/fix-it' && req.method === 'POST') {
      const user = getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Login required' });
      const { platform, redFlag, auditSummary, fixType } = req.body || {};

      if (!platform || !fixType) {
        return res.status(400).json({ error: 'Platform and fix type are required' });
      }

      const FIX_IT_PROMPT = `You are ReachRadar AI — an expert content strategist and algorithm recovery specialist for ${platform} in 2026.

The user ran an algorithm audit and needs you to ACTUALLY FIX their problems — not just advise, but generate ready-to-use deliverables they can copy-paste and implement immediately.

Audit context: ${auditSummary || 'No summary provided'}
Specific issue to fix: ${redFlag || 'General recovery'}
Fix type requested: ${fixType}

Based on the fix type, generate the ACTUAL deliverables. Return ONLY valid JSON, no markdown:

${fixType === 'content_calendar' ? `{
  "type": "content_calendar",
  "title": "Your 30-Day Recovery Content Calendar",
  "weeks": [
    {
      "week": 1,
      "theme": "<weekly theme>",
      "posts": [
        {
          "day": "<day name>",
          "content_type": "<Reel/Short/Post/Story/Video/Carousel>",
          "topic": "<specific topic idea>",
          "title": "<ready-to-use title/caption first line>",
          "hook": "<first 3 seconds script or opening line>",
          "description": "<full ready-to-use description/caption>",
          "hashtags": ["<relevant hashtags>"],
          "best_time": "<posting time>",
          "estimated_reach": "<expected reach>",
          "notes": "<production tips>"
        }
      ]
    }
  ],
  "strategy_notes": "<overall strategy explanation>"
}` : ''}${fixType === 'titles_descriptions' ? `{
  "type": "titles_descriptions",
  "title": "10 Optimized Titles & Descriptions",
  "items": [
    {
      "number": 1,
      "niche_topic": "<topic based on their content>",
      "title_options": ["<option A — curiosity gap>", "<option B — how-to>", "<option C — listicle>"],
      "description": "<full SEO-optimized description with keywords, timestamps if video, CTA>",
      "tags_keywords": ["<keyword1>", "<keyword2>"],
      "thumbnail_concept": "<visual description of what thumbnail should look like — colors, text overlay, facial expression>",
      "hook_script": "<first 5-10 seconds script to maximize retention>"
    }
  ],
  "keyword_strategy": "<overall keyword/SEO approach>",
  "title_formulas": ["<formula 1: pattern they can reuse>", "<formula 2>", "<formula 3>"]
}` : ''}${fixType === 'bio_profile' ? `{
  "type": "bio_profile",
  "title": "Optimized Profile & Bio",
  "optimized_bio": "<ready-to-paste bio text, platform-optimized>",
  "display_name_suggestion": "<optimized display name>",
  "bio_variations": ["<variation 1>", "<variation 2>", "<variation 3>"],
  "profile_keywords": ["<keywords to include>"],
  "link_in_bio_strategy": "<what to link and why>",
  "highlight_covers": ["<highlight/category 1>", "<highlight/category 2>"],
  "pinned_content_strategy": "<what to pin and why>",
  "profile_checklist": ["<action item 1>", "<action item 2>"]
}` : ''}${fixType === 'hashtag_strategy' ? `{
  "type": "hashtag_strategy",
  "title": "Custom Hashtag Strategy",
  "hashtag_sets": [
    {
      "content_type": "<type of content this set is for>",
      "primary_hashtags": ["<high-volume relevant hashtags>"],
      "secondary_hashtags": ["<medium-volume niche hashtags>"],
      "micro_hashtags": ["<low-volume high-engagement hashtags>"],
      "banned_hashtags": ["<hashtags to AVOID — shadowban triggers>"]
    }
  ],
  "hashtag_rules": ["<rule 1 for this platform in 2026>"],
  "rotation_strategy": "<how to rotate hashtags to avoid spam detection>"
}` : ''}${fixType === 'engagement_recovery' ? `{
  "type": "engagement_recovery",
  "title": "Engagement Recovery Playbook",
  "immediate_actions": [
    {"action": "<specific action>", "script": "<exact words/message to use>", "when": "<timing>"}
  ],
  "comment_templates": [
    {"scenario": "<when to use>", "template": "<ready-to-paste comment/reply>"}
  ],
  "community_building": [
    {"tactic": "<tactic>", "how_to": "<step-by-step>", "frequency": "<how often>"}
  ],
  "collaboration_outreach": {
    "dm_template": "<ready-to-send DM for collabs>",
    "target_criteria": "<what accounts to reach out to>",
    "pitch_template": "<collab pitch>"
  },
  "posting_schedule": {
    "optimal_times": ["<time 1>", "<time 2>"],
    "frequency": "<posts per week>",
    "content_mix": {"<type>": "<percentage>"}
  }
}` : ''}${fixType === 'viral_hooks' ? `{
  "type": "viral_hooks",
  "title": "50 Viral Hooks & Scripts",
  "hooks": [
    {
      "number": 1,
      "hook_text": "<first line / first 3 seconds>",
      "why_it_works": "<psychology behind it>",
      "content_type": "<best for: Reel/Short/Tweet/Post>",
      "full_script_outline": "<brief script structure: hook → problem → solution → CTA>",
      "example_topic": "<specific topic to pair with this hook>"
    }
  ],
  "hook_formulas": ["<reusable formula 1>", "<formula 2>"],
  "cta_templates": ["<CTA 1>", "<CTA 2>", "<CTA 3>"],
  "storytelling_frameworks": [
    {"name": "<framework name>", "structure": "<step by step>", "example": "<brief example>"}
  ]
}` : ''}

Generate content specifically for ${platform}. Make everything READY TO USE — the user should be able to copy-paste and publish. Be specific to their niche based on the audit data. Include trending formats and styles for ${platform} in 2026.`;

      const client = new Anthropic();
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: FIX_IT_PROMPT,
        messages: [{ role: 'user', content: `Generate the ${fixType} deliverables for my ${platform} account. Here's my audit context: ${auditSummary}. Specific issue: ${redFlag || 'general recovery needed'}` }],
      });

      const result = parseAIResponse(message.content[0].text);
      return res.json(result);
    }

    // Image Improvement — generate improved versions using OpenAI
    if (url === '/api/audit/improve-image' && req.method === 'POST') {
      const user = getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Login required' });

      // Image improver is Pro only
      const imgPlan = await checkUserPlan(user.id);
      if (imgPlan.plan !== 'pro') {
        return res.status(403).json({ error: 'AI Image Improver is a Pro feature. Upgrade to unlock.', upgrade: true });
      }

      const { image, platform, description, genre } = req.body || {};
      if (!image || !image.data) return res.status(400).json({ error: 'Image is required' });

      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) return res.status(500).json({ error: 'Image generation not configured' });

      // First, use Claude to analyze the image and generate improvement prompts
      const client = new Anthropic();
      const analysisMsg = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
            { type: 'text', text: `You are a social media visual content expert. Analyze this image for ${platform || 'social media'} posting.${description ? ` Context: ${description}` : ''}${genre ? ` Genre: ${genre}` : ''}

Return ONLY valid JSON with exactly 4 improvement prompts for regenerating this image:
{
  "analysis": "<what the image shows, current strengths and weaknesses>",
  "prompts": [
    {"label": "Enhanced Original", "prompt": "<detailed prompt to recreate this image but with better lighting, composition, and colors. Keep same subject/scene>"},
    {"label": "Vibrant & Eye-Catching", "prompt": "<prompt for a more vibrant, scroll-stopping version with bolder colors and contrast>"},
    {"label": "Professional & Clean", "prompt": "<prompt for a polished, professional-looking version with clean composition>"},
    {"label": "Trending Style", "prompt": "<prompt matching current ${platform || 'social media'} trending aesthetic — ${genre ? genre + ' genre' : 'popular style'}>"}
  ]
}
Each prompt should be detailed (50+ words) and describe the EXACT scene, subject, style, lighting, colors, and mood. The prompts should recreate the same scene/subject but improved.` }
          ]
        }]
      });

      const analysis = parseAIResponse(analysisMsg.content[0].text);
      if (!analysis.prompts || analysis.prompts.length === 0) {
        return res.status(500).json({ error: 'Could not analyze image' });
      }

      // Generate improved images with OpenAI — in PARALLEL, only 2 images for speed
      const prompts = analysis.prompts.slice(0, 2);
      const imagePromises = prompts.map(async (p) => {
        try {
          const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: `${p.prompt}. Style: high-quality social media content photo, professional, engaging, optimized for ${platform || 'social media'}.`,
              n: 1,
              size: '1024x1024',
              quality: 'standard',
              response_format: 'url',
            }),
          });
          const openaiData = await openaiRes.json();
          if (openaiData.data?.[0]?.url) {
            return { label: p.label, imageUrl: openaiData.data[0].url, prompt: p.prompt };
          }
        } catch {}
        return null;
      });

      const results = (await Promise.all(imagePromises)).filter(Boolean);

      return res.json({
        analysis: analysis.analysis,
        images: results,
      });
    }

    // Plans
    if (url === '/api/payments/plans') {
      return res.json({
        plans: [
          { id: 'monthly', name: 'Pro Monthly', price: 4.99, mode: 'subscription', interval: 'month' },
          { id: 'yearly', name: 'Pro Yearly', price: 29.99, mode: 'subscription', interval: 'year' },
        ],
      });
    }

    // Create Razorpay order
    if (url === '/api/payments/create-order' && req.method === 'POST') {
      const user = getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Login required' });

      const { planId } = req.body || {};
      const plans = {
        monthly: { amount: 499, currency: 'USD', name: 'Pro Monthly', period: 'monthly' },
        yearly: { amount: 2999, currency: 'USD', name: 'Pro Yearly', period: 'yearly' },
      };
      const plan = plans[planId];
      if (!plan) return res.status(400).json({ error: 'Invalid plan' });

      const rzpKey = process.env.RAZORPAY_KEY_ID;
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
      if (!rzpKey || !rzpSecret) return res.status(500).json({ error: 'Payment not configured' });

      // Create Razorpay order
      const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${rzpKey}:${rzpSecret}`).toString('base64'),
        },
        body: JSON.stringify({
          amount: plan.amount,
          currency: plan.currency,
          receipt: `rcpt_${Date.now()}`,
          notes: { userId: user.id, email: user.email, plan: planId },
        }),
      });
      const order = await orderRes.json();
      if (order.error) return res.status(500).json({ error: order.error.description || 'Order creation failed' });

      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: rzpKey,
        planName: plan.name,
      });
    }

    // Verify Razorpay payment
    if (url === '/api/payments/verify' && req.method === 'POST') {
      const user = getUserFromReq(req);
      if (!user) return res.status(401).json({ error: 'Login required' });

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body || {};
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment details' });
      }

      // Verify signature
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(rzpSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`));
      const expectedSignature = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: 'Payment verification failed' });
      }

      // Update user plan in database
      if (supabase) {
        const planExpiry = new Date();
        if (planId === 'monthly') planExpiry.setMonth(planExpiry.getMonth() + 1);
        if (planId === 'yearly') planExpiry.setFullYear(planExpiry.getFullYear() + 1);

        await supabase.from('users').update({
          plan: 'pro',
          plan_period: planId,
          plan_expires: planExpiry.toISOString(),
          razorpay_payment_id,
        }).eq('id', user.id);
      }

      return res.json({ success: true, plan: 'pro' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
