document.addEventListener('DOMContentLoaded', () => {
    let appData = loadData();
    // Ensure UI state container to preserve expand/collapse between renders
    if (!appData.uiState) {
        appData.uiState = {
            expandedThemes: [],
            expandedSubthemes: [],
            expandedTasks: []
        };
    }

    // Set initial theme
    document.body.dataset.theme = appData.userPreferences.darkMode ? 'dark' : 'light';

    dailyReset(appData);

    const dateEl = document.getElementById('current-date');
    dateEl.textContent = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    renderUI(appData);
    renderStats(appData);

    // Event Listeners
    const taskListEl = document.getElementById('task-list');
    taskListEl.addEventListener('click', (e) => handleTaskListClick(e, appData));

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('click', () => toggleDarkMode(appData));

    const exportCsvButton = document.getElementById('export-csv');
    if (exportCsvButton) {
        exportCsvButton.addEventListener('click', () => exportStatsToCSV(appData));
    }

    const resetMonthButton = document.getElementById('reset-month');
    if (resetMonthButton) {
        resetMonthButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres borrar todo el historial de este mes? Esta acción no se puede deshacer.')) {
                resetMonthlyHistory(appData);
            }
        });
    }
});

function resetMonthlyHistory(appData) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    getAllTasks(appData).forEach(task => {
        task.history = task.history.filter(dateStr => {
            const completedDate = new Date(dateStr);
            return completedDate < startOfMonth || completedDate > endOfMonth;
        });
    });

    saveData(appData);
    renderUI(appData);
    renderStats(appData);
    console.log('Monthly history reset complete.');
}

function handleTaskListClick(e, appData) {
    // Usa closest() para que los clics en SVG/Iconos dentro del botón se resuelvan al botón correcto
    const target = (e.target.closest('.delete-task-btn, .add-task-btn, .edit-task-btn, .delete-theme-btn, .add-subtheme-btn, .edit-theme-btn, .edit-subtheme-btn, .delete-subtheme-btn, .edit-subtask-btn, .delete-subtask-btn')
        || (e.target.matches('input[type="checkbox"][data-subtask-id], input[type="checkbox"][data-task-id]') ? e.target : null)
        || e.target);
    const today = new Date().toISOString().split('T')[0];

    if (target.matches('input[type="checkbox"][data-subtask-id]')) {
        const subtaskId = target.dataset.subtaskId;
        const parentId = target.dataset.parentId;
        toggleSubtask(parentId, subtaskId, today, appData);
    } else if (target.matches('input[type="checkbox"][data-task-id]')) {
        const taskId = target.dataset.taskId;
        toggleTask(taskId, today, appData);
    } else if (target.matches('.delete-task-btn')) {
        const taskId = target.dataset.taskId;
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) {
            deleteTask(taskId, appData);
        }
    } else if (target.matches('.add-task-btn')) {
        const themeId = target.dataset.themeId;
        const subthemeId = target.dataset.subthemeId;
        showAddTaskModal(themeId, subthemeId, appData);
    } else if (target.matches('.edit-task-btn')) {
        const taskId = target.dataset.taskId;
        showEditTaskModal(taskId, appData);
    } else if (target.matches('.delete-theme-btn')) {
        const themeId = target.dataset.themeId;
        if (confirm('¿Estás seguro de que quieres eliminar este tema y todas sus tareas? Esta acción no se puede deshacer.')) {
            deleteTheme(themeId, appData);
        }
    } else if (target.matches('.add-subtheme-btn')) {
        const themeId = target.dataset.themeId;
        showAddSubthemeModal(themeId, appData);
    } else if (target.matches('.edit-theme-btn')) {
        const themeId = target.dataset.themeId;
        showEditThemeModal(themeId, appData);
    } else if (target.matches('.edit-subtheme-btn')) {
        const subthemeId = target.dataset.subthemeId;
        const themeId = target.dataset.themeId;
        showEditSubthemeModal(themeId, subthemeId, appData);
    } else if (target.matches('.delete-subtheme-btn')) {
        const subthemeId = target.dataset.subthemeId;
        const themeId = target.dataset.themeId;
        if (confirm('¿Estás seguro de que quieres eliminar este subtema y todas sus tareas? Esta acción no se puede deshacer.')) {
            deleteSubtheme(themeId, subthemeId, appData);
        }
    } else if (target.matches('.edit-subtask-btn')) {
        const subtaskId = target.dataset.subtaskId;
        const parentId = target.dataset.parentId;
        showEditSubtaskModal(parentId, subtaskId, appData);
    } else if (target.matches('.delete-subtask-btn')) {
        const subtaskId = target.dataset.subtaskId;
        const parentId = target.dataset.parentId;
        if (confirm('¿Estás seguro de que quieres eliminar esta subtarea? Esta acción no se puede deshacer.')) {
            deleteSubtask(parentId, subtaskId, appData);
        }
    }
}

