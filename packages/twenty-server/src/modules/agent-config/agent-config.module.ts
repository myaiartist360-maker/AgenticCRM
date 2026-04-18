import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentCapabilityRuleEntity } from 'src/modules/agent-config/agent-capability-rule.entity';
import { AgentCapabilityService } from 'src/modules/agent-config/agent-capability.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentCapabilityRuleEntity])],
  providers: [AgentCapabilityService],
  exports: [AgentCapabilityService],
})
export class AgentConfigModule {}
