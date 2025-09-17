/**
 * Cursor Management Contract
 * 
 * This contract defines the simplified interface for cursor management in the OpenChoreo
 * Incremental Entity Provider, including creation, validation, serialization,
 * and persistence of cursor data.
 * 
 * Feature: OpenChoreo Incremental Entity Provider
 * Date: 2025-09-16
 * Spec Reference: /specs/001-incremental-entity-provider/spec.md
 */

import {
  OpenChoreoCursor,
  CursorValidationResult,
} from './incremental-entity-provider';

/**
 * Note: This contract has been simplified to focus on essential functionality.
 * Advanced features like cursor backup, recovery, and comprehensive metrics
 * have been removed for the initial implementation.
 */

/**
 * Cursor Events Interface
 * 
 * Events emitted by the cursor manager for monitoring and debugging
 */
export interface CursorEvents {
  /**
   * Emitted when a new cursor is created
   */
  onCursorCreated: (cursor: OpenChoreoCursor) => void;
  
  /**
   * Emitted when a cursor is updated
   */
  onCursorUpdated: (oldCursor: OpenChoreoCursor, newCursor: OpenChoreoCursor) => void;
  
  /**
   * Emitted when a cursor is validated
   */
  onCursorValidated: (cursor: OpenChoreoCursor, result: CursorValidationResult) => void;
  
  /**
   * Emitted when a cursor is saved
   */
  onCursorSaved: (cursor: OpenChoreoCursor) => void;
  
  /**
   * Emitted when a cursor is loaded
   */
  onCursorLoaded: (cursor: OpenChoreoCursor) => void;
  
  /**
   * Emitted when a cursor is deleted
   */
  onCursorDeleted: () => void;
  
  /**
   * Emitted when a cursor error occurs
   */
  onCursorError: (error: CursorError) => void;
}

/**
 * Cursor Error Interface
 * 
 * Represents cursor-related errors
 */
export interface CursorError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error severity
   */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /**
   * Error context
   */
  context?: {
    operation: string;
    cursor?: OpenChoreoCursor;
    cursorState?: string;
    timestamp: string;
  };
}

/**
 * Cursor Manager Configuration Interface
 * 
 * Simplified configuration for the cursor manager behavior
 */
export interface CursorManagerConfig {
  /**
   * Maximum cursor size in bytes (when serialized)
   */
  maxCursorSize?: number;
  
  /**
   * Cursor expiration time in seconds
   */
  cursorExpiration?: number;
}

/**
 * Cursor Storage Interface
 * 
 * Defines the contract for cursor persistence storage
 */
export interface CursorStorage {
  /**
   * Store cursor data
   */
  store(key: string, data: string): Promise<void>;
  
  /**
   * Retrieve cursor data
   */
  retrieve(key: string): Promise<string | null>;
  
  /**
   * Delete cursor data
   */
  delete(key: string): Promise<void>;
  
  /**
   * Check if cursor exists
   */
  exists(key: string): Promise<boolean>;
  
  /**
   * List all cursor keys
   */
  list(): Promise<string[]>;
  
  /**
   * Get cursor metadata
   */
  getMetadata(key: string): Promise<CursorMetadata | null>;
  
  /**
   * Update cursor metadata
   */
  updateMetadata(key: string, metadata: Partial<CursorMetadata>): Promise<void>;
}

/**
 * Cursor Metadata Interface
 * 
 * Metadata for cursor storage entries
 */
export interface CursorMetadata {
  /**
   * Cursor identifier
   */
  id: string;
  
  /**
   * Cursor version
   */
  version: string;
  
  /**
   * Creation timestamp (ISO 8601 format)
   */
  createdAt: string;
  
  /**
   * Last update timestamp (ISO 8601 format)
   */
  updatedAt: string;
  
  /**
   * Expiration timestamp (ISO 8601 format)
   */
  expiresAt?: string;
  
  /**
   * Cursor size in bytes
   */
  size: number;
  
  /**
   * Cursor hash for integrity verification
   */
  hash: string;
  
  /**
   * Backup information
   */
  backup?: {
    backedUpAt: string;
    backupCount: number;
  };
}

/**
 * Cursor Serializer Interface
 * 
 * Defines the contract for cursor serialization and deserialization
 */
export interface CursorSerializer {
  /**
   * Serialize cursor to string
   */
  serialize(cursor: OpenChoreoCursor): string;
  
