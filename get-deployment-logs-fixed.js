#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const DEPLOYMENT_UUID = 'l8ok8ggocccogwg40okk80kk';

async function getDeploymentLogs() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/deployments/${DEPLOYMENT_UUID}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
      }
    });

    const data = await response.json();
    console.log('Deployment data:', JSON.stringify(data, null, 2));

    if (!data.logs) {
      console.log('No logs found for this deployment.');
      return;
    }

    try {
      const logs = JSON.parse(data.logs);

      console.log('\nLast 30 log entries:');
      const lastLogs = logs.slice(-30);

      for (let i = 0; i < lastLogs.length; i++) {
        const log = lastLogs[i];
        console.log(`${i + 1}. ${log.timestamp}: ${log.output}`);
      }
    } catch (error) {
      console.error('Error parsing logs:', error);
      console.log('Raw logs:', data.logs);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getDeploymentLogs();
