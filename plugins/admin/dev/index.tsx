import { createDevApp } from '@backstage/dev-utils';
import { adminPlugin, AdminPage } from '../src/plugin';

createDevApp()
  .registerPlugin(adminPlugin)
  .addPage({
    element: <AdminPage />,
    title: 'Root Page',
    path: '/admin',
  })
  .render();
