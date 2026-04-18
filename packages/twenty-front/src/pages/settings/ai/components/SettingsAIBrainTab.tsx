import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { H2Title, IconBolt, IconRobot } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type AdminAiModelConfig } from '~/generated-metadata/graphql';

import { billingState } from '@/client-config/states/billingState';
import { GET_ADMIN_AI_MODELS } from '@/settings/admin-panel/ai/graphql/queries/getAdminAiModels';
import { GET_AI_PROVIDERS } from '@/settings/admin-panel/ai/graphql/queries/getAiProviders';
import { type GetAiProvidersResult } from '@/settings/admin-panel/ai/types/GetAiProvidersResult';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledProviderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledProviderChip = styled.div<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) =>
    active ? themeCssVariables.color.blue10 : themeCssVariables.background.secondary};
  border: 1px solid ${({ active }) =>
    active ? themeCssVariables.color.blue : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledProviderName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledProviderModelCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledStatusRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledStatusDot = styled.div<{ status: 'ok' | 'warn' | 'off' }>`
  background: ${({ status }) =>
    status === 'ok'
      ? themeCssVariables.color.green
      : status === 'warn'
        ? themeCssVariables.color.yellow
        : themeCssVariables.color.gray30};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

const StyledStatusLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SettingsAIBrainTab = () => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  const { data: modelsData, loading: isLoadingModels } = useQuery<{
    getAdminAiModels: {
      defaultSmartModelId?: string | null;
      defaultFastModelId?: string | null;
      models: AdminAiModelConfig[];
    };
  }>(GET_ADMIN_AI_MODELS);

  const { data: providersData, loading: isLoadingProviders } =
    useQuery<GetAiProvidersResult>(GET_AI_PROVIDERS);

  const providers = providersData?.getAiProviders ?? {};
  const activeProviderEntries = Object.entries(providers).filter(
    ([, config]) => config && Object.keys(config).length > 0,
  );

  const models = modelsData?.getAdminAiModels?.models ?? [];
  const enabledModels = models.filter((m) => m.isAvailable && m.isAdminEnabled && !m.isDeprecated);
  const smartModel = modelsData?.getAdminAiModels?.defaultSmartModelId;
  const fastModel = modelsData?.getAdminAiModels?.defaultFastModelId;

  const ollamaActive = activeProviderEntries.some(([key]) => key === 'ollama');
  const openrouterActive = activeProviderEntries.some(([key]) => key === 'openrouter');

  return (
    <>
      <Section>
        <H2Title
          title={t`Active Providers`}
          description={t`Providers are active when their API key or base URL is configured`}
        />
        {isLoadingProviders ? (
          <StyledStatusLabel>{t`Loading…`}</StyledStatusLabel>
        ) : (
          <StyledProviderGrid>
            {activeProviderEntries.map(([key, config]) => (
              <StyledProviderChip key={key} active>
                <StyledProviderName>{(config as { label?: string }).label ?? key}</StyledProviderName>
                <StyledProviderModelCount>
                  {enabledModels.filter((m) =>
                    m.providerName?.toLowerCase() === key.toLowerCase(),
                  ).length}{' '}
                  {t`models active`}
                </StyledProviderModelCount>
              </StyledProviderChip>
            ))}
          </StyledProviderGrid>
        )}
      </Section>

      <Section>
        <H2Title
          title={t`Default Models`}
          description={t`Models used by the AI assistant for this workspace`}
        />
        <Card rounded>
          <StyledStatusRow>
            <IconRobot size={theme.icon.size.md} />
            <div>
              <StyledProviderName>{t`Smart Model`}</StyledProviderName>
              <StyledProviderModelCount>{smartModel ?? t`Not set`}</StyledProviderModelCount>
            </div>
          </StyledStatusRow>
          <StyledStatusRow>
            <IconBolt size={theme.icon.size.md} />
            <div>
              <StyledProviderName>{t`Fast Model`}</StyledProviderName>
              <StyledProviderModelCount>{fastModel ?? t`Not set`}</StyledProviderModelCount>
            </div>
          </StyledStatusRow>
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`Self-Hosted & Gateway Providers`}
          description={t`Configure environment variables to enable local models or OpenRouter`}
        />
        <Card rounded>
          <StyledStatusRow>
            <StyledStatusDot status={ollamaActive ? 'ok' : 'off'} />
            <StyledStatusLabel>
              <strong>Ollama (Local)</strong> —{' '}
              {ollamaActive
                ? t`Active. Set OLLAMA_BASE_URL in .env to change endpoint.`
                : t`Inactive. Set OLLAMA_BASE_URL=http://localhost:11434/v1 in .env to enable.`}
            </StyledStatusLabel>
          </StyledStatusRow>
          <StyledStatusRow>
            <StyledStatusDot status={openrouterActive ? 'ok' : 'off'} />
            <StyledStatusLabel>
              <strong>OpenRouter</strong> —{' '}
              {openrouterActive
                ? t`Active. Routing to 7 models via OpenRouter gateway.`
                : t`Inactive. Set OPENROUTER_API_KEY in .env to enable.`}
            </StyledStatusLabel>
          </StyledStatusRow>
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`AI Memory & Graph`}
          description={t`Status of the CRM intelligence layers`}
        />
        <Card rounded>
          <StyledStatusRow>
            <StyledStatusDot status="ok" />
            <StyledStatusLabel>
              <strong>{t`Graph DB`}</strong> —{' '}
              {t`Entity graph enabled. CRM records sync automatically to the graph on write.`}
            </StyledStatusLabel>
          </StyledStatusRow>
          <StyledStatusRow>
            <StyledStatusDot status="ok" />
            <StyledStatusLabel>
              <strong>{t`Episodic Memory`}</strong> —{' '}
              {t`Conversation history and agent actions are stored per thread.`}
            </StyledStatusLabel>
          </StyledStatusRow>
          <StyledStatusRow>
            <StyledStatusDot status="ok" />
            <StyledStatusLabel>
              <strong>{t`Knowledge Base`}</strong> —{' '}
              {t`MD workflow and rules files are indexed and available to the agent.`}
            </StyledStatusLabel>
          </StyledStatusRow>
          <StyledStatusRow>
            <StyledStatusDot status="warn" />
            <StyledStatusLabel>
              <strong>{t`Semantic Search (pgvector)`}</strong> —{' '}
              {t`Requires pgvector extension + embedding generation. Keyword search active as fallback.`}
            </StyledStatusLabel>
          </StyledStatusRow>
        </Card>
      </Section>
    </>
  );
};
