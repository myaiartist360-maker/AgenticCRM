import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type MemoryEpisodeType =
  | 'conversation'
  | 'action'
  | 'observation'
  | 'tool_result';

@Entity({ name: 'aiMemoryEpisode', schema: 'core' })
@Index(['workspaceId', 'threadId'])
@Index(['workspaceId', 'userId'])
export class AiMemoryEpisodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  threadId: string | null;

  @Column({ type: 'varchar', length: 50, default: 'conversation' })
  type: MemoryEpisodeType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  // pgvector embedding stored as text; cast in queries
  @Column({ type: 'text', nullable: true })
  embedding: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
