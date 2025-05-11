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
    
    // Update the volumes section for the frontend to use a different .env.local file
    dockerCompose = dockerCompose.replace(
      '      - ./frontend/.env.local:/app/.env.local:ro',
      '      - /data/coolify/applications/qcooscsw0kgwsgsk888k8ook/frontend/.env.local:/app/.env.local:ro'
    );
    
    // Update the volumes section for the backend to use a different .env file
    dockerCompose = dockerCompose.replace(
      '      - ./backend/.env:/app/.env:ro',
      '      - /data/coolify/applications/qcooscsw0kgwsgsk888k8ook/backend/.env:/app/.env:ro'
    );
    
    // Remove environment variables from the Docker Compose file
    dockerCompose = dockerCompose.replace(
      '    environment:\n      - ENV_MODE=local\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379\n      - REDIS_PASSWORD=\n      - REDIS_SSL=False',
      '    environment:\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379'
    );
    
    dockerCompose = dockerCompose.replace(
      '    environment:\n      - NODE_ENV=production',
      '    environment:\n      - NODE_ENV=production'
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
