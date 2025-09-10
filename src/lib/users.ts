import type { DataSource } from 'typeorm';
import { User as UserEntity } from '@/entities/User';

export async function getOrCreateUserByClerkId(dataSource: DataSource, clerkId: string): Promise<UserEntity> {
  const userRepo = dataSource.getRepository(UserEntity);
  const existing = await userRepo.findOne({ where: { clerkId } });
  if (existing) {
    existing.deletedAt = null;
    existing.lastSeenAt = new Date();
    return await userRepo.save(existing);
  }
  const created = userRepo.create({ clerkId } as Partial<UserEntity>);
  created.deletedAt = null;
  created.lastSeenAt = new Date();
  return await userRepo.save(created);
}

export async function findUserByClerkId(dataSource: DataSource, clerkId: string): Promise<UserEntity | null> {
  const userRepo = dataSource.getRepository(UserEntity);
  return userRepo.findOne({ where: { clerkId } });
}
