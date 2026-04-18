import { Injectable, Logger } from '@nestjs/common';

import { EpisodicMemoryService } from 'src/modules/ai-memory/episodic-memory.service';

export type AgentActionType =
  | 'search'
  | 'create'
  | 'update'
  | 'delete'
  | 'stage_change'
  | 'bulk_update'
  | 'task_complete'
  | 'note_log';

export type AgentAuditEntry = {
  workspaceId: string;
  userId?: string;
  agentId?: string;
  threadId?: string;
  actionType: AgentActionType;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AgentAuditService {
  private readonly logger = new Logger(AgentAuditService.name);

  constructor(
    private readonly episodicMemory: EpisodicMemoryService,
  ) {}

  async logAction(entry: AgentAuditEntry): Promise<void> {
    try {
      await this.episodicMemory.store({
        workspaceId: entry.workspaceId,
        userId: entry.userId,
        agentId: entry.agentId,
        threadId: entry.threadId,
        type: 'action',
        content: this.formatAuditContent(entry),
        metadata: {
          actionType: entry.actionType,
          entityType: entry.entityType,
          entityId: entry.entityId,
          ...entry.metadata,
        },
      });
    } catch (error) {
      // Audit logging must never block the main flow
      this.logger.error('Failed to log agent action', error);
    }
  }

  async getAuditLog(
    workspaceId: string,
    options: {
      userId?: string;
      threadId?: string;
      entityType?: string;
      limit?: number;
    } = {},
  ): Promise<Array<{
    id: string;
    actionType: string;
    entityType: string;
    entityId: string | undefined;
    summary: string;
    createdAt: Date;
    userId: string | null;
  }>> {
    const episodes = options.threadId
      ? await this.episodicMemory.getThreadHistory(
          workspaceId,
          options.threadId,
          options.limit ?? 50,
        )
      : await this.episodicMemory.getRecentActions(
          workspaceId,
          options.userId ?? '',
          options.limit ?? 50,
        );

    return episodes
      .filter((e) => e.type === 'action')
      .filter((e) =>
        options.entityType
          ? (e.metadata as Record<string, unknown>)?.['entityType'] === options.entityType
          : true,
      )
      .map((e) => ({
        id: e.id,
        actionType: String((e.metadata as Record<string, unknown>)?.['actionType'] ?? 'unknown'),
        entityType: String((e.metadata as Record<string, unknown>)?.['entityType'] ?? ''),
        entityId: (e.metadata as Record<string, unknown>)?.['entityId'] as string | undefined,
        summary: e.content,
        createdAt: e.createdAt,
        userId: e.userId,
      }));
  }

  private formatAuditContent(entry: AgentAuditEntry): string {
    const ts = new Date().toISOString();
    const actor = entry.userId ? `user:${entry.userId}` : `agent:${entry.agentId ?? 'system'}`;

    return `[${ts}] ${actor} performed ${entry.actionType} on ${entry.entityType}${entry.entityId ? `:${entry.entityId}` : ''} — ${entry.summary}`;
  }
}
