/**
 * Shared UI and API – re-exports for portal structure.
 * Phase 7. Components and services remain in src/components, src/services, src/contexts.
 */

export { default as Header } from '../components/Header';
export { default as Footer } from '../components/Footer';
export { default as ProtectedRoute } from '../components/ProtectedRoute';
export { default as PageTransition } from '../components/PageTransition';
export { default as FloatingButton } from '../components/FloatingButton';
export { default as ConsentBanner } from '../components/ConsentBanner';
export { default as TermsPrivacySummary } from '../components/TermsPrivacySummary';
export { default as ErrorBoundary } from '../components/ErrorBoundary';
export * from '../services/api';
export { useAuth, AuthProvider } from '../contexts/AuthContext';
