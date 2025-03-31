export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  profilePic?: string;
  coverPic?: string;
  createdAt: Date;
}
