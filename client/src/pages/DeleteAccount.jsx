import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock3, Mail, ShieldAlert, Trash2 } from 'lucide-react';
import { getUser } from '../utils/api';

const SUPPORT_EMAIL = 'gd@reachradarai.com';

function buildMailto(email, reason) {
  const subject = 'Account deletion request';
  const bodyLines = [
    'Hello ReachRadar AI,',
    '',
    'I would like to request deletion of my account and associated data.',
    email ? `Account email: ${email}` : '',
    reason ? `Reason: ${reason}` : '',
    '',
    'Please confirm once this request has been received.',
    '',
    'Thank you,',
  ].filter(Boolean);

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
}

export default function DeleteAccount() {
  const currentUser = getUser();
  const [email, setEmail] = useState(currentUser?.email || '');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    document.title = 'Delete Account - ReachRadar AI';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Request deletion of your ReachRadar AI account and associated data.'
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!confirmed) return;
    window.location.href = buildMailto(email.trim(), reason.trim());
  };

  return (
    <div className="pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-indigo-900/10" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium">
            <Trash2 size={14} />
            Account deletion request
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              Delete your <span className="text-red-300">ReachRadar AI</span> account
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              Use this page to request deletion of your account and associated data.
              If you are signed in, your email address will be prefilled automatically.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 mt-12">
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Send a deletion request</h2>
                  <p className="text-sm text-gray-400">This opens your email client with a prefilled request.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-red-400 focus:outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason for deletion (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-red-400 focus:outline-none transition resize-none"
                  placeholder="Tell us anything that would help us improve."
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-red-400 focus:ring-red-400"
                />
                <span>
                  I understand that deleting my account is permanent and will remove access to my ReachRadar AI data.
                </span>
              </label>

              <button
                type="submit"
                disabled={!confirmed}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 rounded-xl font-semibold transition"
              >
                Send deletion request
                <ArrowRight size={18} />
              </button>

              <p className="text-xs text-gray-500 leading-relaxed">
                If your email app does not open, send the request manually to{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-red-300 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </form>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">What happens next</h2>
                    <p className="text-sm text-gray-400">Simple request flow</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    'We receive your deletion request and verify the account email.',
                    'We remove your account and associated data from our system.',
                    'Deletion is completed within 30 days of receiving the request.',
                  ].map((item, index) => (
                    <div key={item} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Before you send</h2>
                    <p className="text-sm text-gray-400">A few things to check first</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <Clock3 className="w-4 h-4 text-yellow-300 mt-0.5 shrink-0" />
                    <span>Make sure the email matches the account you want deleted.</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock3 className="w-4 h-4 text-yellow-300 mt-0.5 shrink-0" />
                    <span>Save any audit reports or PDFs you want to keep.</span>
                  </li>
                  <li className="flex gap-3">
                    <Clock3 className="w-4 h-4 text-yellow-300 mt-0.5 shrink-0" />
                    <span>You can review the full privacy policy before sending the request.</span>
                  </li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition"
                  >
                    View Privacy Policy
                  </Link>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl text-sm font-medium text-red-200 transition"
                  >
                    Email support directly
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
