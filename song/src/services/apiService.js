// API 서비스 - 백엔드 연동 (읽기 전용)

// 안전한 환경 변수 접근
const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL || 'http://ceprj2.gachon.ac.kr:65027/api';
  }
  return 'http://ceprj2.gachon.ac.kr:65027/api';
};

const API_BASE_URL = getApiUrl();

// ========================================
// 사용자 관리 API (읽기 전용)
// ========================================

export const userAPI = {
  // 모든 사용자 조회
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('사용자 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      throw error;
    }
  },

  // 사용자 검색
  search: async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('사용자 검색 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      throw error;
    }
  },
};

// ========================================
// 데이터처리 API (읽기 전용)
// ========================================

export const userdataAPI = {
  // 모든 데이터 조회
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/userdata`);
      if (!response.ok) {
        throw new Error('데이터 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      throw error;
    }
  },

  // 특정 사용자 데이터 조회
  getByUserId: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/userdata/${userId}`);
      if (!response.ok) {
        throw new Error('데이터 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('데이터 조회 오류:', error);
      throw error;
    }
  },
};

// ========================================
// 통계 API (읽기 전용)
// ========================================

export const statsAPI = {
  // 사용자 통계
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/users`);
      if (!response.ok) {
        throw new Error('통계 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('통계 조회 오류:', error);
      throw error;
    }
  },

  // 데이터처리 통계
  getUserdata: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/userdata`);
      if (!response.ok) {
        throw new Error('통계 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('통계 조회 오류:', error);
      throw error;
    }
  },
};