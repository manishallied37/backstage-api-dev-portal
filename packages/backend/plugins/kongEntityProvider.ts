import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import fetch from 'node-fetch';

class KongEntityProvider {
    private connection: any;

    constructor(private readonly config: any) { }

    getProviderName(): string {
        return 'kong-entity-provider';
    }

    async connect(connection: any) {
        this.connection = connection;
        await this.refresh();
    }

    async refresh() {
        if (!this.connection) return;

        const instances =
            this.config.getOptionalConfigArray('kong.instances') ?? [];

        const allEntities: Entity[] = [];

        for (const instanceConfig of instances) {
            const id = instanceConfig.getString('id');
            const apiBaseUrl = instanceConfig.getString('apiBaseUrl');

            const response = await fetch(`${apiBaseUrl}/services`);
            if (!response.ok) continue;

            const data = (await response.json()) as {
                data: { name: string }[];
            };

            const entities: Entity[] = data.data.map(service => ({
                apiVersion: 'backstage.io/v1alpha1',
                kind: 'API',
                metadata: {
                    name: service.name,
                    annotations: {
                        'kong-manager/service-name': service.name,
                        'kong-manager/instance': id,
                    },
                },
                spec: {
                    type: 'openapi',
                    lifecycle: 'production',
                    owner: 'group:default/guests',
                },
            }));

            allEntities.push(...entities);
        }

        await this.connection.applyMutation({
            type: 'full',
            entities: allEntities.map(entity => ({
                entity,
                locationKey: 'kong-provider',
            })),
        });
    }
}

export default createBackendModule({
    pluginId: 'catalog',
    moduleId: 'kong-entity-provider',
    register(env) {
        env.registerInit({
            deps: {
                catalog: catalogProcessingExtensionPoint,
                config: coreServices.config,
            },
            async init({ catalog, config }) {
                catalog.addEntityProvider(new KongEntityProvider(config));
            },
        });
    },
});