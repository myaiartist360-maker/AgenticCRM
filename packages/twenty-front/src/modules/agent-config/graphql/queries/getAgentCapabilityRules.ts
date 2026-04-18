import { gql } from '@apollo/client';

export const GET_AGENT_CAPABILITY_RULES = gql`
  query GetAgentCapabilityRules {
    agentCapabilityRules {
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
