import * as _ from 'lodash-es';
import * as React from 'react';
import { connect, FormikContextType, FormikValues } from 'formik';
import { TFunction } from 'i18next';
/* eslint-disable-next-line */
import { withTranslation, WithTranslation } from "react-i18next";
import { AsyncComponentProps, Dropdown } from '../utils';
import { K8sResourceKind, ServiceKind, ServicePort } from '../../module/k8s';
import { getActiveNamespace } from '../../actions/ui';
import { AsyncComponent } from '../utils/async';
import { Button, Grid, GridItem } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { selectorToK8s } from './utils';

const NameValueEditorComponent = (props: Omit<AsyncComponentProps, 'loader'>) => (
  <AsyncComponent
    loader={() =>
      import('@console/internal/components/utils/name-value-editor').then((c) => c.NameValueEditor)
    }
    {...props}
  />
);

class CreateServiceWithTranslation extends React.Component<
  CreateServiceProps & { formik: FormikContextType<FormikValues> },
  CreateServiceState
> {
  state = {
    name: '',
    namespace: getActiveNamespace(),
    selector: {},
    labels: {},
    annotations: {},
    ports: [
      {
        name: '',
        port: '',
        targetPort: '',
        protocol: 'TCP',
      },
    ],
    type: 'ClusterIP',
    selectorOptions: [['', '']],
    labelOptions: [['', '']],
    annotationOptions: [['', '']],
    isVisible: false,
    headless: false,
    externalTrafficPolicy: 'Cluster',
  };

  componentDidMount() {
    const { formik } = this.props;
    formik.setFieldValue('formData.namespace', this.state.namespace);
    formik.setFieldValue('formData.type', this.state.type);
    this.setState((state) => ({ ...state, ...formik.values.formData }));
  }

  handleChangeName: React.ReactEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.currentTarget;
    this.setState({
      [name]: value,
    } as any);
    this.props.formik.setFieldValue(`formData.${name}`, value);
  };

  changeServiceType = (serviceType: string) => {
    this.props.formik.setFieldValue('formData.type', serviceType);
    this.setState({ type: serviceType });
  };

  changeExternalTrafficPolicy = (externalTrafficPolicy: string) => {
    this.props.formik.setFieldValue('formData.externalTrafficPolicy', externalTrafficPolicy);
    this.setState({ externalTrafficPolicy });
  };

  changePodSelector = ({ nameValuePairs: updatedNameValuePairs }) => {
    const selector = selectorToK8s(updatedNameValuePairs);
    this.setState({ selectorOptions: updatedNameValuePairs });
    this.setState({ selector });
    this.props.formik.setFieldValue('formData.selector', selector);
  };

  changeAnnotations = ({ nameValuePairs: updatedNameValuePairs }) => {
    const annotations = selectorToK8s(updatedNameValuePairs);
    this.setState({ annotationOptions: updatedNameValuePairs });
    this.setState({ annotations });
    this.props.formik.setFieldValue('formData.annotations', annotations);
  };

  changeLabels = ({ nameValuePairs: updatedNameValuePairs }) => {
    const labels = selectorToK8s(updatedNameValuePairs);
    this.setState({ labelOptions: updatedNameValuePairs });
    this.setState({ labels });
    this.props.formik.setFieldValue('formData.labels', labels);
  };

  changeHeadless = (event) => {
    const { name, checked } = event.currentTarget;
    this.setState({
      [name]: checked,
    } as any);
    this.props.formik.setFieldValue(`formData.${name}`, checked);
  };

  changePort = (ports) => {
    this.setState({ ports });
  };

  onSingleChange = (port: ServicePort, index: number) => {
    const ports = [...this.state.ports.slice(0, index), port, ...this.state.ports.slice(index + 1)];
    this.setState({ ports });
    this.props.formik.setFieldValue('formData.ports', ports);
  };

  onRemove = (index: number) => {
    const ports = [...this.state.ports.slice(0, index), ...this.state.ports.slice(index + 1)];
    this.setState({ ports });
  };

  render() {
    const { t, existingService } = this.props;
    const { ports, selectorOptions, labelOptions, annotationOptions } = this.state;

    const serviceTypes = {
      ClusterIP: 'ClusterIP',
      NodePort: 'NodePort',
      LoadBalancer: 'LoadBalancer',
    };

    const trafficPolicies = {
      Local: 'Local',
      Cluster: 'Cluster',
    };

    return (
      <div className="co-m-pane__form">
        <div className="form-group co-create-service__name">
          <label className="co-required" htmlFor="name">
            {t('public~Name')}
          </label>
          <input
            className="pf-c-form-control"
            type="text"
            onChange={this.handleChangeName}
            value={this.state.name}
            disabled={!!existingService}
            placeholder="my-service"
            id="name"
            name="name"
            aria-describedby="name-help"
            required
          />
        </div>
        <div className="form-group co-create-service__type">
          <label className="co-required">{t('public~Service type')}</label>
          <Dropdown
            items={serviceTypes}
            title={this.state.type}
            dropDownClassName="dropdown--full-width"
            name="type"
            onChange={this.changeServiceType}
            disabled={this.state.headless}
            // selectedKey={this.state.type}
          />
          {this.state.type === 'ClusterIP' && (
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  onChange={this.changeHeadless}
                  checked={this.state.headless}
                  id="headless"
                  name="headless"
                  aria-describedby="headless-help"
                />
                {t('public~Headless service')}
              </label>
            </div>
          )}
          {this.state.type === 'NodePort' && (
            <div className="co-create-service__externaltrafficpolicy">
              <div className="form-group co-create-service__externalTrafficPolicy">
                <label className="co-required">{t('public~Select traffic policy')}</label>
                <Dropdown
                  items={trafficPolicies}
                  title={t('public~Select termination type')}
                  dropDownClassName="dropdown--full-width"
                  id="tls-termination"
                  onChange={this.changeExternalTrafficPolicy}
                  selectedKey={this.state.externalTrafficPolicy}
                />
              </div>
            </div>
          )}
        </div>
        <div className="form-group co-create-service__selector">
          <span>
            <label>{t('public~Pod selector')}</label>
          </span>
          <NameValueEditorComponent
            nameValuePairs={selectorOptions.length > 0 ? selectorOptions : [['', '']]}
            addString={t('public~Add label')}
            readOnly={false}
            allowSorting={false}
            updateParentData={this.changePodSelector}
          />
        </div>
        <div className="form-group co-create-service__ports-list">
          <label>{t('public~Service port mapping')}</label>
          <div className="odc-multi-column-field__header">
            <Grid>
              <GridItem span={3}>
                <>
                  {t('public~Name')}
                  <span
                    className="odc-multi-column-field__header--required-label"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </>
              </GridItem>
              <GridItem span={3}>
                <>
                  {t('public~Service port')}
                  <span
                    className="odc-multi-column-field__header--required-label"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </>
              </GridItem>
              <GridItem span={3}>
                <>
                  {t('public~Container port')}
                  <span
                    className="odc-multi-column-field__header--required-label"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </>
              </GridItem>
              <GridItem span={3}>
                <>
                  {t('public~Protocol')}
                  <span
                    className="odc-multi-column-field__header--required-label"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </>
              </GridItem>
            </Grid>
          </div>

          {ports.map((port, idx) => {
            return (
              <div className="odc-multi-column-field__row" key={idx}>
                <Grid>
                  <GridItem span={3}>
                    <div className="odc-multi-column-field__col">
                      <input
                        className="pf-c-form-control"
                        onChange={(event) =>
                          this.onSingleChange({ ...port, name: event.currentTarget.value }, idx)
                        }
                        placeholder="name"
                        aria-describedby="name-help"
                        name={`${idx}-name`}
                        id={`${idx}-name`}
                        value={port.name}
                        data-test="name-input"
                      />
                    </div>
                  </GridItem>
                  <GridItem span={3}>
                    <div className="odc-multi-column-field__col">
                      <input
                        className="pf-c-form-control"
                        onChange={(event) =>
                          this.onSingleChange(
                            { ...port, port: _.toInteger(event.currentTarget.value) },
                            idx,
                          )
                        }
                        placeholder="port"
                        aria-describedby="port-help"
                        name={`${idx}-port`}
                        id={`${idx}-port`}
                        value={port.port}
                        data-test="port-input"
                      />
                    </div>
                  </GridItem>
                  <GridItem span={3}>
                    <div className="odc-multi-column-field__col">
                      <input
                        className="pf-c-form-control"
                        onChange={(event) =>
                          this.onSingleChange(
                            { ...port, targetPort: _.toInteger(event.currentTarget.value) },
                            idx,
                          )
                        }
                        placeholder="targetPort"
                        aria-describedby="targetPort-help"
                        name={`${idx}-targetPort`}
                        id={`${idx}-targetPort`}
                        value={port.targetPort}
                        data-test="targetPort-input"
                      />
                    </div>
                  </GridItem>
                  <GridItem span={3}>
                    <div className="odc-multi-column-field__col">
                      <Dropdown
                        items={{
                          TCP: <>TCP</>,
                          UDP: <>UDP</>,
                          SCTP: <>SCTP</>,
                        }}
                        title={port.protocol}
                        name={`${idx}-protocol`}
                        className="service-protocol-btn-group"
                        onChange={(protocol) => this.onSingleChange({ ...port, protocol }, idx)}
                        data-test="port-protocol"
                      />
                    </div>
                  </GridItem>
                </Grid>
                <div className={'odc-multi-column-field__col--button'}>
                  <Button
                    aria-label={t('public~Remove')}
                    className="co-create-service__remove-port"
                    onClick={() => this.onRemove(idx)}
                    type="button"
                    variant="plain"
                    data-test="remove-port"
                    disabled={idx === 0}
                  >
                    <MinusCircleIcon />
                  </Button>
                </div>
              </div>
            );
          })}
          <div className="co-toolbar__group co-toolbar__group--left co-create-service__add-port">
            <Button
              className="pf-m-link--align-left"
              onClick={() => {
                this.changePort([
                  ...ports,
                  { name: '', port: '', targetPort: '', protocol: 'TCP' },
                ]);
              }}
              type="button"
              variant="link"
              data-test="add-port"
            >
              <PlusCircleIcon className="co-icon-space-r" />
              {t('public~Add more')}
            </Button>
          </div>
        </div>
        <div className="form-group co-create-service__annotation">
          <span>
            <label>{t('public~Annotations')}</label>
          </span>
          <NameValueEditorComponent
            nameValuePairs={annotationOptions.length > 0 ? annotationOptions : [['', '']]}
            addString={t('public~Add annotation')}
            readOnly={false}
            allowSorting={false}
            updateParentData={this.changeAnnotations}
          />
        </div>
        <div className="form-group co-create-service__label">
          <span>
            <label>{t('public~Labels')}</label>
          </span>
          <NameValueEditorComponent
            nameValuePairs={labelOptions.length > 0 ? labelOptions : [['', '']]}
            addString={t('public~Add label')}
            readOnly={false}
            allowSorting={false}
            updateParentData={this.changeLabels}
          />
        </div>
      </div>
    );
  }
}

export const CreateCustomService = withTranslation()(
  connect<CreateServiceProps, any>(CreateServiceWithTranslation),
);

type CreateServiceProps = WithTranslation & {
  t: TFunction;
  service: K8sResourceKind;
  existingService?: ServiceKind;
};

export type ServiceFormProps = {
  name: string;
  namespace: string;
  labels: object;
  selector: object;
  ports: ServicePort[];
  selectorOptions: any;
  isVisible: boolean;
  type: string;
  headless: boolean;
  annotations: object;
  annotationOptions: any;
  labelOptions: any;
  externalTrafficPolicy: string;
};

export type CreateServiceState = ServiceFormProps & {
  isVisible: boolean;
};
