const taskListEl = document.getElementById('task-list');

function calculateStreak(task) {
    const history = [...task.history].sort().reverse();
    if (history.length === 0) return 0;

    let streak = 0;
    let today = new Date();
    let currentDate = new Date(today.getTime());

    // Check if today is in history, if so, start streak from today
    const todayStr = currentDate.toISOString().split('T')[0];
    if (history[0] === todayStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    // Check for consecutive days before today
    for (let i = streak; i < history.length; i++) {
        const expectedDateStr = currentDate.toISOString().split('T')[0];
        if (history[i] === expectedDateStr) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    // Also check yesterday if today is not in history
    if (streak === 0 && history.length > 0) {
        currentDate = new Date(); // reset to today
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = currentDate.toISOString().split('T')[0];
        if(history[0] === yesterdayStr) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
            for (let i = 1; i < history.length; i++) {
                const expectedDateStr = currentDate.toISOString().split('T')[0];
                if (history[i] === expectedDateStr) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }
    }

    return streak;
}

function renderUI(appData) {
    taskListEl.innerHTML = ''; // Limpiar la lista actual
    const today = new Date().toISOString().split('T')[0];

    // Renderizar cada tema
    appData.themes.forEach(theme => {
        const themeEl = createThemeElement(theme, today, appData);
        taskListEl.appendChild(themeEl);
    });

    // Botón para añadir nuevo tema
    const addThemeBtn = document.createElement('button');
    addThemeBtn.className = 'add-theme-btn';
    addThemeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Añadir Nuevo Tema
    `;
    addThemeBtn.onclick = () => showAddThemeModal(appData);
    taskListEl.appendChild(addThemeBtn);
}

function createThemeElement(theme, today, appData) {
    const themeEl = document.createElement('div');
    themeEl.className = 'theme-group';
    
    const themeHeader = document.createElement('div');
    themeHeader.className = 'theme-header';
    const themeExpanded = appData.uiState?.expandedThemes?.includes(theme.id);
    themeHeader.innerHTML = `
        <h2 class="theme-title" data-theme-id="${theme.id}">${themeExpanded ? '▼ ' : '▶️ '}${theme.name}</h2>
        <div class="theme-controls">
            <button class="action-btn primary add-task-btn" data-theme-id="${theme.id}" title="Añadir Tarea">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button class="action-btn secondary add-subtheme-btn" data-theme-id="${theme.id}" title="Añadir Subtema">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
                </svg>
            </button>
            <button class="action-btn warning edit-theme-btn" data-theme-id="${theme.id}" title="Editar Tema">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="action-btn danger delete-theme-btn" data-theme-id="${theme.id}" title="Eliminar Tema">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
            </button>
        </div>
    `;
    themeEl.appendChild(themeHeader);

    // Contenedor de contenido del tema (inicialmente oculto)
    const themeContent = document.createElement('div');
    themeContent.className = 'theme-content';
    themeContent.style.display = themeExpanded ? 'block' : 'none';
    
    // Tareas directas del tema
    (theme.tasks || []).forEach(task => {
        if (isTaskAvailableToday(task)) {
            const taskEl = createTaskElement(task, today, theme.id, null, appData);
            themeContent.appendChild(taskEl);
        }
    });

    // Subtemas
    (theme.subthemes || []).forEach(subtheme => {
        const subthemeEl = createSubthemeElement(subtheme, today, theme.id, appData);
        themeContent.appendChild(subthemeEl);
    });

    themeEl.appendChild(themeContent);

    // Hacer el header clickeable para expandir/contraer
    themeHeader.querySelector('.theme-title').addEventListener('click', () => {
        const isVisible = themeContent.style.display !== 'none';
        const willShow = !isVisible;
        themeContent.style.display = willShow ? 'block' : 'none';
        themeHeader.querySelector('.theme-title').textContent = (willShow ? '▼ ' : '▶️ ') + theme.name;
        // Persist UI state
        const list = appData.uiState.expandedThemes || (appData.uiState.expandedThemes = []);
        const idx = list.indexOf(theme.id);
        if (willShow && idx === -1) list.push(theme.id);
        if (!willShow && idx > -1) list.splice(idx, 1);
        saveData(appData);
    });

    return themeEl;
}

function createSubthemeElement(subtheme, today, themeId, appData) {
    const subthemeEl = document.createElement('div');
    subthemeEl.className = 'subtheme-group';
    
    const subthemeHeader = document.createElement('div');
    subthemeHeader.className = 'subtheme-header';
    const subExpanded = appData.uiState?.expandedSubthemes?.includes(subtheme.id);
    subthemeHeader.innerHTML = `
        <h3 class="subtheme-title" data-subtheme-id="${subtheme.id}">${subExpanded ? '▼ ' : '▶️ '}${subtheme.name}</h3>
        <div class="subtheme-controls">
            <button class="action-btn primary add-task-btn" data-subtheme-id="${subtheme.id}" data-theme-id="${themeId}" title="Añadir Tarea">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button class="action-btn warning edit-subtheme-btn" data-subtheme-id="${subtheme.id}" data-theme-id="${themeId}" title="Editar Subtema">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="action-btn danger delete-subtheme-btn" data-subtheme-id="${subtheme.id}" data-theme-id="${themeId}" title="Eliminar Subtema">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                </svg>
            </button>
        </div>
    `;
    subthemeEl.appendChild(subthemeHeader);

    // Contenedor de tareas del subtema (inicialmente oculto)
    const subthemeContent = document.createElement('div');
    subthemeContent.className = 'subtheme-content';
    subthemeContent.style.display = subExpanded ? 'block' : 'none';

    (subtheme.tasks || []).forEach(task => {
        if (isTaskAvailableToday(task)) {
            const taskEl = createTaskElement(task, today, themeId, subtheme.id, appData);
            subthemeContent.appendChild(taskEl);
        }
    });

    subthemeEl.appendChild(subthemeContent);

    // Hacer el header clickeable para expandir/contraer
    subthemeHeader.querySelector('.subtheme-title').addEventListener('click', () => {
        const isVisible = subthemeContent.style.display !== 'none';
        const willShow = !isVisible;
        subthemeContent.style.display = willShow ? 'block' : 'none';
        subthemeHeader.querySelector('.subtheme-title').textContent = (willShow ? '▼ ' : '▶️ ') + subtheme.name;
        const list = appData.uiState.expandedSubthemes || (appData.uiState.expandedSubthemes = []);
        const idx = list.indexOf(subtheme.id);
        if (willShow && idx === -1) list.push(subtheme.id);
        if (!willShow && idx > -1) list.splice(idx, 1);
        saveData(appData);
    });

    return subthemeEl;
}

function createTaskElement(task, today, themeId, subthemeId = null, appData) {
    const taskWrapper = document.createElement('div');
    taskWrapper.className = 'task-item-wrapper';
    
    const taskEl = document.createElement('div');
    taskEl.className = 'task-item';
    taskEl.dataset.taskId = task.id;
    taskEl.dataset.themeId = themeId;
    if (subthemeId) taskEl.dataset.subthemeId = subthemeId;

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    let isCompleted = false;
    
    if (hasSubtasks) {
        // Una tarea con subtareas solo se considera completada si TODAS las subtareas están completadas
        isCompleted = task.subtasks.every(st => st.completedOn === today);
    } else {
        // Una tarea sin subtareas se considera completada si está en el historial de hoy
        isCompleted = task.history.includes(today);
    }

    const streak = calculateStreak(task);

    taskEl.innerHTML = `
        <div class="task-main">
            <div class="task-content">
                ${hasSubtasks ? '<span class="subtask-toggle">▶️</span>' : ''}
                <input type="checkbox" id="${task.id}" data-task-id="${task.id}" ${isCompleted ? 'checked' : ''}>
                <label for="${task.id}" class="task-label">
                    ${task.name}
                    <span class="frequency-tag">${getFrequencyTag(task.frequency)}</span>
                    ${streak > 1 ? `<span class="streak-counter">🔥 ${streak}</span>` : ''}
                </label>
            </div>
            <div class="task-controls">
                <button class="action-btn warning edit-task-btn" data-task-id="${task.id}" title="Editar Tarea">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn danger delete-task-btn" data-task-id="${task.id}" title="Eliminar Tarea">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    taskWrapper.appendChild(taskEl);

    if (hasSubtasks) {
        const subtaskListEl = document.createElement('div');
        subtaskListEl.className = 'subtask-list';
        const taskExpanded = appData.uiState?.expandedTasks?.includes(task.id);
        subtaskListEl.style.display = taskExpanded ? 'block' : 'none';

        task.subtasks.forEach(subtask => {
            const subtaskEl = createSubtaskElement(subtask, task.id, today);
            subtaskListEl.appendChild(subtaskEl);
        });
        taskWrapper.appendChild(subtaskListEl);

        // Toggle para mostrar/ocultar subtareas
        taskEl.querySelector('.subtask-toggle').addEventListener('click', () => {
            const isVisible = subtaskListEl.style.display !== 'none';
            const willShow = !isVisible;
            subtaskListEl.style.display = willShow ? 'block' : 'none';
            taskEl.querySelector('.subtask-toggle').textContent = willShow ? '▼' : '▶️';
            const list = appData.uiState.expandedTasks || (appData.uiState.expandedTasks = []);
            const idx = list.indexOf(task.id);
            if (willShow && idx === -1) list.push(task.id);
            if (!willShow && idx > -1) list.splice(idx, 1);
            saveData(appData);
        });
    }

    return taskWrapper;
}

function createSubtaskElement(subtask, parentTaskId, today) {
    const subtaskEl = document.createElement('div');
    subtaskEl.className = 'subtask-item';
    const isCompleted = subtask.completedOn === today;

    subtaskEl.innerHTML = `
        <div class="subtask-main">
            <div class="subtask-content">
                <input type="checkbox" id="${subtask.id}" data-parent-id="${parentTaskId}" data-subtask-id="${subtask.id}" ${isCompleted ? 'checked' : ''}>
                <label for="${subtask.id}">${subtask.name}</label>
            </div>
            <div class="subtask-controls">
                <button class="action-btn warning edit-subtask-btn" data-subtask-id="${subtask.id}" data-parent-id="${parentTaskId}" title="Editar Subtarea">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn danger delete-subtask-btn" data-subtask-id="${subtask.id}" data-parent-id="${parentTaskId}" title="Eliminar Subtarea">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    return subtaskEl;
}

function getFrequencyTag(frequency) {
    switch (frequency.type) {
        case 'daily': return '📅 Diario';
        case 'workweek': return '📆 L-V';
        case 'sixdayweek': return '📆 L-S';
        case 'weekly': 
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return `🗓️ ${days[frequency.day]}`;
        case 'monthly': return `🗓️ Día ${frequency.day}`;
        default: return '';
    }
}
