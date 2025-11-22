# OWASP ZAP DAST Scanning for Monis-Torias

Este directorio contiene la configuración para realizar escaneos de seguridad dinámica (DAST) usando OWASP ZAP.

## ¿Qué es OWASP ZAP?

OWASP ZAP (Zed Attack Proxy) es una herramienta de seguridad open-source que encuentra vulnerabilidades en aplicaciones web durante la ejecución. A diferencia de SAST (análisis estático), DAST analiza la aplicación en tiempo real, simulando ataques.

## Tipos de Escaneos

### 1. Baseline Scan
- Escaneo rápido (2-5 minutos)
- Ideal para CI/CD
- Detecta vulnerabilidades comunes (XSS, SQLi, etc.)

### 2. Full Scan
- Escaneo completo (30-60 minutos)
- Más exhaustivo
- Incluye spider completo y active scanning

## Uso

### Opción 1: Script PowerShell (Local)

```powershell
# Escaneo baseline
.\scripts\zap-scan.ps1 -ScanType baseline -TargetUrl http://localhost:5173

# Escaneo completo
.\scripts\zap-scan.ps1 -ScanType full -TargetUrl http://localhost:5173
```

### Opción 2: Docker (Recomendado)

```bash
# Escaneo baseline
docker run --rm -v $(pwd)/security:/zap/wrk/ \
  softwaresecurityproject/zap-stable \
  zap-baseline.py \
  -t http://host.docker.internal:5173 \
  -r zap-report.html \
  -J zap-report.json

# Escaneo completo
docker run --rm -v $(pwd)/security:/zap/wrk/ \
  softwaresecurityproject/zap-stable \
  zap-full-scan.py \
  -t http://host.docker.internal:5173 \
  -r zap-full-report.html \
  -J zap-full-report.json
```

### Opción 3: GitHub Actions (CI/CD)

El escaneo ZAP se ejecuta automáticamente en cada push a `main` o `develop`. Ver `.github/workflows/ci.yml`.

## Requisitos Previos

1. **Aplicación desplegada y accesible**:
   ```bash
   # Terminal 1: Backend
   cd functions
   npm run serve
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Docker instalado** (para opción Docker)

3. **PowerShell 7+** (para opción script)

## Interpretación de Resultados

### Niveles de Alerta

- **High (Rojo)**: Vulnerabilidades críticas que deben corregirse inmediatamente
- **Medium (Naranja)**: Vulnerabilidades moderadas que requieren atención
- **Low (Amarillo)**: Riesgos bajos o mejores prácticas
- **Informational (Azul)**: Información general, no requiere acción

### Reportes Generados

1. **HTML Report**: `security/zap-report.html`
   - Informe legible con detalles de cada vulnerabilidad
   - Incluye recomendaciones de remediación

2. **JSON Report**: `security/zap-report.json`
   - Formato estructurado para integración con otras herramientas
   - Útil para tracking histórico

3. **XML Report**: `security/zap-report.xml` (opcional)
   - Compatible con SonarQube y otras herramientas

## Vulnerabilidades Comunes Detectadas

### 1. Cross-Site Scripting (XSS)
**Descripción**: Inyección de scripts maliciosos en páginas web

**Remediación**:
- Sanitizar inputs del usuario
- Usar Content Security Policy (CSP) headers
- Escapar outputs en el HTML

### 2. SQL Injection
**Descripción**: Inyección de SQL en queries no sanitizadas

**Remediación**:
- Usar prepared statements
- Validar y sanitizar inputs
- Usar ORMs (Firestore no es vulnerable a SQLi)

### 3. Missing Security Headers
**Descripción**: Headers de seguridad no configurados

**Remediación**:
```json
// firebase.json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'"
    }
  ]
}
```

### 4. Cookie Security Issues
**Descripción**: Cookies sin flags Secure, HttpOnly, SameSite

**Remediación**:
```javascript
// Backend: Configurar cookies seguras
res.cookie('token', value, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### 5. CORS Misconfiguration
**Descripción**: CORS configurado para aceptar cualquier origen

**Remediación**:
```javascript
// functions/src/index.js
const cors = require('cors')({
  origin: ['https://proyecto-arqui-2c418.web.app'],
  credentials: true
});
```

## Configuración Avanzada

### Excluir URLs del Escaneo

Crea `security/zap-config.conf`:

```
# Excluir endpoints de logout y admin
-exclude "http://localhost:5173/logout"
-exclude "http://localhost:5173/admin/*"

# Excluir archivos estáticos
-exclude ".*\.(css|js|png|jpg|gif)$"
```

Usa la configuración:

```bash
docker run --rm \
  -v $(pwd)/security:/zap/wrk/ \
  softwaresecurityproject/zap-stable \
  zap-baseline.py \
  -t http://host.docker.internal:5173 \
  -c zap-config.conf \
  -r zap-report.html
```

### Autenticación para Escaneos

Si necesitas escanear endpoints protegidos:

```bash
# Crear contexto de autenticación
docker run --rm \
  -v $(pwd)/security:/zap/wrk/ \
  softwaresecurityproject/zap-stable \
  zap-baseline.py \
  -t http://host.docker.internal:5173 \
  -U admin \  # Usuario
  -z "-config api.addrs.addr.name=* -config api.addrs.addr.regex=true"
```

## Integración con SonarQube

Los reportes XML de ZAP pueden importarse a SonarQube:

```bash
# Generar reporte XML
docker run --rm \
  -v $(pwd)/security:/zap/wrk/ \
  softwaresecurityproject/zap-stable \
  zap-baseline.py \
  -t http://host.docker.internal:5173 \
  -x zap-report.xml

# Importar en SonarQube (en sonar-project.properties)
sonar.zaproxy.reportPath=security/zap-report.xml
```

## Frecuencia Recomendada

- **Baseline Scan**: En cada merge a main (CI/CD)
- **Full Scan**: Semanalmente o antes de releases
- **Manual Scan**: Después de cambios significativos en seguridad

## Troubleshooting

### Error: Cannot connect to target

**Causa**: La aplicación no está corriendo o no es accesible desde Docker

**Solución**:
```bash
# En Windows/Mac con Docker Desktop, usa host.docker.internal
-t http://host.docker.internal:5173

# En Linux, usa la IP del host
-t http://172.17.0.1:5173
```

### Error: Too many alerts

**Causa**: Escaneo muy exhaustivo generando alertas duplicadas

**Solución**:
```bash
# Reducir nivel de alerta
zap-baseline.py -t <URL> -l PASS  # Solo High/Medium
```

### Error: Timeout

**Causa**: La aplicación responde lentamente

**Solución**:
```bash
# Aumentar timeout (en segundos)
zap-baseline.py -t <URL> -T 300
```

## Referencias

- **OWASP ZAP Documentation**: https://www.zaproxy.org/docs/
- **ZAP Docker**: https://www.zaproxy.org/docs/docker/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **DAST vs SAST**: https://owasp.org/www-community/Source_Code_Analysis_Tools

## Roadmap

- [ ] Integrar ZAP con SonarQube
- [ ] Configurar escaneos programados (cron jobs)
- [ ] Añadir autenticación automática para escaneos de endpoints protegidos
- [ ] Crear baseline de alertas aceptables
- [ ] Implementar Quality Gate basado en resultados de ZAP
