/**
 * API Client Context Contract
 * 
 * This contract defines the interface for the OpenChoreo API client context,
 * providing stateless client construction per iteration with authentication,
 * configuration management, and error handling.
 * 
 * Feature: OpenChoreo Incremental Entity Provider
 * Date: 2025-09-16
 * Spec Reference: /specs/001-incremental-entity-provider/spec.md
 */

import {
  OpenChoreoContext,
  OpenChoreoApiClient,
  OpenChoreoReadOptions,
  ProviderStatus,
  ProviderHealth,
} from './incremental-entity-provider';

/**
 * API Client Configuration Interface
 * 
 * Configuration for the OpenChoreo API client
 */
export interface ApiClientConfig {
  /**
   * Base URL for OpenChoreo API
   */
  baseUrl: string;
  
  /**
   * Authentication token
   */
  token: string;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Maximum number of retries
   */
  maxRetries?: number;
  
  /**
   * Retry delay in milliseconds
   */
  retryDelay?: number;
  
  /**
   * Enable request compression
   */
  enableCompression?: boolean;
  
  /**
   * User agent string
   */
  userAgent?: string;
  
  /**
   * Proxy configuration
   */
  proxy?: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  
  /**
   * SSL/TLS configuration
   */
  ssl?: {
    rejectUnauthorized: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  
  /**
   * Rate limiting configuration
   */
  rateLimit?: {
    requestsPerSecond: number;
    burstSize: number;
  };
}

/**
 * API Client Context Factory Interface
 * 
 * Factory for creating OpenChoreo API client contexts
 */
export interface ApiClientContextFactory {
  /**
   * Create API client context from configuration
   */
  createContext(config: ApiClientConfig): Promise<OpenChoreoContext>;
  
  /**
   * Create API client context from Backstage configuration
   */
  createContextFromConfig(backstageConfig: any): Promise<OpenChoreoContext>;
  
  /**
   * Validate API client context
   */
  validateContext(context: OpenChoreoContext): Promise<ApiContextValidationResult>;
  
  /**
   * Get API client context metrics
   */
  getContextMetrics(): ApiContextMetrics;
}

/**
 * API Context Validation Result Interface
 * 
 * Result of API client context validation
 */
export interface ApiContextValidationResult {
  /**
   * Whether the context is valid
   */
  isValid: boolean;
  
  /**
   * Validation errors if any
   */
  errors: ApiContextValidationError[];
  
  /**
   * Validation warnings if any
   */
  warnings: ApiContextValidationError[];
  
  /**
   * API connectivity status
   */
  connectivity: {
    status: boolean;
    latency: number;
    error?: string;
  };
}

/**
 * API Context Validation Error Interface
 * 
 * Validation errors for API client context
 */
export interface ApiContextValidationError {
  /**
   * Error path
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
   * Error code
   */
  code: string;
}

/**
 * API Context Metrics Interface
 * 
 * Metrics for API client context operations
 */
export interface ApiContextMetrics {
  /**
   * Total number of context creations
   */
  contextCreations: number;
  
  /**
   * Total number of context validations
   */
  contextValidations: number;
  
  /**
   * Total number of connectivity tests
   */
  connectivityTests: number;
  
  /**
   * Average context creation time in milliseconds
   */
  averageContextCreationTime: number;
  
  /**
   * Average context validation time in milliseconds
   */
  averageContextValidationTime: number;
  
  /**
   * Average connectivity test time in milliseconds
   */
  averageConnectivityTestTime: number;
  
  /**
   * Context creation success rate
   */
  contextCreationSuccessRate: number;
  
  /**
   * Context validation success rate
   */
  contextValidationSuccessRate: number;
  
