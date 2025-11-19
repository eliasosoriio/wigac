import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { Task } from '../entities/Task';
import { Activity } from '../entities/Activity';
import { WikiPage } from '../entities/WikiPage';

export const getRepositories = () => ({
  users: AppDataSource.getRepository(User),
  projects: AppDataSource.getRepository(Project),
  tasks: AppDataSource.getRepository(Task),
  activities: AppDataSource.getRepository(Activity),
  wikiPages: AppDataSource.getRepository(WikiPage),
});
