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
    
    // Create a custom Dockerfile for the frontend
    const frontendDockerfile = `FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y --no-install-recommends \\
    python3 \\
    make \\
    g++ \\
    build-essential \\
    pkg-config \\
    libcairo2-dev \\
    libpango1.0-dev \\
    libjpeg-dev \\
    libgif-dev \\
    librsvg2-dev \\
    && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

# Create .env.local file with Supabase credentials
RUN echo "NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000" > .env.local \\
    && echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" >> .env.local

RUN npm run build

CMD ["npm", "run", "start"]`;
    
    // Update the frontend build context to use the custom Dockerfile
    dockerCompose = dockerCompose.replace(
      '    build:\n      context: ./frontend\n      dockerfile: Dockerfile',
      `    build:\n      context: ./frontend\n      dockerfile_inline: |\n${frontendDockerfile.split('\n').map(line => `        ${line}`).join('\n')}`
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
