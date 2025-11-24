import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { QuickNote } from '../entities/QuickNote';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const quickNoteRepository = AppDataSource.getRepository(QuickNote);

// Obtener nota rápida del usuario
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    let quickNote = await quickNoteRepository.findOne({
      where: { userId },
    });

    // Si no existe, crear una vacía
    if (!quickNote) {
      quickNote = quickNoteRepository.create({
        userId,
        content: '',
      });
      await quickNoteRepository.save(quickNote);
    }

    res.json(quickNote);
  } catch (error) {
    console.error('Error fetching quick note:', error);
    res.status(500).json({ error: 'Error al obtener la nota rápida' });
  }
});

// Guardar/actualizar nota rápida
router.put('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'El contenido debe ser un texto' });
    }

    let quickNote = await quickNoteRepository.findOne({
      where: { userId },
    });

    if (quickNote) {
      // Actualizar existente
      quickNote.content = content;
      await quickNoteRepository.save(quickNote);
    } else {
      // Crear nueva
      quickNote = quickNoteRepository.create({
        userId,
        content,
      });
      await quickNoteRepository.save(quickNote);
    }

    res.json(quickNote);
  } catch (error) {
    console.error('Error saving quick note:', error);
    res.status(500).json({ error: 'Error al guardar la nota rápida' });
  }
});

export default router;
