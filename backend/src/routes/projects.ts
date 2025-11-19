import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';
import { ProjectStatus } from '../entities/Project';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { userId } = req.query;
    const where = userId ? { createdById: parseInt(userId as string) } : {};

    const projects = await projectRepository.find({ where });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { id } = req.params;
    const project = await projectRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['tasks', 'wikiPages']
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { name, description, status, color, startDate, endDate } = req.body;

    const project = projectRepository.create({
      name,
      description,
      status: status || ProjectStatus.ACTIVE,
      color,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    await projectRepository.save(project);
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { id } = req.params;
    const { name, description, status, color, startDate, endDate } = req.body;

    const project = await projectRepository.findOne({ where: { id: parseInt(id) } });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (color) project.color = color;
    if (startDate !== undefined) project.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) project.endDate = endDate ? new Date(endDate) : undefined;

    await projectRepository.save(project);
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { id } = req.params;
    await projectRepository.delete({ id: parseInt(id) });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
