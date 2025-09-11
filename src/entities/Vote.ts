import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index('IDX_votes_userId')
  @Column('uuid')
  userId!: string;

  @Index('IDX_votes_quoteId')
  @Column('int')
  quoteId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

