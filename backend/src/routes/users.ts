import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all users
router.get('/', async (req, res) => {
  try {
    const { users: userRepository } = getRepositories();
    const users = await userRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { users: userRepository } = getRepositories();
    const { id } = req.params;
    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
