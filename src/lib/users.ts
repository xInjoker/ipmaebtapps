
export type UserRole = 'super-user' | 'project-manager';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
};

export const initialUsers: User[] = [
  { id: 1, name: 'Super User', email: 'superuser@example.com', role: 'super-user', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 2, name: 'Project Manager', email: 'pm@example.com', role: 'project-manager', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 3, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'project-manager', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 4, name: 'John Smith', email: 'john.smith@example.com', role: 'project-manager', avatarUrl: 'https://placehold.co/40x40.png' },
];
