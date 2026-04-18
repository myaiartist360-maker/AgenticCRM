import { Module } from '@nestjs/common';

import { AgentConfigModule } from 'src/modules/agent-config/agent-config.module';
import { AiMemoryModule } from 'src/modules/ai-memory/ai-memory.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { GraphDbModule } from 'src/modules/graph-db/graph-db.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';

@Module({
  imports: [
    MessagingModule,
    CalendarModule,
    ConnectedAccountModule,
    WorkflowModule,
    WorkspaceMemberModule,
    GraphDbModule,
    AiMemoryModule,
    AgentConfigModule,
  ],
  providers: [],
  exports: [],
})
export class ModulesModule {}