function showAddThemeModal(appData) {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Añadir Nuevo Tema</h2>
            <label for="theme-name">Nombre del Tema:</label>
            <input type="text" id="theme-name" placeholder="Ej: Ejercicio, Trabajo, Hobbies">
            <button id="save-theme-btn">Guardar</button>
            <button id="cancel-theme-btn">Cancelar</button>
        </div>
    `;

    const saveTheme = () => createTheme(appData);
    document.getElementById('save-theme-btn').addEventListener('click', saveTheme, { once: true });
    const themeInput = document.getElementById('theme-name');
    themeInput.focus();
    themeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveTheme(); });

    document.getElementById('cancel-theme-btn').addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        modalOverlay.innerHTML = '';
    });
}

function createTheme(appData) {
    const themeName = document.getElementById('theme-name').value;
    if (!themeName) {
        alert('Por favor, introduce un nombre para el tema.');
        return;
    }

    const newTheme = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? `theme-${crypto.randomUUID()}` : `theme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`),
        name: themeName,
        tasks: [],
        subthemes: []
    };

    appData.themes.push(newTheme);

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function showEditThemeModal(themeId, appData) {
    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;

    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Editar Tema</h2>
            <label for="theme-name">Nombre del Tema:</label>
            <input type="text" id="theme-name" value="${theme.name}">
            <button id="save-theme-btn">Guardar</button>
            <button id="cancel-theme-btn">Cancelar</button>
        </div>
    `;

    document.getElementById('save-theme-btn').addEventListener('click', () => {
        updateTheme(themeId, appData);
    });

    const input = document.getElementById('theme-name');
    input.focus();
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') updateTheme(themeId, appData); });

    document.getElementById('cancel-theme-btn').addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        modalOverlay.innerHTML = '';
    });
}

