import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AiRecommendationScreen extends StatefulWidget {
  const AiRecommendationScreen({Key? key}) : super(key: key);

  @override
  State<AiRecommendationScreen> createState() => _AiRecommendationScreenState();
}

class _AiRecommendationScreenState extends State<AiRecommendationScreen> {
  Map<String, dynamic>? aiRecommendation;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAiRecommendation();
  }

  Future<void> _loadAiRecommendation() async {
    final result = await ApiService.getAiRecommendation();

    setState(() {
      if (result['success']) {
        aiRecommendation = result['data'];
      }
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : aiRecommendation == null
          ? const Center(
        child: Text('추천 옷차림이 없습니다'),
      )
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 30),
            const Text(
              '✨ AI 추천 옷차림 ✨',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 40),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  _buildRecommendationCard(
                    '👕 상의',
                    aiRecommendation!['top'],
                    Colors.purple,
                  ),
                  const SizedBox(height: 24),
                  _buildRecommendationCard(
                    '👖 하의',
                    aiRecommendation!['bottom'],
                    Colors.blue,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            const Text(
              '특정 주기에 따라 모든 사용자들의 옷차림을 분석하여\n최근 주목받고 있는 옷차림을 추천해드립니다.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationCard(String label, String item, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: color.withOpacity(0.3),
              width: 2,
            ),
          ),
          child: Center(
            child: Text(
              item,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
        ),
      ],
    );
  }
}