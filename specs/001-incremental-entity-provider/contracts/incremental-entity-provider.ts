/**
 * Incremental Entity Provider Contract
 *
 * This contract defines the interface for the OpenChoreo Incremental Entity Provider
 * implementation based on @backstage/plugin-catalog-backend-module-incremental-ingestion
 *
 * Feature: OpenChoreo Incremental Entity Provider
 * Date: 2025-09-16
 * Spec Reference: /specs/001-incremental-entity-provider/spec.md
 */

import {
  IncrementalEntityProvider,
  ReadOptions,
} from '@backstage/plugin-catalog-backend-module-incremental-ingestion';

import { Entity } from '@backstage/catalog-model';

/**
 * OpenChoreo Specific Cursor Interface
 *
 * Defines the cursor structure for tracking pagination state across ingestions
 */
export interface OpenChoreoCursor {
  /**
   * Cursor schema version for backward compatibility
   */
  version: '1.0';

  /**
   * Timestamp of last successful processing (ISO 8601 format)
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

/**
 * Cursor storage and serialization guarantees
 *
 * NOTE: Engine implementations persist cursors as UTF-8 strings into the
 * ingestion marks table. To avoid database issues and excessive storage
 * consumption, providers MUST ensure the cursor follows these constraints:
 *
 * - Cursor MUST be JSON-serializable.
 * - The serialized cursor MUST be a UTF-8 string and its byte-length MUST be
 *   less than or equal to 2048 bytes (2 KiB) unless a server-side pointer is
 *   used via the CursorManager (see `cursor-management.ts`).
 * - Cursor MUST include a `version` string (e.g. '1.0').
 * - When the upstream API provides an opaque pagination token (commonly
 *   named `nextCursor`, `nextToken`, or similar), the cursor SHOULD contain a
 *   single field carrying that opaque token (e.g. `nextCursorToken`). Do not
 *   embed large lists of entity IDs inside the persisted cursor.
 */

/**
 * OpenChoreo Context for Stateless Client Construction
 *
 * Contains essential configuration and authentication details
 * for reconstructing API clients per iteration
 */
export interface OpenChoreoContext {
  /**
   * Base URL for OpenChoreo API
   */
  baseUrl: string;

  /**
   * Authentication token for OpenChoreo API
   */
  token: string;

  /**
   * Configuration for incremental processing
   */
  incrementalConfig?: {
    enabled: boolean;
    batchSize: number;
    interval: string;
    timeout: string;
  };
}

/**
 * OpenChoreo Incremental Entity Provider Interface
 *
 * Main interface implementing the Backstage IncrementalEntityProvider
 * contract with OpenChoreo-specific extensions
 */
export interface OpenChoreoIncrementalEntityProvider
  extends IncrementalEntityProvider<OpenChoreoCursor, OpenChoreoContext> {
  /**
   * Provider identifier for catalog registration
   */
  readonly providerId: string;

  /**
   * Get current provider status and metrics
   */
  getStatus(): ProviderStatus;

  /**
   * Reset provider state (for recovery)
   */
  reset(): Promise<void>;

  /**
   * Get provider health information
   */
  getHealth(): Promise<ProviderHealth>;

  /**
   * Get processor for entity processing
   */
  getProcessor(): EntityProcessor;
}

/**
 * around(burst) expectations
 *
 * Implementations MUST treat each `around(burst)` invocation as an isolated
 * execution context. In particular:
 *
 * - Providers MUST construct and use a fresh API client and context for each
 *   `around(burst)` call. Re-using long-lived, in-memory clients or caches
 *   across bursts is NOT permitted because the engine may run bursts in
 *   different processes or after long pauses; clients must be reconstructed
 *   from the provided `OpenChoreoContext`.
 * - Any per-burst caches SHOULD be local to the `around` invocation and
 *   discarded when `around` completes.
 */

/**
 * Provider Status Interface
 *
 * Provides current status and health information about the provider
 */
export interface ProviderStatus {
  /**
   * Overall provider status
   */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'stopped';

