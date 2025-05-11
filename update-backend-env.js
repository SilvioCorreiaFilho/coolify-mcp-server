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
    
    // Create a custom Dockerfile for the backend
    const backendDockerfile = `FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 appuser && \\
    mkdir -p /app/logs && \\
    chown -R appuser:appuser /app

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY --chown=appuser:appuser . .

# Create .env file with Supabase credentials
RUN echo "ENV_MODE=production" > .env \\
    && echo "REDIS_HOST=redis" >> .env \\
    && echo "REDIS_PORT=6379" >> .env \\
    && echo "REDIS_PASSWORD=" >> .env \\
    && echo "REDIS_SSL=False" >> .env \\
    && echo "SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000" >> .env \\
    && echo "SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" >> .env \\
    && echo "OPENAI_API_KEY=your_openai_api_key" >> .env

USER appuser

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]`;
    
    // Update the backend build context to use the custom Dockerfile
    dockerCompose = dockerCompose.replace(
      '    build:\n      context: ./backend\n      dockerfile: Dockerfile',
      `    build:\n      context: ./backend\n      dockerfile_inline: |\n${backendDockerfile.split('\n').map(line => `        ${line}`).join('\n')}`
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
