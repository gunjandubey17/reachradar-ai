import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/audit_report.dart';
import '../models/audit_summary.dart';
import '../services/audit_repository.dart';
import '../state/session_controller.dart';

class ResultsRouteArgs {
  const ResultsRouteArgs({
    required this.platform,
    required this.report,
  });

  final String platform;
  final AuditReport report;
}

class ResultsScreen extends StatefulWidget {
  const ResultsScreen({
    super.key,
    this.args,
    this.auditId,
    this.platformLabel,
  });

  final ResultsRouteArgs? args;
  final String? auditId;
  final String? platformLabel;

  factory ResultsScreen.fromHistorySummary({required AuditSummary summary}) {
    return ResultsScreen(
      auditId: summary.id,
      platformLabel: summary.platform,
    );
  }

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  Future<AuditReport>? _reportFuture;

  @override
  void initState() {
    super.initState();
    if (widget.args == null && widget.auditId != null) {
      final session = context.read<SessionController>();
      _reportFuture = context
          .read<AuditRepository>()
          .fetchAudit(session.token!, widget.auditId!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Audit Results')),
      body: widget.args != null
          ? _ResultsContent(
              platform: widget.args!.platform,
              report: widget.args!.report,
            )
          : FutureBuilder<AuditReport>(
              future: _reportFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text('Failed to load audit: ${snapshot.error}'),
                    ),
                  );
                }

                final report = snapshot.data;
                if (report == null) {
                  return const Center(child: Text('Audit not found.'));
                }

                return _ResultsContent(
                  platform: widget.platformLabel ?? 'audit',
                  report: report,
                );
              },
            ),
    );
  }
}

class _ResultsContent extends StatelessWidget {
  const _ResultsContent({
    required this.platform,
    required this.report,
  });

  final String platform;
  final AuditReport report;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  platform.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '${report.riskScore}',
                  style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w800),
                ),
                Text('Risk level: ${report.riskLevel}'),
                const SizedBox(height: 8),
                Text('Predicted 30-day reach drop: ${report.predictedReachDrop}'),
                Text('Potential monthly loss: ${report.potentialLoss}'),
                Text('Authenticity score: ${report.authenticityScore}'),
                const SizedBox(height: 12),
                Text(report.summary),
              ],
            ),
          ),
        ),
        if (report.priorityAction.isNotEmpty) ...[
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Priority action',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(report.priorityAction),
                ],
              ),
            ),
          ),
        ],
        if (report.topRedFlags.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text(
            'Top red flags',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          ...report.topRedFlags.map(
            (flag) => Card(
              child: ListTile(
                title: Text(
                  flag is Map<String, dynamic>
                      ? flag['flag']?.toString() ?? 'Issue'
                      : flag.toString(),
                ),
                subtitle: flag is Map<String, dynamic>
                    ? Text(
                        [
                          if (flag['severity'] != null)
                            'Severity: ${flag['severity']}',
                          if (flag['explanation'] != null)
                            flag['explanation'].toString(),
                        ].join('\n'),
                      )
                    : null,
                isThreeLine: flag is Map<String, dynamic> &&
                    flag['severity'] != null &&
                    flag['explanation'] != null,
              ),
            ),
          ),
        ],
        if (report.fixPlan.isNotEmpty) ...[
          const SizedBox(height: 16),
          const Text(
            'Fix plan',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          ...report.fixPlan.take(5).map(
            (step) => Card(
              child: ListTile(
                title: Text(
                  step is Map<String, dynamic>
                      ? step['action']?.toString() ?? 'Action'
                      : step.toString(),
                ),
                subtitle: step is Map<String, dynamic>
                    ? Text(
                        [
                          if (step['timeline'] != null)
                            'When: ${step['timeline']}',
                          if (step['impact'] != null)
                            'Impact: ${step['impact']}',
                        ].join('\n'),
                      )
                    : null,
                isThreeLine: step is Map<String, dynamic> &&
                    step['timeline'] != null &&
                    step['impact'] != null,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