function updateTheme(themeId, appData) {
    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;

    const themeName = document.getElementById('theme-name').value;
    if (!themeName) {
        alert('Por favor, introduce un nombre para el tema.');
        return;
    }

    theme.name = themeName;

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function showAddSubthemeModal(themeId, appData) {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Añadir Nuevo Subtema</h2>
            <label for="subtheme-name">Nombre del Subtema:</label>
            <input type="text" id="subtheme-name" placeholder="Ej: Carne y pisto, Marketing digital">
            <button id="save-subtheme-btn">Guardar</button>
            <button id="cancel-subtheme-btn">Cancelar</button>
        </div>
    `;

    const saveSubtheme = () => createSubtheme(themeId, appData);
    document.getElementById('save-subtheme-btn').addEventListener('click', saveSubtheme, { once: true });
    const input = document.getElementById('subtheme-name');
    input.focus();
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveSubtheme(); });

    document.getElementById('cancel-subtheme-btn').addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        modalOverlay.innerHTML = '';
    });
}

function createSubtheme(themeId, appData) {
    const subthemeName = document.getElementById('subtheme-name').value;
    if (!subthemeName) {
        alert('Por favor, introduce un nombre para el subtema.');
        return;
    }

    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;

    const newSubtheme = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? `subtheme-${crypto.randomUUID()}` : `subtheme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`),
        name: subthemeName,
        tasks: []
    };

    if (!theme.subthemes) {
        theme.subthemes = [];
    }
    theme.subthemes.push(newSubtheme);

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function showEditSubthemeModal(themeId, subthemeId, appData) {
    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;
    
    const subtheme = theme.subthemes.find(st => st.id === subthemeId);
    if (!subtheme) return;

    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Editar Subtema</h2>
            <label for="subtheme-name">Nombre del Subtema:</label>
            <input type="text" id="subtheme-name" value="${subtheme.name}">
            <button id="save-subtheme-btn">Guardar</button>
            <button id="cancel-subtheme-btn">Cancelar</button>
        </div>
    `;

    const save = () => updateSubtheme(themeId, subthemeId, appData);
    document.getElementById('save-subtheme-btn').addEventListener('click', save, { once: true });
    const input = document.getElementById('subtheme-name');
    input.focus();
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });

    document.getElementById('cancel-subtheme-btn').addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        modalOverlay.innerHTML = '';
    });
}

