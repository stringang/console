import * as React from 'react';
import { FormGroup, Grid, GridItem, Tile, Tooltip } from '@patternfly/react-core';
import { LayerGroupIcon, CubeIcon, GitAltIcon, StarIcon } from '@patternfly/react-icons';
import { FormikValues, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { GitProvider, ImportStrategy } from '@console/git-service/src';
import { BuildStrategyType } from '@console/internal/components/build';
import { getFieldId, useFormikValidationFix } from '@console/shared/src';
import './ImportStrategySelector.scss';

const ImportStrategySelector: React.FC = () => {
  const { t } = useTranslation();
  const {
    values: {
      import: { recommendedStrategy, selectedStrategy },
      build: { strategy },
      git: { type },
    },
    setFieldValue,
  } = useFormikContext<FormikValues>();
  const fieldId = getFieldId('import.selectedStrategy', 'importStrategySelect');

  const itemList = [
    {
      name: 'Devfile',
      type: ImportStrategy.DEVFILE,
      build: BuildStrategyType.Devfile,
      priority: 2,
      detectedFiles: [],
      icon: <LayerGroupIcon />,
      isDisabled: type === GitProvider.UNSURE,
      disabledReason:
        type === GitProvider.UNSURE
          ? t('devconsole~Could not get Devfile for an unknown Git type')
          : null,
    },
    {
      name: 'Dockerfile',
      type: ImportStrategy.DOCKERFILE,
      build: BuildStrategyType.Docker,
      priority: 1,
      detectedFiles: [],
      icon: <CubeIcon />,
    },
    {
      name: 'Builder Image',
      type: ImportStrategy.S2I,
      build: BuildStrategyType.Source,
      priority: 0,
      detectedFiles: [],
      icon: <GitAltIcon />,
    },
  ];

  const onSelect = React.useCallback(
    (item) => {
      setFieldValue('import.selectedStrategy.name', item.name);
      setFieldValue('import.selectedStrategy.type', item.type);
      setFieldValue('import.selectedStrategy.priority', item.priority);
      setFieldValue('import.selectedStrategy.detectedFiles', item.detectedFiles);
      setFieldValue('build.strategy', item.build);
      setFieldValue('import.strategyChanged', false);
    },
    [setFieldValue],
  );

  useFormikValidationFix(strategy);

  return (
    <FormGroup fieldId={fieldId} label={t('devconsole~Import Strategy')}>
      <Grid hasGutter>
        {itemList.map((item) =>
          item.disabledReason ? (
            <Tooltip content={item.disabledReason}>
              <GridItem span={4} key={item.name}>
                <Tile
                  className="odc-import-strategy-selector__tile"
                  data-test={`import-strategy-${item.name}`}
                  title={item.name}
                  icon={item.icon}
                  onClick={() => onSelect(item)}
                  isSelected={selectedStrategy.type === item.type}
                  isDisabled={item.isDisabled}
                >
                  {recommendedStrategy?.type === item.type && (
                    <span className="odc-import-strategy-selector__recommended">
                      <StarIcon />
                    </span>
                  )}
                </Tile>
              </GridItem>
            </Tooltip>
          ) : (
            <GridItem span={4} key={item.name}>
              <Tile
                className="odc-import-strategy-selector__tile"
                data-test={`import-strategy-${item.name}`}
                title={item.name}
                icon={item.icon}
                onClick={() => onSelect(item)}
                isSelected={selectedStrategy.type === item.type}
                isDisabled={item.isDisabled}
              >
                {recommendedStrategy?.type === item.type && (
                  <span className="odc-import-strategy-selector__recommended">
                    <StarIcon />
                  </span>
                )}
              </Tile>
            </GridItem>
          ),
        )}
      </Grid>
    </FormGroup>
  );
};

export default ImportStrategySelector;
