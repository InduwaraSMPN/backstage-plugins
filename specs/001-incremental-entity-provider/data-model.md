# Data Models and Schemas

**Feature**: OpenChoreo Incremental Entity Provider  
**Date**: 2025-09-16  
**Spec Reference**: /specs/001-incremental-entity-provider/spec.md

## Overview
This document defines the data models, schemas, and entity structures required for implementing the OpenChoreo Incremental Entity Provider. All models are designed to meet the requirements of the Backstage incremental ingestion system while maintaining compatibility with existing OpenChoreo configurations.

---

## 1. Core Provider Entities

### 1.1 OpenChoreoIncrementalEntityProvider

**Purpose**: Main provider implementing the IncrementalEntityProvider interface  
**Extends**: IncrementalEntityProvider<OpenChoreoCursor, OpenChoreoContext>

```typescript
interface OpenChoreoIncrementalEntityProvider 
  extends IncrementalEntityProvider<OpenChoreoCursor, OpenChoreoContext> {
  
  /**
   * Provider identifier for catalog registration
   */
  readonly providerId: string;
  
  /**
   * Configuration for the provider
   */
  readonly config: OpenChoreoIncrementalConfig;
  
  /**
   * Initialize the provider with configuration
   */
  initialize(config: OpenChoreoIncrementalConfig): Promise<void>;
  
  /**
   * Perform incremental read operation
   */
  read(options?: ReadOptions): Promise<IncrementalReadResult<OpenChoreoCursor, OpenChoreoContext>>;
  
  /**
   * Get current provider status and metrics
   */
  getStatus(): ProviderStatus;
}
```

**Validation Rules**:
- `providerId` must be a non-empty string
- `config` must pass OpenChoreoIncrementalConfig validation
- All methods must return promises for async compatibility

---

### 1.2 OpenChoreoCursor

**Purpose**: JSON-serializable cursor for tracking pagination state  
**Implements**: JSON serializable database storage

```typescript
interface OpenChoreoCursor {
  /**
   * Cursor schema version for backward compatibility
   */
  version: '1.0';
  
  /**
   * Timestamp of last successful processing
   */
  lastProcessedTimestamp: string;
  
  /**
   * Entity identifiers for resume capability
   */
  entityIds: {
    lastOrganizationId?: string;
    lastProjectId?: string;
    lastComponentId?: string;
  };
}
```

**Validation Rules**:
- `version` must be exactly '1.0'
- `lastProcessedTimestamp` must be a valid ISO 8601 timestamp
- At least one of `lastOrganizationId`, `lastProjectId`, or `lastComponentId` must be provided

---

### 1.3 OpenChoreoContext

**Purpose**: Stateless context for API client construction per iteration  

```typescript
interface OpenChoreoContext {
  /**
   * Base URL for OpenChoreo API
   */
  baseUrl: string;
  
  /**
   * Authentication token
   */
  token: string;
  
  /**
   * Configuration for incremental processing
   */
  incrementalConfig: {
    enabled: boolean;
    burstLength: number;
    burstInterval: number;
    restLength: number;
  };
  
  /**
   * Pagination configuration
   */
  paginationConfig: {
    batchSize: {
      organizations: number;
      projects: number;
      components: number;
    };
    fallbackEnabled: boolean;
    maxConcurrentRequests: number;
  };
  
  /**
   * Error handling configuration
   */
  errorHandlingConfig: {
    retryIntervals: number[];
    maxRetryAttempts: number;
    circuitBreakerThreshold: number;
  };
  
  /**
   * Entity processing configuration
   */
  processingConfig: {
    rejectRemovalsAbovePercentage: number;
    rejectEmptySourceCollections: boolean;
    enableMarkAndSweep: boolean;
  };
}
```

**Validation Rules**:
- `baseUrl` must be a valid URL string
- `token` must be a non-empty string
- All time-based configurations must be > 0
- Percentage values must be between 0 and 100
- Batch sizes must be ≥ 1

---

## 2. Configuration Schema

### 2.1 OpenChoreoIncrementalConfig

**Purpose**: Root configuration schema for the provider  

```typescript
interface OpenChoreoIncrementalConfig {
  /**
   * OpenChoreo API base URL
   */
  baseUrl: string;
  
  /**
   * Authentication token for OpenChoreo API
   */
  token: string;
  
  /**
   * Provider type selection
   */
  provider?: {
    /**
     * Type of provider to use
     */
    type: 'traditional' | 'incremental';
  };
  
  /**
   * Incremental processing configuration
   */
  incremental?: {
    /**
     * Enable incremental processing mode
     */
    enabled: boolean;
    
    /**
     * Batch size for processing entities
     */
    batchSize: number;
    
    /**
     * Interval between processing cycles
     */
    interval: string;
    
    /**
     * Timeout for processing operations
     */
    timeout: string;
  };
}
```

