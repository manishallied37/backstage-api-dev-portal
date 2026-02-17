import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const dbSetupPlugin = createPlugin({
  id: 'db-setup',
  routes: {
    root: rootRouteRef,
  },
});

export const DbSetupPage = dbSetupPlugin.provide(
  createRoutableExtension({
    name: 'DbSetupPage',
    component: () =>
      import('./components/DbSetupPage').then(m => m.DbSetupPage),
    mountPoint: rootRouteRef,
  }),
);