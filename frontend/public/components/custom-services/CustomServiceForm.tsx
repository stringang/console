import * as React from 'react';
import { FormikProps, FormikValues } from 'formik';
import * as _ from 'lodash';
import { ServiceModel } from '@console/internal/models';
import { ServiceKind } from '@console/internal/module/k8s';
import {
  FlexForm,
  FormBody,
  FormFooter,
  SyncedEditorField,
  YAMLEditorField,
} from '@console/shared/src';
import { EditorType } from '@console/shared/src/components/synced-editor/editor-toggle';
import { safeJSToYAML } from '@console/shared/src/utils/yaml';
import { CreateCustomService } from './create-custom-service';
import { convertEditFormToService, convertServiceToEditForm } from './utils';
import { PageHeading } from '../utils';

type ServiceFormProps = {
  handleCancel: () => void;
  heading: string;
  submitLabel: string;
  service: ServiceKind;
  existingService?: ServiceKind;
};

export const CustomServiceForm: React.FC<FormikProps<FormikValues> & ServiceFormProps> = ({
  dirty,
  errors,
  service,
  existingService,
  handleCancel,
  handleSubmit,
  heading,
  isSubmitting,
  setStatus,
  status,
  submitLabel,
  validateForm,
  values,
}) => {
  // const { t } = useTranslation();
  const { editorType, formData } = values;
  const LAST_VIEWED_EDITOR_TYPE_USERSETTING_KEY = 'console.serviceForm.editor.lastView';

  const formEditor = <CreateCustomService service={service} existingService={existingService} />;

  const yamlEditor = (
    <YAMLEditorField name="yamlData" model={ServiceModel} onSave={handleSubmit} showSamples />
  );

  const sanitizeToForm = (yamlData: ServiceKind) => {
    return convertServiceToEditForm(yamlData);
  };

  const sanitizeToYaml = () =>
    safeJSToYAML(convertEditFormToService(formData, existingService), 'yamlData', {
      skipInvalid: true,
    });

  React.useEffect(() => {
    setStatus({ submitError: null });
    if (values.editorType === EditorType.Form) {
      setTimeout(() => validateForm(), 0);
    }
  }, [setStatus, values.editorType, validateForm]);

  return (
    <>
      <PageHeading title={heading} />
      <FlexForm onSubmit={handleSubmit}>
        <FormBody flexLayout className="co-m-pane__body--no-top-margin">
          <SyncedEditorField
            name="editorType"
            formContext={{
              name: 'formData',
              editor: formEditor,
              sanitizeTo: sanitizeToForm,
            }}
            yamlContext={{
              name: 'yamlData',
              editor: yamlEditor,
              sanitizeTo: sanitizeToYaml,
            }}
            lastViewUserSettingKey={LAST_VIEWED_EDITOR_TYPE_USERSETTING_KEY}
            noMargin
          />
        </FormBody>
        <FormFooter
          handleCancel={handleCancel}
          errorMessage={status?.submitError}
          successMessage={status?.submitSuccess}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          disableSubmit={
            (editorType === EditorType.YAML ? !dirty : !dirty || !_.isEmpty(errors)) || isSubmitting
          }
          sticky
        />
      </FlexForm>
    </>
  );
};
