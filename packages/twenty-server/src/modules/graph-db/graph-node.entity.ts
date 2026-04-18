import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'graphNode', schema: 'core' })
@Index(['workspaceId'])
@Index(['entityType'])
@Index(['workspaceId', 'entityType', 'entityId'], { unique: true })
export class GraphNodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'varchar', length: 100 })
  entityType: string;

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'jsonb', default: {} })
  properties: Record<string, unknown>;

  // Stored as text to avoid TypeORM issues with pgvector; cast in queries
  @Column({ type: 'text', nullable: true })
  embedding: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
