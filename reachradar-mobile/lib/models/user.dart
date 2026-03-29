class User {
  const User({
    required this.id,
    required this.email,
    this.name,
    required this.plan,
    this.auditsRemaining,
    this.prechecksRemaining,
  });

  final String id;
  final String email;
  final String? name;
  final String plan;
  final int? auditsRemaining;
  final int? prechecksRemaining;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      name: json['name']?.toString(),
      plan: json['plan']?.toString() ?? 'free',
      auditsRemaining: (json['auditsRemaining'] as num?)?.toInt() ??
          (json['audits_remaining'] as num?)?.toInt(),
      prechecksRemaining: (json['prechecksRemaining'] as num?)?.toInt(),
    );
  }
}