  /**
   * Status message describing current state
   */
  message: string;

  /**
   * Last update timestamp (ISO 8601 format)
   */
  lastUpdate: string;

  /**
   * Processing metrics
   */
  metrics: {
    totalEntitiesProcessed: number;
    currentCycleEntities: number;
    processingLatency: number;
    errorCount: number;
    retryCount: number;
  };

  /**
   * Current cursor state
   */
  cursorState: {
    currentPosition: OpenChoreoCursor;
    cursorAge: number;
    validation: 'valid' | 'invalid' | 'expired' | 'corrupted';
  };

  /**
   * Health checks
   */
  healthChecks: {
    apiConnectivity: boolean;
    databaseConnectivity: boolean;
    configurationValid: boolean;
    memoryUsage: 'normal' | 'high' | 'critical';
  };
}

/**
 * Provider Health Interface
 *
 * Detailed health information for monitoring and diagnostics
 */
export interface ProviderHealth {
  /**
   * Overall health status
   */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /**
   * Timestamp of health check (ISO 8601 format)
   */
  timestamp: string;

  /**
   * Detailed health information
   */
  details: {
    /**
     * API connectivity status
     */
    api: {
      status: boolean;
      latency: number;
      error?: string;
    };

    /**
     * Database connectivity status
     */
    database: {
      status: boolean;
      latency: number;
      error?: string;
    };

    /**
     * Configuration validation status
     */
    configuration: {
      status: boolean;
      errors: string[];
    };

    /**
     * Resource usage
     */
    resources: {
      memory: {
        used: number;
        total: number;
        percentage: number;
      };
      cpu: {
        usage: number;
      };
    };
  };
}

/**
 * Entity Processor Interface
 *
 * Handles processing of entities from OpenChoreo to Backstage format
 */
export interface EntityProcessor {
  /**
   * Process raw entities and transform to Backstage format
   */
  processEntities(
    entities: OpenChoreoRawEntity[],
  ): Promise<ProcessedEntitiesResult>;

  /**
   * Validate processed entities
   */
  validateEntities(entities: Entity[]): Promise<ValidationResult>;
}

/**
 * OpenChoreo Raw Entity Interface
 *
 * Represents raw entity data from OpenChoreo API
 */
export interface OpenChoreoRawEntity {
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
    domains?: string[];
    owner?: string;
    system?: string;
    lifecycle?: string;
    version?: string;
    kind?: string;
  };
}

/**
 * OpenChoreo Relationship Interface
 *
 * Represents relationships between OpenChoreo entities
 */
export interface OpenChoreoRelationship {
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
    strength?: number;
    description?: string;
    [key: string]: any;
  };
}

/**
 * Processed Entities Result Interface
 *
 * Result of entity processing operation
 */
export interface ProcessedEntitiesResult {
  /**
   * Successfully processed entities
   */
  entities: Entity[];

  /**
   * Processing errors encountered
   */
  errors: ProcessingError[];

  /**
   * Processing metadata
   */
  metadata: {
    totalProcessed: number;
    totalSucceeded: number;
    totalFailed: number;
    processingTime: number;
  };
}

/**
 * Processing Error Interface
 *
 * Represents errors encountered during entity processing
 */
export interface ProcessingError {
  /**
   * Entity ID that caused the error
   */
  entityId: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Error severity
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Error details
   */
  details?: any;

  /**
   * Timestamp of error (ISO 8601 format)
   */
  timestamp: string;
}

/**
 * Validation Result Interface
 *
 * Result of entity validation operation
 */
export interface ValidationResult {
  /**
   * Whether validation passed
   */
  isValid: boolean;

  /**
   * Validation errors if any
   */
  errors: ValidationError[];
}

/**
 * Validation Error Interface
 *
 * Represents validation errors for entities
 */
export interface ValidationError {
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

  /**
   * Entity ID if applicable
   */
  entityId?: string;
}

