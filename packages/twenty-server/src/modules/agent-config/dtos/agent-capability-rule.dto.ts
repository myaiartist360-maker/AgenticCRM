import { Field, Int, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentCapabilityRule')
export class AgentCapabilityRuleDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  agentId?: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  entityType: string;

  @IsBoolean()
  @Field()
  canRead: boolean;

  @IsBoolean()
  @Field()
  canWrite: boolean;

  @IsBoolean()
  @Field()
  canDelete: boolean;

  @IsBoolean()
  @Field()
  canBulkOps: boolean;

  @IsNumber()
  @Field(() => Int)
  rateLimit: number;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
