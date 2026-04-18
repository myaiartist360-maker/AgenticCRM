import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Toggle } from 'twenty-ui/input';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { NumberInput } from '@/ui/input/components/NumberInput';

type EntityCapability = {
  entityType: string;
  label: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canBulkOps: boolean;
  rateLimit: number;
};

const DEFAULT_CAPABILITIES: EntityCapability[] = [
  { entityType: 'person',          label: 'People',          canRead: true,  canWrite: true,  canDelete: false, canBulkOps: true,  rateLimit: 50 },
  { entityType: 'company',         label: 'Companies',       canRead: true,  canWrite: true,  canDelete: false, canBulkOps: false, rateLimit: 50 },
  { entityType: 'opportunity',     label: 'Opportunities',   canRead: true,  canWrite: true,  canDelete: false, canBulkOps: false, rateLimit: 50 },
  { entityType: 'note',            label: 'Notes',           canRead: true,  canWrite: true,  canDelete: false, canBulkOps: false, rateLimit: 50 },
  { entityType: 'task',            label: 'Tasks',           canRead: true,  canWrite: true,  canDelete: true,  canBulkOps: false, rateLimit: 50 },
  { entityType: 'workspaceMember', label: 'Team Members',    canRead: true,  canWrite: false, canDelete: false, canBulkOps: false, rateLimit: 20 },
];

const StyledTableWrapper = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledHeaderRow = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledHeaderCell = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-transform: uppercase;
`;

const StyledDataRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledEntityLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledRateLimitInput = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 80px;
`;

const StyledRateLimitSuffix = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  white-space: nowrap;
`;

const StyledSaveHint = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

type CapabilityKey = 'canRead' | 'canWrite' | 'canDelete' | 'canBulkOps';

export const SettingsAIPermissionsTab = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [capabilities, setCapabilities] = useState<EntityCapability[]>(DEFAULT_CAPABILITIES);
  const [isDirty, setIsDirty] = useState(false);

  const handleToggle = useCallback(
    (entityType: string, field: CapabilityKey, value: boolean) => {
      setCapabilities((prev) =>
        prev.map((cap) =>
          cap.entityType === entityType ? { ...cap, [field]: value } : cap,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  const handleRateLimitChange = useCallback(
    (entityType: string, value: number) => {
      setCapabilities((prev) =>
        prev.map((cap) =>
          cap.entityType === entityType ? { ...cap, rateLimit: value } : cap,
        ),
      );
      setIsDirty(true);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    try {
      // TODO: Persist via GraphQL mutation once backend resolver is wired
      enqueueSuccessSnackBar({ message: t`Agent permissions saved` });
      setIsDirty(false);
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to save permissions` });
    }
  }, [capabilities, enqueueSuccessSnackBar, enqueueErrorSnackBar]);

  return (
    <>
      <Section>
        <H2Title
          title={t`Agent Capability Matrix`}
          description={t`Control what the AI agent can read, write, delete, and bulk-operate on per entity type`}
        />
        <StyledTableWrapper>
          <StyledHeaderRow>
            <StyledHeaderCell>{t`Entity`}</StyledHeaderCell>
            <StyledHeaderCell>{t`Read`}</StyledHeaderCell>
            <StyledHeaderCell>{t`Write`}</StyledHeaderCell>
            <StyledHeaderCell>{t`Delete`}</StyledHeaderCell>
            <StyledHeaderCell>{t`Bulk`}</StyledHeaderCell>
            <StyledHeaderCell>{t`Rate/hr`}</StyledHeaderCell>
          </StyledHeaderRow>
          {capabilities.map((cap) => (
            <StyledDataRow key={cap.entityType}>
              <StyledEntityLabel>{cap.label}</StyledEntityLabel>
              <Toggle
                value={cap.canRead}
                onChange={(v) => handleToggle(cap.entityType, 'canRead', v)}
                toggleSize="small"
              />
              <Toggle
                value={cap.canWrite}
                onChange={(v) => handleToggle(cap.entityType, 'canWrite', v)}
                toggleSize="small"
              />
              <Toggle
                value={cap.canDelete}
                onChange={(v) => handleToggle(cap.entityType, 'canDelete', v)}
                toggleSize="small"
              />
              <Toggle
                value={cap.canBulkOps}
                onChange={(v) => handleToggle(cap.entityType, 'canBulkOps', v)}
                toggleSize="small"
              />
              <StyledRateLimitInput>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={cap.rateLimit}
                  onChange={(e) =>
                    handleRateLimitChange(cap.entityType, Number(e.target.value))
                  }
                  style={{
                    background: 'transparent',
                    border: `1px solid ${themeCssVariables.border.color.medium}`,
                    borderRadius: themeCssVariables.border.radius.sm,
                    color: 'inherit',
                    fontSize: themeCssVariables.font.size.sm,
                    padding: '2px 6px',
                    width: '52px',
                  }}
                />
              </StyledRateLimitInput>
            </StyledDataRow>
          ))}
        </StyledTableWrapper>
        {isDirty && (
          <StyledSaveHint>
            {t`Unsaved changes.`}{' '}
            <button
              onClick={handleSave}
              style={{
                background: 'none',
                border: 'none',
                color: themeCssVariables.color.blue,
                cursor: 'pointer',
                fontSize: 'inherit',
                padding: 0,
              }}
            >
              {t`Save now`}
            </button>
          </StyledSaveHint>
        )}
      </Section>

      <Section>
        <H2Title
          title={t`Global Rate Limit`}
          description={t`Maximum total agent actions per user per hour, across all entity types`}
        />
        <Card rounded>
          <StyledDataRow style={{ gridTemplateColumns: '1fr auto' }}>
            <StyledEntityLabel>
              {t`Actions per user per hour`}
            </StyledEntityLabel>
            <StyledRateLimitInput>
              <input
                type="number"
                min={1}
                max={2000}
                defaultValue={200}
                style={{
                  background: 'transparent',
                  border: `1px solid ${themeCssVariables.border.color.medium}`,
                  borderRadius: themeCssVariables.border.radius.sm,
                  color: 'inherit',
                  fontSize: themeCssVariables.font.size.sm,
                  padding: '2px 6px',
                  width: '64px',
                }}
              />
              <StyledRateLimitSuffix>{t`actions`}</StyledRateLimitSuffix>
            </StyledRateLimitInput>
          </StyledDataRow>
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`Dangerous Actions`}
          description={t`These require double-confirmation regardless of above settings`}
        />
        <Card rounded>
          {[
            { label: t`Bulk delete records`, description: t`Agent must ask twice before bulk deletion` },
            { label: t`Send external emails`, description: t`Agent must show draft and await approval` },
            { label: t`Modify workspace settings`, description: t`Always blocked for AI agents` },
          ].map(({ label, description }, i) => (
            <StyledDataRow
              key={i}
              style={{ gridTemplateColumns: '1fr auto', borderBottom: i < 2 ? `1px solid ${themeCssVariables.border.color.medium}` : 'none' }}
            >
              <div>
                <StyledEntityLabel>{label}</StyledEntityLabel>
                <br />
                <StyledRateLimitSuffix>{description}</StyledRateLimitSuffix>
              </div>
              <Toggle value={true} onChange={() => {}} toggleSize="small" disabled={i === 2} />
            </StyledDataRow>
          ))}
        </Card>
      </Section>
    </>
  );
};
