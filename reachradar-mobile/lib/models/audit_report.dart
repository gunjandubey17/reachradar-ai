import 'dart:convert';

class AuditReport {
  const AuditReport({
    required this.riskScore,
    required this.riskLevel,
    required this.summary,
    required this.priorityAction,
    required this.predictedReachDrop,
    required this.potentialLoss,
    required this.authenticityScore,
    required this.topRedFlags,
    required this.fixPlan,
    required this.raw,
  });

  final int riskScore;
  final String riskLevel;
  final String summary;
  final String priorityAction;
  final String predictedReachDrop;
  final String potentialLoss;
  final int authenticityScore;
  final List<dynamic> topRedFlags;
  final List<dynamic> fixPlan;
  final Map<String, dynamic> raw;

  factory AuditReport.fromJson(Map<String, dynamic> json) {
    return AuditReport(
      riskScore: (json['risk_score'] as num?)?.toInt() ?? 0,
      riskLevel: json['risk_level']?.toString() ?? 'Unknown',
      summary: json['summary']?.toString() ?? '',
      priorityAction: json['priority_action']?.toString() ?? '',
      predictedReachDrop: json['predicted_30day_reach_drop']?.toString() ?? '-',
      potentialLoss: json['potential_monthly_loss']?.toString() ?? '-',
      authenticityScore: (json['authenticity_score'] as num?)?.toInt() ?? 0,
      topRedFlags: (json['top_red_flags'] as List<dynamic>? ?? const []),
      fixPlan: (json['fix_plan'] as List<dynamic>? ?? const []),
      raw: json,
    );
  }

  factory AuditReport.fromSerialized(
    String value, {
    Map<String, dynamic> fallback = const {},
  }) {
    try {
      final decoded = jsonDecode(value);
      if (decoded is Map<String, dynamic>) {
        return AuditReport.fromJson(decoded);
      }
    } catch (_) {}
    return AuditReport.fromJson(fallback);
  }
}

