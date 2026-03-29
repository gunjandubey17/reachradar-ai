class AuditSummary {
  const AuditSummary({
    required this.id,
    required this.platform,
    required this.riskScore,
    required this.riskLevel,
    required this.createdAt,
  });

  final String id;
  final String platform;
  final int riskScore;
  final String riskLevel;
  final DateTime? createdAt;

  factory AuditSummary.fromJson(Map<String, dynamic> json) {
    return AuditSummary(
      id: json['id']?.toString() ?? '',
      platform: json['platform']?.toString() ?? '',
      riskScore: (json['risk_score'] as num?)?.toInt() ?? 0,
      riskLevel: json['risk_level']?.toString() ?? 'Unknown',
      createdAt: json['created_at'] == null
          ? null
          : DateTime.tryParse(json['created_at'].toString()),
    );
  }
}
