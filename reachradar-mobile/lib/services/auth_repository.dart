import '../models/user.dart';
import 'api_client.dart';
import 'storage_service.dart';

class AuthSession {
  const AuthSession({
    required this.token,
    required this.user,
  });

  final String token;
  final User user;
}

class AuthRepository {
  AuthRepository(this._apiClient, this._storageService);

  final ApiClient _apiClient;
  final StorageService _storageService;

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final data = await _apiClient.post(
      '/auth/login',
      body: {
        'email': email,
        'password': password,
      },
    );

    final token = data['token']?.toString() ?? '';
    final user = User.fromJson(data['user'] as Map<String, dynamic>? ?? {});
    await _storageService.writeToken(token);
    return AuthSession(token: token, user: user);
  }

  Future<AuthSession> register({
    required String email,
    required String password,
    String? name,
  }) async {
    final data = await _apiClient.post(
      '/auth/register',
      body: {
        'email': email,
        'password': password,
        if (name != null && name.isNotEmpty) 'name': name,
      },
    );

    final token = data['token']?.toString() ?? '';
    final user = User.fromJson(data['user'] as Map<String, dynamic>? ?? {});
    await _storageService.writeToken(token);
    return AuthSession(token: token, user: user);
  }

  Future<AuthSession?> restoreSession() async {
    final token = await _storageService.readToken();
    if (token == null || token.isEmpty) return null;

    try {
      final data = await _apiClient.get('/auth/me', token: token);
      return AuthSession(
        token: token,
        user: User.fromJson(data['user'] as Map<String, dynamic>? ?? {}),
      );
    } catch (_) {
      await _storageService.clear();
      return null;
    }
  }

  Future<void> logout() {
    return _storageService.clear();
  }
}
