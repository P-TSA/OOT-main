import 'package:flutter/material.dart';
import '../models/outfit_record.dart';
import '../services/api_service.dart';
import 'auth_screen.dart';
import 'community_screen.dart';
import 'ai_recommendation_screen.dart';

class OutfitScreen extends StatefulWidget {
  final String userId;

  const OutfitScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<OutfitScreen> createState() => _OutfitScreenState();
}

class _OutfitScreenState extends State<OutfitScreen> {
  List<OutfitRecord> outfits = [];
  String? selectedTop;
  String? selectedBottom;
  bool _isSaving = false;
  int _currentIndex = 0;

  final Map<String, List<String>> clothingDB = {
    'top': ['맨투맨/스웨트', '셔츠/블라우스', '니트/스웨터', '후드', '후드 집업', '가디건', '패딩', '코트', '재킷', '긴팔 티셔츠', '반팔 티셔츠'],
    'bottom': ['청바지', '면바지', '슈트/슬랙스', '트레이닝/조거 팬츠', '레깅스', '반바지', '스커트'],
  };

  @override
  void initState() {
    super.initState();
    _loadOutfits();
  }

  Future<void> _loadOutfits() async {
    final result = await ApiService.getOutfits(widget.userId);

    if (result['success']) {
      setState(() {
        outfits = (result['data'] as List)
            .map((item) => OutfitRecord(
          date: DateTime.parse(item['created_at']),
          top: item['top'],
          bottom: item['bottom'],
        ))
            .toList();
      });
    } else {
      _showSnackBar(result['message']);
    }
  }

  void addOutfit() {
    if (selectedTop == null && selectedBottom == null) {
      _showSnackBar('최소 하나 이상의 옷을 선택해주세요');
      return;
    }

    setState(() => _isSaving = true);

    _saveOutfit();
  }

  Future<void> _saveOutfit() async {
    final result = await ApiService.saveOutfit(
      userId: widget.userId,
      top: selectedTop ?? '선택안함',
      bottom: selectedBottom ?? '선택안함',
    );

    setState(() => _isSaving = false);

    _showSnackBar(result['message']);

    if (result['success']) {
      final outfit = OutfitRecord(
        date: DateTime.now(),
        top: selectedTop,
        bottom: selectedBottom,
      );

      setState(() {
        outfits.add(outfit);
        selectedTop = null;
        selectedBottom = null;
      });

      _loadOutfits();
    }
  }

  void deleteOutfit(int index) {
    setState(() => outfits.removeAt(index));
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/icons/app_icon.png',
                height: 50,
                width: 50,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            const Text('OOT° - 온핏'),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 1,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: Colors.black87,
          fontSize: 23,
          fontWeight: FontWeight.bold,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black87),
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (context) => const AuthScreen()),
              );
            },
          ),
        ],
      ),
      body: _currentIndex == 0 ? _buildOutfitTab() : _currentIndex == 1 ? CommunityScreen(userId: widget.userId) : AiRecommendationScreen(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: '내 기록',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: '커뮤니티',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.auto_awesome),
            label: 'AI 추천',
          ),
        ],
      ),
    );
  }

  Widget _buildOutfitTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '오늘의 옷차림 기록하기',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 20),
                _buildDropdownField(
                  '👕 상의',
                  selectedTop,
                  clothingDB['top']!,
                      (value) => setState(() => selectedTop = value),
                  Colors.purple,
                  Icons.checkroom,
                ),
                const SizedBox(height: 16),
                _buildDropdownField(
                  '👖 하의',
                  selectedBottom,
                  clothingDB['bottom']!,
                      (value) => setState(() => selectedBottom = value),
                  Colors.blue,
                  Icons.accessibility,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : addOutfit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 4,
                    ),
                    child: _isSaving
                        ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                        : const Text(
                      '✓ 옷차림 기록',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (outfits.isNotEmpty) ...[
            const SizedBox(height: 28),
            const Text(
              '최근 옷차림 기록',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...outfits.take(3).toList().asMap().entries.map((entry) {
              return _buildOutfitCard(entry.key, entry.value);
            }).toList(),
          ],
        ],
      ),
    );
  }

  Widget _buildDropdownField(String label, String? value, List<String> items,
      Function(String?) onChanged, Color color, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: value != null ? color : Colors.grey.shade300,
              width: 2,
            ),
          ),
          child: DropdownButton<String>(
            value: value,
            onChanged: onChanged,
            isExpanded: true,
            underline: const SizedBox(),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            items: items.map<DropdownMenuItem<String>>((String item) {
              return DropdownMenuItem<String>(
                value: item,
                child: Row(
                  children: [
                    Icon(icon, color: color, size: 18),
                    const SizedBox(width: 10),
                    Text(item),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildOutfitCard(int index, OutfitRecord outfit) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: const Border(
          left: BorderSide(color: Colors.purple, width: 4),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '📅 ${outfit.date.year}-${outfit.date.month.toString().padLeft(2, '0')}-${outfit.date.day.toString().padLeft(2, '0')}',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Colors.purple,
                  fontSize: 14,
                ),
              ),
              GestureDetector(
                onTap: () => deleteOutfit(index),
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.close, color: Colors.red, size: 20),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (outfit.top != null && outfit.top != '선택안함')
            _buildTagItem('👕 상의', outfit.top!, Colors.purple),
          if (outfit.bottom != null && outfit.bottom != '선택안함')
            _buildTagItem('👖 하의', outfit.bottom!, Colors.blue),
        ],
      ),
    );
  }

  Widget _buildTagItem(String label, String tag, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Text(
              tag,
              style: TextStyle(
                fontSize: 12,
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}