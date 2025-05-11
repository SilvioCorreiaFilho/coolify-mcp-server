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

// Create a new process for the MCP server
const server = spawn('node', [serverPath], {
  env,
  stdio: ['pipe', 'pipe', process.stderr']
});

// Wait for the server to start
setTimeout(() => {
  // Create the request to list applications
  const request = {
    jsonrpc: '2.0',
    id: '1',
    method: 'mcp.callTool',
    params: {
      name: 'list-applications',
      arguments: {}
    }
  };

  // Write the request to the server's stdin
  server.stdin.write(JSON.stringify(request) + '\n');

  // Set up a timeout to kill the server after 10 seconds
  setTimeout(() => {
    console.log('Timeout reached, killing server...');
    server.kill();
    process.exit(0);
  }, 10000);
}, 1000);

// Listen for the response
server.stdout.on('data', (data) => {
  try {
    const responseText = data.toString().trim();
    console.log('Raw response:', responseText);
    
    // Try to parse the response as JSON
    const lines = responseText.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        if (line.includes('jsonrpc')) {
          const response = JSON.parse(line);
          console.log('Parsed response:', JSON.stringify(response, null, 2));
          
          // If we got a successful response, kill the server
          if (response.result) {
            console.log('Applications:', response.result);
            server.kill();
            process.exit(0);
          }
        }
      } catch (e) {
        console.error('Error parsing line:', line, e);
      }
    }
  } catch (error) {
    console.error('Error processing response:', error);
  }
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code || 0);
});