function updateSubtheme(themeId, subthemeId, appData) {
    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;
    
    const subtheme = theme.subthemes.find(st => st.id === subthemeId);
    if (!subtheme) return;

    const subthemeName = document.getElementById('subtheme-name').value;
    if (!subthemeName) {
        alert('Por favor, introduce un nombre para el subtema.');
        return;
    }

    subtheme.name = subthemeName;

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function deleteTheme(themeId, appData) {
    const index = appData.themes.findIndex(theme => theme.id === themeId);
    if (index === -1) return;
    appData.themes.splice(index, 1);
    saveData(appData);
    renderUI(appData);
    renderStats(appData);
    console.log(`Theme ${themeId} deleted.`);
}

function deleteSubtheme(themeId, subthemeId, appData) {
    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;

    theme.subthemes = theme.subthemes.filter(st => st.id !== subthemeId);
    saveData(appData);
    renderUI(appData);
    renderStats(appData);
    console.log(`Subtheme ${subthemeId} deleted.`);
}

function showEditTaskModal(taskId, appData) {
    const task = findTask(taskId, appData);
    if (!task) return;

    // Limpiar cualquier referencia anterior primero
    window.currentEditingTaskId = null;
    window.currentEditingSubtaskIds = null;
    
    // Guardar el taskId actual en una variable global para el modal
    window.currentEditingTaskId = taskId;

    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Editar Tarea</h2>
            <label for="task-name">Nombre de la Tarea:</label>
            <input type="text" id="task-name" value="${task.name}">
            
            <label for="task-frequency">Frecuencia:</label>
            <select id="task-frequency"></select>

            <div id="frequency-details"></div>

            <button id="save-task-btn" type="button" onclick="window.updateTaskFromModal()">Guardar</button>
            <button id="cancel-task-btn" type="button" onclick="window.closeEditModal()">Cancelar</button>
        </div>
    `;

    const freqSelect = document.getElementById('task-frequency');
    const freqDetails = document.getElementById('frequency-details');
    
    // Populate frequency options and select current
    const freqTypes = [
        { value: 'daily', label: '📅 Diario' },
        { value: 'workweek', label: '📆 Lunes a Viernes' },
        { value: 'sixdayweek', label: '📆 Lunes a Sábado' },
        { value: 'weekly', label: '🗓️ Semanal' },
        { value: 'monthly', label: '🗓️ Mensual' }
    ];
    freqTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        if (type.value === task.frequency.type) {
            option.selected = true;
        }
        freqSelect.appendChild(option);
    });

    // Trigger change to show initial details if any
    freqSelect.dispatchEvent(new Event('change'));
    
    // Establecer el valor del día después de que se cree el elemento
    setTimeout(() => {
        if ((task.frequency.type === 'weekly' || task.frequency.type === 'monthly') && task.frequency.day !== undefined) {
            const dayElement = document.getElementById('task-day');
            if (dayElement) {
                dayElement.value = task.frequency.day;
            }
        }
    }, 10);

    freqSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        if (type === 'weekly') {
            freqDetails.innerHTML = `
                <label for="task-day">Día de la semana:</label>
                <select id="task-day">
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                </select>
            `;
        } else if (type === 'monthly') {
            freqDetails.innerHTML = `
                <label for="task-day">Día del mes:</label>
                <input type="number" id="task-day" min="1" max="31">
            `;
        } else {
            freqDetails.innerHTML = '';
        }
    });

    // Usar delegación de eventos en el modal overlay
    modalOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (e.target.id === 'save-task-btn') {
            e.preventDefault();
            updateTask(taskId, appData);
        } else if (e.target.id === 'cancel-task-btn') {
            e.preventDefault();
            modalOverlay.classList.add('hidden');
            modalOverlay.innerHTML = '';
        } else if (e.target === modalOverlay) {
            // Cerrar modal solo si se hace clic en el overlay (fuera del contenido)
            modalOverlay.classList.add('hidden');
            modalOverlay.innerHTML = '';
        }
    });
}

// Funciones globales para el modal
window.updateTaskFromModal = function() {
    const taskId = window.currentEditingTaskId;
    if (!taskId) return;
    
    const appData = JSON.parse(localStorage.getItem('todoAppData')) || { themes: [], userPreferences: { darkMode: false } };
    updateTask(taskId, appData);
    // Limpiar la referencia después de usar
    window.currentEditingTaskId = null;
};

window.closeEditModal = function() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('hidden');
    modalOverlay.innerHTML = '';
    // Limpiar cualquier referencia pendiente
    window.currentEditingTaskId = null;
    window.currentEditingSubtaskIds = null;
};

window.updateSubtaskFromModal = function() {
    const ids = window.currentEditingSubtaskIds;
    if (!ids) return;
    
    const appData = JSON.parse(localStorage.getItem('todoAppData')) || { themes: [], userPreferences: { darkMode: false } };
    updateSubtask(ids.parentTaskId, ids.subtaskId, appData);
    // Limpiar la referencia después de usar
    window.currentEditingSubtaskIds = null;
};

function updateTask(taskId, appData) {
    const task = findTask(taskId, appData);
    if (!task) return;

    const taskName = document.getElementById('task-name').value;
    if (!taskName) {
        alert('Por favor, introduce un nombre para la tarea.');
        return;
    }

    const frequencyType = document.getElementById('task-frequency').value;
    const frequency = { type: frequencyType };

    if (frequencyType === 'weekly' || frequencyType === 'monthly') {
        frequency.day = parseInt(document.getElementById('task-day').value, 10);
    }

    task.name = taskName;
    task.frequency = frequency;

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function showAddTaskModal(themeId, subthemeId, appData) {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Añadir Nueva Tarea</h2>
            <label for="task-name">Nombre de la Tarea:</label>
            <input type="text" id="task-name" placeholder="Ej: Ir al gym, Escribir artículo">
            
            <label for="task-frequency">Frecuencia:</label>
            <select id="task-frequency">
                <option value="daily">📅 Diario</option>
                <option value="workweek">📆 Lunes a Viernes</option>
                <option value="sixdayweek">📆 Lunes a Sábado</option>
                <option value="weekly">🗓️ Semanal</option>
                <option value="monthly">🗓️ Mensual</option>
            </select>

            <div id="frequency-details"></div>

            <button id="save-task-btn">Guardar</button>
            <button id="cancel-task-btn">Cancelar</button>
        </div>
    `;

    const freqSelect = document.getElementById('task-frequency');
    const freqDetails = document.getElementById('frequency-details');

    freqSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        if (type === 'weekly') {
            freqDetails.innerHTML = `
                <label for="task-day">Día de la semana:</label>
                <select id="task-day">
                    <option value="1">Lunes</option>
                    <option value="2">Martes</option>
                    <option value="3">Miércoles</option>
                    <option value="4">Jueves</option>
                    <option value="5">Viernes</option>
                    <option value="6">Sábado</option>
                    <option value="0">Domingo</option>
                </select>
            `;
        } else if (type === 'monthly') {
            freqDetails.innerHTML = `
                <label for="task-day">Día del mes:</label>
                <input type="number" id="task-day" min="1" max="31" value="1">
            `;
        } else {
            freqDetails.innerHTML = '';
        }
    });

    document.getElementById('save-task-btn').addEventListener('click', () => {
        createTask(themeId, subthemeId, appData);
    });
    document.getElementById('task-name').focus();

    document.getElementById('cancel-task-btn').addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
        modalOverlay.innerHTML = '';
    });
}

