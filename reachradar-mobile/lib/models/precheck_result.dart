class PrecheckResult {
  const PrecheckResult({
    required this.safetyScore,
    required this.viralityScore,
    required this.summary,
    required this.estimatedReachBoost,
    required this.currentAnalysis,
    required this.readyMadeContent,
    required this.raw,
  });

  final int safetyScore;
  final int viralityScore;
  final String summary;
  final String estimatedReachBoost;
  final Map<String, dynamic> currentAnalysis;
  final Map<String, dynamic> readyMadeContent;
  final Map<String, dynamic> raw;

  factory PrecheckResult.fromJson(Map<String, dynamic> json) {
    return PrecheckResult(
      safetyScore: (json['safety_score'] as num?)?.toInt() ?? 0,
      viralityScore: (json['virality_score'] as num?)?.toInt() ?? 0,
      summary: json['summary']?.toString() ?? '',
      estimatedReachBoost: json['estimated_reach_boost']?.toString() ?? '',
      currentAnalysis:
          (json['current_analysis'] as Map<String, dynamic>?) ?? const {},
      readyMadeContent:
          (json['ready_made_content'] as Map<String, dynamic>?) ?? const {},
      raw: json,
    );
  }
}

