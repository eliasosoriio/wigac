import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authenticate, AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const router = Router();

router.use(authenticate);

// Generate and download database backup
router.get('/download', async (req: AuthRequest, res) => {
  try {
    // Use the same environment variables as data-source.ts
    const dbHost = process.env.DB_HOST || 'postgres';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.POSTGRES_DB || 'wigac_db';
    const dbUser = process.env.POSTGRES_USER || 'wigac_user';
    const dbPassword = process.env.POSTGRES_PASSWORD || 'wigac_password';

    // Generate filename with format: yyyymmdd_hhmm_dbname.sql
    // Use Madrid timezone (Europe/Madrid)
    const date = new Date();
    const madridDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const year = madridDate.getFullYear();
    const month = String(madridDate.getMonth() + 1).padStart(2, '0');
    const day = String(madridDate.getDate()).padStart(2, '0');
    const hours = String(madridDate.getHours()).padStart(2, '0');
    const minutes = String(madridDate.getMinutes()).padStart(2, '0');
    const filename = `${year}${month}${day}_${hours}${minutes}_${dbName}.sql`;
    const filepath = path.join('/tmp', filename);

    // Create pg_dump command
    const dumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f ${filepath}`;

    console.log('Generating database backup...');

    // Execute pg_dump
    await execAsync(dumpCommand);

    // Check if file was created
    if (!fs.existsSync(filepath)) {
      throw new Error('Backup file was not created');
    }

    console.log('Backup generated successfully:', filename);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filepath);

    fileStream.pipe(res);

    // Clean up after sending
    fileStream.on('end', () => {
      fs.unlinkSync(filepath);
      console.log('Backup file cleaned up');
    });

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error sending backup file' });
      }
    });

  } catch (error: any) {
    console.error('Backup error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        message: 'Error generating backup',
        error: error.message
      });
    }
  }
});

export default router;
