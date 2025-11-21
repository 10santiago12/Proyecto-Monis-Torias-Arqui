import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const authErrorRate = new Rate('auth_errors');

export const options = {
  stages: [
    { duration: '5s', target: 3 },   // Ramp-up suave a 3 VUs
    { duration: '20s', target: 10 }, // Mantener 10 VUs
    { duration: '5s', target: 0 },   // Ramp-down a 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% de requests deben ser < 1s (auth puede ser más lento)
    http_req_failed: ['rate<0.1'],     // < 10% de requests pueden fallar
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:5001/proyecto-arqui-2c418/us-central1/api';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export default function () {
  // Escenario 1: Request sin autenticación (debe devolver 401)
  const noAuthRes = http.get(`${BASE_URL}/sessions`);
  check(noAuthRes, {
    'request without auth returns 401': (r) => r.status === 401,
    'error message is present': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.message !== undefined;
      } catch {
        return false;
      }
    },
  }) || authErrorRate.add(1);

  sleep(0.5);

  // Escenario 2: Request con token malformado
  const badAuthRes = http.get(`${BASE_URL}/sessions`, {
    headers: { 'Authorization': 'InvalidToken' },
  });
  check(badAuthRes, {
    'bad token returns 401': (r) => r.status === 401,
  }) || authErrorRate.add(1);

  sleep(0.5);

  // Escenario 3: Request con token válido (si está disponible)
  if (AUTH_TOKEN) {
    const validAuthRes = http.get(`${BASE_URL}/sessions`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
    });
    check(validAuthRes, {
      'valid token returns 200': (r) => r.status === 200,
      'response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    sleep(0.5);

    // Escenario 4: Request a endpoint protegido por rol
    const tutorsRes = http.get(`${BASE_URL}/tutors`, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
    });
    check(tutorsRes, {
      'tutors endpoint responds': (r) => [200, 403].includes(r.status),
      'response has proper structure': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'load-tests/results/auth-summary.json': JSON.stringify(data),
    stdout: generateTextSummary(data),
  };
}

function generateTextSummary(data) {
  let summary = '\n ═══════════════════════════════════════\n';
  summary += '  Authentication Load Test Results\n';
  summary += ' ═══════════════════════════════════════\n\n';
  
  // Duration metrics
  const duration = data.metrics.http_req_duration.values;
  summary += ' HTTP Request Duration:\n';
  summary += `   Average:  ${duration.avg.toFixed(2)} ms\n`;
  summary += `   Median:   ${duration.med.toFixed(2)} ms\n`;
  summary += `   p(95):    ${duration['p(95)'].toFixed(2)} ms\n`;
  summary += `   p(99):    ${duration['p(99)'].toFixed(2)} ms\n`;
  summary += `   Max:      ${duration.max.toFixed(2)} ms\n\n`;
  
  // Request metrics
  const requests = data.metrics.http_reqs.values;
  summary += ' HTTP Requests:\n';
  summary += `   Total:    ${requests.count}\n`;
  summary += `   Rate:     ${requests.rate.toFixed(2)}/s\n`;
  summary += `   Duration: ${(data.state.testRunDurationMs / 1000).toFixed(1)}s\n\n`;
  
  // Success rate
  const failedRate = data.metrics.http_req_failed.values.rate * 100;
  summary += ' Success Metrics:\n';
  summary += `   Success:  ${(100 - failedRate).toFixed(2)}%\n`;
  summary += `   Failed:   ${failedRate.toFixed(2)}%\n\n`;
  
  // Checks
  const checks = data.metrics.checks.values;
  summary += ' Validation Checks:\n';
  summary += `   Passed:   ${checks.passes}\n`;
  summary += `   Failed:   ${checks.fails}\n`;
  summary += `   Rate:     ${(checks.rate * 100).toFixed(2)}%\n\n`;
  
  summary += ' ═══════════════════════════════════════\n';
  
  return summary;
}
