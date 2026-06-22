import React, { type ComponentType, type ReactNode } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { useRecentlyVisitedService } from "@common/components/layout/providers/RecentlyVisitedServiceStore";

export function withExtraProps<T extends object>(
  Component: React.ComponentType<T>,
  extraProps: Partial<T>,
) {
  const WrappedComponent = (props: Omit<T, keyof typeof extraProps>) => {
    return <Component {...(props as T)} {...extraProps} />;
  };
  WrappedComponent.displayName = `withExtraProps(${(Component.displayName ?? Component.name) || "Component"})`;
  return WrappedComponent;
}

export const withAccessControl = <P extends object>(
  config: {
    action: string | string[];
    fallbackProps?: object;
    FallbackUI?: ReactNode;
    storeType?: "Layout";
  },
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> => {
  const ComponentWithAccessControl: React.FC<P> = (props) => {
    const { fallbackProps, action, FallbackUI } = config;
    const store = useLayoutStore;
    const { allowedActions } = store((state) => state);
    const actions = Array.isArray(action) ? action : [action];
    const hasPermission = actions.some((a) => allowedActions.has(a));

    if (!hasPermission) {
      if (FallbackUI) return FallbackUI;
      return <WrappedComponent {...props} {...(fallbackProps as Partial<P>)} />;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAccessControl;
};

export function withHydration<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallbackUI?: ReactNode,
): // return component and keep generic component props
React.FC<P> {
  return function HydratedComponent(props: P) {
    const isHydrated = useRecentlyVisitedService((s) => s.isHydrated);

    if (!isHydrated) {
      return fallbackUI ?? null;
    }

    return <WrappedComponent {...props} />;
  };
}
