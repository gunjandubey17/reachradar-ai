import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class ApiException implements Exception {
  ApiException(this.message);

  final String message;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient();

  Future<Map<String, dynamic>> get(
    String path, {
    String? token,
  }) async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiBaseUrl}$path'),
      headers: _headers(token: token),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    required Map<String, dynamic> body,
    String? token,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}$path'),
      headers: _headers(token: token),
      body: jsonEncode(body),
    );
    return _decode(response);
  }

  Map<String, String> _headers({String? token}) {
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Map<String, dynamic> _decode(http.Response response) {
    final dynamic data = response.body.isEmpty ? {} : jsonDecode(response.body);
    if (response.statusCode >= 400) {
      final message = data is Map<String, dynamic>
          ? data['error']?.toString() ?? 'Request failed'
          : 'Request failed';
      throw ApiException(message);
    }
    if (data is Map<String, dynamic>) {
      return data;
    }
    throw ApiException('Unexpected server response');
  }

  static String readableError(Object error) {
    if (error is ApiException) return error.message;
    return error.toString();
  }
}

