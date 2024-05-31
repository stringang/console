import * as yup from 'yup';
import { ServiceKind } from '@console/internal/module/k8s';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { getActiveNamespace } from '../../actions/ui';
import { ServiceFormProps } from './create-custom-service';
import * as _ from 'lodash-es';

export const serviceValidationSchema = yup.object({
  editorType: yup.string(),
  formData: yup.object().when('editorType', {
    is: EditorType.Form,
    then: yup.object({
      name: yup.string().required(),
      ports: yup.array().of(
        yup.object({
          name: yup.string().required(),
          port: yup.string().required(),
          targetPort: yup.string().required(),
          protocol: yup.string().required(),
        }),
      ),
    }),
  }),
});

export const selectorToK8s = (selector: string[][]): {} => {
  const filtered = selector.filter((pair) => pair.length >= 2 && pair[0] !== '');
  if (filtered.length > 0) {
    return _.fromPairs(filtered);
  }
  return {};
};

const selectorFromK8s = (selector: {} | undefined): string[][] => {
  if (!selector) {
    return [];
  }
  return _.isEmpty(selector) ? [] : _.map(selector, (key: string, val: string) => [val, key]);
};

export const convertServiceToEditForm = (data: ServiceKind): Partial<ServiceFormProps> => {
  if (!data) {
    return null;
  }
  const { metadata, spec } = data;
  return {
    name: metadata?.name,
    namespace: metadata?.namespace || getActiveNamespace(),
    labels: metadata?.labels,
    labelOptions: metadata?.labels ? selectorFromK8s(metadata?.labels) : [['', '']],
    annotations: metadata?.annotations,
    annotationOptions: metadata?.annotations ? selectorFromK8s(metadata?.annotations) : [['', '']],
    selector: spec?.selector,
    selectorOptions: spec?.selector ? selectorFromK8s(spec?.selector) : [['', '']],
    ports: spec?.ports || [
      {
        name: '',
        port: '',
        targetPort: '',
        protocol: 'TCP',
      },
    ],
    isVisible: true,
    headless: spec?.clusterIP === 'None',
    type: spec?.type,
  };
};

export const convertEditFormToService = (
  formData: ServiceFormProps,
  existingService?: ServiceKind,
): ServiceKind => {
  const {
    name,
    selector,
    ports,
    namespace,
    headless,
    type,
    labels,
    annotations,
    externalTrafficPolicy,
  } = formData;

  const mergeLabels = _.merge(labels, _.get(existingService, 'metadata.labels'));

  const mergeAnnotations = _.merge(annotations, _.get(existingService, 'metadata.annotations'));

  const service: ServiceKind = {
    kind: 'Service',
    apiVersion: 'v1',
    metadata: {
      ..._.get(existingService, 'metadata', {}),
      name,
      namespace: namespace || getActiveNamespace(),
      labels: mergeLabels,
      annotations: mergeAnnotations,
    },
    spec: {
      ..._.get(existingService, 'spec', {}),
      selector,
      ports,
      type,
      clusterIP: headless ? 'None' : '',
      externalTrafficPolicy,
    },
  };

  return service;
};
