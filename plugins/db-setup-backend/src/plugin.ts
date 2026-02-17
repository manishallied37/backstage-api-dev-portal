import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { todoListServiceRef } from './services/TodoListService';

/**
 * dbSetupPlugin backend plugin
 *
 * @public
 */
export const dbSetupPlugin = createBackendPlugin({
  pluginId: 'db-setup',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        todoList: todoListServiceRef,
      },
      async init({ httpAuth, httpRouter, todoList }) {
        httpRouter.addAuthPolicy({
          path: '/test-db',
          allow: 'unauthenticated',
        });

        httpRouter.addAuthPolicy({
          path: '/save-db',
          allow: 'unauthenticated',
        });

        httpRouter.addAuthPolicy({
          path: '/status',
          allow: 'unauthenticated',
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            todoList,
          }),
        );
      },
    });
  },
});
