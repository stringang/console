import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { sortable } from '@patternfly/react-table';
import { DetailsPage, ListPage, Table, TableData } from './factory';
import {
  DetailsItem,
  Kebab,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
  detailsPage,
  navFactory,
  LabelList,
  Selector,
  ResourceIcon,
} from './utils';
import { K8sResourceKindReference, ServiceKind } from '../module/k8s';
import { ServiceModel } from '../models';

const ServicesReference: K8sResourceKindReference = 'Service';
const menuActions = [
  Kebab.factory.ModifyPodSelector,
  ...Kebab.getExtensionsActionsForKind(ServiceModel),
  ...Kebab.factory.common,
];

const tableColumnClasses = [
  '',
  '',
  // Status is less important than Location, so hide it earlier, but maintain its position for consistency with other tables
  classNames('pf-m-hidden', 'pf-m-visible-on-lg', 'pf-u-w-16-on-lg'),
  classNames('pf-m-hidden', 'pf-m-visible-on-sm'),
  classNames('pf-m-hidden', 'pf-m-visible-on-lg'),
  Kebab.columnClass,
];

const kind = 'Service';

const ServiceIP = ({ obj: s }) => {
  return (
    <>
      {_.map(s.spec.ports, (portObj, i) => {
        const clusterIP =
          s.spec.clusterIP === 'None' ? 'None' : `${s.spec.clusterIP}:${portObj.port}`;
        return (
          <div key={i} className="co-truncate co-select-to-copy">
            {clusterIP}
          </div>
        );
      })}
    </>
  );
};

