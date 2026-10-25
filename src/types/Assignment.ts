export interface Assignment {
  id: string;
  courseName: string;
  title: string;
  dueAt: string;
  status: 'PENDING' | 'COMPLETED';
  username: string;
}