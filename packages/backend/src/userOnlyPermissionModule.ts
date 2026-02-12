import { createBackendModule } from '@backstage/backend-plugin-api';
import {
    PolicyDecision,
    AuthorizeResult,
} from '@backstage/plugin-permission-common';
import {
    PermissionPolicy,
    PolicyQuery, PolicyQueryUser
} from '@backstage/plugin-permission-node';
import {
    catalogEntityReadPermission, catalogEntityRefreshPermission, catalogEntityDeletePermission, catalogEntityCreatePermission
} from '@backstage/plugin-catalog-common/alpha';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import { kongServiceReadPermission, kongRoutesReadPermission, kongReadAvailablePluginsPermission } from '@veecode-platform/backstage-plugin-kong-service-manager-common';

class CustomPermissionPolicy implements PermissionPolicy {
    // async handle(request: PolicyQuery): Promise<PolicyDecision> {
    //     const permissionName = request.permission.name;

    //     if (
    //         permissionName === kongRoutesReadPermission.name ||
    //         permissionName === kongServiceReadPermission.name ||
    //         permissionName === catalogEntityReadPermission.name ||
    //         permissionName === kongReadAvailablePluginsPermission.name
    //     ) {
    //         return { result: AuthorizeResult.ALLOW };
    //     }

    //     return { result: AuthorizeResult.DENY };
    // }
    async handle(
        request: PolicyQuery,
        user?: PolicyQueryUser,
    ): Promise<PolicyDecision> {

        const permissionName = request.permission.name;
        const groups = user?.identity?.ownershipEntityRefs ?? [];

        console.log('USER:', user?.identity?.userEntityRef);
        console.log('GROUPS:', groups);

        const isSuperUser = groups.some(g => g.endsWith('/superusers'));
        const isAdmin = groups.some(g => g.endsWith('/admins'));
        const isUser = groups.some(g => g.endsWith('/users'));

        if (isSuperUser) {
            return { result: AuthorizeResult.ALLOW };
        }

        if (isAdmin) {
            if (
                permissionName === kongRoutesReadPermission.name ||
                permissionName === kongServiceReadPermission.name ||
                permissionName === kongReadAvailablePluginsPermission.name ||
                permissionName === catalogEntityReadPermission.name ||
                permissionName === catalogEntityRefreshPermission.name ||
                permissionName === catalogEntityDeletePermission.name ||
                permissionName === catalogEntityCreatePermission.name
            ) {
                return { result: AuthorizeResult.ALLOW };
            }
            return { result: AuthorizeResult.DENY };
        }
        if (isUser) {
            if (permissionName === catalogEntityReadPermission.name ||
                permissionName === kongRoutesReadPermission.name ||
                permissionName === kongServiceReadPermission.name ||
                permissionName === kongReadAvailablePluginsPermission.name) {
                return { result: AuthorizeResult.ALLOW };
            }
            return { result: AuthorizeResult.DENY };
        }

        return { result: AuthorizeResult.DENY };
    }
}


export default createBackendModule({
    pluginId: 'permission',
    moduleId: 'custom-rbac-policy',
    register(reg) {
        reg.registerInit({
            deps: { policy: policyExtensionPoint },
            async init({ policy }) {
                policy.setPolicy(new CustomPermissionPolicy());
            },
        });
    },
});