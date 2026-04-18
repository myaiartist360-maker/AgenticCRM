import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GraphDbModule } from 'src/modules/graph-db/graph-db.module';
import { AiKnowledgeChunkEntity } from 'src/modules/ai-memory/ai-knowledge-chunk.entity';
import { AiMemoryEpisodeEntity } from 'src/modules/ai-memory/ai-memory-episode.entity';
import { EpisodicMemoryService } from 'src/modules/ai-memory/episodic-memory.service';
import { KnowledgeLoaderService } from 'src/modules/ai-memory/knowledge-loader.service';
import { MemoryContextBuilderService } from 'src/modules/ai-memory/memory-context-builder.service';
import { SemanticMemoryService } from 'src/modules/ai-memory/semantic-memory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiMemoryEpisodeEntity, AiKnowledgeChunkEntity]),
    GraphDbModule,
  ],
  providers: [
    EpisodicMemoryService,
    SemanticMemoryService,
    KnowledgeLoaderService,
    MemoryContextBuilderService,
  ],
  exports: [
    EpisodicMemoryService,
    SemanticMemoryService,
    KnowledgeLoaderService,
    MemoryContextBuilderService,
  ],
})
export class AiMemoryModule {}
