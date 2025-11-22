# Allure Test Reports for Monis-Torias

Este directorio contiene la configuración y resultados de los reportes visuales de pruebas usando Allure Framework.

## ¿Qué es Allure?

Allure Framework es una herramienta open-source que genera reportes visuales interactivos de pruebas. Permite:
- Ver resultados de pruebas en un dashboard interactivo
- Analizar tendencias de pruebas a lo largo del tiempo
- Categorizar fallos por tipo de error
- Ver screenshots y logs adjuntos
- Generar gráficos de cobertura y distribución de pruebas

## Estructura de Directorios

```
allure/
├── README.md              # Este archivo
├── allure-results/        # Resultados crudos generados por los tests (JSON)
├── allure-report/         # Reporte HTML generado
└── history/               # Historial de ejecuciones para tendencias
```

## Instalación

### Opción 1: NPM Global (Recomendado)

```powershell
npm install -g allure-commandline
```

Verifica la instalación:
```powershell
allure --version
```

### Opción 2: Scoop (Windows)

```powershell
scoop install allure
```

### Opción 3: Homebrew (macOS/Linux)

```bash
brew install allure
```

## Configuración por Framework

### Backend (Jest)

Ya configurado en `functions/jest.config.js`:

```javascript
module.exports = {
  // ... otras configuraciones
  reporters: [
    'default',
    ['jest-allure', {
      resultsDir: '../allure/allure-results/backend',
      reportDir: '../allure/allure-report',
      overwrite: false,
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: true,
    }]
  ]
};
```

### Frontend (Vitest)

Ya configurado en `frontend/vite.config.ts`:

```typescript
export default defineConfig({
  test: {
    reporters: [
      'default',
      ['allure-vitest/reporter', {
        resultsDir: '../allure/allure-results/frontend',
        links: {
          issue: {
            urlTemplate: 'https://github.com/10santiago12/Proyecto-Monis-Torias-Arqui/issues/%s'
          }
        }
      }]
    ]
  }
});
```

### E2E (Cypress)

Ya configurado en `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress';
import { allureCypress } from 'allure-cypress/reporter';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      allureCypress(on, {
        resultsDir: './allure/allure-results/e2e',
      });
      return config;
    },
  },
});
```

En `cypress/support/e2e.ts`:

```typescript
import 'allure-cypress/commands';
```

## Uso

### 1. Ejecutar Tests y Generar Resultados

```powershell
# Backend
cd functions
npm run test:allure

# Frontend
cd frontend
npm run test:allure

# E2E (si aplicable)
cd ..
npm run test:e2e
```

Esto generará archivos JSON en `allure/allure-results/`.

### 2. Generar Reporte HTML

```powershell
# Desde la raíz del proyecto
allure generate allure/allure-results --clean -o allure/allure-report
```

Opciones:
- `--clean`: Limpia el directorio de salida antes de generar
- `-o`: Especifica directorio de salida

### 3. Abrir Reporte

```powershell
# Opción 1: Servir con Allure (recomendado)
allure open allure/allure-report

# Opción 2: Abrir HTML directamente
start allure/allure-report/index.html
```

### Scripts NPM Configurados

Agregados en `package.json` raíz:

```json
{
  "scripts": {
    "test:backend:allure": "cd functions && npm run test:unit",
    "test:frontend:allure": "cd frontend && npm run test",
    "test:all:allure": "npm run test:backend:allure && npm run test:frontend:allure",
    "allure:generate": "allure generate allure/allure-results --clean -o allure/allure-report",
    "allure:open": "allure open allure/allure-report",
    "allure:serve": "allure serve allure/allure-results",
    "allure:clean": "rimraf allure/allure-results/* allure/allure-report/*"
  }
}
```

Uso:

```powershell
# Ejecutar todos los tests y generar resultados
npm run test:all:allure

# Generar reporte HTML
npm run allure:generate

# Abrir reporte en navegador
npm run allure:open

# O generar y servir en un solo comando
npm run allure:serve
```

## Agregar Metadata a Tests

### Jest (Backend)

```javascript
import { allure } from 'jest-allure/dist/setup';

describe('SessionsService', () => {
  beforeEach(() => {
    allure.feature('Sessions Management');
    allure.story('Request Session');
  });

  test('should create a new session request', async () => {
    allure.description('This test verifies that a student can request a tutoring session');
    allure.severity('critical');
    allure.tag('sessions', 'students');
    
    // Test implementation
    const result = await sessionsService.requestSession(data);
    
    allure.attachment('Request Data', JSON.stringify(data, null, 2), 'application/json');
    expect(result).toBeDefined();
  });
});
```

### Vitest (Frontend)

