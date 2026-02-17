import { createDevApp } from '@backstage/dev-utils';
import { dbSetupPlugin, DbSetupPage } from '../src/plugin';

createDevApp()
  .registerPlugin(dbSetupPlugin)
  .addPage({
    element: <DbSetupPage />,
    title: 'Root Page',
    path: '/db-setup',
  })
  .render();
