// lib/screens/record_screen.dart

import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class RecordScreen extends StatefulWidget {
  const RecordScreen({super.key});

  @override
  State<RecordScreen> createState() => _RecordScreenState();
}

class _RecordScreenState extends State<RecordScreen> {
  final stt.SpeechToText _speech = stt.SpeechToText();

  bool _isListening = false;
  bool _speechReady = false;
  String _statusText = 'Tap to start voice log';
  String _transcript = '';

  @override
  void initState() {
    super.initState();
    // ইচ্ছে করলে এখানেই init করতে পারতাম, কিন্তু সহজ রাখতে
    // আগে বাটন চাপলে init করবো
  }

  Future<void> _ensureSpeechReady() async {
    if (_speechReady) return;

    final available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'notListening' || status == 'done') {
          setState(() {
            _isListening = false;
          });
        }
      },
      onError: (error) {
        setState(() {
          _statusText = 'Speech error: ${error.errorMsg}';
          _isListening = false;
        });
      },
    );

    setState(() {
      _speechReady = available;
      if (!available) {
        _statusText = 'Speech recognition not available';
      }
    });
  }

  Future<void> _toggleRecording() async {
    // প্রথমে নিশ্চিত হই speech engine রেডি কিনা
    await _ensureSpeechReady();

    if (!_speechReady || !_speech.isAvailable) {
      setState(() {
        _statusText = 'Speech not available (mic permission দিন)';
      });
      return;
    }

    if (_isListening) {
      await _speech.stop();
      setState(() {
        _isListening = false;
        if (_transcript.isEmpty) {
          _statusText = 'No speech detected';
        } else {
          _statusText = 'Recording finished';
        }
      });
    } else {
      setState(() {
        _isListening = true;
        _statusText = 'Listening...';
        _transcript = '';
      });

      await _speech.listen(
        localeId: 'en_US', // device support থাকলে 'bn_BD' ট্রাই করতে পারো
        partialResults: true,
        listenMode: stt.ListenMode.confirmation,
        onResult: (result) {
          setState(() {
            _transcript = result.recognizedWords;
          });
        },
      );
    }
  }

  @override
  void dispose() {
    _speech.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Record Emotion')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _isListening ? Icons.mic : Icons.mic_none,
              size: 72,
              color: _isListening ? Colors.red : Colors.black54,
            ),
            const SizedBox(height: 16),
            Text(
              _statusText,
              style: const TextStyle(fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 220,
              child: ElevatedButton(
                // ❗এখানেই আসল কথা: আর null না, সবসময় `_toggleRecording`
                onPressed: _toggleRecording,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                child: Text(
                  _isListening ? 'Stop Recording' : 'Start Recording',
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (_transcript.isNotEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(_transcript, style: const TextStyle(fontSize: 14)),
              ),
          ],
        ),
      ),
    );
  }
}
