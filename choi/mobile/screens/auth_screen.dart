import 'package:flutter/material.dart';
import 'outfit_screen.dart';
import '../services/api_service.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({Key? key}) : super(key: key);

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isLogin = true;

  final TextEditingController loginIdController = TextEditingController();
  final TextEditingController loginPasswordController = TextEditingController();

  final TextEditingController signupIdController = TextEditingController();
  final TextEditingController signupPasswordController = TextEditingController();
  final TextEditingController signupNameController = TextEditingController();
  final TextEditingController signupAgeController = TextEditingController();

  String? selectedGender;
  bool _isLoading = false;

  void _handleLogin() {
    if (loginIdController.text.isEmpty || loginPasswordController.text.isEmpty) {
      _showSnackBar('ID와 비밀번호를 입력해주세요');
      return;
    }

    setState(() => _isLoading = true);

    _login();
  }
  Future<void> _login() async {
    final result = await ApiService.login(
      id: loginIdController.text,
      password: loginPasswordController.text,
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      _showSnackBar(result['message']);
      // 사용자 정보를 OutfitScreen으로 전달
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => OutfitScreen(userId: loginIdController.text),
        ),
      );
    } else {
      _showSnackBar(result['message']);
    }
  }

  void _handleSignup() {
    if (_validateSignupForm()) return;

    setState(() => _isLoading = true);

    _signup();
  }

  Future<void> _signup() async {
    final result = await ApiService.signup(
      id: signupIdController.text,
      password: signupPasswordController.text,
      name: signupNameController.text,
      age: int.parse(signupAgeController.text),
      gender: selectedGender!,
    );

    setState(() => _isLoading = false);

    _showSnackBar(result['message']);

    if (result['success']) {
      setState(() {
        isLogin = true;
        loginIdController.clear();
        loginPasswordController.clear();
        signupIdController.clear();
        signupPasswordController.clear();
        signupNameController.clear();
        signupAgeController.clear();
        selectedGender = null;
      });
    }
  }

  bool _validateSignupForm() {
    if (signupIdController.text.isEmpty ||
        signupPasswordController.text.isEmpty ||
        signupNameController.text.isEmpty ||
        signupAgeController.text.isEmpty ||
        selectedGender == null) {
      _showSnackBar('모든 필드를 입력해주세요');
      return true;
    }

    try {
      int age = int.parse(signupAgeController.text);
      if (age < 10 || age > 120) {
        _showSnackBar('나이를 정확히 입력해주세요 (10~120)');
        return true;
      }
    } catch (e) {
      _showSnackBar('나이는 숫자로만 입력해주세요');
      return true;
    }
    return false;
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(),
            _buildTabs(),
            isLogin ? _buildLoginForm() : _buildSignupForm(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(color: Color(0xFF288AD5)),
      padding: const EdgeInsets.symmetric(vertical: 50),
      child: Column(
        children: [
          Image.asset(
            'assets/icons/oot_logo_2.png',
            width: 60,
            height: 60,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 12),
          const Text(
            'Outfit On Temperature\nOOT° - 온핏',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '오늘의 패션을 기록하고\nAI의 추천도 받아보세요',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabs() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => isLogin = true),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isLogin ? Colors.blue : Colors.grey.shade300,
                      width: isLogin ? 3 : 1,
                    ),
                  ),
                ),
                child: Text(
                  '로그인',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isLogin ? Colors.blue : Colors.grey,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => isLogin = false),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: !isLogin ? Colors.blue : Colors.grey.shade300,
                      width: !isLogin ? 3 : 1,
                    ),
                  ),
                ),
                child: Text(
                  '회원가입',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: !isLogin ? Colors.blue : Colors.grey,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginForm() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          _buildTextField(
            controller: loginIdController,
            label: 'ID',
            hint: '아이디를 입력하세요',
            icon: Icons.person,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: loginPasswordController,
            label: '비밀번호',
            hint: '비밀번호를 입력하세요',
            icon: Icons.lock,
            obscure: true,
          ),
          const SizedBox(height: 28),
          _buildButton('로그인', _handleLogin),
        ],
      ),
    );
  }

  Widget _buildSignupForm() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          _buildTextField(
            controller: signupIdController,
            label: 'ID',
            hint: '아이디를 입력하세요',
            icon: Icons.person,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: signupPasswordController,
            label: '비밀번호',
            hint: '비밀번호를 입력하세요',
            icon: Icons.lock,
            obscure: true,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: signupNameController,
            label: '이름',
            hint: '이름을 입력하세요',
            icon: Icons.badge,
          ),
          const SizedBox(height: 16),
          _buildTextField(
            controller: signupAgeController,
            label: '나이',
            hint: '나이를 입력하세요',
            icon: Icons.calendar_today,
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: selectedGender,
            decoration: InputDecoration(
              labelText: '성별',
              hintText: '성별을 선택하세요',
              prefixIcon: const Icon(Icons.person),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.blue, width: 2),
              ),
            ),
            items: ['남성', '여성', '기타'].map((gender) {
              return DropdownMenuItem(value: gender, child: Text(gender));
            }).toList(),
            onChanged: (value) => setState(() => selectedGender = value),
          ),
          const SizedBox(height: 28),
          _buildButton('회원가입', _handleSignup),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscure = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.blue, width: 2),
        ),
      ),
    );
  }

  Widget _buildButton(String label, VoidCallback onPressed) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 4,
        ),
        child: _isLoading
            ? const SizedBox(
          height: 20,
          width: 20,
          child: CircularProgressIndicator(
            color: Colors.white,
            strokeWidth: 2,
          ),
        )
            : Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    loginIdController.dispose();
    loginPasswordController.dispose();
    signupIdController.dispose();
    signupPasswordController.dispose();
    signupNameController.dispose();
    signupAgeController.dispose();
    super.dispose();
  }
}