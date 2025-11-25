import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { RegacLog } from '../entities/RegacLog';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const regacLogRepository = AppDataSource.getRepository(RegacLog);

// Obtener estado de registro para una fecha específica
router.get('/:date', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { date } = req.params;

    const log = await regacLogRepository.findOne({
      where: { userId, workDate: date },
    });

    res.json({
      registered: log?.registered || false
    });
  } catch (error) {
    console.error('Error fetching regac log:', error);
    res.status(500).json({ error: 'Error al obtener el estado de Regac' });
  }
});

// Obtener múltiples estados de registro
router.post('/batch', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { dates } = req.body;

    if (!Array.isArray(dates)) {
      return res.status(400).json({ error: 'Se requiere un array de fechas' });
    }

    const logs = await regacLogRepository
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.workDate IN (:...dates)', { dates })
      .getMany();

    const result: { [date: string]: boolean } = {};
    dates.forEach(date => {
      const log = logs.find(l => l.workDate === date);
      result[date] = log?.registered || false;
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching batch regac logs:', error);
    res.status(500).json({ error: 'Error al obtener los estados de Regac' });
  }
});

// Actualizar estado de registro para una fecha
router.put('/:date', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { date } = req.params;
    const { registered } = req.body;

    if (typeof registered !== 'boolean') {
      return res.status(400).json({ error: 'El estado debe ser booleano' });
    }

    let log = await regacLogRepository.findOne({
      where: { userId, workDate: date },
    });

    if (log) {
      log.registered = registered;
      await regacLogRepository.save(log);
    } else {
      log = regacLogRepository.create({
        userId,
        workDate: date,
        registered,
      });
      await regacLogRepository.save(log);
    }

    res.json(log);
  } catch (error) {
    console.error('Error updating regac log:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de Regac' });
  }
});

export default router;
