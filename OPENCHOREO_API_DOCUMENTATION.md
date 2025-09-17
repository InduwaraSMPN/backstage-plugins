# OpenChoreo API Documentation

This document provides a comprehensive reference for all OpenChoreo API endpoints, including detailed request/response formats, authentication, and usage examples.

## Overview

OpenChoreo provides a comprehensive RESTful API that exposes its Kubernetes-native Internal Developer Platform functionality. The API follows RESTful principles and uses standard HTTP methods and response codes.

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
The API uses Kubernetes authentication mechanisms and requires valid authentication credentials to access protected endpoints.

### Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "error": "Optional error message",
  "code": "Optional error code"
}
```

### Error Codes
- `CodeInvalidInput` - Invalid request parameters
- `CodeInternalError` - Internal server error
- `CodeOrganizationNotFound` - Organization not found
- And other specific error codes per endpoint

## API Endpoints

### Health Checks

#### GET /health
Health check endpoint.

**Response:** `200 OK` with body `OK`

#### GET /ready
Readiness check endpoint.

**Response:** `200 OK` with body `Ready`

---

## Resource Management Endpoints

### POST /api/v1/apply
Apply a Kubernetes resource to the cluster. Similar to `kubectl apply`.

**Request Body:** Kubernetes resource manifest (JSON format)
```json
{
  "apiVersion": "openchoreo.dev/v1alpha1",
  "kind": "Organization",
  "metadata": {
    "name": "default"
  },
  "spec": {}
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "apiVersion": "openchoreo.dev/v1alpha1",
    "kind": "Organization",
    "name": "default",
    "namespace": "",
    "operation": "created"
  }
}
```

**Operation Values:**
- `created` - Resource was newly created
- `updated` - Existing resource was updated
- `unchanged` - Resource already exists and matches the specified state

---

### DELETE /api/v1/delete
Delete a Kubernetes resource from the cluster. Similar to `kubectl delete`.

**Request Body:** Kubernetes resource manifest (JSON format)
```json
{
  "apiVersion": "openchoreo.dev/v1alpha1",
  "kind": "Organization",
  "metadata": {
    "name": "default"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "apiVersion": "openchoreo.dev/v1alpha1",
    "kind": "Organization",
    "name": "default",
    "namespace": "",
    "operation": "deleted"
  }
}
```

**Operation Values:**
- `deleted` - Resource was successfully deleted
- `not_found` - Resource did not exist

---

## Organization Management

### GET /api/v1/orgs
List all organizations.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "default",
        "displayName": "My Organization",
        "description": "Organization for platform engineering",
        "namespace": "choreo-default",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### GET /api/v1/orgs/{orgName}
Get a specific organization by name.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "name": "default",
    "displayName": "My Organization",
    "description": "Organization for platform engineering",
    "namespace": "choreo-default",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready"
  }
}
```

**Error Responses:**
- `404 Not Found` - Organization not found
- `500 Internal Server Error` - Server error

---

## DataPlane Management

### GET /api/v1/orgs/{orgName}/dataplanes
List all data planes for an organization.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "prod-dataplane",
        "namespace": "choreo-default",
        "displayName": "Production DataPlane",
        "description": "Production environment cluster",
        "registryPrefix": "docker.io/registry",
        "registrySecretRef": "registry-secret",
        "kubernetesClusterName": "prod-cluster",
        "apiServerURL": "https://prod-cluster.example.com",
        "publicVirtualHost": "prod.example.com",
        "organizationVirtualHost": "internal.prod.example.com",
        "observerURL": "https://observer.prod.example.com",
        "observerUsername": "observer-user",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### POST /api/v1/orgs/{orgName}/dataplanes
Create a new data plane.

**Path Parameters:**
- `orgName` (required): Organization name

