# Quickstart Guide: OpenChoreo Incremental Entity Provider

**Feature**: OpenChoreo Incremental Entity Provider  
**Date**: 2025-09-16  
**Spec Reference**: /specs/001-incremental-entity-provider/spec.md

## Overview

This quickstart guide provides step-by-step instructions for setting up and configuring the OpenChoreo Incremental Entity Provider in a Backstage instance. The guide covers installation, configuration, testing, and troubleshooting.

**Prerequisites**:
- Backstage instance with catalog backend
- OpenChoreo API access with valid credentials
- Node.js 18+ and TypeScript 5.x
- PostgreSQL database (for cursor storage)

---

## 1. Installation

### 1.1 Install the Backend Module

```bash
# Navigate to your Backstage project root
cd /path/to/your/backstage-project

# Install the OpenChoreo incremental ingestion backend module
yarn add @backstage/plugin-catalog-backend-module-incremental-ingestion
```

### 1.2 Install provider dependencies

```bash
# Install required dependencies
yarn add @backstage/backend-plugin-api
yarn add @backstage/catalog-client
yarn add @backstage/types
yarn add uuid
yarn add axios
```

### 1.3 Verify Installation

```bash
# Verify all dependencies are installed
yarn list --pattern "@backstage/*"
```

Expected output should include:
- `@backstage/plugin-catalog-backend-module-incremental-ingestion@1.9.0+`
- `@backstage/backend-plugin-api@latest`
- `@backstage/catalog-client@latest`

---

## 2. Configuration

### 2.1 Backend Module Setup

Create or update your catalog backend module to include the OpenChoreo incremental provider:

```typescript
// packages/backend/src/plugins/catalog.ts
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  catalogProcessingExtensionPoint,
  incrementalEntityProviderExtensionPoint,
} from '@backstage/plugin-catalog-node/alpha';
import { IncrementalOpenChoreoEntityProvider } from '../catalog-backend-module-incremental-ingestion';

export const catalogModuleOpenChoreoIncremental = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'openchoreo-incremental',
  register(env) {
    env.registerInit({
      deps: {
        catalogProcessing: catalogProcessingExtensionPoint,
        incrementalEntityProvider: incrementalEntityProviderExtensionPoint,
      },
      async init({ catalogProcessing, incrementalEntityProvider }) {
        // Create the OpenChoreo incremental provider
        const provider = IncrementalOpenChoreoEntityProvider.fromConfig(env.config, {
          logger: env.logger,
          scheduler: env.scheduler,
        });
        
        // Register the provider
        incrementalEntityProvider.addProvider(provider);
        
        // Register the processor
        catalogProcessing.addProcessor(provider.getProcessor());
      },
    });
  },
});
```

### 2.2 Application Configuration

Add the OpenChoreo configuration to your `app-config.yaml`:

```yaml
# app-config.yaml
catalog:
  providers:
    openchoreo:
      baseUrl: ${OPENCHOREO_API_URL}
      token: ${OPENCHOREO_TOKEN}
      provider:
        type: incremental  # 'traditional' | 'incremental'
      incremental:
        enabled: true
        batchSize: 100
        interval: 30s
        timeout: 300s
```

### 2.3 Environment Variables

Set the required environment variables:

```bash
# .env
OPENCHOREO_API_URL=https://api.openchoreo.example.com
OPENCHOREO_TOKEN=your-api-token-here
```

**Note**: The configuration has been to essential options only. Advanced options like encryption, compression, and complex fallback mechanisms have been removed for the initial implementation.

### 2.4 Database Configuration

Ensure your PostgreSQL database is configured to store cursor data. Add to your `app-config.yaml`:

```yaml
# app-config.yaml
backend:
  database:
    client: pg
    connection:
      host: ${POSTGRES_HOST}
      port: ${POSTGRES_PORT}
      user: ${POSTGRES_USER}
      password: ${POSTGRES_PASSWORD}
      database: ${POSTGRES_DATABASE}
```

---

## 3. Basic Setup

