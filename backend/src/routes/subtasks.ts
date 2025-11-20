import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';

const router = Router();

router.use(authenticate);

// GET /api/subtasks?taskId=X - Obtener subtareas de una tarea o todas las subtareas del usuario
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { tasks, subtasks } = getRepositories();
    const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;

    // Si se proporciona taskId, obtener subtareas de esa tarea específica
    if (taskId) {
      // Verificar que la tarea pertenece al usuario
      const task = await tasks.findOne({
        where: { id: taskId, assignedUserId: req.user!.id },
      });

      if (!task) {
        return res.status(404).json({ message: 'Tarea no encontrada' });
      }

      // Obtener subtareas de la tarea
      const taskSubtasks = await subtasks.find({
        where: { taskId },
        order: { workDate: 'DESC', startTime: 'DESC' },
      });

      return res.json(taskSubtasks);
    }

    // Si no se proporciona taskId, obtener todas las subtareas del usuario
    const allSubtasks = await subtasks
      .createQueryBuilder('subtask')
      .leftJoinAndSelect('subtask.task', 'task')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.assignedUserId = :userId', { userId: req.user!.id })
      .orderBy('subtask.workDate', 'DESC')
      .addOrderBy('subtask.startTime', 'ASC')
      .getMany();

    res.json(allSubtasks);
  } catch (error) {
    console.error('Error al obtener subtareas:', error);
    res.status(500).json({ message: 'Error al obtener subtareas' });
  }
});

// POST /api/subtasks - Crear subtarea
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { tasks, subtasks } = getRepositories();
    const { taskId, description, workDate, startTime, endTime } = req.body;

    // Validar campos requeridos
    if (!taskId || !description || !workDate || !startTime || !endTime) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar que la tarea pertenece al usuario
    const task = await tasks.findOne({
      where: { id: taskId, assignedUserId: req.user!.id },
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Calcular timeSpentMinutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const timeSpentMinutes = endTotalMinutes - startTotalMinutes;

    if (timeSpentMinutes <= 0) {
      return res.status(400).json({ message: 'La hora de fin debe ser posterior a la hora de inicio' });
    }

    // Crear subtarea
    const subtask = subtasks.create({
      taskId,
      description,
      workDate: new Date(workDate),
      startTime,
      endTime,
      timeSpentMinutes,
    });

    await subtasks.save(subtask);

    res.status(201).json(subtask);
  } catch (error) {
    console.error('Error al crear subtarea:', error);
    res.status(500).json({ message: 'Error al crear subtarea' });
  }
});

// PUT /api/subtasks/:id - Actualizar subtarea
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { tasks, subtasks } = getRepositories();
    const subtaskId = parseInt(req.params.id);
    const { description, workDate, startTime, endTime } = req.body;

    // Buscar subtarea
    const subtask = await subtasks.findOne({
      where: { id: subtaskId },
      relations: ['task'],
    });

    if (!subtask) {
      return res.status(404).json({ message: 'Subtarea no encontrada' });
    }

    // Verificar que la tarea pertenece al usuario
    const task = await tasks.findOne({
      where: { id: subtask.taskId, assignedUserId: req.user!.id },
    });

    if (!task) {
      return res.status(403).json({ message: 'No tienes permiso para modificar esta subtarea' });
    }

    // Actualizar campos
    if (description !== undefined) subtask.description = description;
    if (workDate !== undefined) subtask.workDate = new Date(workDate);
    if (startTime !== undefined) subtask.startTime = startTime;
    if (endTime !== undefined) subtask.endTime = endTime;

    // Recalcular timeSpentMinutes si se cambiaron las horas
    if (startTime !== undefined || endTime !== undefined) {
      const [startHour, startMinute] = subtask.startTime.split(':').map(Number);
      const [endHour, endMinute] = subtask.endTime.split(':').map(Number);
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const timeSpentMinutes = endTotalMinutes - startTotalMinutes;

      if (timeSpentMinutes <= 0) {
        return res.status(400).json({ message: 'La hora de fin debe ser posterior a la hora de inicio' });
      }

      subtask.timeSpentMinutes = timeSpentMinutes;
    }

    await subtasks.save(subtask);

    res.json(subtask);
  } catch (error) {
    console.error('Error al actualizar subtarea:', error);
    res.status(500).json({ message: 'Error al actualizar subtarea' });
  }
});

// DELETE /api/subtasks/:id - Eliminar subtarea
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { tasks, subtasks } = getRepositories();
    const subtaskId = parseInt(req.params.id);

    // Buscar subtarea
    const subtask = await subtasks.findOne({
      where: { id: subtaskId },
    });

    if (!subtask) {
      return res.status(404).json({ message: 'Subtarea no encontrada' });
    }

    // Verificar que la tarea pertenece al usuario
    const task = await tasks.findOne({
      where: { id: subtask.taskId, assignedUserId: req.user!.id },
    });

    if (!task) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta subtarea' });
    }

    await subtasks.remove(subtask);

    res.json({ message: 'Subtarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar subtarea:', error);
    res.status(500).json({ message: 'Error al eliminar subtarea' });
  }
});

export default router;