**Request Body:**
```json
{
  "name": "prod-dataplane",
  "displayName": "Production DataPlane",
  "description": "Production environment cluster",
  "registryPrefix": "docker.io/registry",
  "registrySecretRef": "registry-secret",
  "kubernetesClusterName": "prod-cluster",
  "apiServerURL": "https://prod-cluster.example.com",
  "caCert": "-----BEGIN CERTIFICATE-----",
  "clientCert": "-----BEGIN CERTIFICATE-----",
  "clientKey": "-----BEGIN PRIVATE KEY-----",
  "publicVirtualHost": "prod.example.com",
  "organizationVirtualHost": "internal.prod.example.com",
  "observerURL": "https://observer.prod.example.com",
  "observerUsername": "observer-user",
  "observerPassword": "observer-password"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "name": "prod-dataplane",
    "namespace": "choreo-default",
    "displayName": "Production DataPlane",
    "description": "Production environment cluster",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready"
  }
}
```

### GET /api/v1/orgs/{orgName}/dataplanes/{dpName}
Get a specific data plane.

**Path Parameters:**
- `orgName` (required): Organization name
- `dpName` (required): Data plane name

**Response:** `200 OK` (similar to list response, single item)

---

## Environment Management

### GET /api/v1/orgs/{orgName}/environments
List all environments for an organization.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "production",
        "namespace": "choreo-default-production",
        "displayName": "Production",
        "description": "Production environment",
        "dataPlaneRef": "prod-dataplane",
        "isProduction": true,
        "dnsPrefix": "prod",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### POST /api/v1/orgs/{orgName}/environments
Create a new environment.

**Path Parameters:**
- `orgName` (required): Organization name

**Request Body:**
```json
{
  "name": "staging",
  "displayName": "Staging",
  "description": "Staging environment",
  "dataPlaneRef": "staging-dataplane",
  "isProduction": false,
  "dnsPrefix": "staging"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "name": "staging",
    "namespace": "choreo-default-staging",
    "displayName": "Staging",
    "description": "Staging environment",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready"
  }
}
```

### GET /api/v1/orgs/{orgName}/environments/{envName}
Get a specific environment.

**Path Parameters:**
- `orgName` (required): Organization name
- `envName` (required): Environment name

**Response:** `200 OK` (similar to list response, single item)

---

## BuildPlane Management

### GET /api/v1/orgs/{orgName}/buildplanes
List all build planes for an organization.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "ci-buildplane",
        "namespace": "choreo-default",
        "displayName": "CI BuildPlane",
        "description": "Build plane for CI/CD",
        "kubernetesClusterName": "ci-cluster",
        "apiServerURL": "https://ci-cluster.example.com",
        "observerURL": "https://observer.ci.example.com",
        "observerUsername": "observer-user",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### GET /api/v1/orgs/{orgName}/build-templates
List all build templates (ClusterWorkflowTemplates) available in the build plane.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "docker-build",
        "parameters": [
          {
            "name": "dockerfile-path",
            "default": "Dockerfile"
          },
          {
            "name": "build-context",
            "default": "."
          }
        ],
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Project Management

### GET /api/v1/orgs/{orgName}/projects
List all projects for an organization.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "customer-service",
        "orgName": "default",
        "displayName": "Customer Service",
        "description": "Customer service microservice",
        "deploymentPipeline": "default-pipeline",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### POST /api/v1/orgs/{orgName}/projects
Create a new project.

**Path Parameters:**
- `orgName` (required): Organization name

**Request Body:**
```json
{
  "name": "customer-service",
  "displayName": "Customer Service",
  "description": "Customer service microservice",
  "deploymentPipeline": "default-pipeline"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "name": "customer-service",
    "orgName": "default",
    "displayName": "Customer Service",
    "description": "Customer service microservice",
    "deploymentPipeline": "default-pipeline",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready"
  }
}
```

### GET /api/v1/orgs/{orgName}/projects/{projectName}
Get a specific project.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name

**Response:** `200 OK` (similar to list response, single item)

