import 'package:flutter/material.dart';

import 'screens/web_shell_screen.dart';

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
        ),
        useMaterial3: true,
      ),
      home: const WebShellScreen(),
    );
  }
}
