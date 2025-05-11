#!/usr/bin/env node

const fetch = require('node-fetch');

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const APPLICATION_UUID = 'qcooscsw0kgwsgsk888k8ook';

async function updateDockerCompose() {
  try {
    // Create Docker Compose file with environment variables
    const dockerComposeContent = `version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --save 60 1 --loglevel warning
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: always

  backend:
    image: python:3.11-slim
    working_dir: /app
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - ENV_MODE=production
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=
      - REDIS_SSL=False
      - SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000
      - SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - OPENAI_API_KEY=your_openai_api_key
    command: >
      bash -c "
        apt-get update && 
        apt-get install -y --no-install-recommends build-essential curl && 
        pip install --no-cache-dir -r requirements.txt gunicorn && 
        echo 'ENV_MODE=production' > .env &&
        echo 'REDIS_HOST=redis' >> .env &&
        echo 'REDIS_PORT=6379' >> .env &&
        echo 'REDIS_PASSWORD=' >> .env &&
        echo 'REDIS_SSL=False' >> .env &&
        echo 'SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000' >> .env &&
        echo 'SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' >> .env &&
        echo 'OPENAI_API_KEY=your_openai_api_key' >> .env &&
        gunicorn --bind 0.0.0.0:8000 app:app
      "
    depends_on:
      redis:
        condition: service_healthy
    restart: always

  frontend:
    image: node:20-slim
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
    command: >
      bash -c "
        apt-get update && 
        apt-get install -y --no-install-recommends python3 make g++ build-essential pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && 
        npm install && 
        echo 'NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000' > .env.local && 
        echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' >> .env.local && 
        npm run dev
      "
    depends_on:
      - backend
    restart: always

volumes:
  redis-data:`;
    
    // Update application with Docker Compose
    const updateResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        docker_compose_raw: dockerComposeContent
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('Update response:', JSON.stringify(updateData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateDockerCompose();
