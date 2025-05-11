#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const APPLICATION_UUID = 'qcooscsw0kgwsgsk888k8ook';

async function createEnvironmentFiles() {
  try {
    // Create directory for backend .env file
    const createBackendDirResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/directories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '/backend'
      })
    });
    console.log('Create backend directory response:', await createBackendDirResponse.text());

    // Create directory for frontend .env.local file
    const createFrontendDirResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/directories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '/frontend'
      })
    });
    console.log('Create frontend directory response:', await createFrontendDirResponse.text());

    // Create backend .env file
    const backendEnv = `ENV_MODE=production
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=False
SUPABASE_URL=https://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
OPENAI_API_KEY=your_openai_api_key`;

    const createBackendEnvResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '/backend/.env',
        content: backendEnv
      })
    });
    console.log('Create backend .env response:', await createBackendEnvResponse.text());

    // Create frontend .env.local file
    const frontendEnv = `NEXT_PUBLIC_SUPABASE_URL=https://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`;

    const createFrontendEnvResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: '/frontend/.env.local',
        content: frontendEnv
      })
    });
    console.log('Create frontend .env.local response:', await createFrontendEnvResponse.text());

    // Deploy the application
    const deployResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Deploy response:', await deployResponse.text());
  } catch (error) {
    console.error('Error:', error);
  }
}

createEnvironmentFiles();
