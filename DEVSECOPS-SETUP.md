# 🔐 Guía de Configuración de Seguridad DevSecOps

Esta guía te ayudará a configurar SonarQube, Dependency Scanning y Secrets Scanning en tu proyecto.

---

## 📋 **ARCHIVOS CREADOS**

✅ `sonar-project.properties` - Configuración de SonarQube
✅ `.gitleaks.toml` - Configuración de Gitleaks
✅ `.gitleaksignore` - Falsos positivos de Gitleaks
✅ `.github/workflows/ci.yml` - Pipeline actualizado con 3 nuevos jobs:
   - `sonarqube` - Análisis de código estático
   - `secrets-scan` - Escaneo de secretos con Gitleaks
   - `security-scan` - Escaneo de dependencias (npm audit)

---

## 🎯 **PASO 1: Configurar SonarQube Cloud**

### 1.1 Crear cuenta en SonarCloud

1. Ve a: https://sonarcloud.io
2. Haz clic en **"Sign up"** o **"Log in with GitHub"**
3. Autoriza SonarCloud para acceder a tu cuenta de GitHub
4. Selecciona tu organización: **10santiago12**

### 1.2 Importar el proyecto

1. En el dashboard de SonarCloud, haz clic en **"+"** → **"Analyze new project"**
2. Selecciona el repositorio: **Proyecto-Monis-Torias-Arqui**
3. Haz clic en **"Set Up"**
4. Selecciona **"With GitHub Actions"** como método de análisis

### 1.3 Generar token

1. Ve a **My Account** → **Security**
2. En "Generate Tokens", escribe:
   - **Name:** `GitHub Actions - Proyecto Monis Torias`
   - **Type:** `Global Analysis Token`
   - **Expires in:** `90 days` (o más si prefieres)
3. Haz clic en **"Generate"**
4. **COPIA EL TOKEN** (solo se muestra una vez)

### 1.4 Agregar token a GitHub Secrets

1. Ve a tu repositorio en GitHub: https://github.com/10santiago12/Proyecto-Monis-Torias-Arqui
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **"New repository secret"**
4. Agrega:
   - **Name:** `SONAR_TOKEN`
   - **Value:** (pega el token que copiaste)
5. Haz clic en **"Add secret"**

### 1.5 Verificar configuración

1. Ve a SonarCloud → Tu proyecto
2. Verifica que `sonar.projectKey` sea: **10santiago12_Proyecto-Monis-Torias-Arqui**
3. Verifica que `sonar.organization` sea: **10santiago12**

---

## 🔍 **PASO 2: Configurar Dependency Scanning**

### 2.1 Ya está configurado! ✅

El job `security-scan` en `.github/workflows/ci.yml` ejecuta automáticamente:

```yaml
- npm audit --audit-level=moderate  # Backend
- npm audit --audit-level=moderate  # Frontend
```

Esto escanea vulnerabilidades en tus dependencias de npm.

### 2.2 (Opcional) Configurar Snyk

Si quieres un análisis más avanzado:

1. Ve a: https://snyk.io/
2. Crea cuenta con GitHub
3. Conecta el repositorio **Proyecto-Monis-Torias-Arqui**
4. Genera un token en **Settings** → **API Token**
5. Agrégalo a GitHub Secrets como `SNYK_TOKEN`

Luego actualiza el workflow agregando:

```yaml
- name: Run Snyk Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

---

## 🕵️ **PASO 3: Configurar Secrets Scanning (Gitleaks)**

### 3.1 Ya está configurado! ✅

El job `secrets-scan` en `.github/workflows/ci.yml` ejecuta Gitleaks automáticamente.

### 3.2 (Opcional) Gitleaks License

Gitleaks funciona sin licencia para uso básico. Si quieres funciones premium:

1. Ve a: https://gitleaks.io/
2. Adquiere una licencia (si tu universidad tiene una, úsala)
3. Agrégala a GitHub Secrets como `GITLEAKS_LICENSE`

**Nota:** No es necesario para que funcione el escaneo básico.

### 3.3 Verificar Gitleaks localmente (Opcional)

Para probar en local antes de hacer push:

#### Windows (PowerShell):

```powershell
# Instalar Gitleaks con Chocolatey
choco install gitleaks

# Ejecutar scan
gitleaks detect --source . --verbose --config .gitleaks.toml
```

#### Linux/Mac:

```bash
# Instalar Gitleaks
brew install gitleaks  # Mac
# o
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz

