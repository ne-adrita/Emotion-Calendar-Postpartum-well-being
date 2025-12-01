import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AIService {
  static final String baseUrl = dotenv.env['AI_BASE_URL'] ?? "";

  static Future<String> sendMessage(String userMessage) async {
    final url = Uri.parse('$baseUrl/chat');

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"message": userMessage}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data["reply"]; // LLaMA থেকে পাওয়া reply
    } else {
      throw Exception("AI Error ${response.statusCode}: ${response.body}");
    }
  }
}