### GET /api/v1/orgs/{orgName}/projects/{projectName}/deployment-pipeline
Get the deployment pipeline configuration for a project.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "name": "default-pipeline",
    "displayName": "Default Pipeline",
    "description": "Default deployment pipeline",
    "orgName": "default",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready",
    "promotionPaths": [
      {
        "sourceEnvironmentRef": "dev",
        "targetEnvironmentRefs": [
          {
            "name": "staging",
            "requiresApproval": true,
            "isManualApprovalRequired": false
          }
        ]
      },
      {
        "sourceEnvironmentRef": "staging",
        "targetEnvironmentRefs": [
          {
            "name": "production",
            "requiresApproval": true,
            "isManualApprovalRequired": true
          }
        ]
      }
    ]
  }
}
```

---

## Component Management

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components
List all components for a project.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "api-service",
        "displayName": "API Service",
        "description": "REST API service component",
        "type": "Service",
        "projectName": "customer-service",
        "orgName": "default",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready",
        "service": {
          "owner": {
            "projectName": "customer-service"
          },
          "workloadName": "api-service-workload",
          "className": "default",
          "apis": {
            "main-endpoint": {
              "className": "default",
              "type": "HTTP",
              "rest": {
                "backend": {
                  "port": 8080,
                  "basePath": "/api"
                },
                "exposeLevels": ["Project", "Organization", "Public"]
              }
            }
          }
        },
        "buildConfig": {
          "repoUrl": "https://github.com/customer/api-service",
          "repoBranch": "main",
          "componentPath": ".",
          "buildTemplateRef": "docker-build",
          "buildTemplateParams": [
            {
              "name": "dockerfile-path",
              "value": "Dockerfile"
            }
          ]
        }
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### POST /api/v1/orgs/{orgName}/projects/{projectName}/components
Create a new component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name

**Request Body:**
```json
{
  "name": "api-service",
  "displayName": "API Service",
  "description": "REST API service component",
  "type": "Service",
  "buildConfig": {
    "repoUrl": "https://github.com/customer/api-service",
    "repoBranch": "main",
    "componentPath": ".",
    "buildTemplateRef": "docker-build",
    "buildTemplateParams": [
      {
        "name": "dockerfile-path",
        "value": "Dockerfile"
      }
    ]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "name": "api-service",
    "displayName": "API Service",
    "description": "REST API service component",
    "type": "Service",
    "projectName": "customer-service",
    "orgName": "default",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready"
  }
}
```

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}
Get a specific component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Response:** `200 OK` (similar to list response, single item)

---

## Component Binding Management

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/bindings
Get all bindings for a component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "production-binding",
        "type": "ServiceBinding",
        "componentName": "api-service",
        "projectName": "customer-service",
        "orgName": "default",
        "environment": "production",
        "bindingStatus": {
          "reason": "BindingReady",
          "message": "Component is successfully deployed",
          "status": "Active",
          "lastTransitioned": "2025-01-15T10:30:00Z"
        },
        "serviceBinding": {
          "endpoints": [
            {
              "name": "main-endpoint",
              "type": "HTTP",
              "project": {
                "host": "api-service.customer-service.svc.cluster.local",
                "port": 8080,
                "scheme": "http",
                "basePath": "/api",
                "uri": "http://api-service.customer-service.svc.cluster.local:8080/api"
              },
              "organization": {
                "host": "api-service.customer-service.org.svc.cluster.local",
                "port": 8080,
                "scheme": "http",
                "basePath": "/api",
                "uri": "http://api-service.customer-service.org.svc.cluster.local:8080/api"
              },
              "public": {
                "host": "api-service.customer-service.example.com",
                "port": 443,
                "scheme": "https",
                "basePath": "/api",
                "uri": "https://api-service.customer-service.example.com/api"
              }
            }
          ],
          "image": "docker.io/customer/api-service:latest",
          "releaseState": "Active"
        }
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### PATCH /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/bindings/{bindingName}
Update a component binding.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name  
- `componentName` (required): Component name
- `bindingName` (required): Binding name

**Request Body:**
```json
{
  "releaseState": "Suspend"
}
```

**Release State Values:**
- `Active` - Resources are deployed normally
- `Suspend` - Resources are suspended (scaled to zero or paused)
- `Undeploy` - Resources are removed from the data plane

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "releaseState": "Suspend",
    "message": "Binding updated successfully"
  }
}
```

