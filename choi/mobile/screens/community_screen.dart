import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CommunityScreen extends StatefulWidget {
  final String userId;

  const CommunityScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  List<Map<String, dynamic>> allOutfits = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAllOutfits();
  }

  Future<void> _loadAllOutfits() async {
    final result = await ApiService.getAllOutfits();

    if (result['success']) {
      setState(() {
        allOutfits = (result['data'] as List)
            .map((item) => {
          'id': item['ID'],
          'top': item['top'],
          'bottom': item['bottom'],
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
                          _buildOutfitTag(
                            '👖 ${outfit['bottom']}',
                            Colors.blue,
                            isMyOutfit,
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

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 1) {
      return '방금';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}시간 전';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}일 전';
    } else {
      return '${dateTime.year}-${dateTime.month.toString().padLeft(2, '0')}-${dateTime.day.toString().padLeft(2, '0')}';
    }
  }
}