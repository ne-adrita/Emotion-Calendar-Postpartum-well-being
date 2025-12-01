// lib/voice_journal_recorder.dart

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class VoiceJournalRecorder extends StatefulWidget {
  final TextEditingController noteController;

  const VoiceJournalRecorder({super.key, required this.noteController});

  @override
  State<VoiceJournalRecorder> createState() => _VoiceJournalRecorderState();
}

class _VoiceJournalRecorderState extends State<VoiceJournalRecorder> {
  final stt.SpeechToText _speech = stt.SpeechToText();

  bool _speechAvailable = false;
  bool _isListening = false;
  String _statusText = 'Ready to record';
  String _transcript = 'No transcript yet';
  int _elapsedSeconds = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    // mic permission চাই
    final micStatus = await Permission.microphone.request();
    if (!micStatus.isGranted) {
      setState(() {
        _statusText = 'Microphone permission denied';
      });
      return;
    }

    // speech_to_text initialize
    _speechAvailable = await _speech.initialize(
      onStatus: (status) {
        // status: listening / notListening / done
        if (status == 'notListening' || status == 'done') {
          _stopListeningInternal(updateUI: false);
        }
      },
      onError: (error) {
        setState(() {
          _statusText = 'Speech error: ${error.errorMsg}';
          _isListening = false;
        });
      },
    );

    if (!_speechAvailable) {
      setState(() {
        _statusText = 'Speech recognition not available on this device';
      });
    }
  }

  /// mic button চাপলে on/off করবো
  void _toggleRecording() {
    if (!_speechAvailable) return;

    if (_isListening) {
      _stopListeningInternal();
    } else {
      _startListening();
    }
  }

  /// listening শুরু
  Future<void> _startListening() async {
    setState(() {
      _isListening = true;
      _statusText = 'Recording...';
      _transcript = 'Listening...';
      _elapsedSeconds = 0;
    });

    // timer শুরু (সময় দেখানোর জন্য)
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() => _elapsedSeconds++);
      }
    });

    await _speech.listen(
      localeId: 'en_US', // ডিভাইস সাপোর্ট করলে 'bn_BD' দিতে পারো
      partialResults: true,
      listenMode: stt.ListenMode.confirmation,
      onResult: (result) {
        final text = result.recognizedWords;
        setState(() {
          _transcript = text.isEmpty ? 'Listening...' : text;
        });
      },
    );
  }

  /// listening বন্ধ
  Future<void> _stopListeningInternal({bool updateUI = true}) async {
    await _speech.stop();
    _timer?.cancel();

    if (updateUI && mounted) {
      setState(() {
        _isListening = false;
        _statusText = 'Recording stopped';
      });
    }
  }

  /// transcript clear
  void _clearRecording() {
    setState(() {
      _statusText = 'Ready to record';
      _transcript = 'No transcript yet';
      _elapsedSeconds = 0;
    });
  }

  /// transcript -> TextField এ বসানো
  void _useTranscript() {
    if (_transcript.isEmpty || _transcript == 'No transcript yet') return;
    widget.noteController.text = _transcript;
  }

  String _formatTime(int secs) {
    final minutes = (secs ~/ 60).toString().padLeft(2, '0');
    final seconds = (secs % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _timer?.cancel();
    _speech.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isTranscriptEmpty =
        _transcript.isEmpty || _transcript == 'No transcript yet';

    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.purple.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Voice Journaling',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 4),
          const Text(
            'Record your thoughts instead of typing',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(height: 12),

          // উপরে mic button + status + time
          Row(
            children: [
              GestureDetector(
                onTap: _speechAvailable ? _toggleRecording : null,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: _isListening ? Colors.red : Colors.redAccent,
                    shape: BoxShape.circle,
                    boxShadow: _isListening
                        ? [
                            BoxShadow(
                              color: Colors.red.withOpacity(0.5),
                              blurRadius: 12,
                              spreadRadius: 2,
                            ),
                          ]
                        : null,
                  ),
                  child: const Icon(Icons.mic, color: Colors.white),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(_statusText, style: const TextStyle(fontSize: 13)),
              ),
              Text(
                _formatTime(_elapsedSeconds),
                style: const TextStyle(fontSize: 13),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // transcript box
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.02),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Transcript:',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 4),
                Text(_transcript, style: const TextStyle(fontSize: 14)),
              ],
            ),
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              ElevatedButton(
                onPressed: isTranscriptEmpty ? null : _useTranscript,
                child: const Text('Use Transcript'),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: _clearRecording,
                child: const Text('Clear'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