  /**
   * Deserialize cursor from string
   */
  deserialize(data: string): OpenChoreoCursor;
  
  /**
   * Get serialized cursor size
   */
  getSize(serialized: string): number;
  
  /**
   * Validate serialized cursor format
   */
  validateFormat(serialized: string): boolean;
  
  /**
   * Get cursor version from serialized data
   */
  getVersion(serialized: string): string | null;
}

/**
 * Cursor Validator Interface
 * 
 * Defines the contract for cursor validation
 */
export interface CursorValidator {
  /**
   * Validate cursor structure and data
   */
  validate(cursor: OpenChoreoCursor): Promise<CursorValidationResult>;
  
  /**
   * Validate cursor version compatibility
   */
  validateVersion(cursor: OpenChoreoCursor): boolean;
  
  /**
   * Validate cursor expiration
   */
  validateExpiration(cursor: OpenChoreoCursor): boolean;
  
  /**
   * Validate cursor integrity
   */
  validateIntegrity(cursor: OpenChoreoCursor): boolean;
  
  /**
   * Get cursor age in seconds
   */
  getAge(cursor: OpenChoreoCursor): number;
  
  /**
   * Get recommended action for cursor
   */
  getRecommendedAction(result: CursorValidationResult): 'use' | 'refresh' | 'reset';
}

/**
 * Cursor Backup Manager Interface
 * 
 * Defines the contract for cursor backup and recovery
 */
export interface CursorBackupManager {
  /**
   * Create cursor backup
   */
  createBackup(cursor: OpenChoreoCursor): Promise<string>;
  
  /**
   * List available backups
   */
  listBackups(): Promise<CursorBackupInfo[]>;
  
  /**
   * Restore cursor from backup
   */
  restoreFromBackup(backupId: string): Promise<OpenChoreoCursor>;
  
  /**
   * Delete backup
   */
  deleteBackup(backupId: string): Promise<void>;
  
  /**
   * Cleanup old backups
   */
  cleanup(): Promise<void>;
}

/**
 * Cursor Backup Info Interface
 * 
 * Information about cursor backups
 */
export interface CursorBackupInfo {
  /**
   * Backup identifier
   */
  id: string;
  
  /**
   * Backup timestamp (ISO 8601 format)
   */
  timestamp: string;
  
  /**
   * Cursor version
   */
  version: string;
  
  /**
   * Backup size in bytes
   */
  size: number;
  
  /**
   * Backup expiration timestamp (ISO 8601 format)
   */
  expiresAt?: string;
  
  /**
   * Backup metadata
   */
  metadata?: {
    providerId: string;
    ingestionCycleId: string;
    entityCount: number;
  };
}

/**
 * Cursor Recovery Manager Interface
 * 
 * Defines the contract for cursor recovery and repair
 */
export interface CursorRecoveryManager {
  /**
   * Attempt to recover corrupted cursor
   */
  recover(corruptedCursor: string): Promise<RecoveryResult>;
  
  /**
   * Repair cursor with missing or invalid fields
   */
  repair(cursor: OpenChoreoCursor): Promise<RecoveryResult>;
  
  /**
   * Reset cursor to initial state
   */
  reset(): Promise<OpenChoreoCursor>;
  
  /**
   * Get recovery options for corrupted cursor
   */
  getRecoveryOptions(corruptedCursor: string): Promise<RecoveryOption[]>;
}

/**
 * Recovery Result Interface
 * 
 * Result of cursor recovery operation
 */
export interface RecoveryResult {
  /**
   * Whether recovery was successful
   */
  success: boolean;
  
  /**
   * Recovered cursor (if successful)
   */
  cursor?: OpenChoreoCursor;
  
  /**
   * Recovery actions performed
   */
  actions: RecoveryAction[];
  
  /**
   * Recovery errors encountered
   */
  errors: string[];
  
  /**
   * Recovery metadata
   */
  metadata?: {
    recoveryMethod: string;
    recoveryTime: number;
    originalState: string;
    recoveredState: string;
  };
}

/**
 * Recovery Action Interface
 * 
 * Actions performed during cursor recovery
 */
export interface RecoveryAction {
  /**
   * Action type
   */
  type: 'field_repair' | 'version_upgrade' | 'data_reconstruction' | 'metadata_fix';
  
  /**
   * Action description
   */
  description: string;
  
  /**
   * Action result
   */
  result: 'success' | 'partial' | 'failed';
  
