#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';

async function coolifyApiCall(path, method = 'GET', body = null) {
  const url = `${COOLIFY_BASE_URL}/api/v1${path}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`Making API call to: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling Coolify API:', error);
    throw error;
  }
}

async function listApplications() {
  try {
    console.log('Fetching applications...');
    const applications = await coolifyApiCall('/applications');
    console.log('Applications:');
    console.log(JSON.stringify(applications, null, 2));
  } catch (error) {
    console.error('Failed to list applications:', error);
  }
}

async function listResources() {
  try {
    console.log('Fetching resources...');
    const resources = await coolifyApiCall('/resources');
    console.log('Resources:');
    console.log(JSON.stringify(resources, null, 2));
  } catch (error) {
    console.error('Failed to list resources:', error);
  }
}

// Execute the functions
async function main() {
  try {
    await listApplications();
    await listResources();
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();
