import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { GraphEdgeEntity } from 'src/modules/graph-db/graph-edge.entity';
import { GraphNodeEntity } from 'src/modules/graph-db/graph-node.entity';

export type GraphNodeUpsertInput = {
  workspaceId: string;
  entityType: string;
  entityId: string;
  properties?: Record<string, unknown>;
};

export type GraphEdgeUpsertInput = {
  workspaceId: string;
  sourceEntityType: string;
  sourceEntityId: string;
  targetEntityType: string;
  targetEntityId: string;
  relationshipType: string;
  properties?: Record<string, unknown>;
};

export type GraphTraversalResult = {
  nodeId: string;
  entityType: string;
  entityId: string;
  properties: Record<string, unknown>;
  depth: number;
  path: string[];
};

@Injectable()
export class GraphDbService {
  private readonly logger = new Logger(GraphDbService.name);

  constructor(
    @InjectRepository(GraphNodeEntity)
    private readonly nodeRepository: Repository<GraphNodeEntity>,
    @InjectRepository(GraphEdgeEntity)
    private readonly edgeRepository: Repository<GraphEdgeEntity>,
  ) {}

  async upsertNode(input: GraphNodeUpsertInput): Promise<GraphNodeEntity> {
    const existing = await this.nodeRepository.findOne({
      where: {
        workspaceId: input.workspaceId,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });

    if (existing) {
      await this.nodeRepository.update(existing.id, {
        properties: { ...existing.properties, ...input.properties },
        updatedAt: new Date(),
      });

      return { ...existing, properties: { ...existing.properties, ...input.properties } };
    }

    const node = this.nodeRepository.create({
      workspaceId: input.workspaceId,
      entityType: input.entityType,
      entityId: input.entityId,
      properties: input.properties ?? {},
    });

    return this.nodeRepository.save(node);
  }

  async upsertEdge(input: GraphEdgeUpsertInput): Promise<GraphEdgeEntity | null> {
    const [sourceNode, targetNode] = await Promise.all([
      this.nodeRepository.findOne({
        where: {
          workspaceId: input.workspaceId,
          entityType: input.sourceEntityType,
          entityId: input.sourceEntityId,
        },
      }),
      this.nodeRepository.findOne({
        where: {
          workspaceId: input.workspaceId,
          entityType: input.targetEntityType,
          entityId: input.targetEntityId,
        },
      }),
    ]);

    if (!sourceNode || !targetNode) {
      this.logger.warn(
        `Cannot create edge: missing node(s) for ${input.sourceEntityType}:${input.sourceEntityId} → ${input.targetEntityType}:${input.targetEntityId}`,
      );

      return null;
    }

    const existing = await this.edgeRepository.findOne({
      where: {
        workspaceId: input.workspaceId,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        relationshipType: input.relationshipType,
      },
    });

    if (existing) {
      await this.edgeRepository.update(existing.id, {
        properties: { ...existing.properties, ...input.properties },
        updatedAt: new Date(),
      });

      return existing;
    }

    const edge = this.edgeRepository.create({
      workspaceId: input.workspaceId,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      relationshipType: input.relationshipType,
      properties: input.properties ?? {},
    });

    return this.edgeRepository.save(edge);
  }

  async deleteNode(workspaceId: string, entityType: string, entityId: string): Promise<void> {
    await this.nodeRepository.delete({ workspaceId, entityType, entityId });
  }

  // Recursive CTE traversal up to maxDepth hops
  async traverseGraph(
    workspaceId: string,
    startEntityType: string,
    startEntityId: string,
    maxDepth = 3,
    relationshipTypes?: string[],
  ): Promise<GraphTraversalResult[]> {
    const startNode = await this.nodeRepository.findOne({
      where: { workspaceId, entityType: startEntityType, entityId: startEntityId },
    });

    if (!startNode) return [];

    const relationshipFilter =
      relationshipTypes && relationshipTypes.length > 0
        ? `AND e."relationshipType" = ANY(ARRAY[${relationshipTypes.map((r) => `'${r}'`).join(',')}])`
        : '';

    const rows = await this.nodeRepository.manager.query(
      `
      WITH RECURSIVE graph_walk AS (
        SELECT
          n."id"          AS node_id,
          n."entityType"  AS entity_type,
          n."entityId"    AS entity_id,
          n."properties"  AS properties,
          0               AS depth,
          ARRAY[n."id"::text] AS path
        FROM "core"."graphNode" n
        WHERE n."id" = $1

        UNION ALL

        SELECT
          target."id",
          target."entityType",
          target."entityId",
          target."properties",
          gw.depth + 1,
          gw.path || target."id"::text
        FROM graph_walk gw
        JOIN "core"."graphEdge" e
          ON e."sourceNodeId" = gw.node_id
          AND e."workspaceId" = $2
          ${relationshipFilter}
        JOIN "core"."graphNode" target
          ON target."id" = e."targetNodeId"
        WHERE gw.depth < $3
          AND NOT (target."id"::text = ANY(gw.path))
      )
      SELECT * FROM graph_walk WHERE depth > 0
      `,
      [startNode.id, workspaceId, maxDepth],
    );

    return rows.map((row: Record<string, unknown>) => ({
      nodeId: row['node_id'] as string,
      entityType: row['entity_type'] as string,
      entityId: row['entity_id'] as string,
      properties: row['properties'] as Record<string, unknown>,
      depth: row['depth'] as number,
      path: (row['path'] as string[]),
    }));
  }

  // Find nodes similar to a given embedding (requires pgvector)
  async findSimilarNodes(
    workspaceId: string,
    embedding: number[],
    limit = 10,
    entityTypes?: string[],
  ): Promise<Array<GraphNodeEntity & { similarity: number }>> {
    const typeFilter =
      entityTypes && entityTypes.length > 0
        ? `AND n."entityType" = ANY(ARRAY[${entityTypes.map((t) => `'${t}'`).join(',')}])`
        : '';

    const vectorLiteral = `[${embedding.join(',')}]`;

    const rows = await this.nodeRepository.manager.query(
      `
      SELECT n.*, 1 - (n.embedding <=> $1::vector) AS similarity
      FROM "core"."graphNode" n
      WHERE n."workspaceId" = $2
        AND n.embedding IS NOT NULL
        ${typeFilter}
      ORDER BY n.embedding <=> $1::vector
      LIMIT $3
      `,
      [vectorLiteral, workspaceId, limit],
    );

    return rows;
  }

  async getNodeWithRelationships(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<{
    node: GraphNodeEntity | null;
    outgoing: Array<{ edge: GraphEdgeEntity; target: GraphNodeEntity }>;
    incoming: Array<{ edge: GraphEdgeEntity; source: GraphNodeEntity }>;
  }> {
    const node = await this.nodeRepository.findOne({
      where: { workspaceId, entityType, entityId },
    });

    if (!node) return { node: null, outgoing: [], incoming: [] };

    const [outgoingEdges, incomingEdges] = await Promise.all([
      this.edgeRepository.find({
        where: { workspaceId, sourceNodeId: node.id },
        relations: ['targetNode'],
      }),
      this.edgeRepository.find({
        where: { workspaceId, targetNodeId: node.id },
        relations: ['sourceNode'],
      }),
    ]);

    return {
      node,
      outgoing: outgoingEdges.map((edge) => ({ edge, target: edge.targetNode })),
      incoming: incomingEdges.map((edge) => ({ edge, source: edge.sourceNode })),
    };
  }

  async updateNodeEmbedding(nodeId: string, embedding: number[]): Promise<void> {
    const vectorLiteral = `[${embedding.join(',')}]`;

    await this.nodeRepository.manager.query(
      `UPDATE "core"."graphNode" SET embedding = $1::vector WHERE id = $2`,
      [vectorLiteral, nodeId],
    );
  }
}
