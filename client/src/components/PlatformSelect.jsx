const platforms = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-blue-500 to-blue-700' },
  { id: 'youtube', name: 'YouTube', icon: '🎬', color: 'from-red-500 to-red-700' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-gray-800 to-gray-900' },
  { id: 'twitter', name: 'X / Twitter', icon: '𝕏', color: 'from-gray-700 to-gray-900' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-800' },
];

export default function PlatformSelect({ selected, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {platforms.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
            selected === p.id
              ? 'border-indigo-400 bg-indigo-500/20 scale-105'
              : 'border-white/10 bg-white/5 hover:border-white/30'
          }`}
        >
          <div className="text-2xl mb-1">{p.icon}</div>
          <div className="text-xs font-medium">{p.name}</div>
        </button>
      ))}
    </div>
  );
}
