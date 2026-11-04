import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const localDemos: Record<string, LazyExoticComponent<ComponentType>> = {
  button: lazy(() => import('./DemoButton')),
  segmented: lazy(() => import('./DemoSegmented')),
  meter: lazy(() => import('./DemoMeter')),
  'status-dot': lazy(() => import('./DemoStatusDot')),
  surface: lazy(() => import('./DemoSurface')),
  'page-title': lazy(() => import('./DemoPageTitle')),
  states: lazy(() => import('./DemoStates')),
  'confirm-row': lazy(() => import('./DemoConfirmRow')),
  'otp-input': lazy(() => import('./DemoOtpInput')),
  stepper: lazy(() => import('./DemoStepper')),
  'pricing-plans': lazy(() => import('./DemoPricingPlans')),
  'rolling-number': lazy(() => import('./DemoRollingNumber')),
  toaster: lazy(() => import('./DemoToaster')),
};
