import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'aiKnowledgeChunk', schema: 'core' })
@Index(['sourceFile'])
export class AiKnowledgeChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // NULL = global knowledge applicable to all workspaces
  @Column({ type: 'uuid', nullable: true })
  workspaceId: string | null;

  @Column({ type: 'varchar', length: 500 })
  sourceFile: string;

  @Column({ type: 'integer' })
  chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  // pgvector embedding stored as text; cast in queries
  @Column({ type: 'text', nullable: true })
  embedding: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
