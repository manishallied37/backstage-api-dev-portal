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

export default createBackendModule({
    pluginId: 'auth',
    moduleId: 'googleProvider',
    register(reg) {
        reg.registerInit({
            deps: { providers: authProvidersExtensionPoint },
            async init({ providers }) {
                providers.registerProvider({
                    providerId: 'google',
                    factory: createOAuthProviderFactory({
                        authenticator: googleAuthenticator,
                        async signInResolver(
                            { result: { fullProfile } },
                            ctx,
                            ) {
                            const email = fullProfile?.emails?.[0]?.value;

                            if (!email) {
                                throw new Error('Google user profile does not contain an email');
                            }

                            const userId = email.split('@')[0];

                            const userEntityRef = stringifyEntityRef({
                                kind: 'User',
                                name: userId,
                                namespace: DEFAULT_NAMESPACE,
                            });

                            return ctx.issueToken({
                                claims: {
                                    sub: userEntityRef,
                                    ent: [userEntityRef],
                                },
                            });
                        },
                    }),
                });
            },
        });
    },
});