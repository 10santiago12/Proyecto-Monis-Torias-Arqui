import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp-up a 5 VUs
    { duration: '30s', target: 10 }, // Mantener 10 VUs
    { duration: '10s', target: 0 },  // Ramp-down a 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests deben ser < 500ms
    http_req_failed: ['rate<0.1'],    // < 10% de requests pueden fallar
    errors: ['rate<0.1'],             // < 10% de errores de validación
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:5001/proyecto-arqui-2c418/us-central1/api';

// Token de autenticación (debe configurarse como variable de entorno)
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export default function () {
  // Test 1: Health Check (no requiere autenticación)
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check has ok property': (r) => JSON.parse(r.body).ok === true,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: List Sessions (requiere autenticación)
  if (AUTH_TOKEN) {
    const headers = {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const sessionsRes = http.get(`${BASE_URL}/sessions`, { headers });
    check(sessionsRes, {
      'sessions list status is 200 or 401': (r) => [200, 401].includes(r.status),
      'sessions response is valid JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);

    sleep(1);

    // Test 3: List Materials
    const materialsRes = http.get(`${BASE_URL}/materials`, { headers });
    check(materialsRes, {
      'materials list status is 200 or 401': (r) => [200, 401].includes(r.status),
    }) || errorRate.add(1);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'load-tests/results/sessions-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';
  const enableColors = options?.enableColors || false;

  let summary = `\n${indent}Test Summary:\n`;
  summary += `${indent}============\n\n`;
  
  // HTTP metrics
  summary += `${indent}HTTP Request Duration:\n`;
  summary += `${indent}  avg: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += `${indent}  max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += `${indent}  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n\n`;
  
  // Request stats
  summary += `${indent}HTTP Requests:\n`;
  summary += `${indent}  total: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  summary += `${indent}  failed: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n\n`;
  
  // Checks
  summary += `${indent}Checks:\n`;
  summary += `${indent}  passed: ${data.metrics.checks.values.passes}\n`;
  summary += `${indent}  failed: ${data.metrics.checks.values.fails}\n`;
  summary += `${indent}  rate: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%\n\n`;
  
  return summary;
}
