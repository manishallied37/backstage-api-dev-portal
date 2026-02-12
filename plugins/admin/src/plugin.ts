import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const adminPlugin = createPlugin({
  id: 'admin',
  routes: {
    root: rootRouteRef,
  },
});

export const AdminPage = adminPlugin.provide(
  createRoutableExtension({
    name: 'AdminPage',
    component: () =>
      import('./components/LdapConfigPage').then(m => m.LdapConfigPage),
    mountPoint: rootRouteRef,
  }),
);
