#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const DEPLOYMENT_UUID = 'eogwk0kgks4kwk80okoowkoo';

async function getDeploymentLogs() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/deployments/${DEPLOYMENT_UUID}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (!data.logs) {
      console.log('No logs found for this deployment.');
      return;
    }
    
    const logs = JSON.parse(data.logs);
    
    // Save logs to a file for easier viewing
    const fs = await import('fs');
    fs.writeFileSync('deployment-logs.json', JSON.stringify(logs, null, 2));
    console.log('Logs saved to deployment-logs.json');
    
    // Print the last 50 log entries
    console.log('\nLast 50 log entries:');
    const lastLogs = logs.slice(-50);
    
    for (let i = 0; i < lastLogs.length; i++) {
      const log = lastLogs[i];
      console.log(`${i + 1}. ${log.timestamp}: ${log.output}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getDeploymentLogs();
