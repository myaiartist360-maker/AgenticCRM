import { Injectable, Logger } from '@nestjs/common';

import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import {
  AgentCapabilityService,
  DEFAULT_PERMISSIONS,
} from 'src/modules/agent-config/agent-capability.service';

const ONE_HOUR_MS = 60 * 60 * 1000;
const GLOBAL_RATE_LIMIT = 200;

@Injectable()
export class AgentRateLimiterService {
  private readonly logger = new Logger(AgentRateLimiterService.name);

  constructor(
    private readonly throttler: ThrottlerService,
    private readonly capabilityService: AgentCapabilityService,
  ) {}

  // Check and consume one token for an agent action on an entity type.
  // Throws ThrottlerException if rate limit is exceeded.
  async checkAndConsume(
    workspaceId: string,
    userId: string,
    entityType: string,
    agentId?: string,
  ): Promise<void> {
    const permissions = await this.capabilityService.getPermissions(
      workspaceId,
      entityType,
      agentId,
    );

    const entityRateLimit = permissions.rateLimit ?? DEFAULT_PERMISSIONS.rateLimit;

    // Per-entity rate limit
    const entityKey = `agent_rate:${workspaceId}:${userId}:${entityType}`;

    await this.throttler.tokenBucketThrottleOrThrow(
      entityKey,
      1,
      entityRateLimit,
      ONE_HOUR_MS,
    );

    // Global rate limit (all entity types combined)
    const globalKey = `agent_rate_global:${workspaceId}:${userId}`;

    await this.throttler.tokenBucketThrottleOrThrow(
      globalKey,
      1,
      GLOBAL_RATE_LIMIT,
      ONE_HOUR_MS,
    );
  }

  async getRemainingTokens(
    workspaceId: string,
    userId: string,
    entityType: string,
  ): Promise<{ entityRemaining: number; globalRemaining: number }> {
    const permissions = await this.capabilityService.getPermissions(
      workspaceId,
      entityType,
    );

    const entityRateLimit = permissions.rateLimit ?? DEFAULT_PERMISSIONS.rateLimit;
    const entityKey = `agent_rate:${workspaceId}:${userId}:${entityType}`;
    const globalKey = `agent_rate_global:${workspaceId}:${userId}`;

    const [entityRemaining, globalRemaining] = await Promise.all([
      this.throttler.getAvailableTokensCount(entityKey, entityRateLimit, ONE_HOUR_MS),
      this.throttler.getAvailableTokensCount(globalKey, GLOBAL_RATE_LIMIT, ONE_HOUR_MS),
    ]);

    return { entityRemaining, globalRemaining };
  }

  // Guard: check if an agent has permission AND rate tokens for the action
  async guardAction(
    workspaceId: string,
    userId: string,
    entityType: string,
    actionType: 'read' | 'write' | 'delete' | 'bulkOps',
    agentId?: string,
  ): Promise<void> {
    const permissions = await this.capabilityService.getPermissions(
      workspaceId,
      entityType,
      agentId,
    );

    const permissionMap = {
      read: permissions.canRead,
      write: permissions.canWrite,
      delete: permissions.canDelete,
      bulkOps: permissions.canBulkOps,
    };

    if (!permissionMap[actionType]) {
      throw new ThrottlerException(
        `Agent is not allowed to ${actionType} ${entityType} records in this workspace`,
        ThrottlerExceptionCode.LIMIT_REACHED,
      );
    }

    // Only rate-limit mutating operations
    if (actionType !== 'read') {
      await this.checkAndConsume(workspaceId, userId, entityType, agentId);
    }
  }
}
