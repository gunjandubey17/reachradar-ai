import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../config/app_config.dart';

class WebShellScreen extends StatefulWidget {
  const WebShellScreen({super.key});

  @override
  State<WebShellScreen> createState() => _WebShellScreenState();
}

class _WebShellScreenState extends State<WebShellScreen> {
  late final WebViewController _controller;
  int _progress = 0;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (!mounted) return;
            setState(() => _progress = 0);
          },
          onProgress: (progress) {
            if (!mounted) return;
            setState(() => _progress = progress);
          },
          onPageFinished: (_) {
            if (!mounted) return;
            setState(() => _progress = 100);
          },
        ),
      )
      ..loadRequest(Uri.parse(AppConfig.siteUrl));
  }

  Future<bool> _handleBack() async {
    final canGoBack = await _controller.canGoBack();
    if (canGoBack) {
      await _controller.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final shouldPop = await _handleBack();
        if (shouldPop && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        body: Stack(
          children: [
            SafeArea(
              bottom: false,
              child: WebViewWidget(controller: _controller),
            ),
            if (_progress < 100)
              const Positioned.fill(
                child: IgnorePointer(
                  ignoring: true,
                  child: ColoredBox(
                    color: Color(0x14000000),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
              ),
            if (_progress < 100)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: SafeArea(
                  bottom: false,
                  child: LinearProgressIndicator(value: _progress / 100),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
