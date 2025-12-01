import 'package:flutter/material.dart';

class JournalScreen extends StatelessWidget {
  const JournalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Journal")),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text(
            "Recent Entries",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          SizedBox(height: 12),
          _JournalEntryCard(
            mood: "😔",
            title: "Feeling heavy",
            text: "I felt very anxious after class but calmed down later.",
            date: "Oct 26",
          ),
          _JournalEntryCard(
            mood: "🙂",
            title: "Better evening",
            text: "Walked, did breathing, felt normal again.",
            date: "Oct 25",
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // later: open "new journal" screen
        },
        child: const Icon(Icons.edit),
      ),
    );
  }
}

class _JournalEntryCard extends StatelessWidget {
  final String mood;
  final String title;
  final String text;
  final String date;
  const _JournalEntryCard({
    super.key,
    required this.mood,
    required this.title,
    required this.text,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(mood, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "$title • $date",
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    text,
                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
