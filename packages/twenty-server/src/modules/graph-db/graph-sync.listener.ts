import { Injectable, Logger } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { GraphDbService } from 'src/modules/graph-db/graph-db.service';

// CRM entity types to sync into the graph
const TRACKED_ENTITY_TYPES = [
  'person',
  'company',
  'opportunity',
  'note',
  'task',
  'workspaceMember',
] as const;

type TrackedEntityType = (typeof TRACKED_ENTITY_TYPES)[number];

// Relationships extracted from CRM entity fields
const RELATIONSHIP_MAP: Record<
  TrackedEntityType,
  Array<{ field: string; targetType: TrackedEntityType; relationshipType: string }>
> = {
  person: [
    { field: 'companyId', targetType: 'company', relationshipType: 'WORKS_AT' },
  ],
  opportunity: [
    { field: 'companyId', targetType: 'company', relationshipType: 'BELONGS_TO' },
    { field: 'pointOfContactId', targetType: 'person', relationshipType: 'OWNED_BY' },
  ],
  note: [
    { field: 'companyId', targetType: 'company', relationshipType: 'ABOUT_COMPANY' },
  ],
  task: [
    { field: 'assigneeId', targetType: 'workspaceMember', relationshipType: 'ASSIGNED_TO' },
  ],
  company: [],
  workspaceMember: [],
};

@Injectable()
export class GraphSyncListener {
  private readonly logger = new Logger(GraphSyncListener.name);

  constructor(private readonly graphDbService: GraphDbService) {}

  @OnDatabaseBatchEvent('person', DatabaseEventAction.CREATED)
  async onPersonCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'person', 'created');
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async onPersonUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'person', 'updated');
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.DELETED)
  async onPersonDeleted(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent<Record<string, unknown>>>,
  ) {
    await this.deleteBatchFromGraph(payload, 'person');
  }

  @OnDatabaseBatchEvent('company', DatabaseEventAction.CREATED)
  async onCompanyCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'company', 'created');
  }

  @OnDatabaseBatchEvent('company', DatabaseEventAction.UPDATED)
  async onCompanyUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'company', 'updated');
  }

  @OnDatabaseBatchEvent('company', DatabaseEventAction.DELETED)
  async onCompanyDeleted(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent<Record<string, unknown>>>,
  ) {
    await this.deleteBatchFromGraph(payload, 'company');
  }

  @OnDatabaseBatchEvent('opportunity', DatabaseEventAction.CREATED)
  async onOpportunityCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'opportunity', 'created');
  }

  @OnDatabaseBatchEvent('opportunity', DatabaseEventAction.UPDATED)
  async onOpportunityUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'opportunity', 'updated');
  }

  @OnDatabaseBatchEvent('opportunity', DatabaseEventAction.DELETED)
  async onOpportunityDeleted(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent<Record<string, unknown>>>,
  ) {
    await this.deleteBatchFromGraph(payload, 'opportunity');
  }

  @OnDatabaseBatchEvent('note', DatabaseEventAction.CREATED)
  async onNoteCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'note', 'created');
  }

  @OnDatabaseBatchEvent('note', DatabaseEventAction.UPDATED)
  async onNoteUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'note', 'updated');
  }

  @OnDatabaseBatchEvent('task', DatabaseEventAction.CREATED)
  async onTaskCreated(
    payload: WorkspaceEventBatch<ObjectRecordCreateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'task', 'created');
  }

  @OnDatabaseBatchEvent('task', DatabaseEventAction.UPDATED)
  async onTaskUpdated(
    payload: WorkspaceEventBatch<ObjectRecordUpdateEvent<Record<string, unknown>>>,
  ) {
    await this.syncBatchToGraph(payload, 'task', 'updated');
  }

  private async syncBatchToGraph(
    payload: WorkspaceEventBatch<
      | ObjectRecordCreateEvent<Record<string, unknown>>
      | ObjectRecordUpdateEvent<Record<string, unknown>>
    >,
    entityType: TrackedEntityType,
    action: 'created' | 'updated',
  ): Promise<void> {
    const { workspaceId, events } = payload;

    for (const event of events) {
      try {
        const record =
          action === 'created'
            ? (event as ObjectRecordCreateEvent<Record<string, unknown>>).properties.after
            : (event as ObjectRecordUpdateEvent<Record<string, unknown>>).properties.after;

        if (!record) continue;

        const node = await this.graphDbService.upsertNode({
          workspaceId,
          entityType,
          entityId: event.recordId,
          properties: this.extractNodeProperties(record, entityType),
        });

        // Create relationship edges
        const relationshipDefs = RELATIONSHIP_MAP[entityType] ?? [];

        for (const rel of relationshipDefs) {
          const targetId = record[rel.field] as string | undefined;

          if (targetId) {
            // Ensure target node exists before creating edge
            await this.graphDbService.upsertNode({
              workspaceId,
              entityType: rel.targetType,
              entityId: targetId,
              properties: {},
            });

            await this.graphDbService.upsertEdge({
              workspaceId,
              sourceEntityType: entityType,
              sourceEntityId: node.entityId,
              targetEntityType: rel.targetType,
              targetEntityId: targetId,
              relationshipType: rel.relationshipType,
            });
          }
        }
      } catch (error) {
        this.logger.error(
          `Graph sync failed for ${entityType}:${event.recordId}`,
          error,
        );
      }
    }
  }

  private async deleteBatchFromGraph(
    payload: WorkspaceEventBatch<ObjectRecordDeleteEvent<Record<string, unknown>>>,
    entityType: TrackedEntityType,
  ): Promise<void> {
    const { workspaceId, events } = payload;

    for (const event of events) {
      try {
        await this.graphDbService.deleteNode(workspaceId, entityType, event.recordId);
      } catch (error) {
        this.logger.error(
          `Graph delete failed for ${entityType}:${event.recordId}`,
          error,
        );
      }
    }
  }

  private extractNodeProperties(
    record: Record<string, unknown>,
    entityType: TrackedEntityType,
  ): Record<string, unknown> {
    const baseFields = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

    const typeFields: Record<TrackedEntityType, string[]> = {
      person: ['name', 'firstName', 'lastName', 'email', 'phone', 'jobTitle', 'city'],
      company: ['name', 'domainName', 'address', 'employees', 'idealCustomerProfile'],
      opportunity: ['name', 'amount', 'closeDate', 'stage', 'probability'],
      note: ['title', 'body'],
      task: ['title', 'body', 'status', 'dueAt', 'priority'],
      workspaceMember: ['name', 'colorScheme', 'locale'],
    };

    const fields = [...baseFields, ...(typeFields[entityType] ?? [])];
    const result: Record<string, unknown> = {};

    for (const field of fields) {
      if (record[field] !== undefined) {
        result[field] = record[field];
      }
    }

    return result;
  }
}
