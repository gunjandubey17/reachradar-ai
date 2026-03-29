import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../config/app_config.dart';

class WebShellScreen extends StatefulWidget {
  const WebShellScreen({super.key});

  @override
  State<WebShellScreen> createState() => _WebShellScreenState();
}

class _WebShellScreenState extends State<WebShellScreen> {
  late final WebViewController _controller;
  final ImagePicker _imagePicker = ImagePicker();
  int _progress = 0;

  @override
  void initState() {
    super.initState();

    const PlatformWebViewControllerCreationParams params =
        PlatformWebViewControllerCreationParams();
    final controller = WebViewController.fromPlatformCreationParams(params);

    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setOnShowFileSelector(_handleAndroidFileSelection);
      androidController.setMediaPlaybackRequiresUserGesture(false);
      androidController.setAllowFileAccess(true);
    }

    _controller = controller
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

  Future<List<String>> _handleAndroidFileSelection(
    FileSelectorParams params,
  ) async {
    try {
      final acceptsImages = _acceptsImages(params.acceptTypes);
      final allowMultiple = params.mode == FileSelectorMode.openMultiple;

      if (params.isCaptureEnabled && acceptsImages && !allowMultiple) {
        final XFile? captured = await _imagePicker.pickImage(
          source: ImageSource.camera,
          imageQuality: 90,
        );
        if (captured == null) return <String>[];
        return <String>[Uri.file(captured.path).toString()];
      }

      if (acceptsImages && allowMultiple) {
        final List<XFile> images = await _imagePicker.pickMultiImage(
          imageQuality: 90,
        );
        return images.map((image) => Uri.file(image.path).toString()).toList();
      }

      if (acceptsImages && !allowMultiple) {
        final XFile? image = await _imagePicker.pickImage(
          source: ImageSource.gallery,
          imageQuality: 90,
        );
        if (image == null) return <String>[];
        return <String>[Uri.file(image.path).toString()];
      }

      final List<String>? allowedExtensions = _allowedExtensionsForAcceptTypes(
        params.acceptTypes,
      );

      final FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: allowMultiple,
        type: allowedExtensions == null || allowedExtensions.isEmpty
            ? FileType.any
            : FileType.custom,
        allowedExtensions: allowedExtensions == null || allowedExtensions.isEmpty
            ? null
            : allowedExtensions,
      );

      if (result == null) return <String>[];

      return result.files
          .map((file) => file.path)
          .whereType<String>()
          .map((path) => Uri.file(path).toString())
          .toList();
    } catch (_) {
      return <String>[];
    }
  }

  bool _acceptsImages(List<String> acceptTypes) {
    if (acceptTypes.isEmpty) return false;
    return acceptTypes.any((type) {
      final normalized = type.trim().toLowerCase();
      return normalized.startsWith('image/') ||
          normalized == '.png' ||
          normalized == '.jpg' ||
          normalized == '.jpeg' ||
          normalized == '.webp' ||
          normalized == '.gif';
    });
  }

  List<String>? _allowedExtensionsForAcceptTypes(List<String> acceptTypes) {
    if (acceptTypes.isEmpty) return null;

    const mimeToExtension = <String, String>{
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'text/csv': 'csv',
      'text/plain': 'txt',
      'application/json': 'json',
      'application/pdf': 'pdf',
    };

    final extensions = <String>{};
    for (final rawType in acceptTypes) {
      final type = rawType.trim().toLowerCase();
      if (type.isEmpty || type == '*/*') return null;
      if (type.startsWith('.')) {
        extensions.add(type.substring(1));
        continue;
      }
      if (type == 'image/*') {
        extensions.addAll(<String>['png', 'jpg', 'jpeg', 'webp', 'gif']);
        continue;
      }
      final extension = mimeToExtension[type];
      if (extension != null) {
        extensions.add(extension);
      }
    }

    return extensions.isEmpty ? null : extensions.toList();
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
