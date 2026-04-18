import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentCapabilityService } from 'src/modules/agent-config/agent-capability.service';
import { AgentCapabilityRuleDTO } from 'src/modules/agent-config/dtos/agent-capability-rule.dto';
import { UpsertCapabilityRuleInput } from 'src/modules/agent-config/dtos/upsert-capability-rule.input';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => AgentCapabilityRuleDTO)
export class AgentCapabilityResolver {
  constructor(
    private readonly capabilityService: AgentCapabilityService,
  ) {}

  @Query(() => [AgentCapabilityRuleDTO])
  @UseGuards(NoPermissionGuard)
  async agentCapabilityRules(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentCapabilityRuleDTO[]> {
    return this.capabilityService.getAllRules(workspace.id);
  }

  @Mutation(() => AgentCapabilityRuleDTO)
  @UseGuards(NoPermissionGuard)
  async upsertAgentCapabilityRule(
    @Args('input') input: UpsertCapabilityRuleInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<AgentCapabilityRuleDTO> {
    return this.capabilityService.upsertRule({
      workspaceId: workspace.id,
      ...input,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(NoPermissionGuard)
  async deleteAgentCapabilityRule(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.capabilityService.deleteRule(id, workspace.id);

    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(NoPermissionGuard)
  async seedDefaultAgentCapabilityRules(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.capabilityService.seedDefaultRules(workspace.id);

    return true;
  }
}
