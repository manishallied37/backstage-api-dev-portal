import { createBackendModule } from '@backstage/backend-plugin-api';
import {
    PolicyDecision,
    AuthorizeResult,
} from '@backstage/plugin-permission-common';
import {
    PermissionPolicy,
    PolicyQuery,
} from '@backstage/plugin-permission-node';
import {
    catalogEntityReadPermission
} from '@backstage/plugin-catalog-common/alpha';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { kongServiceReadPermission, kongRoutesReadPermission, kongReadAvailablePluginsPermission } from '@veecode-platform/backstage-plugin-kong-service-manager-common';

class CustomPermissionPolicy implements PermissionPolicy {
    async handle(request: PolicyQuery): Promise<PolicyDecision> {
        const permissionName = request.permission.name;

        if (
            permissionName === kongRoutesReadPermission.name ||
            permissionName === kongServiceReadPermission.name ||
            permissionName === catalogEntityReadPermission.name ||
            permissionName === kongReadAvailablePluginsPermission.name
        ) {
            return { result: AuthorizeResult.ALLOW };
        }

        return { result: AuthorizeResult.DENY };
    }
}


export default createBackendModule({
    pluginId: 'permission',
    moduleId: 'user-only-policy',
    register(reg) {
        reg.registerInit({
            deps: { policy: policyExtensionPoint },
            async init({ policy }) {
                policy.setPolicy(new CustomPermissionPolicy());
            },
        });
    },
});