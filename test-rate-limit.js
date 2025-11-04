#!/usr/bin/env node

/**
 * Script para probar el rate limiting
 * 
 * Ejecutar: node test-rate-limit.js
 * 
 * Este script hace 15 requests consecutivos al endpoint /upload/info
 * que tiene un límite de 10 requests por minuto.
 * Los primeros 10 deberían funcionar (200), los siguientes 5 deberían fallar (429)
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/upload/info';
const TOTAL_REQUESTS = 15;

async function makeRequest(requestNumber) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: ENDPOINT,
        method: 'GET',
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode;
          const emoji = status === 200 ? '✅' : status === 429 ? '🚫' : '❌';
          console.log(
            `Request ${requestNumber.toString().padStart(2, ' ')}: ${emoji} ${status} ${
              status === 429 ? '(Rate limit exceeded)' : '(OK)'
            }`,
          );
          resolve({ requestNumber, status });
        });
      },
    );

    req.on('error', (error) => {
      console.error(`Request ${requestNumber}: ❌ Error:`, error.message);
      resolve({ requestNumber, status: 0, error });
    });

    req.end();
  });
}

async function testRateLimit() {
  console.log('🧪 Testing Rate Limiting');
  console.log(`📍 Endpoint: ${BASE_URL}${ENDPOINT}`);
  console.log(`📊 Total requests: ${TOTAL_REQUESTS}`);
  console.log(`⏱️  Limit: 10 requests per minute (global default)`);
  console.log('\n--- Starting test ---\n');

  const results = [];

  // Hacer requests secuenciales rápidos
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    const result = await makeRequest(i);
    results.push(result);
    // Pequeña pausa para simular requests rápidos pero no instantáneos
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  // Resumen
  console.log('\n--- Summary ---\n');
  const successful = results.filter((r) => r.status === 200).length;
  const rateLimited = results.filter((r) => r.status === 429).length;
  const errors = results.filter((r) => r.status !== 200 && r.status !== 429).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`🚫 Rate limited: ${rateLimited}`);
  console.log(`❌ Errors: ${errors}`);

  if (rateLimited > 0) {
    console.log('\n✅ Rate limiting is WORKING correctly!');
  } else {
    console.log('\n⚠️  Rate limiting might NOT be working as expected.');
    console.log('   Expected at least 5 requests to be rate limited (429).');
  }

  console.log('\n💡 Tip: Wait 60 seconds and try again to reset the limit.');
}

// Verificar que el servidor esté corriendo
const checkServer = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/public/health',
    method: 'GET',
  },
  (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server is running\n');
      testRateLimit();
    } else {
      console.error('❌ Server responded with status:', res.statusCode);
      process.exit(1);
    }
  },
);

checkServer.on('error', (error) => {
  console.error('❌ Cannot connect to server. Make sure it is running on http://localhost:3000');
  console.error('   Error:', error.message);
  process.exit(1);
});

checkServer.end();
