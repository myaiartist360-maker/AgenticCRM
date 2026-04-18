import { Injectable, Logger } from '@nestjs/common';

import { GraphDbService } from 'src/modules/graph-db/graph-db.service';
import { AiKnowledgeChunkEntity } from 'src/modules/ai-memory/ai-knowledge-chunk.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type SemanticSearchResult = {
  id: string;
  content: string;
  sourceType: 'entity' | 'knowledge';
  sourceFile?: string;
  entityType?: string;
  entityId?: string;
  similarity: number;
  metadata: Record<string, unknown>;
};

@Injectable()
export class SemanticMemoryService {
  private readonly logger = new Logger(SemanticMemoryService.name);

  constructor(
    private readonly graphDbService: GraphDbService,
    @InjectRepository(AiKnowledgeChunkEntity)
    private readonly chunkRepository: Repository<AiKnowledgeChunkEntity>,
  ) {}

  // Search across CRM entity graph nodes by semantic similarity
  async searchEntities(
    workspaceId: string,
    embedding: number[],
    limit = 10,
    entityTypes?: string[],
  ): Promise<SemanticSearchResult[]> {
    try {
      const nodes = await this.graphDbService.findSimilarNodes(
        workspaceId,
        embedding,
        limit,
        entityTypes,
      );

      return nodes.map((node) => ({
        id: node.id,
        content: JSON.stringify(node.properties),
        sourceType: 'entity' as const,
        entityType: node.entityType,
        entityId: node.entityId,
        similarity: (node as typeof node & { similarity: number }).similarity,
        metadata: node.properties,
      }));
    } catch (error) {
      this.logger.warn('Entity semantic search failed', error);

      return [];
    }
  }

  // Search the MD knowledge base chunks
  async searchKnowledge(
    embedding: number[],
    limit = 5,
    workspaceId?: string,
  ): Promise<SemanticSearchResult[]> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const workspaceFilter = workspaceId
      ? `AND (k."workspaceId" = '${workspaceId}' OR k."workspaceId" IS NULL)`
      : `AND k."workspaceId" IS NULL`;

    try {
      const rows: Array<AiKnowledgeChunkEntity & { similarity: number }> =
        await this.chunkRepository.manager.query(
          `
          SELECT k.*, 1 - (k.embedding <=> $1::vector) AS similarity
          FROM "core"."aiKnowledgeChunk" k
          WHERE k.embedding IS NOT NULL
            ${workspaceFilter}
          ORDER BY k.embedding <=> $1::vector
          LIMIT $2
          `,
          [vectorLiteral, limit],
        );

      return rows.map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        sourceType: 'knowledge' as const,
        sourceFile: chunk.sourceFile,
        similarity: chunk.similarity,
        metadata: chunk.metadata,
      }));
    } catch (error) {
      this.logger.warn('Knowledge semantic search failed (pgvector may be unavailable)', error);

      return [];
    }
  }

  // Combined search: entities + knowledge chunks
  async search(
    workspaceId: string,
    embedding: number[],
    options: {
      entityLimit?: number;
      knowledgeLimit?: number;
      entityTypes?: string[];
    } = {},
  ): Promise<SemanticSearchResult[]> {
    const [entityResults, knowledgeResults] = await Promise.all([
      this.searchEntities(workspaceId, embedding, options.entityLimit ?? 8, options.entityTypes),
      this.searchKnowledge(embedding, options.knowledgeLimit ?? 4, workspaceId),
    ]);

    return [...entityResults, ...knowledgeResults].sort(
      (a, b) => b.similarity - a.similarity,
    );
  }
}
