export type User = { id: string; name: string; email: string; timezone: string };
export type AuthResponse = { accessToken: string; user: User };
export type Course = { id: string; userId: string; code: string; name: string; color: string; createdAt?: string; updatedAt?: string };
export type Assignment = {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  dueAt: string;
  status: "pending" | "completed";
  notes: string;
  attachments: { id?: string; uri: string; fileName?: string }[];
  createdAt?: string;
  updatedAt?: string;
};
export type PaginatedAssignments = { items: Assignment[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
export type CourseProgress = { courseId: string; code: string; name: string; color: string; total: number; completed: number; pending: number; completionRate: number };