  /**
   * Action details
   */
  details?: string;
}

/**
 * Recovery Option Interface
 * 
 * Available recovery options for corrupted cursor
 */
export interface RecoveryOption {
  /**
   * Option identifier
   */
  id: string;
  
  /**
   * Option description
   */
  description: string;
  
  /**
   * Recovery method
   */
  method: 'reset' | 'repair' | 'restore' | 'reconstruct';
  
  /**
   * Expected success probability
   */
  successProbability: number;
  
  /**
   * Data loss risk level
   */
  dataLossRisk: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Cursor Metrics Interface
 * 
 * Metrics for cursor operations
 */
export interface CursorMetrics {
  /**
   * Total number of cursor creations
   */
  cursorCreations: number;
  
  /**
   * Total number of cursor updates
   */
  cursorUpdates: number;
  
  /**
   * Total number of cursor validations
   */
  cursorValidations: number;
  
  /**
   * Total number of cursor saves
   */
  cursorSaves: number;
  
  /**
   * Total number of cursor loads
   */
  cursorLoads: number;
  
  /**
   * Total number of cursor errors
   */
  cursorErrors: number;
  
  /**
   * Average cursor size in bytes
   */
  averageCursorSize: number;
  
  /**
   * Cursor validation times in milliseconds
   */
  validationTimes: number[];
  
  /**
   * Cursor save times in milliseconds
   */
  saveTimes: number[];
  
  /**
   * Cursor load times in milliseconds
   */
  loadTimes: number[];
  
  /**
   * Cursor error counts by type
   */
  errorCounts: Record<string, number>;
}

/**
 * Cursor Manager Factory Interface
 * 
 * Factory for creating cursor manager instances
 */
export interface CursorManagerFactory {
  /**
   * Create cursor manager with configuration
   */
  create(config: CursorManagerConfig): Promise<CursorManager>;
  
  /**
   * Create cursor manager with default configuration
   */
  createDefault(): Promise<CursorManager>;
  
  /**
   * Get supported storage backends
   */
  getSupportedStorageBackends(): string[];
  
  /**
   * Get supported serializers
   */
  getSupportedSerializers(): string[];
}

/**
 * Enhanced Cursor Manager Interface
 * 
 * Extended cursor manager with additional functionality
 */
export interface CursorManager {
  /**
   * Initialize cursor manager
   */
  initialize(): Promise<void>;
  
  /**
   * Create initial cursor
   */
  createInitialCursor(): Promise<OpenChoreoCursor>;
  
  /**
   * Update cursor with new state
   */
  updateCursor(
    cursor: OpenChoreoCursor,
    updates: Partial<OpenChoreoCursor>
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
  
  /**
   * Get cursor metrics
   */
  getMetrics(): CursorMetrics;
  
  /**
   * Register event listeners
   */
  registerEvents(events: CursorEvents): void;
  
  /**
   * Unregister event listeners
   */
  unregisterEvents(): void;
  
  /**
   * Create cursor backup
   */
  createBackup(): Promise<string>;
  
  /**
   * Restore cursor from backup
   */
  restoreFromBackup(backupId: string): Promise<OpenChoreoCursor>;
  
  /**
   * Recover corrupted cursor
   */
  recoverCursor(corruptedCursor: string): Promise<RecoveryResult>;
  
  /**
   * Get current cursor status
   */
  getStatus(): CursorStatus;
}

/**
 * Cursor Status Interface
 * 
 * Current status of the cursor manager
 */
export interface CursorStatus {
  /**
   * Overall cursor status
   */
  status: 'initialized' | 'ready' | 'error' | 'disabled';
  
  /**
   * Current cursor if available
   */
  currentCursor?: OpenChoreoCursor;
  
  /**
   * Last error if any
   */
  lastError?: CursorError;
  
  /**
   * Storage backend status
   */
  storageStatus: {
    connected: boolean;
    backend: string;
    latency: number;
  };
  
  /**
   * Backup status
   */
  backupStatus: {
    enabled: boolean;
    lastBackup?: string;
    backupCount: number;
  };
  
  /**
   * Encryption status
   */
  encryptionStatus: {
    enabled: boolean;
    algorithm?: string;
    keyRotation?: string;
  };
  
  /**
   * Performance metrics
   */
  performance: {
    averageSerializationTime: number;
    averageDeserializationTime: number;
    averageValidationTime: number;
    averageSaveTime: number;
    averageLoadTime: number;
  };
}