**Validation Rules**:
- `baseUrl` must be a valid HTTPS URL (production) or HTTP URL (development)
- `token` must be a non-empty string with minimum length of 16
- `provider.type` must be either 'traditional' or 'incremental' if provided
- `incremental.batchSize` must be a positive number if provided
- `incremental.interval` and `incremental.timeout` must be valid time strings if provided

---

## 3. Data Transformation Entities

### 3.1 OpenChoreoRawEntity

**Purpose**: Raw entity data from OpenChoreo API  

```typescript
interface OpenChoreoRawEntity {
  /**
   * Entity type identifier
   */
  type: 'organization' | 'project' | 'component';
  
  /**
   * Unique entity identifier
   */
  id: string;
  
  /**
   * Entity display name
   */
  name: string;
  
  /**
   * Entity description
   */
  description?: string;
  
  /**
   * Entity metadata from API
   */
  metadata: Record<string, any>;
  
  /**
   * Relationships to other entities
   */
  relationships: OpenChoreoRelationship[];
  
  /**
   * Entity-specific properties
   */
  properties: {
    // Organization-specific
    domains?: string[];
    owner?: string;
    
    // Project-specific
    system?: string;
    lifecycle?: string;
    
    // Component-specific
    version?: string;
    kind?: string;
    owner?: string;
    lifecycle?: string;
  };
}
```

**Validation Rules**:
- `type` must be one of 'organization', 'project', or 'component'
- `id` must be a non-empty string
- `name` must be a non-empty string
- `relationships` must be an array (can be empty)

---

### 3.2 OpenChoreoRelationship

**Purpose**: Entity relationship structure from OpenChoreo API  

```typescript
interface OpenChoreoRelationship {
  /**
   * Relationship type
   */
  type: 'parent' | 'child' | 'dependency' | 'ownedBy' | 'memberOf';
  
  /**
   * Target entity ID
   */
  targetId: string;
  
  /**
   * Target entity type
   */
  targetType: 'organization' | 'project' | 'component';
  
  /**
   * Relationship metadata
   */
  metadata?: {
    /**
     * Relationship strength (0-1)
     */
    strength?: number;
    
    /**
     * Relationship description
     */
    description?: string;
    
    /**
     * Custom relationship properties
     */
    [key: string]: any;
  };
}
```

**Validation Rules**:
- `type` must be a valid relationship type
- `targetId` and `targetType` must be non-empty strings
- `strength` must be between 0 and 1 if provided

---

### 3.3 BackstageEntity

**Purpose**: Transformed Backstage entity ready for catalog ingestion  

```typescript
interface BackstageEntity {
  /**
   * Backstage entity API version
   */
  apiVersion: string;
  
  /**
   * Backstage entity kind
   */
  kind: 'Component' | 'System' | 'Domain' | 'Resource' | 'API';
  
  /**
   * Entity metadata
   */
  metadata: {
    /**
     * Unique entity name
     */
    name: string;
    
    /**
     * Entity namespace
     */
    namespace?: string;
    
    /**
     * Entity title
     */
    title?: string;
    
    /**
     * Entity description
     */
    description?: string;
    
    /**
     * Entity labels
     */
    labels?: Record<string, string>;
    
    /**
     * Entity annotations
     */
    annotations?: Record<string, string>;
    
    /**
     * Entity tags
     */
    tags?: string[];
    
    /**
     * Entity links
     */
    links?: Array<{
      url: string;
      title: string;
      icon?: string;
    }>;
  };
  
  /**
   * Entity specification
   */
  spec: {
    /**
     * Entity owner
     */
    owner?: string;
    
    /**
     * Entity lifecycle
     */
    lifecycle?: string;
    
    /**
     * Entity system
     */
    system?: string;
    
    /**
     * Entity domain
     */
    domain?: string;
    
    /**
     * Entity-specific properties
     */
    [key: string]: any;
  };
  
  /**
   * Entity relationships
   */
  relations?: Array<{
    type: string;
    target: {
      kind: string;
      namespace: string;
      name: string;
    };
  }>;
}

**Provider requirements (annotations and stable names)**:

- Providers MUST set the following annotations on every produced Backstage entity:
  - `backstage.io/managed-by-location` (ANNOATION_LOCATION): a URL or VCS path
    that points to the authoritative source in the upstream system (e.g.
    OpenChoreo resource path).
  - `backstage.io/managed-by-origin-location` (ANNOATION_ORIGIN_LOCATION): a
    short identifier describing the origin (for operator visibility).

- Providers SHOULD ensure `metadata.name` is stable across runs. Prefer
  using a deterministic name derived from the upstream entity's stable ID
  (for example: `openchoreo-component-${entity.id}`). Avoid ephemeral names
  that include timestamps or UUIDs.

Example entity generation (short snippet):

```typescript
function toBackstageEntity(raw: OpenChoreoRawEntity): BackstageEntity {
  const name = `openchoreo-${raw.type}-${raw.id}`; // stable deterministic name

  return {
    apiVersion: 'backstage.io/v1beta1',
    kind: raw.type === 'component' ? 'Component' : 'System',
    metadata: {
      name,
      description: raw.description,
      annotations: {
        'backstage.io/managed-by-location': `https://openchoreo.example.com/${raw.type}s/${raw.id}`,
        'backstage.io/managed-by-origin-location': 'openchoreo',
      },
      labels: {
        'openchoreo/id': raw.id,
      },
    },
    // spec and other fields omitted for brevity
  } as BackstageEntity;
}
```
```

