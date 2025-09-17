# 🛠️ Documentación Técnica - Mi Productividad

## 🏗️ Arquitectura del Sistema

### Patrones de Diseño Implementados

#### 1. **Module Pattern**
```javascript
// Cada archivo JS encapsula su funcionalidad
const TaskManager = {
  // Funciones privadas y públicas
  createTask: function() { ... },
  updateTask: function() { ... }
};
```

#### 2. **Observer Pattern**
```javascript
// Las estadísticas se actualizan automáticamente cuando cambian los datos
function updateUI() {
  renderTasks();
  updateStatistics();
  saveData();
}
```

#### 3. **Strategy Pattern**
```javascript
// Diferentes estrategias para manejar frecuencias
const FrequencyHandlers = {
  'Diario': () => true,
  'Lun,Mié,Vie': (today) => ['Lun','Mié','Vie'].includes(today)
};
```

### Flujo de Datos

```
Usuario Interact → Event Handler → Data Update → UI Render → localStorage Save
     ↑                                                              ↓
     └─────────────────── App Init ← Data Load ←──────────────────────┘
```

## 🔧 Funciones Principales

### Gestión de Estado

#### `saveData(appData)`
```javascript
function saveData(appData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
        console.error('Error saving data:', error);
        // Fallback: mostrar warning al usuario
    }
}
```

#### `loadData()`
```javascript
function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : getDefaultData();
    } catch (error) {
        console.error('Error loading data:', error);
        return getDefaultData();
    }
}
```

### Lógica de Frecuencias

#### `isTaskAvailableToday(task)`
```javascript
function isTaskAvailableToday(task) {
    if (task.frequency === 'Diario') return true;
    
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'short' });
    const dayMap = {
        'lun': 'Lun', 'mar': 'Mar', 'mié': 'Mié',
        'jue': 'Jue', 'vie': 'Vie', 'sáb': 'Sáb', 'dom': 'Dom'
    };
    
    const todayMapped = dayMap[today.toLowerCase()];
    return task.frequency.split(',').map(d => d.trim()).includes(todayMapped);
}
```

### Cálculo de Rachas

#### `calculateStreak(task)`
```javascript
function calculateStreak(task) {
    if (!task.history || task.history.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        if (task.history.includes(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}
```

## 🎨 Sistema de Estilos

### CSS Custom Properties (Variables)

#### Tema Claro
```css
:root {
    --bg-primary: #faf9f7;
    --bg-secondary: #ffffff;
    --text-primary: #2d1b36;
    --accent-primary: #7c3aed;
    --accent-gold: #f59e0b;
    --accent-emerald: #10b981;
}
```

#### Tema Oscuro
```css
[data-theme="dark"] {
    --bg-primary: #1a0f1f;
    --bg-secondary: #2d1b36;
    --text-primary: #f7f4f1;
    --accent-primary: #8b5cf6;
    --accent-gold: #fbbf24;
    --accent-emerald: #34d399;
}
```

### Jerarquía de Botones

```css
/* Tema: 2.5rem */
.theme-controls .action-btn {
    height: 2.5rem;
    width: 2.5rem;
}

/* Subtema: 2.25rem */
.subtheme-controls .action-btn {
    height: 2.25rem;
    width: 2.25rem;
}

/* Tarea/Subtarea: 2rem */
.task-controls .action-btn,
.subtask-controls .action-btn {
    height: 2rem;
    width: 2rem;
}
```

### Sistema de Alineación

```css
/* Contenido a la izquierda, controles a la derecha */
.task-main {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.task-controls {
    margin-left: auto; /* Empuja hacia la derecha */
}

.task-label {
    display: flex;
    align-items: center;
    gap: 0.75rem; /* Mantiene frecuencias juntas al texto */
}
```

## 🖥️ Integración con Electron

### Configuración Principal

#### `electron-main.js`
```javascript
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,    // Seguridad
            contextIsolation: true,    // Aislamiento
            webSecurity: true          // Políticas web
        },
        title: 'Mi Productividad - TodoList'
    });
}
```

### Menús Nativos