### 3.1 Register the Backend Module

Update your backend to register the new module:

```typescript
// packages/backend/src/index.ts
import { catalogModuleOpenChoreoIncremental } from './plugins/catalog';

const backend = createBackend();
backend.add(catalogModuleOpenChoreoIncremental);
// ... other modules
backend.start();
```

### 3.2 Start the Backend

```bash
# Start the backend
yarn start-backend
```

### 3.3 Verify Startup

Check the backend logs to confirm the provider is registered correctly:

```bash
# Expected logs
[info] Loading catalog module: openchoreo-incremental
[info] OpenChoreo Incremental Entity Provider initialized
[info] Provider registered with ID: openchoreo-incremental
[info] Schedule configured: 0 */30 * * * *
[info] Incremental processing enabled
```

---

## 4. Testing the Setup

### 4.1 Test API Connectivity

Verify that the OpenChoreo API is accessible:

```bash
curl -H "Authorization: Bearer ${OPENCHOREO_TOKEN}" \
     "${OPENCHOREO_API_URL}/organizations"
```

Expected response should return organizations in JSON format.

### 4.2 Test Provider Registration

Verify the provider is registered with the catalog:

```bash
# Query the catalog for provider status
curl -H "Content-Type: application/json" \
     -d '{ "entities": [{ "kind": "Component", "namespace": "default", "name": "provider-status" }] }' \
     http://localhost:7007/api/catalog/entities/by-query
```

### 4.3 Test Incremental Processing

Trigger an incremental processing cycle manually:

```bash
# Trigger processing (via management endpoint if available)
curl -X POST http://localhost:7007/api/catalog/providers/openchoreo-incremental/read
```

### 4.4 Check Processing Logs

Monitor the logs during processing:

```bash
# Tail the backend logs
yarn start-backend | grep -i "openchoreo\|incremental"

# Expected logs during processing
[info] Starting incremental read cycle
[info] Processing burst 1 (3 seconds)
[info] Retrieved 50 organizations
[info] Processed 150 projects
[info] Processed 800 components
[info] Burst completed, pausing for 3 seconds
[info] Cycle completed, resting for 24 hours
```

---

## 5. Configuration Options

### 5.1 Basic Configuration

**Minimal Configuration:**
```yaml
catalog:
  providers:
    openchoreo:
      baseUrl: ${OPENCHOREO_API_URL}
      token: ${OPENCHOREO_TOKEN}
      provider:
        type: incremental
      incremental:
        enabled: true
        batchSize: 100
        interval: 30s
        timeout: 300s
```

**Production Configuration:**
```yaml
catalog:
  providers:
    openchoreo:
      baseUrl: ${OPENCHOREO_API_URL}
      token: ${OPENCHOREO_TOKEN}
      provider:
        type: incremental
      incremental:
        enabled: true
        batchSize: 200
        interval: 15m
        timeout: 600s
```

**Development Configuration:**
```yaml
catalog:
  providers:
    openchoreo:
      baseUrl: ${OPENCHOREO_API_URL}
      token: ${OPENCHOREO_TOKEN}
      provider:
        type: incremental
      incremental:
        enabled: true
        batchSize: 10
        interval: 5s
        timeout: 30s
```

**Note**: The configuration has been to essential options only. Advanced options like encryption, compression, and complex fallback mechanisms have been removed for the initial implementation.

---

## 6. Monitoring and Observability

### 6.1 Enable Metrics

Add metrics configuration to your `app-config.yaml`:

```yaml
# app-config.yaml
backend:
  metrics:
    provider: prometheus
    interval: 30s
```

### 6.2 Monitor Provider Status

Check provider status and metrics:

```bash
# Get provider status
curl http://localhost:7007/api/catalog/providers/openchoreo-incremental

# Check metrics
curl http://localhost:7007/metrics | grep 'openchoreo_incremental_'
```

### 6.3 Key Metrics to Monitor