function createTask(themeId, subthemeId, appData) {
    const taskName = document.getElementById('task-name').value;
    if (!taskName) {
        alert('Por favor, introduce un nombre para la tarea.');
        return;
    }

    const frequencyType = document.getElementById('task-frequency').value;
    const frequency = { type: frequencyType };

    if (frequencyType === 'weekly' || frequencyType === 'monthly') {
        frequency.day = parseInt(document.getElementById('task-day').value, 10);
    }

    const newTask = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? `task-${crypto.randomUUID()}` : `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`),
        name: taskName,
        frequency: frequency,
        history: [],
        subtasks: []
    };

    const theme = appData.themes.find(t => t.id === themeId);
    if (!theme) return;

    if (subthemeId) {
        const subtheme = theme.subthemes.find(st => st.id === subthemeId);
        if (!subtheme) return;
        subtheme.tasks.push(newTask);
    } else {
        theme.tasks.push(newTask);
    }

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function deleteTask(taskId, appData) {
    appData.themes.forEach(theme => {
        if (theme.tasks) {
            theme.tasks = theme.tasks.filter(t => t.id !== taskId);
        }
        if (theme.subthemes) {
            theme.subthemes.forEach(subtheme => {
                if (subtheme.tasks) {
                    subtheme.tasks = subtheme.tasks.filter(t => t.id !== taskId);
                }
            });
        }
    });

    saveData(appData);
    renderUI(appData);
    renderStats(appData);
    console.log(`Task ${taskId} deleted.`);
}

function findTask(taskId, appData) {
    for (const theme of appData.themes) {
        if (theme.tasks) {
            const task = theme.tasks.find(t => t.id === taskId);
            if (task) return task;
        }
        if (theme.subthemes) {
            for (const subtheme of theme.subthemes) {
                const task = subtheme.tasks.find(t => t.id === taskId);
                if (task) return task;
            }
        }
    }
    return null;
}

function toggleTask(taskId, today, appData) {
    const task = findTask(taskId, appData);
    if (!task) return;

    // If task has subtasks, toggle all subtasks at once and sync parent history
    if (task.subtasks && task.subtasks.length > 0) {
        const shouldCompleteAll = task.subtasks.some(st => st.completedOn !== today);
        task.subtasks.forEach(st => {
            st.completedOn = shouldCompleteAll ? today : null;
        });
        const idx = task.history.indexOf(today);
        if (shouldCompleteAll && idx === -1) task.history.push(today);
        if (!shouldCompleteAll && idx > -1) task.history.splice(idx, 1);
    } else {
        const historyIndex = task.history.indexOf(today);
        if (historyIndex > -1) {
            task.history.splice(historyIndex, 1);
        } else {
            task.history.push(today);
        }
    }

    saveData(appData);
    renderUI(appData);
    renderStats(appData);
}

