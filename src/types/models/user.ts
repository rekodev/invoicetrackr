export type UserModel = {
  id: number;
  name: string;
  role: string;
  team: string;
  status: UserStatus;
  age: string;
  avatar: string;
  email: string;
};

export type UserStatus = 'active' | 'paused' | 'vacation';