---

## Component Promotion

### POST /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/promote
Promote a component from one environment to another.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Request Body:**
```json
{
  "sourceEnv": "staging", 
  "targetEnv": "production"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Component promotion initiated",
    "sourceEnvironment": "staging",
    "targetEnvironment": "production",
    "status": "InProgress"
  }
}
```

---

## Build Management

### POST /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/builds
Trigger a build for a component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Request Body:**
```json
{
  "workflowTemplateName": "docker-build",
  "parameters": {
    "dockerfile-path": "Dockerfile",
    "build-context": ".",
    "registry": "docker.io/customer",
    "image-name": "api-service"
  }
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "name": "api-service-build-123",
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "componentName": "api-service",
    "projectName": "customer-service",
    "orgName": "default",
    "commit": "abc123def456",
    "status": "Running",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/builds
List builds for a component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Query Parameters:**
- `status` (optional): Filter by build status (e.g., Running, Succeeded, Failed)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "api-service-build-123",
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "componentName": "api-service",
        "projectName": "customer-service",
        "orgName": "default",
        "commit": "abc123def456",
        "status": "Succeeded",
        "createdAt": "2025-01-15T10:30:00Z",
        "image": "docker.io/customer/api-service:abc123"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Observer URL Management

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/environments/{environmentName}/observer-url
Get the observer URL for a component in a specific environment.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name
- `environmentName` (required): Environment name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://observer.example.com/orgs/default/projects/customer-service/components/api-service/environments/production",
    "environment": "production"
  }
}
```

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/observer-url
Get the observer URL for component builds.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "url": "https://observer.example.com/orgs/default/projects/customer-service/components/api-service/builds",
    "type": "builds"
  }
}
```

---

## Workload Management

### POST /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/workloads
Create a workload for a component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Request Body:**
```json
{
  "containers": {
    "main": {
      "image": "docker.io/customer/api-service:latest",
      "command": ["/app/server"],
      "args": ["--port=8080"],
      "env": [
        {
          "name": "PORT", 
          "value": "8080"
        }
      ]
    }
  },
  "endpoints": {
    "http": {
      "type": "HTTP",
      "port": 8080
    }
  },
  "connections": {
    "database": {
      "type": "api",
      "params": {
        "service": "postgres",
        "port": "5432"
      },
      "inject": {
        "env": [
          {
            "name": "DATABASE_URL",
            "value": "tcp://{{ .host }}:{{ .port }}"
          }
        ]
      }
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "name": "api-service-workload",
    "createdAt": "2025-01-15T10:30:00Z",
    "status": "Ready"
  }
}
```

### GET /api/v1/orgs/{orgName}/projects/{projectName}/components/{componentName}/workloads
Get workloads for a component.

**Path Parameters:**
- `orgName` (required): Organization name
- `projectName` (required): Project name
- `componentName` (required): Component name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "api-service-workload",
        "containers": {
          "main": {
            "image": "docker.io/customer/api-service:latest",
            "command": ["/app/server"],
            "args": ["--port=8080"],
            "env": [
              {
                "name": "PORT", 
                "value": "8080"
              }
            ]
          }
        },
        "endpoints": {
          "http": {
            "type": "HTTP",
            "port": 8080
          }
        },
        "status": "Ready"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Deployment Pipeline Management

### GET /api/v1/orgs/{orgName}/deployment-pipelines
List deployment pipelines for an organization.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "default-pipeline",
        "displayName": "Default Pipeline",
        "description": "Default deployment pipeline",
        "orgName": "default",
        "createdAt": "2025-01-15T10:30:00Z",
        "status": "Ready",
        "promotionPaths": [
          {
            "sourceEnvironmentRef": "dev",
            "targetEnvironmentRefs": [
              {
                "name": "staging",
                "requiresApproval": true,
                "isManualApprovalRequired": false
              }
            ]
          },
          {
            "sourceEnvironmentRef": "staging",
            "targetEnvironmentRefs": [
              {
                "name": "production",
                "requiresApproval": true,
                "isManualApprovalRequired": true
              }
            ]
          }
        ]
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Configuration Group Management

### GET /api/v1/orgs/{orgName}/configuration-groups
List configuration groups for an organization.

**Path Parameters:**
- `orgName` (required): Organization name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "name": "database-config",
        "orgName": "default",
        "createdAt": "2025-01-15T10:30:00Z",
        "data": {
          "host": "postgres.example.com",
          "port": 5432,
          "database": "customer_db",
          "ssl": true
        }
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "Error-Code"
}
```

### Common Error Codes

- `CodeInvalidInput` - Missing or invalid request parameters
- `CodeInternalError` - Internal server error
- `CodeOrganizationNotFound` - Specified organization not found
- `CodeProjectNotFound` - Specified project not found
- `CodeComponentNotFound` - Specified component not found
- `CodeEnvironmentNotFound` - Specified environment not found
- `CodeDataPlaneNotFound` - Specified dataplane not found

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource successfully created
- `202 Accepted` - Request accepted for processing
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication and Authorization

The OpenChoreo API integrates with Kubernetes authentication mechanisms:

### Authentication Methods

1. **Service Account Tokens** - Use Kubernetes service account tokens
2. **Client Certificates** - Use client certificates for mutual TLS
3. **Bearer Tokens** - Use bearer tokens for API access

### Authorization

Access is controlled through Kubernetes RBAC (Role-Based Access Control). Users must have appropriate permissions to perform operations on the various OpenChoreo resources.

### Example Authentication Headers

```
Authorization: Bearer <kubernetes-token>
```

---

## Rate Limiting and Quotas

The API implements rate limiting to prevent abuse:

- Default rate limit: 1000 requests per minute per user
- Burst rate: 100 requests per second
- Quotas are applied based on authenticated user identity

---

## Pagination

List endpoints support pagination using the following query parameters:

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20, max: 100)

