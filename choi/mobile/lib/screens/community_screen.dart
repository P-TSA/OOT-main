import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CommunityScreen extends StatefulWidget {
  final String userId;

  const CommunityScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> with WidgetsBindingObserver {
  List<Map<String, dynamic>> allOutfits = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadAllOutfits();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // 화면 포커스를 다시 받을 때 새로고침
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _loadAllOutfits();
    }
  }

  Future<void> _loadAllOutfits() async {
    final result = await ApiService.getAllOutfits();

    if (result['success']) {
      setState(() {
        allOutfits = (result['data'] as List)
            .map((item) => {
          'id': item['ID'],
          'top': item['top'] ?? '선택안함',
          'bottom': item['bottom'] ?? '선택안함',
          'temperature': item['temperature'] ?? 0,
          'weather_code': item['weather_code'] ?? 0,
          'weather_description': _getWeatherDescription(item['weather_code']),
          'created_at': DateTime.parse(item['created_at']),
        })
            .toList();

        // 시간 역순으로 정렬 (최신순)
        allOutfits.sort((a, b) => b['created_at'].compareTo(a['created_at']));
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  String _getWeatherDescription(int? code) {
    if (code == null) return '맑음';
    final weatherCodeMap = {
      0: '맑음',
      1: '대체로 맑음',
      2: '부분적으로 흐림',
      3: '흐림',
      45: '안개',
      48: '서리 안개',
      51: '이슬비 (약)',
      53: '이슬비 (중간)',
      55: '이슬비 (강)',
      56: '어는 이슬비 (약)',
      57: '어는 이슬비 (강)',
      61: '비 (약)',
      63: '비 (중간)',
      65: '비 (강)',
      66: '어는 비 (약)',
      67: '어는 비 (강)',
      71: '눈 (약)',
      73: '눈 (중간)',
      75: '눈 (강)',
      77: '눈날림',
      80: '소나기 (약)',
      81: '소나기 (중간)',
      82: '소나기 (강)',
      85: '소낙눈 (약/중간)',
      86: '소낙눈 (강)',
      95: '천둥번개',
      96: '천둥번개 + 약한 우박',
      99: '천둥번개 + 강한 우박',
    };
    return weatherCodeMap[code] ?? '맑음';
  }

  String _formatTime(DateTime createdAt) {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inSeconds < 60) {
      return '방금';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}시간 전';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}일 전';
    } else {
      return '${createdAt.year}-${createdAt.month}-${createdAt.day}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : allOutfits.isEmpty
          ? const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('아직 공유된 옷차림이 없습니다'),
            SizedBox(height: 16),
            Text(
              '공유해보세요!',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      )
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: allOutfits.length,
        reverse: true,
        itemBuilder: (context, index) {
          final outfit = allOutfits[index];
          final isMyOutfit = outfit['id'] == widget.userId;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Align(
              alignment: isMyOutfit
                  ? Alignment.centerRight
                  : Alignment.centerLeft,
              child: Container(
                constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.75,
                ),
                decoration: BoxDecoration(
                  color: isMyOutfit
                      ? Colors.blue.shade100
                      : Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: isMyOutfit
                      ? CrossAxisAlignment.end
                      : CrossAxisAlignment.start,
                  children: [
                    if (!isMyOutfit)
                      Text(
                        outfit['id'],
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                          color: Colors.black87,
                        ),
                      ),
                    if (!isMyOutfit) const SizedBox(height: 4),
                    Column(
                      crossAxisAlignment:
                      isMyOutfit
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
                      children: [
                        if (outfit['top'] != '선택안함')
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: _buildOutfitTag(
                              '👕 ${outfit['top']}',
                              Colors.purple,
                              isMyOutfit,
                            ),
                          ),
                        if (outfit['bottom'] != '선택안함')
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: _buildOutfitTag(
                              '👖 ${outfit['bottom']}',
                              Colors.blue,
                              isMyOutfit,
                            ),
                          ),
                        if (outfit['temperature'] != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _buildOutfitTag(
                                  '🌡️ ${outfit['temperature']}°',
                                  Colors.orange,
                                  isMyOutfit,
                                ),
                                const SizedBox(width: 4),
                                _buildOutfitTag(
                                  _getWeatherDescription(outfit['weather_code']),
                                  Colors.cyan,
                                  isMyOutfit,
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _formatTime(outfit['created_at']),
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildOutfitTag(String text, Color color, bool isMyOutfit) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
