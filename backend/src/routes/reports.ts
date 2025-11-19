import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getRepositories } from '../utils/repositories';
import { generatePDF, ReportData } from '../services/pdf.service';
import { sendEmail } from '../services/email.service';
import { format } from 'date-fns';
import { Between } from 'typeorm';

const router = Router();

router.use(authenticate);

// Generate daily report PDF
router.get('/daily', async (req: AuthRequest, res) => {
  try {
    const { users: userRepository, activities: activityRepository } = getRepositories();
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;

    // Get user
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get activities for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await activityRepository.find({
      where: {
        userId,
        date: Between(startOfDay, endOfDay)
      },
      relations: ['task', 'task.project']
    });

    // Prepare data
    const reportData: ReportData = {
      userName: user.name,
      date: format(date, 'dd/MM/yyyy'),
      activities: activities.map(a => ({
        task: a.task.title,
        project: a.task.project.name,
        hours: a.hours,
        description: a.description || ''
      })),
      totalHours: activities.reduce((sum: number, a) => sum + a.hours, 0)
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(reportData);

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="parte-trabajo-${format(date, 'yyyy-MM-dd')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send daily report by email
router.post('/daily/send', async (req: AuthRequest, res) => {
  try {
    const { users: userRepository, activities: activityRepository } = getRepositories();
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const email = (req.query.email as string) || req.user?.email;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get activities
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await activityRepository.find({
      where: {
        userId,
        date: Between(startOfDay, endOfDay)
      },
      relations: ['task', 'task.project']
    });

    // Prepare data
    const reportData: ReportData = {
      userName: user.name,
      date: format(date, 'dd/MM/yyyy'),
      activities: activities.map(a => ({
        task: a.task.title,
        project: a.task.project.name,
        hours: a.hours,
        description: a.description || ''
      })),
      totalHours: activities.reduce((sum: number, a) => sum + a.hours, 0)
    };

    // Generate PDF
    const pdfBuffer = await generatePDF(reportData);

    // Send email
    await sendEmail({
      to: email,
      subject: `Parte de Trabajo - ${format(date, 'dd/MM/yyyy')}`,
      text: `Adjunto parte de trabajo del día ${format(date, 'dd/MM/yyyy')}`,
      attachments: [
        {
          filename: `parte-trabajo-${format(date, 'yyyy-MM-dd')}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    res.json({ message: 'Report sent successfully' });
  } catch (error) {
    console.error('Send report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
