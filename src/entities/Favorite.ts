import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  // Internal user UUID (FK to users.id)
  @Index('IDX_favorites_userId')
  @Column('uuid')
  userId!: string;

  // Quote foreign key
  @Index('IDX_favorites_quoteId')
  @Column('int')
  quoteId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
