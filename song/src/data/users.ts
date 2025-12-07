export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: '남성' | '여성' | '기타';
  joinDate: string;
  status: 'active' | 'pending';
}

export const users: User[] = [
  {
    id: '1',
    name: '김민수',
    email: 'kimminsu@example.com',
    password: 'pass1234!@',
    gender: '남성',
    joinDate: '2025-12-03',
    status: 'active',
  },
  {
    id: '2',
    name: '이지은',
    email: 'leejieun@example.com',
    password: 'secure#567',
    gender: '여성',
    joinDate: '2025-12-03',
    status: 'active',
  },
  {
    id: '3',
    name: '박서준',
    email: 'parkseojun@example.com',
    password: 'myPass890',
    gender: '남성',
    joinDate: '2025-12-02',
    status: 'active',
  },
  {
    id: '4',
    name: '최유진',
    email: 'choiyujin@example.com',
    password: 'pwd!2024',
    gender: '여성',
    joinDate: '2025-12-02',
    status: 'pending',
  },
  {
    id: '5',
    name: '정하늘',
    email: 'junghaneul@example.com',
    password: 'test@123',
    gender: '기타',
    joinDate: '2025-12-02',
    status: 'active',
  },
  {
    id: '6',
    name: '강민지',
    email: 'kangminji@example.com',
    password: 'hello!456',
    gender: '여성',
    joinDate: '2025-12-01',
    status: 'active',
  },
  {
    id: '7',
    name: '윤태양',
    email: 'yuntaeyang@example.com',
    password: 'sun#789',
    gender: '남성',
    joinDate: '2025-12-01',
    status: 'pending',
  },
];
