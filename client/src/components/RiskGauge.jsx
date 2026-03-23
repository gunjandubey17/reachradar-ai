export default function RiskGauge({ score, size = 200 }) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const getColor = (s) => {
    if (s <= 25) return '#22c55e';
    if (s <= 50) return '#eab308';
    if (s <= 75) return '#f97316';
    return '#ef4444';
  };

  const getLabel = (s) => {
    if (s <= 25) return 'Low Risk';
    if (s <= 50) return 'Medium Risk';
    if (s <= 75) return 'High Risk';
    return 'Critical';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{
            filter: `drop-shadow(0 0 8px ${color}60)`,
            transition: 'stroke-dasharray 1s ease-out',
          }}
        />
        {/* Score text */}
        <text x={center} y={center - 10} textAnchor="middle" fill={color} fontSize="42" fontWeight="800">
          {score}
        </text>
        <text x={center} y={center + 18} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="14">
          {getLabel(score)}
        </text>
      </svg>
    </div>
  );
}
