import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from './Task';

@Entity('subtasks')
export class Subtask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'date' })
  workDate!: Date;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: 'int' })
  timeSpentMinutes!: number;

  @ManyToOne(() => Task, (task) => task.subtasks)
  @JoinColumn({ name: 'taskId' })
  task!: Task;

  @Column()
  taskId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
