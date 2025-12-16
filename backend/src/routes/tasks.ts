import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';
import { TaskStatus, TaskPriority } from '../entities/Task';
import { Between } from 'typeorm';

const router = Router();

router.use(authenticate);

// Get all tasks with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const userId = req.user!.id;
    const { projectId, status, priority, date } = req.query;

    let query = taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.subtasks', 'subtask')
      .where('task.assignedUserId = :userId', { userId });

    if (projectId) {
      query = query.andWhere('task.projectId = :projectId', { projectId: parseInt(projectId as string) });
    }
    if (status) {
      query = query.andWhere('task.status = :status', { status });
    }
    if (priority) {
      query = query.andWhere('task.priority = :priority', { priority });
    }

    // Filter by subtask workDate if date parameter is provided
    if (date) {
      query = query.andWhere('subtask.workDate = :date', { date });
    }

    const tasks = await query
      .orderBy('task.id', 'DESC')
      .getMany();

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tasks by date range (for reports)
router.get('/range', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const tasks = await taskRepository.find({
      where: {
        assignedUserId: userId,
        workDate: Between(new Date(startDate as string), new Date(endDate as string))
      },
      relations: ['project', 'subtasks'],
      order: { workDate: 'ASC', startTime: 'ASC' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks range error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get task by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { id } = req.params;
    const userId = req.user!.id;

    const task = await taskRepository.findOne({
      where: { id: parseInt(id), assignedUserId: userId },
      relations: ['project', 'subtasks']
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
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const userId = req.user!.id;
    const { title, description, status, priority, workDate, startTime, endTime, projectId } = req.body;

    // Calculate time spent
    let timeSpentMinutes: number | undefined = undefined;
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      timeSpentMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    }

    const task = taskRepository.create({
      title,
      description,
      status: status || TaskStatus.PENDING,
      priority: priority || TaskPriority.MEDIUM,
      workDate: workDate ? new Date(workDate) : undefined,
      startTime,
      endTime,
      timeSpentMinutes,
      assignedUserId: userId
    });

    if (projectId) {
      task.projectId = parseInt(projectId);
    }    await taskRepository.save(task);

    const savedTask = await taskRepository.findOne({
      where: { id: task.id },
      relations: ['project']
    });

    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, description, status, priority, workDate, startTime, endTime, projectId } = req.body;

    const task = await taskRepository.findOne({
      where: { id: parseInt(id), assignedUserId: userId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to edit it' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (workDate !== undefined) task.workDate = workDate ? new Date(workDate) : undefined;
    if (startTime !== undefined) task.startTime = startTime;
    if (endTime !== undefined) task.endTime = endTime;
    if (projectId !== undefined) task.projectId = projectId ? parseInt(projectId) : null as any;

    // Recalculate time spent
    if (task.startTime && task.endTime) {
      const [startHour, startMin] = task.startTime.split(':').map(Number);
      const [endHour, endMin] = task.endTime.split(':').map(Number);
      task.timeSpentMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    }

    await taskRepository.save(task);

    const updatedTask = await taskRepository.findOne({
      where: { id: task.id },
      relations: ['project']
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task status only
router.patch('/:id/status', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const task = await taskRepository.findOne({
      where: { id: parseInt(id), assignedUserId: userId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await taskRepository.save(task);

    const updatedTask = await taskRepository.findOne({
      where: { id: task.id },
      relations: ['project']
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task map position
router.patch('/:id/position', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository } = getRepositories();
    const { id } = req.params;
    const { mapPositionX, mapPositionY } = req.body;
    const userId = req.user!.id;

    const task = await taskRepository.findOne({
      where: { id: parseInt(id), assignedUserId: userId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.mapPositionX = mapPositionX;
    task.mapPositionY = mapPositionY;
    await taskRepository.save(task);

    res.json(task);
  } catch (error) {
    console.error('Update task position error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { tasks: taskRepository} = getRepositories();
    const { id } = req.params;
    const userId = req.user!.id;

    const task = await taskRepository.findOne({
      where: { id: parseInt(id), assignedUserId: userId }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or you do not have permission to delete it' });
    }

    await taskRepository.delete({ id: parseInt(id) });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