- `openchoreo_incremental_entities_processed_total`
- `openchoreo_incremental_processing_duration_seconds`
- `openchoreo_incremental_errors_total`
- `openchoreo_incremental_retries_total`
- `openchoreo_incremental_active_connections`

Recommended metric labels (where applicable):

- `provider_id` — provider identifier (e.g. `openchoreo-incremental`)
- `entity_type` — `organization|project|component`
- `status` — `success|failure|skipped`
- `burst_id` — unique id for the burst invocation

Prometheus alert example (no entities added for N cycles):

```yaml
- alert: OpenChoreoNoEntitiesAdded
  expr: increase(openchoreo_incremental_entities_processed_total{provider_id="openchoreo-incremental"}[6h]) == 0
  for: 6h
  labels:
    severity: warning
  annotations:
    summary: "OpenChoreo provider added zero entities in the last 6 hours"
    description: "Investigate OpenChoreo API connectivity or provider configuration."
```

### 6.4 Alerting Setup

Configure alerts for critical metrics:

```yaml
# Example alerting configuration (prometheus)
groups:
  - name: openchoreo_incremental
    rules:
      - alert: OpenChoreoHighErrorRate
        expr: rate(openchoreo_incremental_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "OpenChoreo incremental provider high error rate"
      
      - alert: OpenChoreoProcessingLag
        expr: openchoreo_incremental_processing_duration_seconds > 300
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "OpenChoreo processing taking too long"
```

---

## 7. Troubleshooting

### 7.1 Common Issues

**Provider not starting:**
```bash
# Check logs for error messages
yarn start-backend 2>&1 | grep -i "error\|failed"
```

**Solution:** Verify configuration syntax and environment variables.

**API connectivity issues:**
```bash
# Test API connectivity
curl -v -H "Authorization: Bearer ${OPENCHOREO_TOKEN}" \
     "${OPENCHOREO_API_URL}/organizations"
```

**Solution:** Check API URL, authentication token, and network connectivity.

**Cursor corruption:**
```bash
# Check logs for cursor validation errors
yarn start-backend 2>&1 | grep -i "cursor\|corrupt"
```

**Solution:** Restart the provider to reset cursor state.

**Memory issues:**
```bash
# Monitor memory usage
ps aux | grep "backstage-backend"
```

**Solution:** Reduce batch size and burst length in configuration.

### 7.2 Debug Mode

Enable debug logging:

```yaml
# app-config.yaml
logging:
  level: debug
```

```bash
# View debug logs
yarn start-backend 2>&1 | grep -i "debug.*openchoreo\|debug.*incremental"
```

## Admin Endpoints (exact paths & permissions)

The incremental ingestion engine exposes the following administrative REST endpoints under the catalog backend. These endpoints require an operator or service account with elevated privileges (in Backstage this is typically `system.admin` or a service principal granted `catalog:read` and `catalog:write` scopes).

| Method | Path |
| ------ | ---- |
| GET    | `/api/catalog/incremental/health` |
| GET    | `/api/catalog/incremental/providers` |
| GET    | `/api/catalog/incremental/providers/:provider` |
| POST   | `/api/catalog/incremental/providers/:provider/trigger` |
| POST   | `/api/catalog/incremental/providers/:provider/start` |
| POST   | `/api/catalog/incremental/providers/:provider/cancel` |
| DELETE | `/api/catalog/incremental/providers/:provider` |
| GET    | `/api/catalog/incremental/providers/:provider/marks` |
| DELETE | `/api/catalog/incremental/providers/:provider/marks` |
| POST   | `/api/catalog/incremental/cleanup` |

Required permissions:

- `catalog:read` — to list and inspect provider status and marks
- `catalog:write` — to trigger, start, cancel, or delete provider records

Operators should secure these endpoints using gateway authentication and RBAC in production.

### 7.3 Health Checks

Verify provider health:

```bash
# Check provider health
curl http://localhost:7007/api/catalog/providers/openchoreo-incremental/health

# Expected response
{
  "status": "healthy",
  "checks": {
    "api_connectivity": true,
    "database_connectivity": true,
    "configuration_valid": true,
    "memory_usage": "normal"
  }
}
```

