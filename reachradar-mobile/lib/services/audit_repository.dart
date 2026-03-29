import '../models/audit_report.dart';
import '../models/precheck_result.dart';
import '../models/audit_summary.dart';
import 'api_client.dart';

class AuditRepository {
  AuditRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<AuditSummary>> fetchHistory(String token) async {
    final data = await _apiClient.get('/audit/history', token: token);
    final items = data['audits'] as List<dynamic>? ?? const [];
    return items
        .map((item) => AuditSummary.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<AuditReport> fetchAudit(String token, String auditId) async {
    final data = await _apiClient.get('/audit/get/$auditId', token: token);
    final audit = data['audit'] as Map<String, dynamic>? ?? const {};
    final fullReport = audit['full_report'];

    if (fullReport is Map<String, dynamic>) {
      return AuditReport.fromJson(fullReport);
    }

    if (fullReport is String && fullReport.isNotEmpty) {
      return AuditReport.fromSerialized(fullReport, fallback: audit);
    }

    return AuditReport.fromJson(audit);
  }

  Future<AuditReport> runAudit({
    required String token,
    required String platform,
    required String manualData,
  }) async {
    final data = await _apiClient.post(
      '/audit/analyze',
      token: token,
      body: {
        'platform': platform,
        'manualData': manualData,
      },
    );
    return AuditReport.fromJson(data);
  }

  Future<void> saveAudit({
    required String token,
    required String platform,
    required AuditReport report,
  }) {
    return _apiClient.post(
      '/audit/save',
      token: token,
      body: {
        'platform': platform,
        'risk_score': report.riskScore,
        'risk_level': report.riskLevel,
        'full_report': report.raw,
      },
    );
  }

  Future<PrecheckResult> runPrecheck({
    required String token,
    required String platform,
    required String content,
    String? contentUrl,
    List<String> engagementGoals = const [],
    String? genre,
  }) async {
    final data = await _apiClient.post(
      '/audit/pre-check',
      token: token,
      body: {
        'platform': platform,
        if (content.trim().isNotEmpty) 'content': content.trim(),
        if (contentUrl != null && contentUrl.trim().isNotEmpty)
          'contentUrl': contentUrl.trim(),
        if (engagementGoals.isNotEmpty)
          'engagementGoal': engagementGoals.join(', '),
        if (genre != null && genre.isNotEmpty) 'genre': genre,
      },
    );
    return PrecheckResult.fromJson(data);
  }
}

