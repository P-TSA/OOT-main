import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const OutfitApp());
}

class OutfitApp extends StatelessWidget {
  const OutfitApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '옷차림 기록',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      debugShowCheckedModeBanner: false,
      home: const OutfitScreen(),
    );
  }
}

class OutfitScreen extends StatefulWidget {
  const OutfitScreen({Key? key}) : super(key: key);

  @override
  State<OutfitScreen> createState() => _OutfitScreenState();
}

class _OutfitScreenState extends State<OutfitScreen> {
  Map<String, dynamic>? weather;
  bool loadingWeather = true;
  List<OutfitRecord> outfits = [];

  // 선택된 태그들
  String? selectedTop;
  String? selectedBottom;
  String? selectedShoes;
  String? selectedStyle;
  String? selectedSeason;
  String? selectedColor;

  DateTime? selectedDate;

  final Map<String, List<String>> clothingDB = {
    'top': ['티셔츠', '셔츠', '블라우스', '후드', '스웨터', '니트', '자켓', '코트', '원피스'],
    'bottom': ['청바지', '슬랙스', '치노바지', '레깅스', '스커트', '팬츠', '반바지', '조거팬츠'],
    'shoes': ['운동화', '힐', '플랫', '부츠', '로퍼', '슬리퍼', '샌들', '구두', '스니커즈'],
    'style': ['캐주얼', '포멀', '미니멀', '보이시', '페미닌', '스포츠', '레트로', '고급스러움', '스트릿'],
    'season': ['봄', '여름', '가을', '겨울', '사계절'],
    'color': ['검정', '흰색', '회색', '빨강', '파랑', '초록', '노랑', '베이지', '핑크', '보라'],
  };

  @override
  void initState() {
    super.initState();
    fetchWeather();
  }

