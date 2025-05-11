#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const APPLICATION_UUID = 'qcooscsw0kgwsgsk888k8ook';

async function updateDockerCompose() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
      }
    });
    
    const data = await response.json();
    let dockerCompose = data.docker_compose_raw;
    
    // Remove the volumes for the environment files
    dockerCompose = dockerCompose.replace(
      '    volumes:\n      - ./backend/.env:/app/.env:ro',
      ''
    );
    
    dockerCompose = dockerCompose.replace(
      '    volumes:\n      - ./frontend/.env.local:/app/.env.local:ro',
      ''
    );
    
    // Remove the environment variables from the services since they're in the .env files
    dockerCompose = dockerCompose.replace(
      '    environment:\n      - ENV_MODE=local\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379\n      - REDIS_PASSWORD=\n      - REDIS_SSL=False',
      ''
    );
    
    dockerCompose = dockerCompose.replace(
      '    environment:\n      - NODE_ENV=production',
      ''
    );
    
    console.log('Updated Docker Compose:', dockerCompose);
    
    // Update the Docker Compose file
    const updateResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        docker_compose_raw: dockerCompose
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('Update response:', JSON.stringify(updateData, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

updateDockerCompose();
