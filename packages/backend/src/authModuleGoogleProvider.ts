import { createBackendModule } from '@backstage/backend-plugin-api';
import {
    DEFAULT_NAMESPACE,
    stringifyEntityRef,
} from '@backstage/catalog-model';
import { googleAuthenticator } from '@backstage/plugin-auth-backend-module-google-provider';
import {
    authProvidersExtensionPoint,
    createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { tryGetDbPool } from './db';
import { coreServices } from '@backstage/backend-plugin-api';

export default createBackendModule({
    pluginId: 'auth',
    moduleId: 'googleProvider',

    register(reg) {
        reg.registerInit({
            deps: {
                providers: authProvidersExtensionPoint,
                config: coreServices.rootConfig,
            },

            async init({ providers, config }) {

                providers.registerProvider({
                    providerId: 'google',

                    factory: createOAuthProviderFactory({
                        authenticator: googleAuthenticator,

                        async signInResolver({ result: { fullProfile } }, ctx) {

                            const email = fullProfile?.emails?.[0]?.value;

                            if (!email) {
                                throw new Error('Google profile does not contain email');
                            }

                            const userId = email.split('@')[0];

                            const pool = tryGetDbPool(config);

                            if (!pool) {
                                throw new Error('System is not initialized. Please complete setup first.');
                            }

                            const client = await pool.connect();

                            try {
                                const result = await client.query(
                                    'SELECT role, is_registered FROM api_users WHERE email = $1',
                                    [email],
                                );

                                if (result.rowCount === 0) {
                                    throw new Error('User not registered in system');
                                }

                                const dbUser = result.rows[0];

                                if (!dbUser.is_registered) {
                                    throw new Error('User not activated');
                                }

                                const role = dbUser.role;

                                const groupName =
                                    role === 'superuser'
                                        ? 'superusers'
                                        : role === 'admin'
                                            ? 'admins'
                                            : 'users';

                                const userEntityRef = stringifyEntityRef({
                                    kind: 'User',
                                    name: userId,
                                    namespace: DEFAULT_NAMESPACE,
                                });

                                const groupEntityRef = stringifyEntityRef({
                                    kind: 'Group',
                                    name: groupName,
                                    namespace: DEFAULT_NAMESPACE,
                                });

                                return ctx.issueToken({
                                    claims: {
                                        sub: userEntityRef,
                                        ent: [userEntityRef, groupEntityRef],
                                        role: role,
                                        email: email,
                                    },
                                });

                            } finally {
                                client.release();
                            }
                        },
                    }),
                });
            },
        });
    },
});