#### Estructura del Menú
```javascript
const template = [
    {
        label: 'Archivo',
        submenu: [
            {
                label: 'Nueva Tarea',
                accelerator: 'CmdOrCtrl+N',
                click: () => executeInRenderer('showAddTaskModal()')
            }
        ]
    },
    {
        label: 'Ver',
        submenu: [
            {
                label: 'Alternar Modo Oscuro',
                accelerator: 'CmdOrCtrl+D',
                click: () => executeInRenderer('toggleNightMode()')
            }
        ]
    }
];
```

### Comunicación Renderer ↔ Main

```javascript
// Ejecutar función en el renderer desde el main process
function executeInRenderer(code) {
    if (mainWindow) {
        mainWindow.webContents.executeJavaScript(code);
    }
}
```

## 📱 Responsividad

### Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
    .theme-header,
    .subtheme-header,
    .task-main {
        padding: 1rem;
    }
    
    .modal-content {
        margin: 1rem;
        width: calc(100% - 2rem);
    }
}

/* Mobile */
@media (max-width: 480px) {
    .action-btn {
        height: 1.75rem;
        width: 1.75rem;
    }
    
    .frequency-tag,
    .streak-counter {
        font-size: 0.65rem;
        padding: 0.2rem 0.5rem;
    }
}
```

## 🔐 Seguridad y Buenas Prácticas

### Sanitización de Datos

```javascript
function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>\"']/g, '') // Prevenir XSS básico
        .substring(0, 100);       // Limitar longitud
}
```

### Validación de Entrada

```javascript
function validateTask(task) {
    if (!task.name || task.name.trim().length === 0) {
        throw new Error('El nombre de la tarea es requerido');
    }
    
    if (!VALID_FREQUENCIES.includes(task.frequency)) {
        throw new Error('Frecuencia inválida');
    }
    
    return true;
}
```

### Manejo de Errores

```javascript
function safeExecute(fn, fallback = null) {
    try {
        return fn();
    } catch (error) {
        console.error('Error en operación:', error);
        return fallback;
    }
}
```

## 📊 Performance

### Optimizaciones Implementadas

#### 1. **Event Delegation**
```javascript
// Un solo listener para todos los botones
document.addEventListener('click', (e) => {
    if (e.target.closest('.edit-task-btn')) {
        handleEditTask(e);
    } else if (e.target.closest('.delete-task-btn')) {
        handleDeleteTask(e);
    }
});
```

#### 2. **Lazy Loading de Stats**
```javascript
// Solo calcular estadísticas cuando son visibles
function updateStatistics() {
    if (document.querySelector('#stats-content').offsetParent) {
        renderStatistics(calculateStats());
    }
}
```

#### 3. **Debounced Save**
```javascript
let saveTimeout;
function debouncedSave(data) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveData(data), 300);
}
```

## 🧪 Testing

### Funciones de Test Manual

#### Verificar Frecuencias
```javascript
// En DevTools Console
function testFrequencies() {
    const testCases = [
        { freq: 'Diario', expected: true },
        { freq: 'Lun', expected: new Date().getDay() === 1 },
        { freq: 'Lun,Mié,Vie', expected: [1,3,5].includes(new Date().getDay()) }
    ];
    
    testCases.forEach(test => {
        console.log(`${test.freq}: ${test.expected}`);
    });
}
```

#### Verificar Persistencia
```javascript
// Guardar datos de prueba
function testPersistence() {
    const testData = { themes: [{ id: 'test', name: 'Test Theme' }] };
    saveData(testData);
    
    const loaded = loadData();
    console.log('Persistencia OK:', JSON.stringify(loaded) === JSON.stringify(testData));
}
```

## 🚀 Build y Deployment

### Scripts Disponibles

```json
{
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "dist": "electron-builder --publish=never"
  }
}
```

### Configuración de Build

```json
{
  "build": {
    "appId": "com.tecnomata.miproductividad",
    "productName": "Mi Productividad",
    "win": {
      "target": "portable",
      "sign": false
    },
    "nsis": {
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

---

## 📚 Referencias y Recursos

- [Electron Documentation](https://www.electronjs.org/docs)
- [CSS Custom Properties](https://developer.mozilla.org/docs/Web/CSS/--*)
- [localStorage API](https://developer.mozilla.org/docs/Web/API/Window/localStorage)
- [SVG Icons](https://feathericons.com/)

---

**Documentación técnica completa para desarrolladores**