  Future<void> fetchWeather() async {
    try {
      final response = await http.get(
        Uri.parse(
          'https://api.open-meteo.com/v1/forecast?latitude=37.2756&longitude=126.6236&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Seoul',
        ),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          weather = data['current'];
          loadingWeather = false;
        });
      }
    } catch (e) {
      print('날씨 로드 실패: $e');
      setState(() {
        loadingWeather = false;
        weather = {
          'temperature_2m': 15,
          'relative_humidity_2m': 65,
          'weather_code': 0,
          'wind_speed_10m': 5,
        };
      });
    }
  }

  String getWeatherDescription(int code) {
    const descriptions = {
      0: '맑음',
      1: '거의 맑음',
      2: '부분흐림',
      3: '흐림',
      45: '안개',
      48: '서리 안개',
      51: '이슬비',
      53: '이슬비',
      55: '이슬비',
      61: '비',
      63: '비',
      65: '비',
      71: '눈',
      73: '눈',
      75: '눈',
      80: '소나기',
      81: '소나기',
      82: '소나기',
      95: '뇌우',
      96: '뇌우',
      99: '뇌우',
    };
    return descriptions[code] ?? '맑음';
  }

  IconData getWeatherIcon(int code) {
    if (code == 0 || code == 1) return Icons.wb_sunny;
    if (code == 2 || code == 3) return Icons.cloud;
    if (code >= 45 && code <= 67) return Icons.cloud_queue;
    if (code >= 71 && code <= 75) return Icons.ac_unit;
    if (code >= 80 && code <= 82) return Icons.water_drop;
    if (code >= 95 && code <= 99) return Icons.cloud_queue;
    return Icons.wb_sunny;
  }

  void addOutfit() {
    if (selectedTop == null && selectedBottom == null && selectedShoes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('최소 하나 이상의 옷을 선택해주세요')),
      );
      return;
    }

    final outfit = OutfitRecord(
      date: selectedDate ?? DateTime.now(),
      top: selectedTop,
      bottom: selectedBottom,
      shoes: selectedShoes,
      style: selectedStyle,
      season: selectedSeason,
      color: selectedColor,
    );

    setState(() {
      outfits.add(outfit);
      selectedTop = null;
      selectedBottom = null;
      selectedShoes = null;
      selectedStyle = null;
      selectedSeason = null;
      selectedColor = null;
      selectedDate = null;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('옷차림이 저장되었습니다')),
    );
  }

  void deleteOutfit(int index) {
    setState(() {
      outfits.removeAt(index);
    });
  }

  Widget buildWeatherWidget() {
    if (loadingWeather || weather == null) {
      return const CircularProgressIndicator();
    }

    final temp = weather!['temperature_2m'];
    final humidity = weather!['relative_humidity_2m'];
    final windSpeed = weather!['wind_speed_10m'];
    final weatherCode = weather!['weather_code'];

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue.shade400, Colors.blue.shade600],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '인천 · 현재',
            style: TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${temp.toStringAsFixed(0)}°',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    getWeatherDescription(weatherCode),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              Icon(
                getWeatherIcon(weatherCode),
                color: Colors.white,
                size: 56,
              ),
            ],
          ),
          const SizedBox(height: 20),
          Divider(color: Colors.blue.shade200, thickness: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.opacity, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    '습도',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
              Text(
                '$humidity%',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.air, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    '풍속',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
              Text(
                '${windSpeed.toStringAsFixed(0)} km/h',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget buildDropdownField(String label, String? value, List<String> items,
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
            color: Colors.white,
          ),
          child: DropdownButton<String>(
            value: value,
            onChanged: onChanged,
            isExpanded: true,
            underline: const SizedBox(),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            hint: Row(
              children: [
                Icon(icon, color: Colors.grey, size: 20),
                const SizedBox(width: 10),
                Text(
                  '선택하세요',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
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
            selectedItemBuilder: (BuildContext context) {
              return items.map<Widget>((String item) {
                return Row(
                  children: [
                    Icon(icon, color: color, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      item,
                      style: TextStyle(
                        color: Colors.grey.shade800,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                );
              }).toList();
            },
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('👗 옷차림 기록'),
        backgroundColor: Colors.white,
        elevation: 1,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: Colors.black87,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 날씨 위젯
            buildWeatherWidget(),
            const SizedBox(height: 24),

            // 입력 폼
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
                    '새로운 옷차림 추가',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 날짜 선택
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '📅 날짜',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: selectedDate ?? DateTime.now(),
                            firstDate: DateTime(2020),
                            lastDate: DateTime(2099),
                          );
                          if (date != null) {
                            setState(() => selectedDate = date);
                          }
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: selectedDate != null ? Colors.purple : Colors.grey.shade300,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                          child: Row(
                            children: [
                              Icon(
                                Icons.calendar_today,
                                color: selectedDate != null ? Colors.purple : Colors.grey,
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Text(
                                selectedDate != null
                                    ? '${selectedDate!.year}-${selectedDate!.month.toString().padLeft(2, '0')}-${selectedDate!.day.toString().padLeft(2, '0')}'
                                    : '날짜 선택',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: selectedDate != null ? Colors.grey.shade800 : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // 드롭다운 필드들
                  buildDropdownField(
                    '👕 상의',
                    selectedTop,
                    clothingDB['top']!,
                        (value) => setState(() => selectedTop = value),
                    Colors.purple,
                    Icons.checkroom,
                  ),
                  const SizedBox(height: 16),

                  buildDropdownField(
                    '👖 하의',
                    selectedBottom,
                    clothingDB['bottom']!,
                        (value) => setState(() => selectedBottom = value),
                    Colors.blue,
                    Icons.accessibility,
                  ),
                  const SizedBox(height: 16),

                  buildDropdownField(
                    '👠 신발',
                    selectedShoes,
                    clothingDB['shoes']!,
                        (value) => setState(() => selectedShoes = value),
                    Colors.pink,
                    Icons.directions_walk,
                  ),
                  const SizedBox(height: 16),

                  buildDropdownField(
                    '🎨 스타일',
                    selectedStyle,
                    clothingDB['style']!,
                        (value) => setState(() => selectedStyle = value),
                    Colors.amber,
                    Icons.palette,
                  ),
                  const SizedBox(height: 16),

                  buildDropdownField(
                    '🌡️ 계절',
                    selectedSeason,
                    clothingDB['season']!,
                        (value) => setState(() => selectedSeason = value),
                    Colors.green,
                    Icons.cloud,
                  ),
                  const SizedBox(height: 16),

                  buildDropdownField(
                    '🎨 색상',
                    selectedColor,
                    clothingDB['color']!,
                        (value) => setState(() => selectedColor = value),
                    Colors.red,
                    Icons.format_paint,
                  ),
                  const SizedBox(height: 28),

                  // 추가 버튼
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: addOutfit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                      ),
                      child: const Text(
                        '✓ 옷차림 추가',
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
            const SizedBox(height: 28),

            // 기록된 옷차림
            if (outfits.isNotEmpty) ...[
              const Text(
                '기록된 옷차림',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              ...outfits.asMap().entries.map((entry) {
                final index = entry.key;
                final outfit = entry.value;
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border(
                      left: BorderSide(
                        color: Colors.purple,
                        width: 4,
                      ),
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
                              child: Icon(
                                Icons.close,
                                color: Colors.red,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (outfit.top != null) _buildTagItem('👕 상의', outfit.top!, Colors.purple),
                      if (outfit.bottom != null) _buildTagItem('👖 하의', outfit.bottom!, Colors.blue),
                      if (outfit.shoes != null) _buildTagItem('👠 신발', outfit.shoes!, Colors.pink),
                      if (outfit.style != null) _buildTagItem('🎨 스타일', outfit.style!, Colors.amber),
                      if (outfit.season != null) _buildTagItem('🌡️ 계절', outfit.season!, Colors.green),
                      if (outfit.color != null) _buildTagItem('🎨 색상', outfit.color!, Colors.red),
                    ],
                  ),
                );
              }).toList(),
            ],
          ],
        ),
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

class OutfitRecord {
  final DateTime date;
  final String? top;
  final String? bottom;
  final String? shoes;
  final String? style;
  final String? season;
  final String? color;

  OutfitRecord({
    required this.date,
    this.top,
    this.bottom,
    this.shoes,
    this.style,
    this.season,
    this.color,
  });
}