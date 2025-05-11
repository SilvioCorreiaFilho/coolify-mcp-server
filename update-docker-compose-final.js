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
    
    // Update the environment variables for the backend
    dockerCompose = dockerCompose.replace(
      '    environment:\n      - ENV_MODE=local\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379\n      - REDIS_PASSWORD=\n      - REDIS_SSL=False',
      '    environment:\n      - ENV_MODE=production\n      - REDIS_HOST=redis\n      - REDIS_PORT=6379\n      - REDIS_PASSWORD=\n      - REDIS_SSL=False\n      - SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000\n      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0\n      - OPENAI_API_KEY=your_openai_api_key'
    );
    
    // Update the environment variables for the frontend
    dockerCompose = dockerCompose.replace(
      '    environment:\n      - NODE_ENV=production',
      '    environment:\n      - NODE_ENV=production\n      - NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000\n      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
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
