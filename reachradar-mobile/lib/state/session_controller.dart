import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../services/auth_repository.dart';

class SessionController extends ChangeNotifier {
  SessionController(this._authRepository);

  final AuthRepository _authRepository;

  String? _token;
  User? _user;
  bool _loading = true;

  String? get token => _token;
  User? get user => _user;
  bool get isLoading => _loading;
  bool get isAuthenticated => _token != null && _user != null;

  Future<void> restore() async {
    _loading = true;
    notifyListeners();

    final session = await _authRepository.restoreSession();
    _token = session?.token;
    _user = session?.user;
    _loading = false;
    notifyListeners();
  }

  Future<void> refreshUser() async {
    if (_token == null) return;
    final session = await _authRepository.restoreSession();
    if (session == null) {
      _token = null;
      _user = null;
    } else {
      _token = session.token;
      _user = session.user;
    }
    notifyListeners();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    final session = await _authRepository.login(
      email: email,
      password: password,
    );
    _token = session.token;
    _user = session.user;
    notifyListeners();
  }

  Future<void> register({
    required String email,
    required String password,
    String? name,
  }) async {
    final session = await _authRepository.register(
      email: email,
      password: password,
      name: name,
    );
    _token = session.token;
    _user = session.user;
    notifyListeners();
  }

  Future<void> logout() async {
    await _authRepository.logout();
    _token = null;
    _user = null;
    notifyListeners();
  }
}

