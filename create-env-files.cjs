#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const APPLICATION_UUID = 'qcooscsw0kgwsgsk888k8ook';

async function createEnvFiles() {
  try {
    // Create backend .env content
    const backendEnvContent = `ENV_MODE=production
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False
SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
OPENAI_API_KEY=your_openai_api_key`;

    // Create frontend .env.local content
    const frontendEnvContent = `NEXT_PUBLIC_SUPABASE_URL=http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`;

    // Create a helper container to write the files
    console.log('Creating helper container to write environment files...');
    
    const createContainerResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        command: `mkdir -p /data/coolify/applications/${APPLICATION_UUID}/backend /data/coolify/applications/${APPLICATION_UUID}/frontend && 
                 echo '${backendEnvContent}' > /data/coolify/applications/${APPLICATION_UUID}/backend/.env && 
                 echo '${frontendEnvContent}' > /data/coolify/applications/${APPLICATION_UUID}/frontend/.env.local && 
                 chmod 644 /data/coolify/applications/${APPLICATION_UUID}/backend/.env /data/coolify/applications/${APPLICATION_UUID}/frontend/.env.local && 
                 ls -la /data/coolify/applications/${APPLICATION_UUID}/backend/.env /data/coolify/applications/${APPLICATION_UUID}/frontend/.env.local`
      })
    });
    
    const createContainerData = await createContainerResponse.json();
    console.log('Response:', JSON.stringify(createContainerData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createEnvFiles();
