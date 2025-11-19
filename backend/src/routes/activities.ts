import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';
import { Between } from 'typeorm';

const router = Router();

router.use(authenticate);

// Get activities with date filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { activities: activityRepository } = getRepositories();
    const { date, startDate, endDate } = req.query;
    const userId = req.user!.id;

    const where: any = { userId };

    if (date) {
      where.date = new Date(date as string);
    } else if (startDate && endDate) {
      where.date = Between(new Date(startDate as string), new Date(endDate as string));
    }

    const activities = await activityRepository.find({
      where,
      relations: ['task', 'task.project'],
      order: { date: 'DESC' }
    });

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create activity
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { activities: activityRepository } = getRepositories();
    const { date, hours, description, taskId } = req.body;
    const userId = req.user!.id;

    const activity = activityRepository.create({
      date: new Date(date),
      hours,
      description,
      taskId: parseInt(taskId),
      userId
    });

    await activityRepository.save(activity);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete activity
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { activities: activityRepository } = getRepositories();
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const activity = await activityRepository.findOne({ where: { id: parseInt(id) } });
    if (!activity || activity.userId !== userId) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    await activityRepository.delete({ id: parseInt(id) });
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
