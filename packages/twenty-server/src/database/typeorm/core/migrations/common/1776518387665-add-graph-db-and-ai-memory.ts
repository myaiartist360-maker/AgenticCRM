import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddGraphDbAndAiMemory1776518387665 implements MigrationInterface {
  name = 'AddGraphDbAndAiMemory1776518387665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pgvector extension for semantic embeddings
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS vector`,
    );

    // Graph nodes: mirror every CRM entity in the graph
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."graphNode" (
        "id"             UUID        NOT NULL DEFAULT gen_random_uuid(),
        "workspaceId"    UUID        NOT NULL,
        "entityType"     VARCHAR(100) NOT NULL,
        "entityId"       UUID        NOT NULL,
        "properties"     JSONB       NOT NULL DEFAULT '{}',
        "embedding"      vector(1536),
        "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graphNode" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_graphNode_workspace_entity" UNIQUE ("workspaceId", "entityType", "entityId")
      )
    `);

    // Graph edges: relationships between CRM entities
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."graphEdge" (
        "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
        "workspaceId"       UUID        NOT NULL,
        "sourceNodeId"      UUID        NOT NULL,
        "targetNodeId"      UUID        NOT NULL,
        "relationshipType"  VARCHAR(100) NOT NULL,
        "properties"        JSONB       NOT NULL DEFAULT '{}',
        "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graphEdge" PRIMARY KEY ("id"),
        CONSTRAINT "FK_graphEdge_source" FOREIGN KEY ("sourceNodeId")
          REFERENCES "core"."graphNode"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_graphEdge_target" FOREIGN KEY ("targetNodeId")
          REFERENCES "core"."graphNode"("id") ON DELETE CASCADE
      )
    `);

    // Episodic memory: conversation turns, actions, observations
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."aiMemoryEpisode" (
        "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
        "workspaceId" UUID        NOT NULL,
        "userId"      UUID,
        "agentId"     UUID,
        "threadId"    UUID,
        "type"        VARCHAR(50) NOT NULL DEFAULT 'conversation',
        "content"     TEXT        NOT NULL,
        "metadata"    JSONB       NOT NULL DEFAULT '{}',
        "embedding"   vector(1536),
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_aiMemoryEpisode" PRIMARY KEY ("id")
      )
    `);

    // Knowledge chunks: MD file content indexed for RAG retrieval
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."aiKnowledgeChunk" (
        "id"          UUID         NOT NULL DEFAULT gen_random_uuid(),
        "workspaceId" UUID,
        "sourceFile"  VARCHAR(500) NOT NULL,
        "chunkIndex"  INTEGER      NOT NULL,
        "content"     TEXT         NOT NULL,
        "metadata"    JSONB        NOT NULL DEFAULT '{}',
        "embedding"   vector(1536),
        "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_aiKnowledgeChunk" PRIMARY KEY ("id")
      )
    `);

    // Agent capability matrix: per-entity-type permissions for agents
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core"."agentCapabilityRule" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "workspaceId"   UUID        NOT NULL,
        "agentId"       UUID,
        "entityType"    VARCHAR(100) NOT NULL,
        "canRead"       BOOLEAN     NOT NULL DEFAULT true,
        "canWrite"      BOOLEAN     NOT NULL DEFAULT false,
        "canDelete"     BOOLEAN     NOT NULL DEFAULT false,
        "canBulkOps"    BOOLEAN     NOT NULL DEFAULT false,
        "rateLimit"     INTEGER     NOT NULL DEFAULT 50,
        "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agentCapabilityRule" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_agentCapabilityRule_workspace_agent_entity"
          UNIQUE ("workspaceId", "agentId", "entityType")
      )
    `);

    // Indexes for performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphNode_workspaceId" ON "core"."graphNode" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphNode_entityType" ON "core"."graphNode" ("entityType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphEdge_workspaceId" ON "core"."graphEdge" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphEdge_source" ON "core"."graphEdge" ("sourceNodeId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphEdge_target" ON "core"."graphEdge" ("targetNodeId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphEdge_relationship" ON "core"."graphEdge" ("workspaceId", "relationshipType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aiMemoryEpisode_workspace_thread" ON "core"."aiMemoryEpisode" ("workspaceId", "threadId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aiKnowledgeChunk_sourceFile" ON "core"."aiKnowledgeChunk" ("sourceFile")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_agentCapabilityRule_workspaceId" ON "core"."agentCapabilityRule" ("workspaceId")`,
    );

    // Vector similarity indexes (IVFFlat — good balance of speed vs accuracy)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_graphNode_embedding" ON "core"."graphNode"
       USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aiMemoryEpisode_embedding" ON "core"."aiMemoryEpisode"
       USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_aiKnowledgeChunk_embedding" ON "core"."aiKnowledgeChunk"
       USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."agentCapabilityRule"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."aiKnowledgeChunk"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."aiMemoryEpisode"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."graphEdge"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."graphNode"`);
  }
}
