import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/audit_summary.dart';
import '../services/audit_repository.dart';
import '../state/session_controller.dart';
import 'audit_screen.dart';
import 'precheck_screen.dart';
import 'results_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<List<AuditSummary>> _historyFuture;

  @override
  void initState() {
    super.initState();
    _historyFuture = _loadHistory();
  }

  Future<List<AuditSummary>> _loadHistory() {
    final session = context.read<SessionController>();
    return context.read<AuditRepository>().fetchHistory(session.token!);
  }

  Color _riskColor(int score) {
    if (score <= 25) return Colors.greenAccent;
    if (score <= 50) return Colors.amberAccent;
    if (score <= 75) return Colors.orangeAccent;
    return Colors.redAccent;
  }

  Future<void> _refreshAll() async {
    await context.read<SessionController>().refreshUser();
    setState(() {
      _historyFuture = _loadHistory();
    });
    await _historyFuture;
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    final user = session.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            onPressed: () => session.logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.of(context).push<void>(
            MaterialPageRoute(builder: (_) => const AuditScreen()),
          );
          if (!mounted) return;
          await _refreshAll();
        },
        icon: const Icon(Icons.add),
        label: const Text('New Audit'),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshAll,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              user?.email ?? '',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 4),
            Text('Plan: ${user?.plan ?? 'free'}'),
            if (user?.plan == 'free') ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _UsageCard(
                      title: 'Free Audits',
                      value: '${user?.auditsRemaining ?? 5}/5',
                      caption: 'Audit credits left',
                      color: const Color(0xFF4F46E5),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _UsageCard(
                      title: 'Pre-Checks',
                      value: '${user?.prechecksRemaining ?? 5}/5',
                      caption: 'Content checks left',
                      color: const Color(0xFF7C3AED),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 20),
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Recent audits',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                ),
                TextButton.icon(
                  onPressed: () async {
                    await Navigator.of(context).push<void>(
                      MaterialPageRoute(builder: (_) => const PrecheckScreen()),
                    );
                    if (!mounted) return;
                    await _refreshAll();
                  },
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Pre-Check'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FutureBuilder<List<AuditSummary>>(
              future: _historyFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }

                if (snapshot.hasError) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text('Failed to load history: ${snapshot.error}'),
                    ),
                  );
                }

                final items = snapshot.data ?? const [];
                if (items.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Text('No audits yet. Run your first audit.'),
                    ),
                  );
                }

                return Column(
                  children: items
                      .map(
                        (audit) => Card(
                          child: ListTile(
                            title: Text(_labelForPlatform(audit.platform)),
                            subtitle: Text(
                              '${audit.riskLevel} • ${audit.createdAt == null ? 'Unknown date' : DateFormat.yMMMd().format(audit.createdAt!.toLocal())}',
                            ),
                            trailing: Text(
                              '${audit.riskScore}',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: _riskColor(audit.riskScore),
                              ),
                            ),
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ResultsScreen.fromHistorySummary(
                                    summary: audit,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  String _labelForPlatform(String value) {
    switch (value) {
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      case 'twitter':
        return 'X / Twitter';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return value;
    }
  }
}

class _UsageCard extends StatelessWidget {
  const _UsageCard({
    required this.title,
    required this.value,
    required this.caption,
    required this.color,
  });

  final String title;
  final String value;
  final String caption;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [color.withValues(alpha: 0.28), color.withValues(alpha: 0.12)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(caption, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}