# Ejecutar scan
./gitleaks detect --source . --verbose --config .gitleaks.toml
```

---

## 🚀 **PASO 4: Hacer Push y Verificar Pipeline**

### 4.1 Commit y Push

```bash
git add .
git commit -m "feat: Add DevSecOps - SonarQube, Dependency Scanning, Secrets Scanning"
git push origin main
```

### 4.2 Verificar en GitHub Actions

1. Ve a tu repositorio: https://github.com/10santiago12/Proyecto-Monis-Torias-Arqui
2. Ve a la pestaña **Actions**
3. Verifica que el workflow **"CI - Tests and Linting"** se está ejecutando
4. Espera a que termine (puede tardar 5-10 minutos)
5. Verifica que todos los jobs pasen:
   - ✅ backend-tests
   - ✅ frontend-tests
   - ✅ security-scan (npm audit)
   - ✅ sonarqube (análisis de código)
   - ✅ secrets-scan (Gitleaks)
   - ✅ build-status

### 4.3 Verificar resultados en SonarCloud

1. Ve a: https://sonarcloud.io/organizations/10santiago12/projects
2. Haz clic en tu proyecto: **Proyecto-Monis-Torias-Arqui**
3. Revisa:
   - **Code Smells:** Problemas de calidad de código
   - **Bugs:** Errores potenciales
   - **Vulnerabilities:** Vulnerabilidades de seguridad
   - **Security Hotspots:** Puntos calientes de seguridad
   - **Coverage:** Cobertura de tests (debería estar cerca de 98%)
   - **Duplications:** Código duplicado

---

## 📊 **PASO 5: Capturar Evidencias para el PDF**

### 5.1 GitHub Actions

Captura screenshots de:
- ✅ Pipeline ejecutándose (pestaña Actions)
- ✅ Todos los jobs pasando (verde)
- ✅ Logs del job `sonarqube`
- ✅ Logs del job `secrets-scan`
- ✅ Logs del job `security-scan`

### 5.2 SonarCloud Dashboard

Captura screenshots de:
- ✅ Overview del proyecto (métricas generales)
- ✅ Code Smells
- ✅ Bugs encontrados (si hay)
- ✅ Security Issues (si hay)
- ✅ Coverage report
- ✅ Quality Gate (Pass/Fail)

### 5.3 npm audit

Si hay vulnerabilidades, captura:
- ✅ Output de `npm audit` en terminal
- ✅ Tabla de vulnerabilidades
- ✅ Recomendaciones de fix

### 5.4 Gitleaks

Si encuentra secretos:
- ✅ Output de Gitleaks
- ✅ Secretos encontrados
- ✅ Archivos afectados
- ✅ Explicación de falsos positivos

---

## 🎯 **CHECKLIST DE COMPLETADO**

### SonarQube
- [ ] Cuenta creada en SonarCloud
- [ ] Proyecto importado
- [ ] Token generado y agregado a GitHub Secrets
- [ ] `sonar-project.properties` configurado
- [ ] Pipeline ejecutado exitosamente
- [ ] Dashboard de SonarCloud muestra resultados
- [ ] Screenshots capturados

### Dependency Scanning
- [ ] Job `security-scan` ejecutado
- [ ] `npm audit` corriendo en frontend y backend
- [ ] Vulnerabilidades documentadas (si hay)
- [ ] Screenshots capturados

### Secrets Scanning
- [ ] Gitleaks configurado en pipeline
- [ ] `.gitleaks.toml` creado
- [ ] `.gitleaksignore` configurado
- [ ] Job `secrets-scan` ejecutado
- [ ] Falsos positivos ignorados
- [ ] Screenshots capturados

---

## 🔧 **SOLUCIÓN DE PROBLEMAS**

### Problema: SonarQube falla con "Quality Gate"

**Solución:**
- Ve a SonarCloud → Tu proyecto → Quality Gate
- Ajusta los umbrales si son muy estrictos
- O mejora la cobertura de tests

### Problema: npm audit encuentra vulnerabilidades críticas

**Solución:**
```bash
cd functions  # o frontend
npm audit fix
npm audit fix --force  # Si npm audit fix no funciona
```

### Problema: Gitleaks encuentra secretos que no son reales

**Solución:**
- Agrega el patrón a `.gitleaksignore`
- O especifica la ruta del archivo en `.gitleaks.toml` en `allowlist`

### Problema: Pipeline falla porque falta SONAR_TOKEN

**Solución:**
- Verifica que agregaste el secret correctamente
- El nombre DEBE ser exactamente `SONAR_TOKEN`
- Regenera el token si es necesario

---

## 📚 **RECURSOS ADICIONALES**

- SonarQube Docs: https://docs.sonarqube.org/latest/
- SonarCloud: https://sonarcloud.io/
- Gitleaks: https://github.com/gitleaks/gitleaks
- npm audit: https://docs.npmjs.com/cli/v8/commands/npm-audit
- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## ✅ **SIGUIENTE PASO**

Una vez completados estos 3 pasos, continúa con:
- 📐 Diagramas C4 (niveles 1-2)
- 📄 README completo
- 📊 Documento PDF con evidencias

---

**¡Buena suerte! 🚀**
