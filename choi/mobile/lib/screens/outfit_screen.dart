import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/weather_service.dart';
import 'auth_screen.dart';
import 'community_screen.dart';
import 'ai_recommendation_screen.dart';

class OutfitScreen extends StatefulWidget {
  final String userId;
  final String userName;

  const OutfitScreen({Key? key, required this.userId, required this.userName}) : super(key: key);

  @override
  State<OutfitScreen> createState() => _OutfitScreenState();
}

class _OutfitScreenState extends State<OutfitScreen> with WidgetsBindingObserver {
  List<Map<String, dynamic>> outfits = [];
  String? selectedTop;
  String? selectedBottom;
  bool _isSaving = false;
  int _currentIndex = 0;
  int _previousIndex = -1;
  int _lastLoadedIndex = -1;
  Map<String, dynamic>? currentWeather;
  late Future<Map<String, dynamic>> _weatherFuture;

  final Map<String, List<String>> clothingDB = {
    'top': ['맨투맨/스웨트', '셔츠/블라우스', '니트/스웨터', '후드', '후드 집업', '가디건', '패딩', '코트', '재킷', '긴팔 티셔츠', '반팔 티셔츠'],
    'bottom': ['청바지', '면바지', '슈트/슬랙스', '트레이닝/조거 팬츠', '레깅스', '반바지', '스커트'],
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadOutfits();
    _weatherFuture = WeatherService.getCurrentWeather();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // 화면 포커스를 다시 받을 때 새로고침 (현재 탭이 0일 때만)
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _currentIndex == 0) {
      _loadOutfits();
    }
  }

  Future<void> _loadOutfits() async {
    final result = await ApiService.getOutfits(widget.userId);

    if (result['success']) {
      setState(() {
        outfits = (result['data'] as List)
            .map((item) {
          return {
            'date': DateTime.parse(item['created_at']),
            'top': item['top'] ?? '선택안함',
            'bottom': item['bottom'] ?? '선택안함',
            'temperature': item['temperature'],
            'weather_code': item['weather_code'],
            'weather_description': _getWeatherDescription(item['weather_code']),
          };
        })
            .toList();
      });
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

  void addOutfit() {
    if (selectedTop == null && selectedBottom == null) {
      _showSnackBar('최소 하나 이상의 옷을 선택해주세요');
      return;
    }

    if (currentWeather == null) {
      _showSnackBar('날씨 정보를 먼저 로드해주세요');
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
      temperature: (currentWeather?['temperature'] ?? 0).toDouble(),
      weatherCode: (currentWeather?['weather_code'] ?? 0).toInt(),
      temperatureMax: (currentWeather?['temperature_max'] ?? 0).toDouble(),
      temperatureMin: (currentWeather?['temperature_min'] ?? 0).toDouble(),
      windSpeed: (currentWeather?['wind_speed'] ?? 0).toDouble(),
    );

    setState(() => _isSaving = false);
    _showSnackBar(result['message']);

    if (result['success']) {
      setState(() {
        selectedTop = null;
        selectedBottom = null;
      });
      _loadOutfits();
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    // 내 기록 탭(0)으로 돌아왔을 때 새로고침
    if (_currentIndex == 0 && _lastLoadedIndex != 0) {
      _lastLoadedIndex = 0;
      // 다음 프레임에서 새로고침 실행
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _loadOutfits();
        }
      });
    } else if (_currentIndex != 0) {
      _lastLoadedIndex = _currentIndex;
    }

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
        onTap: (index) {
          setState(() => _currentIndex = index);
        },
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
          FutureBuilder<Map<String, dynamic>>(
            future: _weatherFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SizedBox(
                  height: 120,
                  child: Center(child: CircularProgressIndicator()),
                );
              }

              if (snapshot.hasData && snapshot.data!['success']) {
                final weather = snapshot.data!['data'];
                currentWeather ??= weather;

                return _buildWeatherWidget();
              } else {
                return const SizedBox(
                  height: 120,
                  child: Center(
                    child: Text('날씨 정보를 불러올 수 없습니다'),
                  ),
                );
              }
            },
          ),
          const SizedBox(height: 24),
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
                Text(
                  '${widget.userName}님의 오늘의 옷차림',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
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
                  Icons.checkroom,
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSaving ? null : addOutfit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
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

  Widget _buildWeatherWidget() {
    if (currentWeather == null) {
      return const SizedBox(
        height: 120,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    final temp = currentWeather!['temperature'];
    final tempMax = currentWeather!['temperature_max'];
    final tempMin = currentWeather!['temperature_min'];
    final weatherCode = currentWeather!['weather_code'];
    final windSpeed = (currentWeather!['wind_speed'] / 3.6).toStringAsFixed(1);

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue.shade300, Colors.blue.shade500],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '현재 날씨',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                WeatherService.getWeatherEmoji(weatherCode),
                style: const TextStyle(fontSize: 28),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${temp.toStringAsFixed(1)}°',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    WeatherService.getWeatherDescription(weatherCode),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '최고: ${tempMax.toStringAsFixed(1)}° 최저: ${tempMin.toStringAsFixed(1)}°',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '풍속: $windSpeed m/s',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
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

  Widget _buildOutfitCard(int index, Map<String, dynamic> outfit) {
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
                '📅 ${outfit['date'].year}-${outfit['date'].month.toString().padLeft(2, '0')}-${outfit['date'].day.toString().padLeft(2, '0')}',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: Colors.purple,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (outfit['top'] != null && outfit['top'] != '선택안함')
            _buildTagItem('👕 상의', outfit['top']!, Colors.purple),
          if (outfit['bottom'] != null && outfit['bottom'] != '선택안함')
            _buildTagItem('👖 하의', outfit['bottom']!, Colors.blue),
          if (outfit['temperature'] != null)
            Column(
              children: [
                const SizedBox(height: 8),
                _buildTagItem('🌡️ 온도', '${outfit['temperature']}°', Colors.orange),
                const SizedBox(height: 4),
                _buildTagItem('☁️ 날씨', outfit['weather_description'] ?? '맑음', Colors.cyan),
              ],
            ),
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
