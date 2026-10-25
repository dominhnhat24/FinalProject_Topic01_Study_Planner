// Có thể thay URL bằng API thực tế hoặc MockAPI của nhóm
const API_BASE_URL = 'https://650000000000000000000000.mockapi.io/api/v1';

export async function fetchCourses(token: string) {
  const res = await fetch(`${API_BASE_URL}/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải học phần');
  return res.json();
}

export async function fetchAssignments(token: string) {
  const res = await fetch(`${API_BASE_URL}/assignments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể tải bài tập');
  return res.json();
}

export async function createAssignment(token: string, data: { courseId: string; title: string; dueAt: string }) {
  const res = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, status: 'PENDING' }),
  });
  if (!res.ok) throw new Error('Tạo bài tập thất bại');
  return res.json();
}