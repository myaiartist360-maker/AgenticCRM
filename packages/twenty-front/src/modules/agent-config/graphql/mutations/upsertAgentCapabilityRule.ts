import { gql } from '@apollo/client';

export const UPSERT_AGENT_CAPABILITY_RULE = gql`
  mutation UpsertAgentCapabilityRule($input: UpsertCapabilityRuleInput!) {
    upsertAgentCapabilityRule(input: $input) {
      id
      agentId
      entityType
      canRead
      canWrite
      canDelete
      canBulkOps
      rateLimit
      createdAt
      updatedAt
    }
  }
`;