  /**
   * Connectivity success rate
   */
  connectivitySuccessRate: number;
}

/**
 * HTTP Client Interface
 * 
 * Base HTTP client interface for API communication
 */
export interface HttpClient {
  /**
   * Make HTTP GET request
   */
  get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Make HTTP POST request
   */
  post<T>(url: string, data?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Make HTTP PUT request
   */
  put<T>(url: string, data?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Make HTTP DELETE request
   */
  delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Make HTTP PATCH request
   */
  patch<T>(url: string, data?: any, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  
  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void;
  
  /**
   * Set authorization header
   */
  setAuthorization(token: string, type?: 'Bearer' | 'Basic' | 'Token'): void;
  
  /**
   * Set timeout
   */
  setTimeout(timeout: number): void;
  
  /**
   * Set proxy configuration
   */
  setProxy(proxy: ApiClientConfig['proxy']): void;
  
  /**
   * Set SSL configuration
   */
  setSsl(ssl: ApiClientConfig['ssl']): void;
  
  /**
   * Enable/disable compression
   */
  setCompression(enabled: boolean): void;
  
  /**
   * Set rate limiting
   */
  setRateLimit(rateLimit: ApiClientConfig['rateLimit']): void;
  
  /**
   * Set user agent
   */
  setUserAgent(userAgent: string): void;
}

/**
 * HTTP Request Options Interface
 * 
 * Options for HTTP requests
 */
export interface HttpRequestOptions {
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Query parameters
   */
  params?: Record<string, string | number | boolean>;
  
  /**
   * Request body
   */
  body?: any;
  
  /**
   * Request content type
   */
  contentType?: string;
  
  /**
   * Accept header
   */
  accept?: string;
  
  /**
   * Whether to follow redirects
   */
  followRedirects?: boolean;
  
  /**
   * Maximum number of redirects
   */
  maxRedirects?: number;
  
  /**
   * Whether to validate SSL certificates
   */
  validateSSL?: boolean;
  
  /**
   * Retry configuration
   */
  retry?: {
    maxRetries?: number;
    retryDelay?: number;
    retryCondition?: (error: any) => boolean;
  };
  
  /**
   * Rate limiting configuration
   */
  rateLimit?: {
    requestsPerSecond?: number;
    burstSize?: number;
  };
}

/**
 * HTTP Response Interface
 * 
 * HTTP response data
 */
export interface HttpResponse<T = any> {
  /**
   * Response status code
   */
  status: number;
  
  /**
   * Response status text
   */
  statusText: string;
  
  /**
   * Response headers
   */
  headers: Record<string, string>;
  
  /**
   * Response data
   */
  data: T;
  
  /**
   * Request ID if available
   */
  requestId?: string;
  
  /**
   * Response time in milliseconds
   */
  responseTime: number;
  
  /**
   * Whether the response was cached
   */
  cached: boolean;
}

/**
 * API Error Interface
 * 
 * Standard API error structure
 */
export interface ApiError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error details
   */
  details?: any;
  
  /**
   * HTTP status code
   */
  statusCode?: number;
  
  /**
   * Request ID
   */
  requestId?: string;
  
  /**
   * Timestamp (ISO 8601 format)
   */
  timestamp: string;
  
  /**
   * Stack trace (for debugging)
   */
  stack?: string;
  
  /**
   * Whether the error is retryable
   */
  retryable: boolean;
  
  /**
   * Suggested retry delay in milliseconds
   */
  retryAfter?: number;
}

/**
 * API Response Wrapper Interface
 * 
 * wrapper for API responses with metadata
 */
export interface ApiResponse<T = any> {
  /**
   * Response data
   */
  data: T;
  
  /**
   * Response metadata
   */
  meta: {
    /**
     * Request ID
     */
    requestId: string;
    
    /**
     * Response timestamp (ISO 8601 format)
     */
    timestamp: string;
    
    /**
     * API version
     */
    apiVersion: string;
    
    /**
   * Response time in milliseconds
   */
    responseTime: number;
    
    /**
     * Whether the response was cached
     */
    cached: boolean;
    
    /**
     * Rate limit information
     */
    rateLimit?: {
      remaining: number;
      limit: number;
      reset: string;
    };
    
    /**
     * Pagination information
     */
    pagination?: {
      page?: number;
      pageSize?: number;
      totalItems?: number;
      totalPages?: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
      nextCursor?: string;
      previousCursor?: string;
    };
  };
}

/**
 * OpenChoreo API Client Extended Interface
 * 
 * Extended API client with additional functionality
 */
export interface OpenChoreoApiClientExtended extends OpenChoreoApiClient {
  /**
   * Get API information and capabilities
   */
  getInfo(): Promise<ApiInfo>;
  
  /**
   * Test API authentication
   */
  testAuthentication(): Promise<AuthTestResult>;
  
  /**
   * Get API rate limits
   */
  getRateLimits(): Promise<RateLimitInfo>;
  
  /**
   * Get API health status
   */
  getHealth(): Promise<ApiHealthStatus>;
  
  /**
   * Get usage statistics
   */
  getUsageStats(): Promise<UsageStats>;
  
  /**
   * Get API endpoints information
   */
  getEndpoints(): Promise<EndpointInfo[]>;
  
  /**
   * Get API changelog
   */
  getChangelog(): Promise<ChangelogEntry[]>;
  
  /**
   * Get API documentation
   */
  getDocumentation(): Promise<ApiDocumentation>;
  
  /**
   * Set API client configuration
   */
  setConfig(config: Partial<ApiClientConfig>): void;
  
  /**
   * Get API client configuration
   */
  getConfig(): ApiClientConfig;
  
  /**
   * Reset API client configuration
   */
  resetConfig(): void;
  
  /**
   * Get API client metrics
   */
  getMetrics(): ApiClientMetrics;
  
  /**
   * Enable/disable debugging mode
   */
  setDebugMode(enabled: boolean): void;
  
  /**
   * Get API client status
   */
  getStatus(): ApiClientStatus;
}

/**
 * API Information Interface
 * 
 * API version and capabilities information
 */
export interface ApiInfo {
  /**
   * API version
   */
  version: string;
  
  /**
   * API name
   */
  name: string;
  
  /**
   * API description
   */
  description?: string;
  
  /**
   * API documentation URL
   */
  documentationUrl?: string;
  
  /**
   * API support email
   */
  supportEmail?: string;
  
  /**
   * API features and capabilities
   */
  features: {
    pagination: boolean;
    webhooks: boolean;
    realtimeUpdates: boolean;
    bulkOperations: boolean;
    advancedFiltering: boolean;
    customFields: boolean;
  };
  
  /**
   * API endpoints
   */
  endpoints: EndpointInfo[];
  
  /**
   * API rate limits
   */
  rateLimits: RateLimitInfo;
  
  /**
   * API authentication methods
   */
  authentication: {
    methods: ('token' | 'oauth' | 'basic')[];
    scopes?: string[];
  };
}

/**
 * Authentication Test Result Interface
 * 
 * Result of authentication test
 */
export interface AuthTestResult {
  /**
   * Whether authentication is successful
   */
  authenticated: boolean;
  
  /**
   * Authentication method
   */
  method: 'token' | 'oauth' | 'basic';
  
  /**
   * User information if available
   */
  user?: {
    id: string;
    username?: string;
    email?: string;
    name?: string;
    roles?: string[];
    permissions?: string[];
  };
  
  /**
   * Token information if available
   */
  token?: {
    type: string;
    expiresAt?: string;
    scopes?: string[];
  };
  
  /**
   * Authentication error if any
   */
  error?: ApiError;
}

/**
 * Rate Limit Information Interface
 * 
 * API rate limit information
 */
export interface RateLimitInfo {
  /**
   * Requests per minute
   */
  requestsPerMinute: number;
  
  /**
   * Requests per hour
   */
  requestsPerHour: number;
  
  /**
   * Requests per day
   */
  requestsPerDay: number;
  
  /**
   * Burst limit
   */
  burstLimit: number;
  
  /**
   * Current usage
   */
  current: {
    minute: number;
    hour: number;
    day: number;
    burst: number;
  };
  
  /**
   * Reset timestamps
   */
  resets: {
    minute: string;
    hour: string;
    day: string;
    burst?: string;
  };
}

/**
 * API Health Status Interface
 * 
 * API health status information
 */
export interface ApiHealthStatus {
  /**
   * Overall health status
   */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /**
   * Health check timestamp (ISO 8601 format)
   */
  timestamp: string;
  
  /**
   * Health checks
   */
  checks: {
    /**
     * Database connectivity
     */
    database: {
      status: boolean;
      latency: number;
      error?: string;
    };
    /**
     * Cache connectivity
     */
    cache: {
      status: boolean;
      latency: number;
      error?: string;
    };
    /**
     * External services
     */
    externalServices: {
      [service: string]: {
        status: boolean;
        latency: number;
        error?: string;
      };
    };
  };
  
  /**
   * Performance metrics
   */
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  
  /**
   * Version information
   */
  version: {
    api: string;
    backend: string;
    database: string;
  };
}

/**
 * Usage Statistics Interface
 * 
 * API usage statistics
 */
export interface UsageStats {
  /**
   * Total requests
   */
  totalRequests: number;
  
  /**
   * Requests by endpoint
   */
  requestsByEndpoint: Record<string, number>;
  
  /**
   * Requests by status code
   */
  requestsByStatusCode: Record<number, number>;
  
  /**
   * Requests by method
   */
  requestsByMethod: Record<string, number>;
  
  /**
   * Usage by time period
   */
  usageByTimePeriod: {
    day: number[];
    week: number[];
    month: number[];
  };
  
  /**
   * Error rates
   */
  errorRates: {
    overall: number;
    byEndpoint: Record<string, number>;
    byStatusCode: Record<number, number>;
  };
  
  /**
   * Average response times
   */
  averageResponseTimes: {
    overall: number;
    byEndpoint: Record<string, number>;
  };
}

/**
 * Endpoint Information Interface
 * 
 * API endpoint information
 */
export interface EndpointInfo {
  /**
   * Endpoint path
   */
  path: string;
  
  /**
   * HTTP methods supported
   */
  methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD')[];
  
  /**
   * Endpoint description
   */
  description?: string;
  
  /**
   * Endpoint parameters
   */
  parameters?: ParameterInfo[];
  
  /**
   * Authentication required
   */
  authentication: boolean;
  
  /**
   * Rate limit overrides
   */
  rateLimit?: {
    requestsPerMinute?: number;
    burstLimit?: number;
  };
  
  /**
   * Pagination supported
   */
  paginationSupported?: boolean;
  
  /**
   * Version introduced
   */
  versionIntroduced: string;
  
  /**
   * Deprecated
   */
  deprecated?: {
    deprecated: boolean;
    deprecatedAt?: string;
    replacement?: string;
  };
}

/**
 * Parameter Information Interface
 * 
 * API parameter information
 */
export interface ParameterInfo {
  /**
   * Parameter name
   */
  name: string;
  
  /**
   * Parameter location
   */
  in: 'query' | 'path' | 'header' | 'body';
  
  /**
   * Parameter type
   */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  /**
   * Parameter description
   */
  description?: string;
  
  /**
   * Whether parameter is required
   */
  required: boolean;
  
  /**
   * Default value
   */
  defaultValue?: any;
  
  /**
   * Parameter constraints
   */
  constraints?: {
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * Changelog Entry Interface
 * 
 * API changelog entry
 */
export interface ChangelogEntry {
  /**
   * Entry version
   */
  version: string;
  
  /**
   * Entry date (ISO 8601 format)
   */
  date: string;
  
  /**
   * Entry type
   */
  type: 'feature' | 'bugfix' | 'improvement' | 'breaking' | 'security';
  
  /**
   * Entry title
   */
  title: string;
  
  /**
   * Entry description
   */
  description: string;
  
  /**
   * Changes made
   */
  changes: {
    type: 'added' | 'removed' | 'modified' | 'deprecated';
    component: string;
    description: string;
  }[];
  
  /**
   * Migration guide
   */
  migrationGuide?: string;
}

/**
 * API Documentation Interface
 * 
 * API documentation information
 */
export interface ApiDocumentation {
  /**
   * Documentation title
   */
  title: string;
  
  /**
   * Documentation description
   */
  description: string;
  
  /**
   * Documentation version
   */
  version: string;
  
  /**
   * Documentation sections
   */
  sections: DocumentationSection[];
  
  /**
   * Examples
   */
  examples: ApiExample[];
  
  /**
   * Troubleshooting guide
   */
  troubleshooting?: {
    commonIssues: CommonIssue[];
    bestPractices: string[];
  };
}

/**
 * Documentation Section Interface
 * 
 * API documentation section
 */
export interface DocumentationSection {
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section content
   */
  content: string;
  
  /**
   * Section order
   */
  order: number;
  
  /**
   * Subsections
   */
  subsections?: DocumentationSection[];
}

/**
 * API Example Interface
 * 
 * API usage example
 */
export interface ApiExample {
  /**
   * Example title
   */
  title: string;
  
  /**
   * Example description
   */
  description: string;
  
  /**
   * Example language
   */
  language: 'javascript' | 'python' | 'curl' | 'typescript';
  
  /**
   * Example code
   */
  code: string;
  
  /**
   * Expected output
   */
  expectedOutput?: string;
  
  /**
   * Tags for filtering
   */
  tags?: string[];
}

/**
 * Common Issue Interface
 * 
 * Common API issue and solution
 */
export interface CommonIssue {
  /**
   * Issue title
   */
  title: string;
  
  /**
   * Issue description
   */
  description: string;
  
  /**
   * Issue symptoms
   */
  symptoms: string[];
  
  /**
   * Issue causes
   */
  causes: string[];
  
  /**
   * Solutions
   */
  solutions: {
    title: string;
    steps: string[];
    code?: string;
  }[];
  
  /**
   * Prevention measures
   */
  prevention?: string[];
}

/**
 * API Client Metrics Interface
 * 
 * API client performance and usage metrics
 */
export interface ApiClientMetrics {
  /**
   * Total requests made
   */
  totalRequests: number;
  
  /**
   * Requests by method
   */
  requestsByMethod: Record<string, number>;
  
  /**
   * Requests by endpoint
   */
  requestsByEndpoint: Record<string, number>;
  
  /**
   * Requests by status code
   */
  requestsByStatusCode: Record<number, number>;
  
  /**
   * Average response time by endpoint
   */
  averageResponseTimeByEndpoint: Record<string, number>;
  
  /**
   * Total errors
   */
  totalErrors: number;
  
  /**
   * Error rate by endpoint
   */
  errorRateByEndpoint: Record<string, number>;
  
  /**
   * Total retries
   */
  totalRetries: number;
  
  /**
   * Retry rate by endpoint
   */
  retryRateByEndpoint: Record<string, number>;
  
  /**
   * Cache hit rate
   */
  cacheHitRate: number;
  
  /**
   * Bandwidth usage in bytes
   */
  bandwidthUsage: number;
  
  /**
   * Connection pool metrics
   */
  connectionPool: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    pendingRequests: number;
  };
}

/**
 * API Client Status Interface
 * 
 * Current status of the API client
 */
export interface ApiClientStatus {
  /**
   * Overall client status
   */
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  
  /**
   * Last activity timestamp (ISO 8601 format)
   */
  lastActivity: string;
  
  /**
   * Connection status
   */
  connection: {
    connected: boolean;
    latency: number;
    lastConnected?: string;
    lastDisconnected?: string;
  };
  
  /**
   * Authentication status
   */
  authentication: {
    authenticated: boolean;
    lastAuthenticated?: string;
    expiresAt?: string;
  };
  
  /**
   * Configuration status
   */
  configuration: {
    valid: boolean;
    lastValidated?: string;
    errors?: string[];
  };
  
  /**
   * Performance status
   */
  performance: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  
  /**
   * Rate limiting status
   */
  rateLimit: {
    remaining: number;
    limit: number;
    reset: string;
    throttleUntil?: string;
  };
}