**Example:**
```
GET /api/v1/orgs/default/projects?page=2&pageSize=50
```

---

## Field Selection

Some endpoints support field selection to reduce response size:

**Example:**
```
GET /api/v1/orgs/default/projects/customer-service/components/api-service?fields=name,status,createdAt
```

---

## API Versioning

The API uses URL-based versioning:

- Current version: `/api/v1`
- Future versions: `/api/v2`

The API maintains backward compatibility within major versions.

---

## Webhook Events

OpenChoreo supports webhook notifications for resource lifecycle events:

### Event Types

- `resource.created` - Resource created
- `resource.updated` - Resource updated
- `resource.deleted` - Resource deleted
- `build.completed` - Build completed
- `deployment.succeeded` - Deployment succeeded
- `deployment.failed` - Deployment failed

### Event Payload

```json
{
  "event": "resource.created",
  "resourceType": "Project",
  "resourceName": "customer-service",
  "organization": "default",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "apiVersion": "openchoreo.dev/v1alpha1",
    "kind": "Project",
    "metadata": {
      "name": "customer-service"
    },
    "spec": {
      // Resource spec
    }
  }
}
```

---

## Example Usage

### 1. Create Organization

```bash
curl -X POST "http://localhost:8080/api/v1/apply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "apiVersion": "openchoreo.dev/v1alpha1",
    "kind": "Organization",
    "metadata": {
      "name": "my-company"
    },
    "spec": {}
  }'
```

### 2. Create Project

```bash
curl -X POST "http://localhost:8080/api/v1/orgs/my-company/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "customer-service",
    "displayName": "Customer Service",
    "description": "Customer service microservice",
    "deploymentPipeline": "default-pipeline"
  }'
```

### 3. Create Component

```bash
curl -X POST "http://localhost:8080/api/v1/orgs/my-company/projects/customer-service/components" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "api-service",
    "displayName": "API Service",
    "description": "REST API service component",
    "type": "Service",
    "buildConfig": {
      "repoUrl": "https://github.com/customer/api-service",
      "repoBranch": "main",
      "componentPath": ".",
      "buildTemplateRef": "docker-build"
    }
  }'
```

