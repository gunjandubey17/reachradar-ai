import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, CheckCircle, Clock3, Mail, Shield } from 'lucide-react';

const REPORT_EMAIL = 'rakhhbakk@gmail.com';

export default function SafetyStandards() {
  useEffect(() => {
    document.title = 'CSAE Safety Standards - ReachRadar AI';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Public safety standards for ReachRadar AI covering child sexual abuse and exploitation (CSAE), reporting, and enforcement.'
    );
  }, []);

  return (
    <div className="pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-indigo-900/10" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
            <Shield size={14} />
            Public safety standards
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              Child Sexual Abuse and Exploitation <span className="text-emerald-300">(CSAE)</span> Standards
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">
              ReachRadar AI does not permit content, requests, or behavior that sexualizes, exploits, or endangers minors.
              This page explains our public standards, reporting channel, and enforcement approach.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href={`mailto:${REPORT_EMAIL}?subject=${encodeURIComponent('CSAE report - ReachRadar AI')}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition glow"
            >
              <Mail size={18} />
              Report a safety concern
            </a>
            <Link
              to="/privacy"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition"
            >
              View Privacy Policy
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-12">
            <div className="glass rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">What we prohibit</h2>
              <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
                <li>Any sexual content involving minors.</li>
                <li>Content that encourages, depicts, or facilitates CSAE.</li>
                <li>Requests to search for, create, optimize, or distribute exploitative material.</li>
                <li>Grooming, coercion, solicitation, or attempts to evade child safety rules.</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">How we respond</h2>
              <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
                <li>We may restrict access to the relevant content or account.</li>
                <li>We may preserve records needed for review, compliance, or legal obligations.</li>
                <li>We may escalate credible reports to law enforcement or the appropriate child safety authority when required or appropriate.</li>
                <li>We review reports as soon as practical after they are received.</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Clock3 className="w-5 h-5 text-indigo-300" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-3">Reporting details</h2>
              <ul className="space-y-2 text-sm text-gray-300 leading-relaxed">
                <li>Email: <a href={`mailto:${REPORT_EMAIL}`} className="text-emerald-300 hover:underline">{REPORT_EMAIL}</a></li>
                <li>Subject line: include "CSAE report" so the message is routed quickly.</li>
                <li>Include links, screenshots, usernames, and any other context that helps review the report.</li>
                <li>If someone is in immediate danger, contact local emergency services first.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