/**
 * OpenChoreo API Client Interface
 *
 * Defines the contract for interacting with OpenChoreo API
 */
export interface OpenChoreoApiClient {
  /**
   * Get all organizations
   */
  getOrganizations(): Promise<OpenChoreoRawEntity[]>;

  /**
   * Get organizations with pagination
   */
  getOrganizationsPaginated(
    cursor?: string,
    limit?: number,
  ): Promise<{
    entities: OpenChoreoRawEntity[];
    hasMore: boolean;
    nextCursor?: string;
  }>;

  /**
   * Get projects for an organization
   */
  getProjects(organizationId: string): Promise<OpenChoreoRawEntity[]>;

  /**
   * Get projects for an organization with pagination
   */
  getProjectsPaginated(
    organizationId: string,
    cursor?: string,
    limit?: number,
  ): Promise<{
    entities: OpenChoreoRawEntity[];
    hasMore: boolean;
    nextCursor?: string;
  }>;

  /**
   * Get components for a project
   */
  getComponents(
    organizationId: string,
    projectId: string,
  ): Promise<OpenChoreoRawEntity[]>;

  /**
   * Get components for a project with pagination
   */
  getComponentsPaginated(
    organizationId: string,
    projectId: string,
    cursor?: string,
    limit?: number,
  ): Promise<{
    entities: OpenChoreoRawEntity[];
    hasMore: boolean;
    nextCursor?: string;
  }>;

  /**
   * Test API connectivity
   */
  testConnection(): Promise<boolean>;
}

/**
 * Cursor Manager Interface
 *
 * Manages cursor creation, validation, serialization, and persistence
 */
export interface CursorManager {
  /**
   * Create initial cursor
   */
  createInitialCursor(): Promise<OpenChoreoCursor>;

  /**
   * Update cursor with new state
   */
  updateCursor(
    cursor: OpenChoreoCursor,
    updates: Partial<OpenChoreoCursor>,
  ): Promise<OpenChoreoCursor>;

  /**
   * Validate cursor integrity
   */
  validateCursor(cursor: OpenChoreoCursor): Promise<CursorValidationResult>;

  /**
   * Serialize cursor for storage
   */
  serializeCursor(cursor: OpenChoreoCursor): string;

  /**
   * Deserialize cursor from storage
   */
  deserializeCursor(serialized: string): OpenChoreoCursor;

  /**
   * Load cursor from storage
   */
  loadCursor(): Promise<OpenChoreoCursor | null>;

  /**
   * Save cursor to storage
   */
  saveCursor(cursor: OpenChoreoCursor): Promise<void>;

  /**
   * Delete cursor from storage
   */
  deleteCursor(): Promise<void>;
}

/**
 * Cursor Validation Result Interface
 *
 * Result of cursor validation operation
 */
export interface CursorValidationResult {
  /**
   * Whether cursor is valid
   */
  isValid: boolean;

  /**
   * Validation errors if any
   */
  errors: string[];

  /**
   * Cursor age in seconds
   */
  age: number;

  /**
   * Cursor version compatibility
   */
  versionCompatible: boolean;

  /**
   * Recommended action
   */
  action: 'use' | 'refresh' | 'reset';
}

/**
 * Configuration Schema Interface
 *
 * configuration schema for the OpenChoreo incremental provider
 */
export interface OpenChoreoIncrementalConfig {
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
    type: 'traditional' | 'incremental';
  };

  /**
   * Incremental processing configuration
   */
  incremental?: {
    enabled: boolean;
    batchSize: number;
    interval: string;
    timeout: string;
  };
}

/**
 * Extended Read Options Interface
 *
 * Extends Backstage ReadOptions with OpenChoreo-specific options
 */
export interface OpenChoreoReadOptions extends ReadOptions {
  /**
   * Force full refresh regardless of cursor
   */
  forceRefresh?: boolean;

  /**
   * Maximum number of entities to process in this cycle
   */
  maxEntities?: number;

  /**
   * Include debugging information
   */
  debug?: boolean;
}