### 4. Trigger Build

```bash
curl -X POST "http://localhost:8080/api/v1/orgs/my-company/projects/customer-service/components/api-service/builds" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "workflowTemplateName": "docker-build",
    "parameters": {
      "dockerfile-path": "Dockerfile",
      "build-context": ".",
      "registry": "docker.io/customer",
      "image-name": "api-service"
    }
  }'
```

### 5. List Projects

```bash
curl -X GET "http://localhost:8080/api/v1/orgs/my-company/projects" \
  -H "Authorization: Bearer <token>"
```

---

## SDKs and Client Libraries

OpenChoreo provides the following client libraries:

- **Go SDK** - Native Go client with full API coverage
- **CLI (choreoctl)** - Command-line interface for all operations
- **REST API** - Direct REST API access as documented

### Go SDK Example

```go
package main

import (
    "context"
    "fmt"
    "log"
    
    "github.com/openchoreo/openchoreo/pkg/client"
)

func main() {
    config := client.Config{
        BaseURL:    "http://localhost:8080",
        AuthToken:  "your-kubernetes-token",
    }
    
    cli := client.New(config)
    
    projects, err := cli.ListProjects(context.Background(), "default")
    if err != nil {
        log.Fatal(err)
    }
    
    for _, project := range projects {
        fmt.Printf("Project: %s\n", project.Name)
    }
}
```

---

## Best Practices

### Error Handling

Always check the `success` field in API responses and handle error conditions gracefully:

```javascript
const response = await fetch('/api/v1/orgs/default/projects');
const data = await response.json();

if (!data.success) {
    console.error('Error:', data.error, 'Code:', data.code);
    // Handle specific error codes
    switch (data.code) {
        case 'CodeOrganizationNotFound':
            // Handle missing organization
            break;
        case 'CodeInvalidInput':
            // Handle invalid parameters
            break;
        default:
            // Handle generic error
            break;
    }
}
```

### Retry Strategy

For transient errors, implement retry logic with exponential backoff:

- Retry on HTTP 5xx errors
- Retry on network timeouts
- Maximum 3-5 retries
- Exponential backoff: 1s, 2s, 4s, 8s

### Resource Creation

When creating resources, follow these guidelines:

1. Use descriptive names and metadata
2. Always handle validation errors
3. Implement proper idempotency patterns
4. Check resource limits and quotas

### Build Management

For build operations:

1. Monitor build status asynchronously
2. Handle build failures gracefully
3. Implement build cancellation when needed
4. Use appropriate build templates for your use case

---

## Troubleshooting

### Common Issues

**Authentication Failures**
- Verify token is valid and not expired
- Check user has RBAC permissions for the requested operation
- Ensure proper authentication headers are sent

**Resource Not Found**
- Verify resource exists in the expected organization/project
- Check spelling of resource names
- Ensure proper hierarchy (org → project → component)

**Validation Errors**
- Review API documentation for required fields
- Check field constraints and formats
- Validate against schema definitions

### Debug Headers

Add these headers for debugging:

```
X-Debug: true
X-Trace-ID: <unique-trace-id>
```

### Logging

Enable verbose logging in client libraries for troubleshooting connection issues and API behavior.

---

## API Changelog

### v1.0.0 (Current)
- Initial release with complete CRUD operations for all OpenChoreo resources
- Support for organization, project, component, environment, and dataplane management
- Build and deployment pipeline functionality
- Component binding and lifecycle management
- Observer URL integration
- Workload management and promotion workflows

---

## Support

For API support and questions:

1. **Documentation**: Refer to OpenChoreo official documentation
2. **Issues**: Report bugs and feature requests on GitHub
3. **Community**: Join the OpenChoreo Discord server
4. **Technical Support**: Contact support for enterprise plans

---

## License

This API documentation and the OpenChoreo platform are licensed under the Apache 2.0 License. See the LICENSE file for details.