import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/precheck_result.dart';
import '../services/api_client.dart';
import '../services/audit_repository.dart';
import '../state/session_controller.dart';

class PrecheckScreen extends StatefulWidget {
  const PrecheckScreen({super.key});

  @override
  State<PrecheckScreen> createState() => _PrecheckScreenState();
}

class _PrecheckScreenState extends State<PrecheckScreen> {
  final _contentController = TextEditingController();
  final _urlController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _platform = 'instagram';
  String _genre = 'other';
  final Set<String> _engagementGoals = <String>{};
  bool _submitting = false;
  String? _error;
  PrecheckResult? _result;

  static const _goalOptions = <(String, String)>[
    ('viral', 'Go Viral'),
    ('growth', 'Grow Followers'),
    ('sales', 'Drive Sales'),
    ('community', 'Build Community'),
    ('brand', 'Brand Awareness'),
    ('educate', 'Educate'),
  ];

  static const _genreOptions = <(String, String)>[
    ('other', 'General'),
    ('business', 'Business'),
    ('education', 'Education'),
    ('health', 'Health & Fitness'),
    ('lifestyle', 'Lifestyle'),
    ('tech', 'Tech'),
    ('family', 'Family & Parenting'),
    ('fashion', 'Fashion & Beauty'),
    ('travel', 'Travel'),
    ('food', 'Food'),
    ('comedy', 'Comedy'),
    ('music', 'Music'),
  ];

  @override
  void dispose() {
    _contentController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
      _result = null;
    });

    try {
      final session = context.read<SessionController>();
      final result = await context.read<AuditRepository>().runPrecheck(
            token: session.token!,
            platform: _platform,
            content: _contentController.text,
            contentUrl: _urlController.text,
            engagementGoals: _engagementGoals.toList(),
            genre: _genre,
          );
      await session.refreshUser();

      if (!mounted) return;
      setState(() {
        _result = result;
      });
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
      appBar: AppBar(title: const Text('Pre-Post Checker')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (user?.plan == 'free')
              Card(
                child: ListTile(
                  title: const Text('Free plan usage'),
                  subtitle: Text('${user?.prechecksRemaining ?? 5}/5 pre-checks left'),
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
                  setState(() => _platform = value);
                }
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _contentController,
              minLines: 5,
              maxLines: 8,
              decoration: const InputDecoration(
                labelText: 'Content description',
                alignLabelWithHint: true,
                hintText: 'Describe the post, reel, short, or thread you want to publish...',
              ),
              validator: (value) {
                if ((value ?? '').trim().isEmpty && _urlController.text.trim().isEmpty) {
                  return 'Add a content description or a URL';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _urlController,
              decoration: const InputDecoration(
                labelText: 'Optional URL',
                hintText: 'https://instagram.com/...',
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _genre,
              decoration: const InputDecoration(labelText: 'Genre'),
              items: _genreOptions
                  .map(
                    (item) => DropdownMenuItem<String>(
                      value: item.$1,
                      child: Text(item.$2),
                    ),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _genre = value);
                }
              },
            ),
            const SizedBox(height: 16),
            const Text(
              'Engagement goals',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _goalOptions
                  .map(
                    (goal) => FilterChip(
                      label: Text(goal.$2),
                      selected: _engagementGoals.contains(goal.$1),
                      onSelected: (selected) {
                        setState(() {
                          if (selected) {
                            _engagementGoals.add(goal.$1);
                          } else {
                            _engagementGoals.remove(goal.$1);
                          }
                        });
                      },
                    ),
                  )
                  .toList(),
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!, style: const TextStyle(color: Colors.redAccent)),
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
                  : const Icon(Icons.auto_awesome),
              label: Text(_submitting ? 'Analyzing...' : 'Run Pre-Check'),
            ),
            if (_result != null) ...[
              const SizedBox(height: 24),
              _ScoreRow(result: _result!),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Summary', style: TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 8),
                      Text(_result!.summary),
                      if (_result!.estimatedReachBoost.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text('Estimated reach boost: ${_result!.estimatedReachBoost}'),
                      ],
                    ],
                  ),
                ),
              ),
              if (_result!.currentAnalysis.isNotEmpty) ...[
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Current analysis', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        ..._result!.currentAnalysis.entries.map(
                          (entry) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Text('${_labelize(entry.key)}: ${_formatValue(entry.value)}'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              if (_result!.readyMadeContent.isNotEmpty) ...[
                const SizedBox(height: 12),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Ready-made content', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        ..._result!.readyMadeContent.entries.map(
                          (entry) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _labelize(entry.key),
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 4),
                                Text(_formatValue(entry.value)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }

  String _labelize(String value) {
    return value
        .replaceAll('_', ' ')
        .split(' ')
        .where((part) => part.isNotEmpty)
        .map((part) => part[0].toUpperCase() + part.substring(1))
        .join(' ');
  }

  String _formatValue(dynamic value) {
    if (value is List) {
      return value.join('\n• ');
    }
    if (value is Map<String, dynamic>) {
      return value.entries
          .map((entry) => '${_labelize(entry.key)}: ${entry.value}')
          .join('\n');
    }
    return value?.toString() ?? '';
  }
}

class _ScoreRow extends StatelessWidget {
  const _ScoreRow({required this.result});

  final PrecheckResult result;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Safety Score'),
                  const SizedBox(height: 8),
                  Text(
                    '${result.safetyScore}',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ),
        ),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Text('Virality Score'),
                  const SizedBox(height: 8),
                  Text(
                    '${result.viralityScore}',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
