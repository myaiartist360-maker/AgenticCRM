import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertCapabilityRuleInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  agentId?: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  entityType: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canRead?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canWrite?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canDelete?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  canBulkOps?: boolean;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  rateLimit?: number;
}