### 7.4 Reset Provider

Reset provider state:

```bash
# Stop the backend
Ctrl+C

# Clear cursor data from database
echo "DELETE FROM incremental_entity_provider_cursor WHERE provider_id = 'openchoreo-incremental';" | psql

# Restart backend
yarn start-backend
```

---

## 8. Migration from Traditional Provider

### 8.1 Backup Existing Configuration

```bash
# Backup existing catalog configuration
cp app-config.yaml app-config.yaml.backup
```

### 8.2 Compare Configurations

**Traditional Configuration:**
```yaml
catalog:
  providers:
    openchoreo:
      baseUrl: ${OPENCHOREO_API_URL}
      token: ${OPENCHOREO_TOKEN}
      schedule:
        frequency: '0 */30 * * * *'
```

**Incremental Configuration:**
```yaml
catalog:
  providers:
    openchoreo:
      baseUrl: ${OPENCHOREO_API_URL}
      token: ${OPENCHOREO_TOKEN}
      schedule:
        frequency: '0 */30 * * * *'
      incremental:
        enabled: true
        # ... additional incremental settings
```

### 8.3 Migration Steps

1. **Stop the traditional provider:**
   ```yaml
   # Disable traditional provider
   catalog:
     providers:
       openchoreo:
         enabled: false
   ```

2. **Add incremental configuration:** (see section 2.2)

3. **Start incremental provider:** (see section 3.2)

4. **Verify entity consistency:**
   ```bash
   # Compare entity counts
   curl -s http://localhost:7007/api/catalog/entities | jq '.totalItems'
   ```

### 8.4 Rollback Procedure

```bash
# Stop backend
Ctrl+C

# Restore configuration
cp app-config.yaml.backup app-config.yaml

# Restart with traditional provider
yarn start-backend
```

---

## 9. Production Checklist

### 9.1 Pre-Deployment Checklist

- [ ] Backend module installed and configured
- [ ] Environment variables set properly
- [ ] Database configured and accessible
- [ ] API connectivity verified
- [ ] Configuration validated
- [ ] Schedule tested
- [ ] Error handling tested
- [ ] Metrics collection enabled
- [ ] Alerting configured
- [ ] Backup procedures documented

### 9.2 Post-Deployment Verification

- [ ] Provider started successfully
- [ ] First cycle completed successfully
- [ ] Entities processed correctly
- [ ] No errors in logs
- [ ] Metrics collection working
- [ ] Alerting functioning
- [ ] Performance within expected ranges

### 9.3 Monitoring Dashboard

Create a monitoring dashboard with the following panels:

1. **Provider Status**: Overall health status
2. **Entity Processing**: Entities processed over time
3. **Processing Duration**: Time taken for each cycle
4. **Error Rate**: Error count and rate
5. **Retry Count**: Retry attempts and success rate
6. **Memory Usage**: Provider memory consumption
7. **API Latency**: OpenChoreo API response times

---

## 10. Next Steps

### 10.1 Customization Options

- **Custom entity transformers**: Modify entity transformation logic
- **Custom pagination strategies**: Implement specialized pagination
- **Custom error handling**: Add domain-specific error handling
- **Custom metrics**: Add additional metrics for your use case

### 10.2 Advanced Features

- **Multi-region support**: Configure providers for different regions
- **High availability**: Setup multiple provider instances
- **Disaster recovery**: Implement backup and recovery procedures
- **Capacity planning**: Scale providers based on entity count

### 10.3 Support and Resources

- **Documentation**: Official Backstage documentation
- **Community**: Backstage community channels
- **Issues**: GitHub issue tracker
- **Support**: Enterprise support options

---

## Summary

This quickstart guide provides a comprehensive foundation for setting up and configuring the OpenChoreo Incremental Entity Provider. By following these steps, you should have a functional provider that efficiently synchronizes OpenChoreo entities with your Backstage catalog using incremental processing.

For additional assistance or to report issues, please refer to the project documentation or community support channels.