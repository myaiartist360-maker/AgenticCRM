import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AiMemoryEpisodeEntity,
  type MemoryEpisodeType,
} from 'src/modules/ai-memory/ai-memory-episode.entity';

export type EpisodeInput = {
  workspaceId: string;
  userId?: string;
  agentId?: string;
  threadId?: string;
  type: MemoryEpisodeType;
  content: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class EpisodicMemoryService {
  private readonly logger = new Logger(EpisodicMemoryService.name);

  constructor(
    @InjectRepository(AiMemoryEpisodeEntity)
    private readonly episodeRepository: Repository<AiMemoryEpisodeEntity>,
  ) {}

  async store(input: EpisodeInput): Promise<AiMemoryEpisodeEntity> {
    const episode = this.episodeRepository.create({
      workspaceId: input.workspaceId,
      userId: input.userId ?? null,
      agentId: input.agentId ?? null,
      threadId: input.threadId ?? null,
      type: input.type,
      content: input.content,
      metadata: input.metadata ?? {},
    });

    return this.episodeRepository.save(episode);
  }

  async getThreadHistory(
    workspaceId: string,
    threadId: string,
    limit = 20,
  ): Promise<AiMemoryEpisodeEntity[]> {
    return this.episodeRepository.find({
      where: { workspaceId, threadId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async getRecentActions(
    workspaceId: string,
    userId: string,
    limit = 10,
  ): Promise<AiMemoryEpisodeEntity[]> {
    return this.episodeRepository.find({
      where: { workspaceId, userId, type: 'action' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Semantic similarity search over episode history using pgvector
  async findSimilarEpisodes(
    workspaceId: string,
    embedding: number[],
    limit = 5,
    threadId?: string,
  ): Promise<Array<AiMemoryEpisodeEntity & { similarity: number }>> {
    const vectorLiteral = `[${embedding.join(',')}]`;
    const threadFilter = threadId
      ? `AND e."threadId" = '${threadId}'`
      : '';

    try {
      const rows = await this.episodeRepository.manager.query(
        `
        SELECT e.*, 1 - (e.embedding <=> $1::vector) AS similarity
        FROM "core"."aiMemoryEpisode" e
        WHERE e."workspaceId" = $2
          AND e.embedding IS NOT NULL
          ${threadFilter}
        ORDER BY e.embedding <=> $1::vector
        LIMIT $3
        `,
        [vectorLiteral, workspaceId, limit],
      );

      return rows;
    } catch (error) {
      this.logger.warn('Semantic episode search failed (pgvector may be unavailable)', error);

      return [];
    }
  }

  async storeWithEmbedding(
    input: EpisodeInput,
    embedding: number[],
  ): Promise<AiMemoryEpisodeEntity> {
    const episode = await this.store(input);
    const vectorLiteral = `[${embedding.join(',')}]`;

    await this.episodeRepository.manager.query(
      `UPDATE "core"."aiMemoryEpisode" SET embedding = $1::vector WHERE id = $2`,
      [vectorLiteral, episode.id],
    );

    return episode;
  }

  async pruneOldEpisodes(
    workspaceId: string,
    threadId: string,
    keepCount = 100,
  ): Promise<void> {
    const episodes = await this.episodeRepository.find({
      where: { workspaceId, threadId },
      order: { createdAt: 'DESC' },
      select: ['id'],
    });

    if (episodes.length <= keepCount) return;

    const idsToDelete = episodes.slice(keepCount).map((e) => e.id);

    await this.episodeRepository.delete(idsToDelete);
  }
}
