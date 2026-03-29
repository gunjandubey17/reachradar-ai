import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'services/api_client.dart';
import 'services/audit_repository.dart';
import 'services/auth_repository.dart';
import 'services/storage_service.dart';
import 'state/session_controller.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  final storageService = StorageService(const FlutterSecureStorage());
  final apiClient = ApiClient();
  final authRepository = AuthRepository(apiClient, storageService);
  final auditRepository = AuditRepository(apiClient);
  final sessionController = SessionController(authRepository)..restore();

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: apiClient),
        Provider<AuthRepository>.value(value: authRepository),
        Provider<AuditRepository>.value(value: auditRepository),
        ChangeNotifierProvider<SessionController>.value(
          value: sessionController,
        ),
      ],
      child: const ReachRadarApp(),
    ),
  );
}

