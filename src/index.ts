#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { OpenAPIV3 } from 'openapi-types';

const server = new Server(
  {
    name: "coolify",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Types for our OpenAPI handling
interface OpenAPIEndpoint {
  path: string;
  method: string;
  operationId: string;
  description: string;
  parameters?: OpenAPIV3.ParameterObject[];
  requestBody?: OpenAPIV3.RequestBodyObject;
  responses?: OpenAPIV3.ResponsesObject;
}

// Helper function for API calls
async function coolifyApiCall(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const baseUrl = process.env.COOLIFY_BASE_URL?.replace(/\/$/, '') || 'https://coolify.stuartmason.co.uk';
  const url = `${baseUrl}/api/v1${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.COOLIFY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(JSON.stringify({
      error: `Coolify API error: ${response.status} ${response.statusText}`,
      status: response.status,
      details: errorBody
    }));
  }

  return await response.json();
}

// Schema Definitions
const UuidSchema = z.object({
  uuid: z.string().describe("Resource UUID"),
});

const DeploySchema = z.object({
  tag: z.string().optional().describe("Tag name(s). Comma separated list is accepted"),
  uuid: z.string().optional().describe("Resource UUID(s). Comma separated list is accepted"),
  force: z.boolean().optional().describe("Force rebuild (without cache)"),
});

const ApplicationUpdateSchema = z.object({
  health_check_enabled: z.boolean().optional(),
  health_check_path: z.string().optional(),
  health_check_port: z.string().nullable().optional(),
  health_check_host: z.string().nullable().optional(),
  health_check_method: z.string().optional(),
  health_check_return_code: z.number().optional(),
  health_check_scheme: z.string().optional(),
  health_check_response_text: z.string().nullable().optional(),
  health_check_interval: z.number().optional(),
  health_check_timeout: z.number().optional(),
  health_check_retries: z.number().optional(),
  health_check_start_period: z.number().optional(),
  // Add other updateable fields
  name: z.string().optional(),
  description: z.string().optional(),
  domains: z.string().optional(),
});

// Function to fetch and parse OpenAPI spec
async function fetchOpenAPISpec(): Promise<OpenAPIV3.Document> {
  const specUrl = process.env.COOLIFY_OPENAPI_URL;
  if (!specUrl) {
    throw new Error('COOLIFY_OPENAPI_URL environment variable is not set');
  }

  const response = await fetch(specUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
  }

  return response.json();
}

// Function to extract endpoints from OpenAPI spec
async function parseOpenAPISpec(): Promise<OpenAPIEndpoint[]> {
  const spec = await fetchOpenAPISpec();
  const endpoints: OpenAPIEndpoint[] = [];
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue;
    for (const [method, operation] of Object.entries(pathItem as OpenAPIV3.PathItemObject)) {
      if (method === 'parameters' || !operation || typeof operation !== 'object' || !('operationId' in operation)) continue;

      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId || `${method}${path}`,
        description: operation.description || operation.summary || '',
        parameters: operation.parameters?.filter((p): p is OpenAPIV3.ParameterObject => !('$ref' in p)),
        requestBody: ('$ref' in (operation.requestBody || {})) ? undefined : operation.requestBody as OpenAPIV3.RequestBodyObject,
        responses: operation.responses
      });
    }
  }

  return endpoints;
}

// Helper function to convert OpenAPI parameters to Zod schema
function parametersToZodSchema(endpoint: OpenAPIEndpoint): z.ZodType {
  const schemaMap: Record<string, z.ZodType> = {};

  // Handle path parameters
  endpoint.parameters?.forEach(param => {
    if (param.in === 'path' || param.in === 'query') {
      schemaMap[param.name] = param.required 
        ? z.string().describe(param.description || '')
        : z.string().optional().describe(param.description || '');
    }
  });

  // Handle request body if present
  if (endpoint.requestBody) {
    const content = endpoint.requestBody.content['application/json'];
    if (content?.schema) {
      // Here you would need to implement a function to convert OpenAPI schema to Zod
      // For now, we'll use a simple any schema
      schemaMap.body = z.any();
    }
  }

  return z.object(schemaMap);
}

// Initialize server with dynamic tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const endpoints = await parseOpenAPISpec();
  
  return {
    tools: endpoints.map(endpoint => ({
      name: endpoint.operationId,
      description: endpoint.description,
      inputSchema: zodToJsonSchema(parametersToZodSchema(endpoint))
    }))
  };
});

// Handle API calls dynamically
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const endpoints = await parseOpenAPISpec();
    const endpoint = endpoints.find(e => e.operationId === request.params.name);
    
    if (!endpoint) {
      throw new Error(`Unknown tool: ${request.params.name}`);
    }

    // Parse the arguments
    const args = request.params.arguments as Record<string, any>;
    
    // Replace path parameters
    let path = endpoint.path;
    endpoint.parameters?.forEach(param => {
      if (param.in === 'path') {
        const paramValue = args[param.name];
        if (!paramValue) {
          throw new Error(`Missing required path parameter: ${param.name}`);
        }
        path = path.replace(`{${param.name}}`, paramValue);
      }
    });

    // Extract body from args if it exists
    const body = endpoint.requestBody ? args : undefined;

    // Make the API call
    const result = await coolifyApiCall(
      path,
      endpoint.method,
      body
    );

    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Coolify MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
