#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const DEPLOYMENT_UUID = 'l4wccwkok8cg0okosk80gc80';

async function getDeploymentLogs() {
  try {
    const response = await fetch(`${COOLIFY_BASE_URL}/api/v1/deployments/${DEPLOYMENT_UUID}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
      }
    });

    const data = await response.json();
    const logs = JSON.parse(data.logs);

    console.log('Last 20 log entries:');
    const lastLogs = logs.slice(-20);

    for (let i = 0; i < lastLogs.length; i++) {
      const log = lastLogs[i];
      console.log(`${i + 1}. ${log.timestamp}: ${log.output}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getDeploymentLogs();
