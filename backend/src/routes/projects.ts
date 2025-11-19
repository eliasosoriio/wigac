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
    const userId = req.user!.id;

    const projects = await projectRepository.find({
      where: { createdById: userId },
      relations: ['tasks'],
      order: { createdAt: 'DESC' }
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get project by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await projectRepository.findOne({
      where: { id: parseInt(id), createdById: userId },
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
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { name, description, status, color, startDate, endDate } = req.body;
    const userId = req.user!.id;

    const project = projectRepository.create({
      name,
      description,
      status: status || ProjectStatus.ACTIVE,
      color,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdById: userId
    });

    await projectRepository.save(project);
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update project
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { id } = req.params;
    const { name, description, status, color, startDate, endDate } = req.body;
    const userId = req.user!.id;

    const project = await projectRepository.findOne({
      where: { id: parseInt(id), createdById: userId }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to edit it' });
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
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { projects: projectRepository } = getRepositories();
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await projectRepository.findOne({
      where: { id: parseInt(id), createdById: userId }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or you do not have permission to delete it' });
    }

    await projectRepository.delete({ id: parseInt(id) });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
