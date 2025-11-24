import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('quick_notes')
export class QuickNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  userId!: number;

  @OneToOne(() => User, user => user.quickNote)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
