import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:reachradar_mobile/screens/auth_screen.dart';
import 'package:reachradar_mobile/screens/dashboard_screen.dart';
import 'package:reachradar_mobile/screens/splash_screen.dart';
import 'package:reachradar_mobile/state/session_controller.dart';

class ReachRadarApp extends StatelessWidget {
  const ReachRadarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReachRadar AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
      ),
      home: Consumer<SessionController>(
        builder: (context, session, _) {
          if (session.isLoading) return const SplashScreen();
          if (!session.isAuthenticated) return const AuthScreen();
          return const DashboardScreen();
        },
      ),
    );
  }
}

