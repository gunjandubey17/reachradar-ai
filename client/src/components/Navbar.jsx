import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getUser, logout } from '../utils/api';
import { Menu, X, Radar } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const user = getUser();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Radar className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-bold gradient-text">ReachRadar AI</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/audit" className="text-sm text-gray-300 hover:text-white transition">
              Audit
            </Link>
            <Link to="/pre-check" className="text-sm text-gray-300 hover:text-white transition">
              Pre-Post Checker
            </Link>
            <Link to="/pricing" className="text-sm text-gray-300 hover:text-white transition">
              Pricing
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-300" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/10 px-4 py-4 space-y-3">
          <Link to="/audit" onClick={() => setOpen(false)} className="block text-gray-300 hover:text-white">Audit</Link>
          <Link to="/pre-check" onClick={() => setOpen(false)} className="block text-gray-300 hover:text-white">Pre-Post Checker</Link>
          <Link to="/pricing" onClick={() => setOpen(false)} className="block text-gray-300 hover:text-white">Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-gray-300 hover:text-white">Dashboard</Link>
              <button onClick={logout} className="block text-gray-400 hover:text-white">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="block text-indigo-400 hover:text-white">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
