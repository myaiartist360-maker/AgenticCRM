import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GraphEdgeEntity } from 'src/modules/graph-db/graph-edge.entity';
import { GraphDbService } from 'src/modules/graph-db/graph-db.service';
import { GraphNodeEntity } from 'src/modules/graph-db/graph-node.entity';
import { GraphSyncListener } from 'src/modules/graph-db/graph-sync.listener';

@Module({
  imports: [TypeOrmModule.forFeature([GraphNodeEntity, GraphEdgeEntity])],
  providers: [GraphDbService, GraphSyncListener],
  exports: [GraphDbService],
})
export class GraphDbModule {}
