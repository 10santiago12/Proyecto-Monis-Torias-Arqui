# 🎨 GUÍA: CÓMO GENERAR IMÁGENES PNG DE LOS DIAGRAMAS

Como PlantUML requiere permisos de administrador para instalarse, aquí tienes **3 opciones simples** para generar las imágenes:

---

## ⭐ OPCIÓN 1: PlantUML Online (MÁS FÁCIL - RECOMENDADO)

### Para cada archivo .puml:

1. **Abre**: http://www.plantuml.com/plantuml/uml/
2. **Navega a**: `informe/diagramas-4+1/` o `informe/diagramas-c4/`
3. **Abre el archivo .puml** con Notepad o cualquier editor
4. **Selecciona TODO el contenido** (Ctrl+A) y **cópialo** (Ctrl+C)
5. **Pega en el editor** de PlantUML Online
6. **Espera** a que se genere la imagen (automático)
7. **Clic derecho** en la imagen → **"Guardar imagen como..."**
8. **Guarda con el nombre**: `nombre-del-archivo.png`

### Archivos a convertir:

#### 📐 Diagramas 4+1 (5 archivos):
- [ ] vista-logica.puml → vista-logica.png
- [ ] vista-procesos.puml → vista-procesos.png
- [ ] vista-desarrollo.puml → vista-desarrollo.png
- [ ] vista-fisica.puml → vista-fisica.png
- [ ] vista-escenarios.puml → vista-escenarios.png

#### 🏗️ Diagramas C4 (4 archivos):
- [ ] level-1-context.puml → level-1-context.png
- [ ] level-2-containers.puml → level-2-containers.png
- [ ] level-3-components.puml → level-3-components.png
- [ ] level-4-code-sessions.puml → level-4-code-sessions.png

**Tiempo estimado**: 2-3 minutos por diagrama = ~20-30 minutos total

---

## 🖥️ OPCIÓN 2: VS Code Extension

### Paso 1: Instalar extensión
1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca: **"PlantUML"** (by jebbs)
4. Clic en **Install**

### Paso 2: Instalar Graphviz (como administrador)
Abre PowerShell **como Administrador** y ejecuta:
```powershell
choco install graphviz -y
```

O descarga desde: https://graphviz.org/download/

### Paso 3: Generar imágenes
1. Abre cualquier archivo `.puml` en VS Code
2. Presiona **Alt+D** (Windows) o **Option+D** (Mac)
3. Se abre un preview del diagrama
4. Clic derecho en el preview → **"Export Current Diagram"**
5. Selecciona formato **PNG**
6. Guarda la imagen

**Ventaja**: Más rápido una vez instalado  
**Desventaja**: Requiere permisos de administrador

---

## 🔧 OPCIÓN 3: Instalar PlantUML CLI (Avanzado)

### Requisitos:
- Java JDK instalado
- PowerShell con permisos de administrador

### Instalación:

**Opción A: Con Chocolatey (Administrador)**
```powershell
# Abre PowerShell como Administrador
choco install plantuml graphviz -y
```

**Opción B: Manual**
1. Instala Java: https://www.java.com/download/
2. Descarga PlantUML: https://plantuml.com/download
3. Descarga Graphviz: https://graphviz.org/download/

### Uso:
```powershell
# Navegar a carpeta
cd "c:\Users\limao\Desktop\U SABANA\SEXTO SEMESTRE\ARQUITECTURA DE SOFTWARE\Proyecto-Monis-Torias-Arqui\informe"

# Generar todos los diagramas 4+1
cd diagramas-4+1
plantuml -tpng *.puml

# Generar todos los diagramas C4
cd ..\diagramas-c4
plantuml -tpng *.puml
```

**Ventaja**: Genera todas las imágenes de una vez  
**Desventaja**: Instalación más compleja

---

## 📋 SCRIPT AUTOMATIZADO (Una vez instalado PlantUML)

Si ya tienes PlantUML instalado, copia y pega esto en PowerShell:

```powershell
# Ir a carpeta informe
cd "c:\Users\limao\Desktop\U SABANA\SEXTO SEMESTRE\ARQUITECTURA DE SOFTWARE\Proyecto-Monis-Torias-Arqui\informe"

# Generar 4+1
Write-Host "Generando diagramas 4+1..." -ForegroundColor Cyan
cd diagramas-4+1
plantuml -tpng *.puml
Write-Host "✅ 5 imágenes generadas en diagramas-4+1/" -ForegroundColor Green

# Generar C4
Write-Host "`nGenerando diagramas C4..." -ForegroundColor Cyan
cd ..\diagramas-c4
plantuml -tpng *.puml
Write-Host "✅ 4 imágenes generadas en diagramas-c4/" -ForegroundColor Green

# Volver a carpeta informe
cd ..

Write-Host "`n🎉 TOTAL: 9 imágenes PNG generadas exitosamente" -ForegroundColor Green
```

---

## ✅ VERIFICACIÓN

Después de generar las imágenes, verifica que tienes:

### En `informe/diagramas-4+1/`:
- vista-logica.png
- vista-procesos.png
- vista-desarrollo.png
- vista-fisica.png
- vista-escenarios.png

### En `informe/diagramas-c4/`:
- level-1-context.png
- level-2-containers.png
- level-3-components.png
- level-4-code-sessions.png

**Total: 9 imágenes PNG** ✅

---

## 💡 RECOMENDACIÓN

**Para ti**: Usa **OPCIÓN 1 (PlantUML Online)**
- ✅ No requiere instalación
- ✅ No requiere permisos de administrador
- ✅ Funciona desde cualquier navegador
- ✅ Calidad profesional
- ⏱️ 20-30 minutos para los 9 diagramas

---

## 🆘 AYUDA RÁPIDA

### Si el diagrama no se genera:
1. Verifica que copiaste TODO el contenido (desde `@startuml` hasta `@enduml`)
2. Verifica que no haya errores de sintaxis
3. Intenta con otro navegador (Chrome, Firefox, Edge)

### Si la imagen se ve mal:
1. En PlantUML Online, espera a que termine de renderizar
2. Haz zoom out en el navegador (Ctrl + -) para ver el diagrama completo
3. Guarda la imagen en resolución original (no uses zoom)

### Si necesitas mejor calidad:
1. En PlantUML Online, cambia de PNG a SVG (vector, escalable)
2. Los SVG se pueden abrir en navegadores y editores gráficos
3. Se pueden convertir a PNG de alta resolución después

---

**¿Listo para empezar? Abre http://www.plantuml.com/plantuml/uml/ y sigue la OPCIÓN 1 👆**