const ServiceTableRow = ({ obj: s }) => {
  return (
    <>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={s.metadata.name} namespace={s.metadata.namespace} />
      </TableData>
      <TableData
        className={classNames(tableColumnClasses[1], 'co-break-word')}
        columnID="namespace"
      >
        <ResourceLink kind="Namespace" name={s.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[2]}>
        <LabelList kind={kind} labels={s.metadata.labels} />
      </TableData>
      <TableData className={tableColumnClasses[3]}>
        <Selector selector={s.spec.selector} namespace={s.metadata.namespace} />
      </TableData>
      <TableData className={tableColumnClasses[4]}>
        <ServiceIP obj={s} />
      </TableData>
      <TableData className={tableColumnClasses[5]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={s} />
      </TableData>
    </>
  );
};

const ServiceAddress = ({ s }) => {
  const { t } = useTranslation();
  const ServiceIPsRow = (name, desc, ips, note = null) => (
    <div className="co-ip-row">
      <div className="row">
        <div className="col-xs-6">
          <p className="ip-name">{name}</p>
          <p className="ip-desc">{desc}</p>
        </div>
        <div className="col-xs-6">
          {note && <span className="text-muted">{note}</span>}
          {ips.join(', ')}
        </div>
      </div>
    </div>
  );

  const ServiceType = (type) => {
    switch (type) {
      case 'NodePort':
        return ServiceIPsRow(
          t('public~Node port'),
          t('public~Accessible outside the cluster'),
          _.map(s.spec.ports, 'nodePort'),
          t('public~(all nodes): '),
        );
      case 'LoadBalancer':
        return ServiceIPsRow(
          t('public~External load balancer'),
          t('public~Ingress points of load balancer'),
          _.map(s.status.loadBalancer.ingress, (i) => i.hostname || i.ip || '-'),
        );
      case 'ExternalName':
        return ServiceIPsRow(
          t('public~External service name'),
          t('public~Location of the resource that backs the service'),
          [s.spec.externalName],
        );
      default:
        return ServiceIPsRow(
          t('public~Cluster IP'),
          t('public~Accessible within the cluster only'),
          [s.spec.clusterIP],
        );
    }
  };

  return (
    <div>
      <div className="row co-ip-header">
        <div className="col-xs-6">{t('public~Type')}</div>
        <div className="col-xs-6">{t('public~Location')}</div>
      </div>
      <div className="rows">
        {ServiceType(s.spec.type)}
        {s.spec.externalIPs &&
          ServiceIPsRow(
            t('public~External IP'),
            t('public~IP Addresses accepting traffic for service'),
            s.spec.externalIPs,
          )}
      </div>
    </div>
  );
};

const ServicePortMapping = ({ ports }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="row co-ip-header">
        <div className="col-xs-3">{t('public~Name')}</div>
        <div className="col-xs-3">{t('public~Port')}</div>
        <div className="col-xs-3">{t('public~Protocol')}</div>
        <div className="col-xs-3">{t('public~Pod port or name')}</div>
      </div>
      <div className="rows">
        {ports.map((portObj, i) => {
          return (
            <div className="co-ip-row" key={i}>
              <div className="row">
                <div className="col-xs-3 co-text-service">
                  <p>{portObj.name || '-'}</p>
                  {portObj.nodePort && <p className="co-text-node">{t('public~Node port')}</p>}
                </div>
                <div className="col-xs-3 co-text-service">
                  <p>
                    <ResourceIcon kind="Service" />
                    <span>{portObj.port}</span>
                  </p>
                  {portObj.nodePort && (
                    <p className="co-text-node">
                      <ResourceIcon kind="Node" />
                      <span>{portObj.nodePort}</span>
                    </p>
                  )}
                </div>
                <div className="col-xs-3">
                  <p>{portObj.protocol}</p>
                </div>
                <div className="col-xs-3 co-text-pod">
                  <p>
                    <ResourceIcon kind="Pod" />
                    <span>{portObj.targetPort}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ServiceDetails: React.FC<ServicesDetailsProps> = ({ obj: service }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="co-m-pane__body">
        <div className="row">
          <div className="col-md-6">
            <SectionHeading text={t('public~Service details')} />
            <ResourceSummary resource={service} showPodSelector>
              <DetailsItem
                label={t('public~Session affinity')}
                obj={service}
                path="spec.sessionAffinity"
              />
            </ResourceSummary>
          </div>
          <div className="col-md-6">
            <SectionHeading text={t('public~Service routing')} />
            <dl>
              <dt>{t('public~Hostname')}</dt>
              <dd>
                <div className="co-select-to-copy">
                  {service.metadata.name}.{service.metadata.namespace}.svc.cluster.local
                </div>
                <div>{t('public~Accessible within the cluster only')}</div>
              </dd>
              <dt>{t('public~Service address')}</dt>
              <dd className="service-ips">
                <ServiceAddress s={service} />
              </dd>
              <DetailsItem label={t('public~Service port mapping')} obj={service} path="spec.ports">
                <div className="service-ips">
                  {service.spec.ports ? <ServicePortMapping ports={service.spec.ports} /> : '-'}
                </div>
              </DetailsItem>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
};

export const ServicesDetailsPage: React.FC<ServicesDetailsPageProps> = (props) => {
  return (
    <DetailsPage
      {...props}
      // getResourceStatus={routeStatus}
      kind={ServicesReference}
      menuActions={menuActions}
      pages={[
        navFactory.details(detailsPage(ServiceDetails)),
        navFactory.editYaml(),
        navFactory.pods(),
      ]}
    />
  );
};

export const ServicesList: React.FC = (props) => {
  const { t } = useTranslation();
  const ServiceTableHeader = () => {
    return [
      {
        title: t('public~Name'),
        sortField: 'metadata.name',
        transforms: [sortable],
        props: { className: tableColumnClasses[0] },
      },
      {
        title: t('public~Namespace'),
        sortField: 'metadata.namespace',
        transforms: [sortable],
        props: { className: tableColumnClasses[1] },
        id: 'namespace',
      },
      {
        title: t('public~Labels'),
        sortField: 'metadata.labels',
        transforms: [sortable],
        props: { className: tableColumnClasses[2] },
      },
      {
        title: t('public~Pod selector'),
        sortField: 'spec.selector',
        transforms: [sortable],
        props: { className: tableColumnClasses[3] },
      },
      {
        title: t('public~Location'),
        sortField: 'spec.clusterIP',
        transforms: [sortable],
        props: { className: tableColumnClasses[4] },
      },
      {
        title: '',
        props: { className: tableColumnClasses[5] },
      },
    ];
  };
  return (
    <Table
      {...props}
      aria-label={t('public~Services')}
      Header={ServiceTableHeader}
      Row={ServiceTableRow}
      virtualize
    />
  );
};

export const ServicesPage: React.FC<ServicesPageProps> = (props) => {
  // const { t } = useTranslation();
  const createProps = {
    to: `/k8s/ns/${props.namespace || 'default'}/services/~new`,
  };

  return (
    <ListPage
      ListComponent={ServicesList}
      kind={ServicesReference}
      canCreate={true}
      createProps={createProps}
      {...props}
    />
  );
};

export type ServicesPageProps = {
  obj: ServiceKind;
  namespace: string;
};

export type ServicesDetailsProps = {
  obj: ServiceKind;
};

export type ServicesDetailsPageProps = {
  match: any;
};