**Validation Rules**:
- `apiVersion` must be a valid Backstage API version (e.g., 'backstage.io/v1alpha1')
- `kind` must be a valid Backstage entity kind
- `metadata.name` must follow Backstage naming conventions
- All URLs in links must be valid

---

## 4. Processing State Models

### 4.1 ProviderStatus

**Purpose**: Current status and health of the provider  

```typescript
interface ProviderStatus {
  /**
   * Overall provider status
   */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'stopped';
  
  /**
   * Status message describing current state
   */
  message: string;
  
  /**
   * Last update timestamp
   */
  lastUpdate: string;
  
  /**
   * Processing metrics
   */
  metrics: {
    /**
     * Total entities processed
     */
    totalEntitiesProcessed: number;
    
    /**
     * Entities processed in current cycle
     */
    currentCycleEntities: number;
    
    /**
     * Processing latency in milliseconds
     */
    processingLatency: number;
    
    /**
     * Error count
     */
    errorCount: number;
    
    /**
     * Retry count
     */
    retryCount: number;
  };
  
  /**
   * Current cursor state
   */
  cursorState: {
    /**
     * Current cursor position
     */
    currentPosition: OpenChoreoCursor;
    
    /**
     * Cursor age in seconds
     */
    cursorAge: number;
    
    /**
     * Cursor validation status
     */
    validation: 'valid' | 'invalid' | 'expired' | 'corrupted';
  };
  
  /**
   * Health checks
   */
  healthChecks: {
    /**
     * API connectivity status
     */
    apiConnectivity: boolean;
    
    /**
     * Database connectivity status
     */
    databaseConnectivity: boolean;
    
    /**
     * Configuration validation status
     */
    configurationValid: boolean;
    
    /**
     * Memory usage status
     */
    memoryUsage: 'normal' | 'high' | 'critical';
  };
}
```

**Validation Rules**:
- `status` must be one of the allowed values
- `lastUpdate` must be a valid ISO 8601 timestamp
- All metrics must be ≥ 0
- All health checks must be boolean or enumerated values

---

### 4.2 IncrementalReadResult

**Purpose**: Result structure for incremental read operations  

```typescript
interface IncrementalReadResult<TCursor, TContext> {
  /**
   * Entities processed in this burst
   */
  entities: BackstageEntity[];
  
  /**
   * Updated cursor state
   */
  cursor?: TCursor;
  
  /**
   * Context for next iteration
   */
  context?: TContext;
  
  /**
   * Processing metadata
   */
  metadata: {
    /**
     * Number of entities processed
     */
    entityCount: number;
    
    /**
     * Processing time in milliseconds
     */
    processingTime: number;
    
    /**
     * Whether this is the final burst
     */
    finalBurst: boolean;
    
    /**
     * Whether to mark entities for orphan prevention
     */
    markForOrphanPrevention: boolean;
    
    /**
     * Error information if processing failed
     */
    errors?: Array<{
      entity?: string;
      error: string;
      severity: 'warning' | 'error' | 'critical';
    }>;
  };
}
```

**Validation Rules**:
- `entities` must be an array (can be empty)
- `metadata.entityCount` must match `entities.length`
- `metadata.processingTime` must be ≥ 0
- Error severity must be one of the allowed values

---

## 5. Error and Exception Models

### 5.1 ProviderError

**Purpose**: Standardized error structure for provider operations  

```typescript
interface ProviderError {
  /**
   * Error code for categorization
   */
  code: string;
  
  /**
   * Human-readable error message
   */
  message: string;
  
  /**
   * Technical error details
   */
  details?: any;
  
  /**
   * Error severity
   */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Whether error is retryable
   */
  retryable: boolean;
  
  /**
   * Suggested retry interval in seconds
   */
  retryAfter?: number;
  
  /**
   * Error context information
   */
  context?: {
    /**
     * Operation that failed
     */
    operation: string;
    
    /**
     * Entity being processed
     */
    entity?: string;
    
    /**
     * API endpoint being called
     */
    endpoint?: string;
    
    /**
     * Timestamp of error
     */
    timestamp: string;
  };
}
```

