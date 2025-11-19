import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';
import { TaskStatus, TaskPriority } from '../entities/Task';

const router = Router();

router.use(authenticate);

// Get all tasks with filters
router.get('/', async (req, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { projectId, status, priority, assignedUserId } = req.query;
    const where: any = {};

    if (projectId) where.projectId = parseInt(projectId as string);
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedUserId) where.assignedUserId = parseInt(assignedUserId as string);

    const tasks = await taskRepository.find({
      where,
      relations: ['project', 'assignedUser', 'activities']
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { id } = req.params;
    const task = await taskRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['project', 'assignedUser', 'activities']
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { title, description, status, priority, department, startDate, dueDate, projectId, assignedUserId } = req.body;

    const task = taskRepository.create({
      title,
      description,
      status: status || TaskStatus.TODO,
      priority: priority || TaskPriority.MEDIUM,
      department,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId: parseInt(projectId),
      assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined
    });

    await taskRepository.save(task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { id } = req.params;
    const { title, description, status, priority, department, startDate, dueDate, assignedUserId } = req.body;

    const task = await taskRepository.findOne({ where: { id: parseInt(id) } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (department !== undefined) task.department = department;
    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : undefined;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (assignedUserId !== undefined) task.assignedUserId = assignedUserId ? parseInt(assignedUserId) : undefined;

    await taskRepository.save(task);
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { tasks: taskRepository} = getRepositories();
    const { id } = req.params;
    await taskRepository.delete({ id: parseInt(id) });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
