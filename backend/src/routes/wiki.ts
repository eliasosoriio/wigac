import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';

const router = Router();

router.use(authenticate);

// Get all wiki pages
router.get('/', async (req, res) => {
  try {
    const { wikiPages: wikiRepository } = getRepositories();
    const { projectId } = req.query;
    const where = projectId ? { projectId: parseInt(projectId as string) } : {};

    const pages = await wikiRepository.find({
      where,
      relations: ['project'],
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
      relations: ['project']
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
    const { title, content, projectId } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const page = wikiRepository.create({
      title,
      slug,
      content,
      projectId: projectId ? parseInt(projectId) : undefined
    });

    await wikiRepository.save(page);
    res.status(201).json(page);
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