**Validation Rules**:
- `code` must be a non-empty string
- `message` must be a non-empty string
- `severity` must be one of the allowed values
- `retryAfter` must be ≥ 0 if provided

---

## 6. State Transition Models

### 6.1 ProviderState

**Purpose**: Enumerate valid provider state transitions  

```typescript
type ProviderState = 
  | 'initializing'     // Provider is initializing
  | 'connecting'       // Connecting to API
  | 'reading'          // Reading entities from API
  | 'processing'       // Processing and transforming entities
  | 'writing'          // Writing entities to catalog
  | 'resting'          // Resting between cycles
  | 'retrying'         // Retrying after error
  | 'stopping'         // Graceful shutdown
  | 'stopped'          // Stopped state
  | 'error'            // Error state
  | 'degraded';        // Degraded operation

interface StateTransition {
  from: ProviderState;
  to: ProviderState;
  conditions: string[];
}
```

**Valid State Transitions**:
- `initializing` → `connecting` (configuration valid)
- `connecting` → `reading` (connection successful)
- `connecting` → `error` (connection failed)
- `reading` → `processing` (data retrieved)
- `reading` → `error` (API error)
- `processing` → `writing` (transformation complete)
- `processing` → `error` (transformation error)
- `writing` → `resting` (write successful)
- `writing` → `error` (write error)
- `resting` → `reading` (rest period over)
- `error` → `retrying` (retryable error)
- `retrying` → `reading` (retry attempt)
- `retrying` → `error` (retry failed)
- `any` → `stopping` (shutdown requested)
- `stopping` → `stopped` (cleanup complete)

---

## 7. Schema Validation

### 7.1 Validation Functions

```typescript
/**
 * Validate OpenChoreoIncrementalConfig
 */
export function validateOpenChoreoIncrementalConfig(
  config: OpenChoreoIncrementalConfig
): ValidationResult;

/**
 * Validate OpenChoreoCursor
 */
export function validateOpenChoreoCursor(
  cursor: OpenChoreoCursor
): ValidationResult;

/**
 * Validate BackstageEntity
 */
export function validateBackstageEntity(
  entity: BackstageEntity
): ValidationResult;
```

### 7.2 ValidationResult

```typescript
interface ValidationResult {
  /**
   * Whether validation passed
   */
  isValid: boolean;
  
  /**
   * Validation errors if any
   */
  errors: ValidationError[];
}

interface ValidationError {
  /**
   * Path to the invalid property
   */
  path: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error severity
   */
  severity: 'error' | 'warning';
}
```

---

## 8. Default Values and Constants

### 8.1 Configuration Defaults

```typescript
const DEFAULT_CONFIG: Partial<OpenChoreoIncrementalConfig> = {
  schedule: {
    frequency: '0 */30 * * * *', // Every 30 minutes
    timeout: 300, // 5 minutes
    initialDelay: 0,
  },
  incremental: {
    enabled: true,
    burstLength: 3, // 3 seconds
    burstInterval: 3, // 3 seconds
    restLength: 86400, // 24 hours
    fallback: {
      enabled: true,
      batchSize: 100,
    },
    backoff: [5, 30, 600, 10800], // 5s, 30s, 10m, 3h
    rejectRemovalsAbovePercentage: 5,
    rejectEmptySourceCollections: true,
  },
  listener: {
    enabled: false,
  },
};
```

### 8.2 Validation Constants

```typescript
const VALIDATION_CONSTANTS = {
  MAX_CURSOR_SIZE: 4096, // 4KB max cursor size
  MIN_TOKEN_LENGTH: 16,
  MAX_BATCH_SIZE: 1000,
  MIN_BURST_LENGTH: 1,
  MAX_BURST_LENGTH: 300,
  MAX_RETRY_ATTEMPTS: 5,
  MAX_CONCURRENT_REQUESTS: 10,
} as const;
```

---

## Summary

This data model specification provides a comprehensive foundation for implementing the OpenChoreo Incremental Entity Provider. All entities are designed with:

1. **Type Safety**: Full TypeScript interface definitions
2. **Validation**: Comprehensive validation rules
3. **Extensibility**: Flexible design for future enhancements
4. **Backward Compatibility**: Support for existing configurations
5. **Production Readiness**: Error handling, monitoring, and observability

The models support all functional requirements from the specification and provide the necessary structure for implementing a robust, scalable incremental entity provider.