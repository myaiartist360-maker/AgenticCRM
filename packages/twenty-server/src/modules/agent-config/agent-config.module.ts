import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { AgentAuditService } from 'src/modules/agent-config/agent-audit.service';
import { AgentCapabilityRuleEntity } from 'src/modules/agent-config/agent-capability-rule.entity';
import { AgentCapabilityResolver } from 'src/modules/agent-config/agent-capability.resolver';
import { AgentCapabilityService } from 'src/modules/agent-config/agent-capability.service';
import { AgentRateLimiterService } from 'src/modules/agent-config/agent-rate-limiter.service';
import { AiMemoryModule } from 'src/modules/ai-memory/ai-memory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentCapabilityRuleEntity]),
    ThrottlerModule,
    AiMemoryModule,
  ],
  providers: [AgentCapabilityService, AgentCapabilityResolver, AgentAuditService, AgentRateLimiterService],
  exports: [AgentCapabilityService, AgentAuditService, AgentRateLimiterService],
})
export class AgentConfigModule {}
