import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-invert text-gray-300 space-y-4 text-sm leading-relaxed">
        <p><strong>Last updated:</strong> March 2026</p>

        <h2 className="text-xl font-semibold text-white mt-6">1. Information We Collect</h2>
        <p>ReachRadar AI collects the following information when you use our service:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Email address and password (for account creation)</li>
          <li>Social media analytics data you upload (screenshots, CSV files, text data)</li>
          <li>URLs to social media posts you submit for analysis</li>
          <li>Payment information (processed securely by Stripe — we never store card details)</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6">2. How We Use Your Data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide AI-powered algorithm audits and content analysis</li>
          <li>To generate personalized recommendations and content strategies</li>
          <li>To process payments and manage your subscription</li>
          <li>To improve our service</li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-6">3. Data Sharing</h2>
        <p>We do not sell, trade, or share your personal data with third parties. Your analytics data is processed by our AI (powered by Anthropic Claude) solely to generate your audit results and is not stored permanently.</p>

        <h2 className="text-xl font-semibold text-white mt-6">4. Data Retention & Deletion</h2>
        <p>
          You can request deletion of your account and all associated data at any time using our{' '}
          <Link to="/delete-account" className="text-indigo-400 hover:underline">
            delete account page
          </Link>{' '}
          or by contacting us at gd@reachradarai.com. We will delete your data within 30 days of receiving your request.
        </p>

        <h2 className="text-xl font-semibold text-white mt-6">5. Security</h2>
        <p>We use industry-standard security measures including encrypted connections (HTTPS), secure password hashing, and JWT-based authentication.</p>

        <h2 className="text-xl font-semibold text-white mt-6">6. Cookies</h2>
        <p>We use essential cookies only (authentication tokens stored in localStorage). We do not use tracking cookies or third-party analytics.</p>

        <h2 className="text-xl font-semibold text-white mt-6">7. Contact</h2>
        <p>For privacy-related questions or data deletion requests, contact us at: <a href="mailto:gd@reachradarai.com" className="text-indigo-400 hover:underline">gd@reachradarai.com</a></p>
      </div>
    </div>
  );
}
