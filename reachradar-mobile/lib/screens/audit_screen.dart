import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/api_client.dart';
import '../services/audit_repository.dart';
import '../state/session_controller.dart';
import 'results_screen.dart';

class AuditScreen extends StatefulWidget {
  const AuditScreen({super.key});

  @override
  State<AuditScreen> createState() => _AuditScreenState();
}

class _AuditScreenState extends State<AuditScreen> {
  final _dataController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _platform = 'instagram';
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _dataController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final session = context.read<SessionController>();
      final repo = context.read<AuditRepository>();
      final report = await repo.runAudit(
        token: session.token!,
        platform: _platform,
        manualData: _dataController.text.trim(),
      );

      await repo.saveAudit(
        token: session.token!,
        platform: _platform,
        report: report,
      );
      await session.refreshUser();

      if (!mounted) return;
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => ResultsScreen(
            args: ResultsRouteArgs(
              platform: _platform,
              report: report,
            ),
          ),
        ),
      );
    } catch (error) {
      setState(() {
        _error = ApiClient.readableError(error);
      });
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<SessionController>().user;

    return Scaffold(
      appBar: AppBar(title: const Text('New Audit')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (user?.plan == 'free')
              Card(
                child: ListTile(
                  title: const Text('Free plan usage'),
                  subtitle: Text('${user?.auditsRemaining ?? 5}/5 audits left'),
                ),
              ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _platform,
              decoration: const InputDecoration(labelText: 'Platform'),
              items: const [
                DropdownMenuItem(value: 'instagram', child: Text('Instagram')),
                DropdownMenuItem(value: 'facebook', child: Text('Facebook')),
                DropdownMenuItem(value: 'youtube', child: Text('YouTube')),
                DropdownMenuItem(value: 'tiktok', child: Text('TikTok')),
                DropdownMenuItem(value: 'twitter', child: Text('X / Twitter')),
                DropdownMenuItem(value: 'linkedin', child: Text('LinkedIn')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _platform = value;
                  });
                }
              },
            ),
            const SizedBox(height: 20),
            TextFormField(
              controller: _dataController,
              minLines: 8,
              maxLines: 12,
              decoration: const InputDecoration(
                labelText: 'Analytics data',
                alignLabelWithHint: true,
                hintText: 'Paste analytics text, metrics, notes, or screenshot data here...',
              ),
              validator: (value) {
                if ((value ?? '').trim().isEmpty) {
                  return 'Paste some analytics data to analyze';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            Text(
              'Tip: include follower count, reach, engagement rate, posting frequency, and recent drops so the audit is more accurate.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ],
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: _submitting ? null : _submit,
              icon: _submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.analytics_outlined),
              label: Text(_submitting ? 'Analyzing...' : 'Analyze'),
            ),
          ],
        ),
      ),
    );
  }
}

