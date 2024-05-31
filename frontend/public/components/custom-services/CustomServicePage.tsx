import * as React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { RouteComponentProps } from 'react-router-dom';
import { useAccessReviewAllowed } from '@console/dynamic-plugin-sdk/src';
import { k8sCreateResource, k8sUpdateResource } from '@console/dynamic-plugin-sdk/src/utils/k8s';
import { ErrorPage404 } from '@console/internal/components/error';
import { StatusBox, history } from '@console/internal/components/utils';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { ServiceModel } from '@console/internal/models';
import { referenceForModel, ServiceKind } from '@console/internal/module/k8s';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { safeJSToYAML, safeYAMLToJS } from '@console/shared/src/utils/yaml';
import { baseTemplates } from '../../models/yaml-templates';
import { CustomServiceForm } from './CustomServiceForm';
import { useTranslation } from 'react-i18next';
import {
  convertServiceToEditForm,
  convertEditFormToService,
  serviceValidationSchema,
} from './utils';
import { ServiceFormProps } from './create-custom-service';

type ServiceFormValues = {
  editorType: EditorType;
  formData: ServiceFormProps;
  yamlData: string;
};

const defaultServiceYAML = baseTemplates.get(referenceForModel(ServiceModel)).get('default');

export type ServicePageProps = RouteComponentProps<{ ns?: string; name?: string }>;

// 可视化创建 service
export const CustomServicePage: React.FC<ServicePageProps> = ({ match }) => {
  const { t } = useTranslation();
  const namespace = match.params.ns;
  const name = match.params.name;
  // 编辑(更新)模式
  const isEditForm = !!name;
  const heading = isEditForm ? t('public~Edit service') : t('public~Create service');
  const submitLabel = isEditForm ? t('public~Save') : t('public~Create');

  const [service, servicesLoaded, serviceLoadError] = useK8sWatchResource<ServiceKind>({
    kind: ServiceModel.kind,
    name,
    namespace,
  });

  const loaded = servicesLoaded;

  const canUpdateHost = useAccessReviewAllowed({
    group: ServiceModel.apiGroup,
    resource: 'services/service',
    verb: 'update',
    name,
    namespace,
  });

  const initialValues = React.useMemo(
    () => ({
      editorType: EditorType.Form,
      yamlData: isEditForm
        ? safeJSToYAML(service, 'yamlData', {
            skipInvalid: true,
          })
        : defaultServiceYAML,
      formData: isEditForm ? convertServiceToEditForm(service) : {},
    }),
    [isEditForm, service],
  );

  const handleSubmit = async (
    values: ServiceFormValues,
    helpers: FormikHelpers<ServiceFormValues>,
  ) => {
    debugger;
    const data: ServiceKind =
      values.editorType === EditorType.Form
        ? convertEditFormToService(values.formData, isEditForm && service)
        : safeYAMLToJS(values.yamlData);

    if (data?.metadata && !data.metadata.namespace) {
      data.metadata.namespace = namespace;
    }

    if (!canUpdateHost && isEditForm) {
      helpers.setStatus({
        submitSuccess: '',
        submitError: t('public~Insufficient permissions to update host.'),
      });
      return null;
    }

    let resource: ServiceKind;
    try {
      if (isEditForm) {
        resource = await k8sUpdateResource({ model: ServiceModel, data, name });
      } else {
        resource = await k8sCreateResource({ model: ServiceModel, data });
      }
      history.push(`/k8s/ns/${resource.metadata.namespace}/services/${resource.metadata.name}`);
    } catch (e) {
      helpers.setStatus({
        submitSuccess: '',
        submitError: e?.message || t('public~Unknown error submitting'),
      });
    }

    return resource;
  };

  const handleCancel = () => history.goBack();

  if (isEditForm && loaded && !service) {
    return <ErrorPage404 />;
  }

  return (
    <StatusBox loaded={loaded} loadError={serviceLoadError} data={initialValues}>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={serviceValidationSchema}
        enableReinitialize
      >
        {(formikProps) => (
          <CustomServiceForm
            {...formikProps}
            heading={heading}
            handleCancel={handleCancel}
            submitLabel={submitLabel}
            service={service}
            existingService={name && service}
          />
        )}
      </Formik>
    </StatusBox>
  );
};
