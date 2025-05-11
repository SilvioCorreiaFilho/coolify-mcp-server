#!/usr/bin/env node

import fetch from 'node-fetch';

const COOLIFY_ACCESS_TOKEN = '3|ifKyIHldX03W1eatGseBEXRLbFuB04QFksm4ISSEa34ebdad';
const COOLIFY_BASE_URL = 'https://coolify.m2w.io';
const APPLICATION_UUID = 'qcooscsw0kgwsgsk888k8ook';

async function getLatestDeploymentLogs() {
  try {
    // Get the latest deployment
    const deploymentsResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/applications/${APPLICATION_UUID}/deployments`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
      }
    });

    const deployments = await deploymentsResponse.json();

    if (!deployments || deployments.length === 0 || !Array.isArray(deployments)) {
      console.log('No deployments found or invalid response:', deployments);

      // Try to get all deployments
      const allDeploymentsResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/deployments`, {
        headers: {
          'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
        }
      });

      const allDeployments = await allDeploymentsResponse.json();

      if (!allDeployments || allDeployments.length === 0) {
        console.log('No deployments found in the system.');
        return;
      }

      // Filter deployments for our application
      const appDeployments = allDeployments.filter(d => d.application_id === APPLICATION_UUID);

      if (!appDeployments || appDeployments.length === 0) {
        console.log('No deployments found for this application.');
        return;
      }

      const latestDeployment = appDeployments[0];
      console.log('Latest deployment UUID:', latestDeployment.deployment_uuid);
      console.log('Status:', latestDeployment.status);
      return latestDeployment;
    }

    const latestDeployment = deployments[0];
    console.log('Latest deployment UUID:', latestDeployment.deployment_uuid);
    console.log('Status:', latestDeployment.status);

    // Get the deployment logs
    const logsResponse = await fetch(`${COOLIFY_BASE_URL}/api/v1/deployments/${latestDeployment.deployment_uuid}`, {
      headers: {
        'Authorization': `Bearer ${COOLIFY_ACCESS_TOKEN}`
      }
    });

    const logsData = await logsResponse.json();

    if (!logsData.logs) {
      console.log('No logs found for this deployment.');
      return;
    }

    const logs = JSON.parse(logsData.logs);

    console.log('\nLast 30 log entries:');
    const lastLogs = logs.slice(-30);

    for (let i = 0; i < lastLogs.length; i++) {
      const log = lastLogs[i];
      console.log(`${i + 1}. ${log.timestamp}: ${log.output}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getLatestDeploymentLogs();
