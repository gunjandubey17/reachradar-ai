import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDB } from '../models/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { runAudit, runPrePostCheck } from '../services/auditEngine.js';
import { generateAuditPDF } from '../services/pdfGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.txt', '.json', '.pdf'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV, TXT, JSON, and PDF files are supported'));
    }
  },
});

const router = Router();

// Run a new audit
router.post('/analyze', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    const { platform, manualData } = req.body;

    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    let analyticsData = manualData || '';

    if (req.file) {
      analyticsData = req.file.buffer.toString('utf-8');
    }

    if (!analyticsData.trim()) {
      return res.status(400).json({ error: 'No analytics data provided. Upload a file or paste your data.' });
    }

    // Run AI audit
    const auditResult = await runAudit(analyticsData, platform);

    // Save to database if user is authenticated
    const auditId = uuidv4();
    if (req.user) {
      const db = getDB();
      db.prepare(`
        INSERT INTO audits (id, user_id, platform, file_name, raw_data, risk_score, risk_level,
          predicted_reach_drop, top_red_flags, potential_loss, fix_plan, full_report)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        auditId,
        req.user.id,
        platform,
        req.file?.originalname || 'manual-input',
        analyticsData.substring(0, 5000), // store first 5000 chars
        auditResult.risk_score,
        auditResult.risk_level,
        auditResult.predicted_30day_reach_drop,
        JSON.stringify(auditResult.top_red_flags),
        auditResult.potential_monthly_loss,
        JSON.stringify(auditResult.fix_plan),
        JSON.stringify(auditResult)
      );
    }

    res.json({ id: auditId, ...auditResult });
  } catch (err) {
    console.error('Audit error:', err);
    res.status(500).json({ error: 'Audit analysis failed. Please try again.' });
  }
});

// Get audit history
router.get('/history', authenticateToken, (req, res) => {
  const db = getDB();
  const audits = db
    .prepare(
      'SELECT id, platform, file_name, risk_score, risk_level, predicted_reach_drop, created_at FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    )
    .all(req.user.id);

  res.json({ audits });
});

// Get single audit
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDB();
  const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id);

  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }

  // Parse JSON fields
  const result = {
    ...audit,
    top_red_flags: JSON.parse(audit.top_red_flags || '[]'),
    fix_plan: JSON.parse(audit.fix_plan || '[]'),
    full_report: JSON.parse(audit.full_report || '{}'),
  };

  res.json(result);
});

// Generate PDF report
router.get('/:id/pdf', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    const audit = db.prepare('SELECT * FROM audits WHERE id = ?').get(req.params.id);

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const fullReport = JSON.parse(audit.full_report || '{}');
    fullReport.platform = audit.platform;

    const pdfBytes = await generateAuditPDF(fullReport);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ReachRadar-Audit-${audit.id.slice(0, 8)}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Pre-post safety & virality check
router.post('/pre-check', optionalAuth, async (req, res) => {
  try {
    const { content, platform } = req.body;

    if (!content || !platform) {
      return res.status(400).json({ error: 'Content and platform are required' });
    }

    const result = await runPrePostCheck(content, platform);

    // Save if authenticated
    if (req.user) {
      const db = getDB();
      db.prepare(`
        INSERT INTO pre_post_checks (id, user_id, platform, content_text, safety_score, virality_score, suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        req.user.id,
        platform,
        content.substring(0, 2000),
        result.safety_score,
        result.virality_score,
        JSON.stringify(result.suggestions)
      );
    }

    res.json(result);
  } catch (err) {
    console.error('Pre-check error:', err);
    res.status(500).json({ error: 'Pre-post check failed. Please try again.' });
  }
});

export default router;
