import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { AiKnowledgeChunkEntity } from 'src/modules/ai-memory/ai-knowledge-chunk.entity';

const KNOWLEDGE_BASE_DIR = path.resolve(process.cwd(), '../../ai-knowledge');
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

@Injectable()
export class KnowledgeLoaderService implements OnModuleInit {
  private readonly logger = new Logger(KnowledgeLoaderService.name);

  constructor(
    @InjectRepository(AiKnowledgeChunkEntity)
    private readonly chunkRepository: Repository<AiKnowledgeChunkEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadKnowledgeBase();
  }

  async loadKnowledgeBase(forceReload = false): Promise<void> {
    if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
      this.logger.warn(`Knowledge base directory not found: ${KNOWLEDGE_BASE_DIR}`);

      return;
    }

    const mdFiles = this.findMarkdownFiles(KNOWLEDGE_BASE_DIR);

    this.logger.log(`Found ${mdFiles.length} knowledge base files`);

    for (const filePath of mdFiles) {
      await this.loadFile(filePath, forceReload);
    }
  }

  async loadFile(filePath: string, forceReload = false): Promise<void> {
    const relativePath = path.relative(KNOWLEDGE_BASE_DIR, filePath);
    const stat = fs.statSync(filePath);
    const lastModified = stat.mtime;

    if (!forceReload) {
      const existingChunk = await this.chunkRepository.findOne({
        where: { sourceFile: relativePath, chunkIndex: 0 },
      });

      if (existingChunk && existingChunk.updatedAt >= lastModified) {
        return;
      }
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = this.chunkText(content, relativePath);

    // Remove old chunks for this file
    await this.chunkRepository.delete({ sourceFile: relativePath });

    // Insert new chunks
    const entities = chunks.map((chunk, index) =>
      this.chunkRepository.create({
        workspaceId: null,
        sourceFile: relativePath,
        chunkIndex: index,
        content: chunk.text,
        metadata: {
          filePath: relativePath,
          heading: chunk.heading,
          totalChunks: chunks.length,
        },
      }),
    );

    await this.chunkRepository.save(entities);

    this.logger.log(`Loaded ${entities.length} chunks from ${relativePath}`);
  }

  getChunksForContext(sourceFile: string): AiKnowledgeChunkEntity[] | Promise<AiKnowledgeChunkEntity[]> {
    return this.chunkRepository.find({
      where: { sourceFile },
      order: { chunkIndex: 'ASC' },
    });
  }

  async getAllChunkContents(workspaceId?: string): Promise<string[]> {
    const chunks = await this.chunkRepository.find({
      where: workspaceId
        ? [{ workspaceId }, { workspaceId: null }]
        : [{ workspaceId: null }],
      order: { sourceFile: 'ASC', chunkIndex: 'ASC' },
    });

    return chunks.map((c) => c.content);
  }

  private findMarkdownFiles(dir: string): string[] {
    const result: string[] = [];

    if (!fs.existsSync(dir)) return result;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        result.push(...this.findMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        result.push(fullPath);
      }
    }

    return result;
  }

  private chunkText(
    text: string,
    sourceFile: string,
  ): Array<{ text: string; heading: string }> {
    const lines = text.split('\n');
    const chunks: Array<{ text: string; heading: string }> = [];
    let currentHeading = path.basename(sourceFile, '.md');
    let currentChunk = '';

    for (const line of lines) {
      if (line.startsWith('#')) {
        currentHeading = line.replace(/^#+\s*/, '').trim();
      }

      currentChunk += line + '\n';

      if (currentChunk.length >= CHUNK_SIZE) {
        const overlap = currentChunk.slice(-CHUNK_OVERLAP);

        chunks.push({ text: currentChunk.trim(), heading: currentHeading });
        currentChunk = overlap;
      }
    }

    if (currentChunk.trim().length > 50) {
      chunks.push({ text: currentChunk.trim(), heading: currentHeading });
    }

    return chunks.length > 0
      ? chunks
      : [{ text: text.trim(), heading: currentHeading }];
  }

  // Called by the AI pipeline to get relevant knowledge for a query
  // without requiring embeddings (keyword fallback)
  async keywordSearch(query: string, limit = 5): Promise<AiKnowledgeChunkEntity[]> {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 3)
      .slice(0, 5);

    if (terms.length === 0) return [];

    const likeConditions = terms
      .map((_, i) => `c.content ILIKE $${i + 1}`)
      .join(' OR ');

    const params = terms.map((t) => `%${t}%`);

    return this.chunkRepository.manager.query(
      `SELECT c.* FROM "core"."aiKnowledgeChunk" c
       WHERE ${likeConditions}
       ORDER BY c."sourceFile", c."chunkIndex"
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );
  }
}
