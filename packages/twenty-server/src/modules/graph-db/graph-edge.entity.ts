import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { GraphNodeEntity } from 'src/modules/graph-db/graph-node.entity';

@Entity({ name: 'graphEdge', schema: 'core' })
@Index(['workspaceId'])
@Index(['sourceNodeId'])
@Index(['targetNodeId'])
@Index(['workspaceId', 'relationshipType'])
export class GraphEdgeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'uuid' })
  sourceNodeId: string;

  @Column({ type: 'uuid' })
  targetNodeId: string;

  @Column({ type: 'varchar', length: 100 })
  relationshipType: string;

  @Column({ type: 'jsonb', default: {} })
  properties: Record<string, unknown>;

  @ManyToOne(() => GraphNodeEntity, { onDelete: 'CASCADE' })
  sourceNode: GraphNodeEntity;

  @ManyToOne(() => GraphNodeEntity, { onDelete: 'CASCADE' })
  targetNode: GraphNodeEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
