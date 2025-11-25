import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Project } from './entities/Project';
import { Task } from './entities/Task';
import { Activity } from './entities/Activity';
import { WikiPage } from './entities/WikiPage';
import { Subtask } from './entities/Subtask';
import { QuickNote } from './entities/QuickNote';
import { RegacLog } from './entities/RegacLog';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'wigac_user',
  password: process.env.POSTGRES_PASSWORD || 'wigac_password',
  database: process.env.POSTGRES_DB || 'wigac_db',
  synchronize: true, // Auto-create tables (disable in production)
  logging: false,
  entities: [User, Project, Task, Activity, WikiPage, Subtask, QuickNote, RegacLog],
  migrations: [],
  subscribers: [],
});