```typescript
import { test, expect } from 'vitest';
import { allure } from 'allure-vitest/runtime';

test('Login component renders correctly', async () => {
  allure.feature('Authentication');
  allure.story('User Login');
  allure.severity('critical');
  allure.tag('auth', 'ui');
  allure.description('Verifies that the login form renders with all required fields');
  
  const { getByLabelText } = render(<Login />);
  
  expect(getByLabelText('Email')).toBeInTheDocument();
  expect(getByLabelText('Password')).toBeInTheDocument();
});
```

### Cypress (E2E)

```javascript
describe('Session Request Flow', () => {
  it('Student can request a tutoring session', () => {
    cy.allure()
      .feature('Sessions Management')
      .story('Request Session')
      .severity('critical')
      .tag('e2e', 'sessions');
    
    cy.visit('/request-session');
    cy.get('[data-testid="tutor-code"]').type('1234');
    cy.get('[data-testid="subject"]').select('Matemáticas');
    
    // Adjuntar screenshot
    cy.screenshot('request-session-form');
    
    cy.get('[data-testid="submit"]').click();
    cy.contains('Solicitud enviada').should('be.visible');
  });
});
```

## Categorías de Severidad

- `blocker`: Funcionalidad crítica que impide el uso de la aplicación
- `critical`: Funcionalidad principal del sistema
- `normal`: Funcionalidad importante pero no crítica
- `minor`: Funcionalidad secundaria
- `trivial`: Detalles estéticos o mejoras menores

## Integración con CI/CD

El reporte Allure se genera automáticamente en GitHub Actions. Ver `.github/workflows/ci.yml`:

```yaml
- name: Generate Allure Report
  if: always()
  run: |
    npm install -g allure-commandline
    npm run allure:generate

- name: Upload Allure Report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure/allure-report
    retention-days: 30
```

## Ver Reportes en GitHub Actions

1. Ve a la pestaña "Actions" en GitHub
2. Selecciona el workflow run
3. Baja hasta "Artifacts"
4. Descarga "allure-report.zip"
5. Extrae y abre `index.html` en tu navegador

## Historial de Tendencias

Allure puede mantener un historial de ejecuciones previas para mostrar tendencias:

```powershell
# Preservar historial antes de generar nuevo reporte
Copy-Item -Path allure/allure-report/history -Destination allure/allure-results/history -Recurse -Force

# Generar reporte (incluirá tendencias)
allure generate allure/allure-results --clean -o allure/allure-report
```

Esto te permitirá ver:
- Tendencia de tests passing/failing a lo largo del tiempo
- Duración promedio de tests
- Identificar tests flaky (intermitentes)

## Características Avanzadas

### 1. Steps (Pasos)

```javascript
test('Complex workflow', async () => {
  await allure.step('Step 1: Login', async () => {
    await login(user);
  });
  
  await allure.step('Step 2: Navigate to dashboard', async () => {
    await navigate('/dashboard');
  });
  
  await allure.step('Step 3: Verify data loaded', async () => {
    expect(data).toBeDefined();
  });
});
```

### 2. Attachments (Adjuntos)

```javascript
// Adjuntar JSON
allure.attachment('Response', JSON.stringify(response), 'application/json');

// Adjuntar texto
allure.attachment('Error Log', errorMessage, 'text/plain');

// Adjuntar imagen (screenshot)
allure.attachment('Screenshot', screenshotBuffer, 'image/png');
```

### 3. Links

```javascript
allure.link('https://github.com/.../issues/123', 'Related Issue');
allure.issue('123');  // Shortcut para GitHub issues
allure.tms('TEST-123');  // Test Management System link
```

### 4. Parameters

```javascript
allure.parameter('username', 'test@example.com');
allure.parameter('environment', 'staging');
```

## Troubleshooting

### Error: `allure: command not found`

**Solución**: Instala Allure globalmente con npm o package manager de tu OS.

```powershell
npm install -g allure-commandline
```

### Error: Reporte vacío o sin tests

**Causa**: Los tests no se ejecutaron correctamente o los reporters no están configurados.

**Solución**:
1. Verifica que los tests se ejecuten sin errores
2. Confirma que `allure-results/` tenga archivos JSON
3. Revisa la configuración de reporters en jest.config.js / vite.config.ts

### Error: Historia de tendencias no aparece

**Causa**: La carpeta `history/` no se preservó entre ejecuciones.

**Solución**: Copia `allure-report/history` a `allure-results/history` antes de generar un nuevo reporte.

## Referencias

- **Allure Documentation**: https://docs.qameta.io/allure/
- **Jest Allure**: https://www.npmjs.com/package/jest-allure
- **Allure Vitest**: https://www.npmjs.com/package/allure-vitest
- **Allure Cypress**: https://www.npmjs.com/package/allure-cypress
- **Allure Report Examples**: https://demo.qameta.io/allure/

## Roadmap

- [ ] Configurar histórico de tendencias en CI/CD
- [ ] Integrar con SonarQube para coverage combinado
- [ ] Añadir categorías personalizadas de errores
- [ ] Configurar notificaciones por email de reportes
- [ ] Publicar reportes en GitHub Pages automáticamente
