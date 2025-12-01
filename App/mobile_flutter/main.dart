import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

// Screens
import 'screens/home_screen.dart';
import 'screens/journal_screen.dart';
import 'screens/record_screen.dart';
import 'screens/calendar_screen.dart';
import 'screens/analytics_screen.dart';
// import 'screens/settings_screen.dart';  // FILE NOT AVAILABLE → SO DISABLED
import 'screens/chat_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  print("TOKEN FOUND: ${dotenv.env['HF_API_KEY']}");
  runApp(const EmotionApp());
}

class EmotionApp extends StatelessWidget {
  const EmotionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Emotion Calendar',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MainTabs(),
    );
  }
}

class MainTabs extends StatefulWidget {
  const MainTabs({super.key});

  @override
  State<MainTabs> createState() => _MainTabsState();
}

class _MainTabsState extends State<MainTabs> {
  int _index = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    JournalScreen(),
    RecordScreen(),
    CalendarScreen(),
    AnalyticsScreen(),
    // SettingsScreen(), // ❌ FILE NOT FOUND → DISABLED
    ChatScreen(), // AI CHAT
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
          NavigationDestination(
            icon: Icon(Icons.book_outlined),
            label: 'Journal',
          ),
          NavigationDestination(icon: Icon(Icons.mic_none), label: 'Record'),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            label: 'Calendar',
          ),
          NavigationDestination(
            icon: Icon(Icons.show_chart_outlined),
            label: 'Stats',
          ),
          // NavigationDestination(
          //   icon: Icon(Icons.settings_outlined),
          //   label: 'Settings',
          // ),  // ❌ Disabled
          NavigationDestination(
            icon: Icon(Icons.chat_bubble_outline),
            label: 'AI',
          ),
        ],
      ),
    );
  }
}
