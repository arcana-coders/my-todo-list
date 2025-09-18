// Helper function para obtener fecha local en formato YYYY-MM-DD
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const STORAGE_KEY = 'miProductividadData';

function generateId(prefix) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getInitialData() {
    return {
        version: '2.0', // Major version bump for correct structure
        userPreferences: {
            darkMode: false,
        },
        themes: [
            {
                id: 'theme-1',
                name: 'Ejercicio',
                tasks: [
                    {
                        id: 'task-1',
                        name: 'Ir al gym',
                        frequency: { type: 'daily' },
                        history: [],
                        subtasks: [],
                    },
                ],
                subthemes: []
            },
            {
                id: 'theme-2',
                name: 'Sopladores',
                tasks: [
                    {
                        id: 'task-2',
                        name: 'Publicar en LinkedIn',
                        frequency: { type: 'workweek' }, // Lunes a Viernes
                        history: [],
                        subtasks: [],
                    },
                ],
                subthemes: []
            },
            {
                id: 'theme-3',
                name: 'Tecnomata',
                tasks: [],
                subthemes: [
                    {
                        id: 'subtheme-1',
                        name: 'Carne y pisto',
                        tasks: [
                            {
                                id: 'task-3',
                                name: 'Sitio web',
                                frequency: { type: 'weekly', day: 3 }, // Miércoles
                                history: [],
                                subtasks: [
                                    {
                                        id: 'subtask-1',
                                        name: 'Diseño',
                                        completedOn: null,
                                    },
                                    {
                                        id: 'subtask-2',
                                        name: 'Artículo de blog',
                                        completedOn: null,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        lastOpened: getLocalDateString(),
    };
}

function loadData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
        const initialData = getInitialData();
        saveData(initialData);
        return initialData;
    }

    let data;
    try {
        data = JSON.parse(storedData);
    } catch (error) {
        console.error('Error parsing localStorage data:', error);
        const initialData = getInitialData();
        saveData(initialData);
        return initialData;
    }

    if (!data.version || data.version < '2.0') {
        console.log('Migrating data from old version...');
        data = migrateDataToV2_0(data);
        saveData(data);
    }

    // Garantizar IDs únicos para evitar colisiones heredadas
    data = ensureUniqueIds(data);
    saveData(data);
    return data;
}

function migrateDataToV2_0(oldData) {
    // Construir estructura nueva sin sembrar datos por defecto para evitar duplicados
    const newData = {
        version: '2.0',
        userPreferences: { darkMode: false },
        themes: [],
        lastOpened: getLocalDateString(),
    };
    
    // If there's old data, try to preserve some of it
    if (oldData.data && Array.isArray(oldData.data)) {
        oldData.data.forEach(oldTheme => {
            const newTheme = {
                id: oldTheme.id || generateId('theme'),
                name: oldTheme.name || 'Tema sin nombre',
                tasks: oldTheme.tasks || [],
                subthemes: oldTheme.subthemes || []
            };
            newData.themes.push(newTheme);
        });
    }

    // Preserve user preferences and lastOpened date
    newData.userPreferences = oldData.userPreferences || newData.userPreferences;
    newData.lastOpened = oldData.lastOpened || newData.lastOpened;
    newData.version = '2.0';

    console.log('Migration to v2.0 complete.');
    return newData;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function ensureUniqueIds(data) {
    const used = new Set();

    const unique = (id, prefix) => {
        let newId = id && !used.has(id) ? id : generateId(prefix);
        while (used.has(newId)) newId = generateId(prefix);
        used.add(newId);
        return newId;
    };

    data.themes = (data.themes || []).map(theme => {
        const t = { ...theme };
        t.id = unique(t.id, 'theme');
        t.tasks = (t.tasks || []).map(task => {
            const nt = { ...task };
            nt.id = unique(nt.id, 'task');
            nt.subtasks = (nt.subtasks || []).map(st => ({ ...st, id: unique(st.id, 'subtask') }));
            return nt;
        });
        t.subthemes = (t.subthemes || []).map(st => {
            const ns = { ...st };
            ns.id = unique(ns.id, 'subtheme');
            ns.tasks = (ns.tasks || []).map(task => {
                const nt = { ...task };
                nt.id = unique(nt.id, 'task');
                nt.subtasks = (nt.subtasks || []).map(sst => ({ ...sst, id: unique(sst.id, 'subtask') }));
                return nt;
            });
            return ns;
        });
        return t;
    });

    return data;
}
