#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', SUPABASE_URL);
    
    // Try to access the auth endpoint
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    console.log('\nAuth API Response:');
    console.log('Status:', authResponse.status);
    console.log('Status Text:', authResponse.statusText);
    
    // Try to access the REST API
    const restResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    console.log('\nREST API Response:');
    console.log('Status:', restResponse.status);
    console.log('Status Text:', restResponse.statusText);
    
    // Overall assessment
    if (authResponse.ok || restResponse.ok) {
      console.log('\n✅ Supabase connection successful!');
      console.log('The service is responding to API requests, which indicates it is working correctly.');
      console.log('The "unhealthy" status in Coolify might be because the service is excluded from health checks.');
    } else {
      console.log('\n❌ Supabase connection failed.');
      console.log('Neither the Auth API nor the REST API responded with a success status.');
    }
  } catch (error) {
    console.error('\nError testing Supabase connection:', error);
  }
}

testSupabaseConnection();
