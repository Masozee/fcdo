'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that defers rendering of its children to client-side only
 * This helps avoid useLayoutEffect warnings during server-side rendering
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * HOC that wraps a component to make it client-side only
 * This is useful for components that use useLayoutEffect
 */
export function withClientOnly<P extends object>(Component: React.ComponentType<P>) {
  return function WithClientOnly(props: P) {
    return (
      <ClientOnly>
        <Component {...props} />
      </ClientOnly>
    );
  };
} 