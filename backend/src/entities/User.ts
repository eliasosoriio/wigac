import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Project } from './Project';
import { Task } from './Task';
import { Activity } from './Activity';
import { QuickNote } from './QuickNote';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Project, (project) => project.createdBy)
  projects!: Project[];

  @OneToMany(() => Task, (task) => task.assignedUser)
  tasks!: Task[];

  @OneToMany(() => Activity, (activity) => activity.user)
  activities!: Activity[];

  @OneToOne(() => QuickNote, (quickNote) => quickNote.user)
  quickNote?: QuickNote;
}
