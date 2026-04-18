import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'agentCapabilityRule', schema: 'core' })
@Index(['workspaceId'])
@Index(['workspaceId', 'agentId', 'entityType'], { unique: true })
export class AgentCapabilityRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  // NULL agentId = applies to all agents in the workspace
  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'varchar', length: 100 })
  entityType: string;

  @Column({ type: 'boolean', default: true })
  canRead: boolean;

  @Column({ type: 'boolean', default: false })
  canWrite: boolean;

  @Column({ type: 'boolean', default: false })
  canDelete: boolean;

  @Column({ type: 'boolean', default: false })
  canBulkOps: boolean;

  @Column({ type: 'integer', default: 50 })
  rateLimit: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
