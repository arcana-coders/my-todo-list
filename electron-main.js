const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true
        },
        titleBarStyle: 'default',
        show: false, // No mostrar hasta que esté listo
        autoHideMenuBar: false, // Mostrar menú por defecto
        title: 'Mi Productividad - TodoList'
    });

    // Cargar el archivo HTML
    mainWindow.loadFile('index.html');

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Centrar la ventana
        mainWindow.center();
    });

    // Abrir DevTools en desarrollo (comentar en producción)
    // mainWindow.webContents.openDevTools();

    // Manejar enlaces externos
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Recordar el tamaño y posición de la ventana
    mainWindow.on('resize', () => {
        // Aquí podrías guardar el tamaño si quieres
    });
}

// Este método se ejecutará cuando Electron haya terminado de inicializarse
app.whenReady().then(createWindow);

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Menú mejorado
const template = [
    {
        label: 'Archivo',
        submenu: [
            {
                label: 'Nueva Tarea',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    if (mainWindow) {
                        mainWindow.webContents.executeJavaScript(`
                            if (typeof showAddTaskModal !== 'undefined') {
                                showAddTaskModal();
                            }
                        `);
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Recargar',
                accelerator: 'CmdOrCtrl+R',
                click: () => {
                    if (mainWindow) {
                        mainWindow.reload();
                    }
                }
            },
            {
                label: 'Forzar Recarga',
                accelerator: 'CmdOrCtrl+Shift+R',
                click: () => {
                    if (mainWindow) {
                        mainWindow.webContents.reloadIgnoringCache();
                    }
                }
            },
            { type: 'separator' },
            {
                label: 'Salir',
                accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            { role: 'undo', label: 'Deshacer' },
            { role: 'redo', label: 'Rehacer' },
            { type: 'separator' },
            { role: 'cut', label: 'Cortar' },
            { role: 'copy', label: 'Copiar' },
            { role: 'paste', label: 'Pegar' },
            { role: 'selectall', label: 'Seleccionar Todo' }
        ]
    },
    {
        label: 'Ver',
        submenu: [
            {
                label: 'Alternar Modo Oscuro',
                accelerator: 'CmdOrCtrl+D',
                click: () => {
                    if (mainWindow) {
                        mainWindow.webContents.executeJavaScript(`
                            if (typeof toggleNightMode !== 'undefined') {
                                toggleNightMode();
                            }
                        `);
                    }
                }
            },
            { type: 'separator' },
            { role: 'reload', label: 'Recargar' },
            { role: 'forceReload', label: 'Forzar Recarga' },
            { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
            { type: 'separator' },
            { role: 'resetZoom', label: 'Zoom Normal' },
            { role: 'zoomIn', label: 'Acercar' },
            { role: 'zoomOut', label: 'Alejar' },
            { type: 'separator' },
            {
                label: 'Pantalla Completa',
                accelerator: 'F11',
                click: () => {
                    if (mainWindow) {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                }
            }
        ]
    },
    {
        label: 'Ventana',
        submenu: [
            { role: 'minimize', label: 'Minimizar' },
            { role: 'close', label: 'Cerrar' },
            { type: 'separator' },
            {
                label: 'Siempre Visible',
                type: 'checkbox',
                click: (menuItem) => {
                    if (mainWindow) {
                        mainWindow.setAlwaysOnTop(menuItem.checked);
                    }
                }
            }
        ]
    },
    {
        label: 'Ayuda',
        submenu: [
            {
                label: 'Acerca de Mi Productividad',
                click: () => {
                    if (mainWindow) {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Acerca de Mi Productividad',
                            message: 'Mi Productividad',
                            detail: 'Tu aplicación personal de gestión de tareas diarias.\\n\\nVersión 1.0.0\\nHecho con ♥ para la claridad.',
                            buttons: ['OK']
                        });
                    }
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);