export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: '남성' | '여성' | '기타';
  age: number;
  lastAccess: string; // 수정: joinDate에서 lastAccess로 변경
  status: 'active' | 'pending';
}

export const users: User[] = [
  {
    id: '1',
    name: '김민수',
    email: 'kimminsu@example.com',
    password: 'pass1234!@',
    gender: '남성',
    age: 28,
    lastAccess: '2025-12-06 14:23', // 수정: 마지막 접속 시간
    status: 'active',
  },
  {
    id: '2',
    name: '이지은',
    email: 'leejieun@example.com',
    password: 'secure#567',
    gender: '여성',
    age: 24,
    lastAccess: '2025-12-06 09:15', // 수정
    status: 'active',
  },
  {
    id: '3',
    name: '박서준',
    email: 'parkseojun@example.com',
    password: 'myPass890',
    gender: '남성',
    age: 35,
    lastAccess: '2025-12-05 18:42', // 수정
    status: 'active',
  },
  {
    id: '4',
    name: '최유진',
    email: 'choiyujin@example.com',
    password: 'pwd!2024',
    gender: '여성',
    age: 19,
    lastAccess: '2025-12-03 22:10', // 수정
    status: 'pending',
  },
  {
    id: '5',
    name: '정하늘',
    email: 'junghaneul@example.com',
    password: 'test@123',
    gender: '기타',
    age: 31,
    lastAccess: '2025-12-04 11:30', // 수정
    status: 'active',
  },
  {
    id: '6',
    name: '강민지',
    email: 'kangminji@example.com',
    password: 'hello!456',
    gender: '여성',
    age: 22,
    lastAccess: '2025-12-06 16:55', // 수정
    status: 'active',
  },
  {
    id: '7',
    name: '윤태양',
    email: 'yuntaeyang@example.com',
    password: 'sun#789',
    gender: '남성',
    age: 42,
    lastAccess: '2025-12-02 08:20', // 수정
    status: 'pending',
  },
];