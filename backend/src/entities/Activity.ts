import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from './Task';
import { User } from './User';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'float' })
  hours!: number;

  @Column({ type: 'text' })
  description!: string;

  @ManyToOne(() => Task, (task) => task.activities)
  @JoinColumn({ name: 'taskId' })
  task!: Task;

  @Column()
  taskId!: number;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
