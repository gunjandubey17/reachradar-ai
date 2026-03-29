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
  bool _canGoBack = false;

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
          onPageFinished: (_) async {
            final canGoBack = await _controller.canGoBack();
            if (!mounted) return;
            setState(() {
              _progress = 100;
              _canGoBack = canGoBack;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(AppConfig.siteUrl));
  }

  Future<bool> _handleBack() async {
    final canGoBack = await _controller.canGoBack();
    if (canGoBack) {
      await _controller.goBack();
      if (mounted) {
        setState(() => _canGoBack = true);
      }
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
        appBar: AppBar(
          title: const Text(AppConfig.appName),
          actions: [
            IconButton(
              tooltip: 'Home',
              onPressed: () {
                _controller.loadRequest(Uri.parse(AppConfig.siteUrl));
              },
              icon: const Icon(Icons.home_outlined),
            ),
            IconButton(
              tooltip: 'Refresh',
              onPressed: () {
                _controller.reload();
              },
              icon: const Icon(Icons.refresh),
            ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(2),
            child: _progress < 100
                ? LinearProgressIndicator(value: _progress / 100)
                : const SizedBox.shrink(),
          ),
        ),
        body: SafeArea(
          bottom: false,
          child: WebViewWidget(controller: _controller),
        ),
        floatingActionButton: _canGoBack
            ? FloatingActionButton.small(
                onPressed: () async {
                  await _handleBack();
                },
                child: const Icon(Icons.arrow_back),
              )
            : null,
      ),
    );
  }
}
