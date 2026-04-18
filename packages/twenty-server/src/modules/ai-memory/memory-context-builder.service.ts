import { Injectable, Logger } from '@nestjs/common';

import { EpisodicMemoryService } from 'src/modules/ai-memory/episodic-memory.service';
import { KnowledgeLoaderService } from 'src/modules/ai-memory/knowledge-loader.service';
import { GraphDbService } from 'src/modules/graph-db/graph-db.service';

export type MemoryContextOptions = {
  workspaceId: string;
  userId?: string;
  threadId?: string;
  currentEntityType?: string;
  currentEntityId?: string;
};

@Injectable()
export class MemoryContextBuilderService {
  private readonly logger = new Logger(MemoryContextBuilderService.name);

  constructor(
    private readonly episodicMemory: EpisodicMemoryService,
    private readonly knowledgeLoader: KnowledgeLoaderService,
    private readonly graphDb: GraphDbService,
  ) {}

  async buildMemorySection(options: MemoryContextOptions): Promise<string> {
    const parts: string[] = [];

    // Graph context for the current entity being viewed
    if (options.currentEntityType && options.currentEntityId) {
      const graphContext = await this.buildGraphContext(
        options.workspaceId,
        options.currentEntityType,
        options.currentEntityId,
      );

      if (graphContext) {
        parts.push(graphContext);
      }
    }

    // Recent action history for this user
    if (options.userId) {
      const recentActions = await this.buildRecentActionsSection(
        options.workspaceId,
        options.userId,
      );

      if (recentActions) {
        parts.push(recentActions);
      }
    }

    // Relevant knowledge from the MD knowledge base
    const knowledgeSection = await this.buildKnowledgeSection(options.workspaceId);

    if (knowledgeSection) {
      parts.push(knowledgeSection);
    }

    if (parts.length === 0) return '';

    return `\n## CRM Intelligence Context\n\n${parts.join('\n\n')}`;
  }

  private async buildGraphContext(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<string | null> {
    try {
      const { node, outgoing, incoming } =
        await this.graphDb.getNodeWithRelationships(
          workspaceId,
          entityType,
          entityId,
        );

      if (!node) return null;

      const lines: string[] = [
        `### Entity Graph: ${entityType} (${entityId})`,
      ];

      if (outgoing.length > 0) {
        lines.push('**Outgoing relationships:**');
        for (const { edge, target } of outgoing.slice(0, 10)) {
          lines.push(
            `- [${edge.relationshipType}] → ${target.entityType} (${target.entityId})`,
          );
        }
      }

      if (incoming.length > 0) {
        lines.push('**Incoming relationships:**');
        for (const { edge, source } of incoming.slice(0, 10)) {
          lines.push(
            `- ${source.entityType} (${source.entityId}) → [${edge.relationshipType}]`,
          );
        }
      }

      if (outgoing.length === 0 && incoming.length === 0) {
        lines.push('No graph relationships found yet.');
      }

      return lines.join('\n');
    } catch (error) {
      this.logger.warn('Failed to build graph context', error);

      return null;
    }
  }

  private async buildRecentActionsSection(
    workspaceId: string,
    userId: string,
  ): Promise<string | null> {
    try {
      const actions = await this.episodicMemory.getRecentActions(
        workspaceId,
        userId,
        5,
      );

      if (actions.length === 0) return null;

      const lines = ['### Recent Agent Actions (this session)'];

      for (const action of actions) {
        const ts = new Date(action.createdAt).toISOString().substring(11, 19);

        lines.push(`- [${ts}] ${action.content}`);
      }

      return lines.join('\n');
    } catch (error) {
      this.logger.warn('Failed to build recent actions section', error);

      return null;
    }
  }

  private async buildKnowledgeSection(workspaceId: string): Promise<string | null> {
    try {
      // Load core workflow and rules documents as context
      const coreFiles = [
        'settings/agent-personality.md',
        'settings/capabilities.md',
      ];

      const parts: string[] = [];

      for (const file of coreFiles) {
        const chunks = await this.knowledgeLoader.getChunksForContext(file);

        if (Array.isArray(chunks) && chunks.length > 0) {
          parts.push(chunks.map((c) => c.content).join('\n'));
        }
      }

      if (parts.length === 0) return null;

      return `### Knowledge Base Context\n\n${parts.join('\n\n---\n\n')}`;
    } catch (error) {
      this.logger.warn('Failed to build knowledge section', error);

      return null;
    }
  }

  // Keyword-based knowledge retrieval for a given query (used before embedding is ready)
  async getRelevantKnowledge(query: string): Promise<string> {
    try {
      const chunks = await this.knowledgeLoader.keywordSearch(query, 3);

      if (chunks.length === 0) return '';

      const lines = ['### Relevant Procedures/Rules'];

      for (const chunk of chunks) {
        lines.push(`**${chunk.sourceFile}:**\n${chunk.content.substring(0, 400)}...`);
      }

      return lines.join('\n\n');
    } catch {
      return '';
    }
  }
}
