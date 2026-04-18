import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Or, Repository } from 'typeorm';

import { AgentCapabilityRuleEntity } from 'src/modules/agent-config/agent-capability-rule.entity';

export type AgentPermission = {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canBulkOps: boolean;
  rateLimit: number;
};

export const DEFAULT_PERMISSIONS: AgentPermission = {
  canRead: true,
  canWrite: false,
  canDelete: false,
  canBulkOps: false,
  rateLimit: 50,
};

export type UpsertCapabilityRuleInput = {
  workspaceId: string;
  agentId?: string;
  entityType: string;
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
  canBulkOps?: boolean;
  rateLimit?: number;
};

@Injectable()
export class AgentCapabilityService {
  private readonly logger = new Logger(AgentCapabilityService.name);

  constructor(
    @InjectRepository(AgentCapabilityRuleEntity)
    private readonly ruleRepository: Repository<AgentCapabilityRuleEntity>,
  ) {}

  async getPermissions(
    workspaceId: string,
    entityType: string,
    agentId?: string,
  ): Promise<AgentPermission> {
    // Prefer agent-specific rule, fall back to workspace-wide rule
    const rules = await this.ruleRepository.find({
      where: [
        ...(agentId ? [{ workspaceId, agentId, entityType }] : []),
        { workspaceId, agentId: IsNull(), entityType },
      ],
    });

    if (rules.length === 0) return DEFAULT_PERMISSIONS;

    // Agent-specific rule takes precedence over workspace-wide
    const rule =
      (agentId ? rules.find((r) => r.agentId === agentId) : undefined) ??
      rules[0];

    return {
      canRead: rule.canRead,
      canWrite: rule.canWrite,
      canDelete: rule.canDelete,
      canBulkOps: rule.canBulkOps,
      rateLimit: rule.rateLimit,
    };
  }

  async getAllRules(workspaceId: string): Promise<AgentCapabilityRuleEntity[]> {
    return this.ruleRepository.find({ where: { workspaceId } });
  }

  async upsertRule(input: UpsertCapabilityRuleInput): Promise<AgentCapabilityRuleEntity> {
    const existing = await this.ruleRepository.findOne({
      where: {
        workspaceId: input.workspaceId,
        agentId: input.agentId ? Or(IsNull()) : IsNull(),
        entityType: input.entityType,
      },
    });

    if (existing) {
      await this.ruleRepository.update(existing.id, {
        canRead: input.canRead ?? existing.canRead,
        canWrite: input.canWrite ?? existing.canWrite,
        canDelete: input.canDelete ?? existing.canDelete,
        canBulkOps: input.canBulkOps ?? existing.canBulkOps,
        rateLimit: input.rateLimit ?? existing.rateLimit,
      });

      return { ...existing, ...input } as AgentCapabilityRuleEntity;
    }

    const rule = this.ruleRepository.create({
      workspaceId: input.workspaceId,
      agentId: input.agentId ?? null,
      entityType: input.entityType,
      canRead: input.canRead ?? DEFAULT_PERMISSIONS.canRead,
      canWrite: input.canWrite ?? DEFAULT_PERMISSIONS.canWrite,
      canDelete: input.canDelete ?? DEFAULT_PERMISSIONS.canDelete,
      canBulkOps: input.canBulkOps ?? DEFAULT_PERMISSIONS.canBulkOps,
      rateLimit: input.rateLimit ?? DEFAULT_PERMISSIONS.rateLimit,
    });

    return this.ruleRepository.save(rule);
  }

  async deleteRule(ruleId: string, workspaceId: string): Promise<void> {
    await this.ruleRepository.delete({ id: ruleId, workspaceId });
  }

  async getWorkspaceCapabilityMatrix(
    workspaceId: string,
  ): Promise<Record<string, AgentPermission>> {
    const rules = await this.ruleRepository.find({
      where: { workspaceId, agentId: IsNull() },
    });

    const matrix: Record<string, AgentPermission> = {};

    for (const rule of rules) {
      matrix[rule.entityType] = {
        canRead: rule.canRead,
        canWrite: rule.canWrite,
        canDelete: rule.canDelete,
        canBulkOps: rule.canBulkOps,
        rateLimit: rule.rateLimit,
      };
    }

    return matrix;
  }

  async seedDefaultRules(workspaceId: string): Promise<void> {
    const entityTypes = [
      'person',
      'company',
      'opportunity',
      'note',
      'task',
      'workspaceMember',
    ];

    const defaults: Record<string, Partial<AgentPermission>> = {
      person:          { canRead: true, canWrite: true,  canDelete: false, canBulkOps: true  },
      company:         { canRead: true, canWrite: true,  canDelete: false, canBulkOps: false },
      opportunity:     { canRead: true, canWrite: true,  canDelete: false, canBulkOps: false },
      note:            { canRead: true, canWrite: true,  canDelete: false, canBulkOps: false },
      task:            { canRead: true, canWrite: true,  canDelete: true,  canBulkOps: false },
      workspaceMember: { canRead: true, canWrite: false, canDelete: false, canBulkOps: false },
    };

    for (const entityType of entityTypes) {
      const existing = await this.ruleRepository.findOne({
        where: { workspaceId, agentId: IsNull(), entityType },
      });

      if (!existing) {
        await this.upsertRule({
          workspaceId,
          entityType,
          ...defaults[entityType],
        });
      }
    }
  }
}