function toggleSubtask(parentId, subtaskId, today, appData) {
    const parentTask = findTask(parentId, appData);
    if (!parentTask) return;

    const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    subtask.completedOn = subtask.completedOn === today ? null : today;

    const allSubtasksDone = parentTask.subtasks.every(st => st.completedOn === today);
    const parentHistoryIndex = parentTask.history.indexOf(today);

    if (allSubtasksDone && parentHistoryIndex === -1) {
        parentTask.history.push(today);
    } else if (!allSubtasksDone && parentHistoryIndex > -1) {
        parentTask.history.splice(parentHistoryIndex, 1);
    }

    saveData(appData);
    renderUI(appData);
    renderStats(appData);
}

function toggleDarkMode(appData) {
    appData.userPreferences.darkMode = !appData.userPreferences.darkMode;
    document.body.dataset.theme = appData.userPreferences.darkMode ? 'dark' : 'light';
    saveData(appData);
}

function dailyReset(appData) {
    const today = new Date().toISOString().split('T')[0];
    if (appData.lastOpened !== today) {
        appData.themes.forEach(theme => {
            (theme.tasks || []).forEach(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        subtask.completedOn = null;
                    });
                }
            });
            (theme.subthemes || []).forEach(subtheme => {
                (subtheme.tasks || []).forEach(task => {
                    if (task.subtasks && task.subtasks.length > 0) {
                        task.subtasks.forEach(subtask => {
                            subtask.completedOn = null;
                        });
                    }
                });
            });
        });

        appData.lastOpened = today;
        saveData(appData);
        console.log('Daily reset complete.');
    }
}

function isTaskAvailableToday(task, today = new Date()) {
    const freq = task.frequency;
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    switch (freq.type) {
        case 'daily': return true;
        case 'workweek': return dayOfWeek >= 1 && dayOfWeek <= 5;
        case 'sixdayweek': return dayOfWeek >= 1 && dayOfWeek <= 6;
        case 'weekly': return dayOfWeek === freq.day;
        case 'monthly': return dayOfMonth === freq.day;
        default: return false;
    }
}

function showEditSubtaskModal(parentTaskId, subtaskId, appData) {
    const parentTask = findTask(parentTaskId, appData);
    if (!parentTask) return;
    
    const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    // Guardar los IDs actuales en variables globales para el modal
    window.currentEditingSubtaskIds = { parentTaskId, subtaskId };

    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('hidden');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2>Editar Subtarea</h2>
            <label for="subtask-name">Nombre de la Subtarea:</label>
            <input type="text" id="subtask-name" value="${subtask.name}">
            <button id="save-subtask-btn" type="button" onclick="window.updateSubtaskFromModal()">Guardar</button>
            <button id="cancel-subtask-btn" type="button" onclick="window.closeEditModal()">Cancelar</button>
        </div>
    `;
    
    // Focus en el input y permitir guardar con Enter
    setTimeout(() => {
        const input = document.getElementById('subtask-name');
        if (input) {
            input.focus();
            input.addEventListener('keydown', (e) => { 
                if (e.key === 'Enter') {
                    window.updateSubtaskFromModal();
                }
            });
        }
    }, 10);
}

function updateSubtask(parentTaskId, subtaskId, appData) {
    const parentTask = findTask(parentTaskId, appData);
    if (!parentTask) return;
    
    const subtask = parentTask.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const subtaskName = document.getElementById('subtask-name').value;
    if (!subtaskName) {
        alert('Por favor, introduce un nombre para la subtarea.');
        return;
    }

    subtask.name = subtaskName;

    saveData(appData);
    renderUI(appData);
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-overlay').innerHTML = '';
}

function deleteSubtask(parentTaskId, subtaskId, appData) {
    const parentTask = findTask(parentTaskId, appData);
    if (!parentTask) return;

    parentTask.subtasks = parentTask.subtasks.filter(st => st.id !== subtaskId);
    saveData(appData);
    renderUI(appData);
    renderStats(appData);
    console.log(`Subtask ${subtaskId} deleted.`);
}
