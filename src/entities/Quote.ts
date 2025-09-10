import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type QuoteStatus = 'pending' | 'scheduled' | 'posted' | 'rejected';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @Column('varchar', { length: 50 })
  llmSource!: string;

  @Column('varchar', { nullable: true })
  twitterHandle?: string;

  @Column({
    type: 'varchar',
    default: 'pending',
  })
  status!: QuoteStatus;

  @Index({ unique: true })
  @Column('varchar')
  slug!: string;

  @Column('timestamp', { nullable: true })
  scheduledFor?: Date;

  @Column('varchar', { nullable: true })
  tweetId?: string;

  @Column('int', { default: 0 })
  views!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column('timestamp', { nullable: true })
  postedAt?: Date;
}
