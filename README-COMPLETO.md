# 📋 Mi Productividad - Aplicación de Gestión de Tareas

Una aplicación de escritorio elegante y minimalista para la gestión de tareas diarias, construida con Electron y JavaScript vanilla.

![Mi Productividad](https://img.shields.io/badge/Version-1.0.0-purple?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-27.0.0-violet?style=for-the-badge)
![License](https://img.shields.io/badge/License-Personal-gold?style=for-the-badge)

## ✨ Características Principales

### 🎯 Organización Jerárquica
- **Temas** → **Subtemas** → **Tareas** → **Subtareas**
- Estructura de 4 niveles para máxima organización
- Colapso/expansión de secciones para mejor navegación

### 📅 Gestión Inteligente de Frecuencias
- **Diario**: Tareas que se realizan todos los días
- **Días específicos**: Lun, Mar, Mié, Jue, Vie, Sáb, Dom
- **Combinaciones**: Ej. "Lun, Mié, Vie" para rutinas alternas
- **Visualización automática**: Solo muestra tareas disponibles hoy

### 🔥 Sistema de Rachas
- Contador automático de días consecutivos completados
- Indicador visual con emoji de fuego
- Motivación para mantener hábitos consistentes

### 🌙 Modo Oscuro
- Interfaz adaptable con paleta elegante
- Cambio instantáneo día/noche
- Colores optimizados para reducir fatiga visual

### 📊 Estadísticas Detalladas
- Total de tareas completadas hoy
- Porcentaje de finalización diaria
- Racha actual más larga
- Resumen de productividad

## 🎨 Diseño Elegante

### Paleta de Colores Única
- **Violeta profundo** (`#7c3aed`) como color primario
- **Dorado elegante** (`#f59e0b`) para elementos especiales
- **Verde esmeralda** (`#059669`) como acento secundario
- **Fondos cálidos** en tonos crema y beige

### Interfaz Intuitiva
- Botones jerárquicos con tamaños progresivos
- Iconos SVG escalables y nítidos
- Animaciones suaves y transiciones elegantes
- Alineación perfecta de controles

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 16+ instalado
- Windows 10/11
- PowerShell (incluido en Windows)

### Instalación
1. **Clona o descarga** el proyecto en `d:\tecnomata-apps\todolist2`
2. **Instala dependencias**:
   ```bash
   npm install
   ```
3. **Crea el acceso directo**:
   ```bash
   powershell -ExecutionPolicy Bypass -File .\crear-acceso-directo.ps1
   ```

### Formas de Ejecutar

#### 🖱️ **Opción 1: Acceso Directo (Recomendado)**
- Doble clic en "Mi Productividad" en el escritorio
- Se abre directamente como aplicación nativa

#### ⚡ **Opción 2: Archivo BAT**
- Navega a `d:\tecnomata-apps\todolist2`
- Doble clic en `Mi-Productividad.bat`

#### 🛠️ **Opción 3: Desarrollo**
- En VS Code o terminal:
  ```bash
  npm start
  ```

## 📖 Guía de Uso

### Creación de Estructura

1. **Crear Tema Principal**
   - Clic en "➕ Agregar Nuevo Tema"
   - Ej: "Trabajo", "Personal", "Salud"

2. **Agregar Subtemas** (Opcional)
   - Clic en ➕ dentro de un tema
   - Ej: "Proyectos", "Reuniones", "Desarrollo"

3. **Crear Tareas**
   - Clic en ➕ en tema o subtema
   - Define nombre y frecuencia
   - Ej: "Ejercicio" → Frecuencia: "Diario"

4. **Agregar Subtareas** (Opcional)
   - Clic en ➕ dentro de una tarea
   - Para dividir tareas grandes en pasos

### Gestión Diaria

#### ✅ **Marcar como Completado**
- Clic en checkbox junto a la tarea
- Se actualiza automáticamente la racha
- Se registra en el historial del día

#### ✏️ **Editar Tareas**
- Clic en icono de lápiz (violeta)
- Modifica nombre, frecuencia o descripción
- Los cambios se guardan automáticamente

#### 🗑️ **Eliminar Elementos**
- Clic en icono de papelera (rojo)
- Elimina el elemento y todos sus hijos
- Acción irreversible

#### 📊 **Ver Estadísticas**
- Panel lateral derecho con métricas del día
- Actualización automática en tiempo real

### Configuración de Frecuencias

| Frecuencia | Descripción | Ejemplo de Uso |
|------------|-------------|----------------|
| `Diario` | Todos los días | Meditar, Ejercicio |
| `Lun` | Solo lunes | Reunión de equipo |
| `Lun,Mié,Vie` | Días específicos | Gimnasio |
| `Sáb,Dom` | Fines de semana | Limpieza profunda |

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + N` | Nueva tarea |
| `Ctrl + D` | Alternar modo oscuro |
| `Ctrl + R` | Recargar aplicación |
| `F11` | Pantalla completa |
| `Ctrl + Q` | Salir |

## 🔧 Arquitectura Técnica

### Estructura de Archivos
```
todolist2/
├── index.html          # Interfaz principal
├── style.css           # Estilos con CSS custom properties
├── app.js              # Lógica principal y gestión de estado
├── ui.js               # Generación de elementos DOM
├── storage.js          # Persistencia en localStorage
├── stats.js            # Cálculo de estadísticas
├── electron-main.js    # Configuración de Electron
├── package.json        # Dependencias y scripts
└── Mi-Productividad.bat # Launcher para Windows
```

### Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Desktop**: Electron 27.0.0
- **Persistencia**: localStorage (sin base de datos externa)
- **Iconos**: SVG inline para máxima calidad
- **Estilos**: CSS custom properties para temas

### Gestión de Datos

#### Estructura de Datos
```javascript
{
  themes: [
    {
      id: "uuid",
      name: "Tema",
      tasks: [...],
      subthemes: [
        {
          id: "uuid", 
          name: "Subtema",
          tasks: [
            {
              id: "uuid",
              name: "Tarea",
              frequency: "Diario",
              history: ["2025-09-17", ...],
              subtasks: [...]
            }
          ]
        }
      ]
    }
  ],
  uiState: {
    expandedThemes: [],
    expandedSubthemes: [],
    expandedTasks: []
  }
}
```

#### Algoritmo de Frecuencias
```javascript
function isTaskAvailableToday(task) {
  const today = new Date().toLocaleDateString('es-ES', {weekday: 'short'});
  const dayMap = {
    'lun': 'Lun', 'mar': 'Mar', 'mié': 'Mié',
    'jue': 'Jue', 'vie': 'Vie', 'sáb': 'Sáb', 'dom': 'Dom'
  };
  
  if (task.frequency === 'Diario') return true;
  return task.frequency.includes(dayMap[today]);
}
```

## 🛡️ Características de Seguridad

- **Sin conexión a internet requerida**
- **Datos almacenados localmente** en tu computadora
- **Sin recolección de telemetría**
- **Código fuente completamente accesible**
- **Sin dependencias externas** en tiempo de ejecución

## 🔄 Respaldo y Migración

### Exportar Datos
Los datos se almacenan en:
```
localStorage['mi-productividad-data']
```

### Respaldo Manual
1. Abre DevTools (F12)
2. Consola → `localStorage.getItem('mi-productividad-data')`
3. Copia el JSON resultante

### Restaurar Datos
1. Abre DevTools (F12)
2. Consola → `localStorage.setItem('mi-productividad-data', 'TU_JSON_AQUI')`
3. Recarga la aplicación

## 🐛 Solución de Problemas

### La aplicación no inicia
```bash
# Reinstalar dependencias
npm install
npm start
```

### Datos perdidos
- Los datos se guardan automáticamente en localStorage
- Si se pierden, verifica que no hayas limpiado la caché del navegador/Electron

### Problemas de permisos
```bash
# Ejecutar como administrador
# Click derecho en Mi-Productividad.bat → "Ejecutar como administrador"
```

### Pantalla en blanco
```bash
# Limpiar caché y reiniciar
Ctrl + Shift + R
```

## 📈 Roadmap Futuro

- [ ] Exportación a PDF de reportes
- [ ] Sincronización en la nube opcional
- [ ] Temas de colores personalizables
- [ ] Recordatorios y notificaciones
- [ ] Métricas avanzadas y gráficos
- [ ] Importación desde otras apps

## 🤝 Contribuciones

Este es un proyecto personal, pero las sugerencias y mejoras son bienvenidas:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature
3. **Commit** tus cambios
4. **Push** a la rama
5. **Abre** un Pull Request

## 📄 Licencia

Proyecto personal de uso libre. Puedes modificar y adaptar según tus necesidades.

---

## 🎯 Filosofía del Proyecto

> "La productividad no se trata de hacer más cosas, sino de hacer las cosas correctas de manera consistente."

Esta aplicación está diseñada bajo los principios de:
- **Simplicidad**: Interfaz limpia sin distracciones
- **Consistencia**: Fomenta hábitos diarios sostenibles  
- **Elegancia**: Diseño que inspira y motiva
- **Privacidad**: Tus datos permanecen en tu control
- **Eficiencia**: Acceso rápido y flujo de trabajo optimizado

---

**¡Hecho con ♥ por [Tecnómata](https://tecnomata.com)!**