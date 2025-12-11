import 'package:flutter/material.dart';
import 'auth_screen.dart';

// 공통 색상
const Color ootColor = Color(0xFF1E88E5);

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateNext();
  }

  Future<void> _navigateNext() async {
    // 스플래시 화면을 2초 동안 표시
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const AuthScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold( // 🔴 const 제거 (Image.asset 때문에)
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 큰 로고
            SizedBox(
              width: 180,
              height: 180,
              child: Image.asset(
                'assets/splash/oot_logo.png',
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 24),

            // Outfit On Temperature
            const Text(
              'Outfit On Temperature',
              style: TextStyle(
                color: ootColor,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),

            // OOT° - 온핏
            const Text(
              'OOT° - 온핏',
              style: TextStyle(
                color: ootColor,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}