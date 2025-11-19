export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed';
  startDate: string;
  endDate?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  department: string;
  assignedUserId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  taskId: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
  createdAt: string;
}

export interface WikiPage {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
