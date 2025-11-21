import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';

const router = Router();

router.use(authenticate);

// Get all wiki pages
router.get('/', async (req, res) => {
  try {
    const { wikiPages: wikiRepository } = getRepositories();
    const { projectId, taskId } = req.query;

    let where: any = {};
    if (projectId) where.projectId = parseInt(projectId as string);
    if (taskId) where.taskId = parseInt(taskId as string);

    const pages = await wikiRepository.find({
      where,
      relations: ['project', 'task'],
      order: { createdAt: 'DESC' }
    });

    res.json(pages);
  } catch (error) {
    console.error('Get wiki pages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get wiki page by ID
router.get('/:id', async (req, res) => {
  try {
    const { wikiPages: wikiRepository } = getRepositories();
    const { id } = req.params;
    const page = await wikiRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['project', 'task']
    });

    if (!page) {
      return res.status(404).json({ message: 'Wiki page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Get wiki page error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create wiki page
router.post('/', async (req, res) => {
  try {
    const { wikiPages: wikiRepository } = getRepositories();
    const { title, content, projectId, taskId } = req.body;

    // Generate unique slug
    let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    let counter = 1;
    let uniqueSlug = slug;

    // Check if slug exists and make it unique
    while (await wikiRepository.findOne({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const page = wikiRepository.create({
      title,
      slug: uniqueSlug,
      content,
      projectId: projectId ? parseInt(projectId) : undefined,
      taskId: taskId ? parseInt(taskId) : undefined
    });

    await wikiRepository.save(page);

    // Fetch with relations
    const savedPage = await wikiRepository.findOne({
      where: { id: page.id },
      relations: ['project', 'task']
    });

    res.status(201).json(savedPage);
  } catch (error) {
    console.error('Create wiki page error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update wiki page
router.put('/:id', async (req, res) => {
  try {
    const { wikiPages: wikiRepository } = getRepositories();
    const { id } = req.params;
    const { title, content } = req.body;

    const page = await wikiRepository.findOne({ where: { id: parseInt(id) } });
    if (!page) {
      return res.status(404).json({ message: 'Wiki page not found' });
    }

    if (title) {
      page.title = title;
      page.slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (content !== undefined) page.content = content;

    await wikiRepository.save(page);
    res.json(page);
  } catch (error) {
    console.error('Update wiki page error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete wiki page
router.delete('/:id', async (req, res) => {
  try {
    const { wikiPages: wikiRepository } = getRepositories();
    const { id } = req.params;
    await wikiRepository.delete({ id: parseInt(id) });
    res.json({ message: 'Wiki page deleted successfully' });
  } catch (error) {
    console.error('Delete wiki page error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
