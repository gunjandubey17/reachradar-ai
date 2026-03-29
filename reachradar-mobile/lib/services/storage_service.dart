import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  StorageService(this._storage);

  final FlutterSecureStorage _storage;

  static const _tokenKey = 'reachradar_token';

  Future<void> writeToken(String token) {
    return _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> readToken() {
    return _storage.read(key: _tokenKey);
  }

  Future<void> clear() {
    return _storage.deleteAll();
  }
}
