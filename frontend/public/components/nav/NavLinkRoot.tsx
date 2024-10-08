import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '@console/internal/redux';
import { getActiveNamespace } from '@console/internal/reducers/ui';
import { stripNS } from './utils';
import { NavLinkComponent, NavLinkProps } from './NavLink';

// TODO [tech debt] Remove this component and use hooks in NavLinkHref, NavLinkResourceNS,
// and NavLinkResourceCluster
const NavLinkRoot_: React.FC<NavLinkRootProps & NavLinkRootStateProps> = ({
  component: Component,
  isActive,
  className,
  children,
  dragRef,
  ...props
}) => {
  return (
    <Component className={className} {...props} isActive={isActive} dragRef={dragRef}>
      {children}
    </Component>
  );
};

const navLinkRootMapStateToProps = (
  state: RootState,
  { component: Component, ...props }: NavLinkRootProps,
): NavLinkRootStateProps => {
  const activeNamespace = getActiveNamespace(state);
  const location = stripNS(state.UI.get('location'));
  return {
    activeNamespace,
    isActive: Component.isActive(props, location, activeNamespace),
  };
};

export const NavLinkRoot = connect(navLinkRootMapStateToProps)(NavLinkRoot_);

type NavLinkRootStateProps = {
  isActive: boolean;
  activeNamespace: string;
};

type NavLinkRootProps<T extends NavLinkProps = NavLinkProps> = NavLinkProps & {
  component: NavLinkComponent<T>;
};
