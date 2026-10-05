import type { ErrorInfo } from 'react';
import { ErrorBoundary, getErrorMessage, type FallbackProps } from 'react-error-boundary';

export type ProfileService = { getName(userId: string): string };

function Profile({ userId, service }: { userId: string; service: ProfileService }) {
  return <h2>{service.getName(userId)}</h2>; // throws when the service fails
}

// FallbackProps.error is `unknown` since react-error-boundary 6.1, so narrow it before use.
function ProfileFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Could not load the profile: {getErrorMessage(error) ?? 'unknown error'}</p>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

type Props = {
  userId: string;
  service: ProfileService;
  onError?: (error: unknown, info: ErrorInfo) => void;
};

/** 16.3: the same job as ResettableBoundary, done by react-error-boundary. */
export function SafeProfile({ userId, service, onError }: Props) {
  return (
    <ErrorBoundary FallbackComponent={ProfileFallback} resetKeys={[userId]} onError={onError}>
      <Profile userId={userId} service={service} />
    </ErrorBoundary>
  );
}
