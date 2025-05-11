#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'http://supabasekong-akowwgwwwwcwossg4cgwk0ok.m2w.io:8000';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Supabase Key:', SUPABASE_KEY);

    // Try to access the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    console.log('Response status:', response.status);

    // Get response headers
    const headers = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
    });
    console.log('Response headers:', JSON.stringify(headers, null, 2));

    try {
      const data = await response.text();
      console.log('Response data (first 200 chars):', data.substring(0, 200));

    if (response.ok) {
      console.log('✅ Supabase connection successful!');
    } else {
      console.log('❌ Supabase connection failed.');
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
}

testSupabaseConnection();
