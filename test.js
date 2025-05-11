#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the MCP server
const serverPath = path.join(__dirname, 'build', 'index.js');

// Environment variables
const env = {
  ...process.env,
  COOLIFY_ACCESS_TOKEN: '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad',
  COOLIFY_BASE_URL: 'https://coolify.m2w.io'
};

// Start the MCP server
const server = spawn('node', [serverPath], {
  env,
  stdio: ['pipe', 'pipe', process.stderr]
});

// Send a request to list tools
const request = {
  jsonrpc: '2.0',
  id: '1',
  method: 'mcp.listTools',
  params: {}
};

// Write the request to the server's stdin
server.stdin.write(JSON.stringify(request) + '\n');

// Listen for the response
server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());

  // Send a request to list applications
  const appRequest = {
    jsonrpc: '2.0',
    id: '2',
    method: 'mcp.callTool',
    params: {
      name: 'list-applications',
      arguments: {}
    }
  };

  // Write the request to the server's stdin
  server.stdin.write(JSON.stringify(appRequest) + '\n');
});

// Handle errors
server.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Keep the script running
setTimeout(() => {
  console.log('Test completed');
  server.kill();
}, 5000);
