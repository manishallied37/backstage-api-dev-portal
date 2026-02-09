// export interface PluginEnvironment {
//     logger: any;
//     config: any;
//     discovery: any;
//     reader: any;
// }

import { LoggerService } from '@backstage/backend-plugin-api';
import { DiscoveryService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { AuthService, HttpAuthService } from '@backstage/backend-plugin-api';
// import { UrlReader } from '@backstage/backend-plugin-api';

export interface PluginEnvironment {
    logger: LoggerService;
    config: Config;
    discovery: DiscoveryService;
    // reader: UrlReader;

    // 🔴 missing earlier
    permissions: PermissionEvaluator;
    auth: AuthService;
    httpAuth: HttpAuthService;
}