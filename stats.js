function isTaskAvailableToday(task, today = new Date()) {
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    const freq = task.frequency || { type: 'daily' };
    switch (freq.type) {
        case 'daily': return true;
        case 'workweek': return dayOfWeek >= 1 && dayOfWeek <= 5;
        case 'sixdayweek': return dayOfWeek >= 1 && dayOfWeek <= 6;
        case 'weekly': return dayOfWeek === freq.day;
        case 'monthly': return dayOfMonth === freq.day;
        default: return true;
    }
}

function isTaskCompletedToday(task, todayStr) {
    if (task.subtasks && task.subtasks.length > 0) {
        return task.subtasks.every(st => st.completedOn === todayStr);
    }
    return Array.isArray(task.history) && task.history.includes(todayStr);
}

function calculateStats(appData) {
    const stats = {
        totalTasks: 0, // de hoy
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        themes: [],
        configTotalTasks: 0 // total configuradas
    };

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    appData.themes.forEach(theme => {
        const themeStats = {
            name: theme.name,
            totalTasks: 0, // de hoy
            completedTasks: 0,
            pendingTasks: 0,
            completionRate: 0,
            configTotalTasks: 0
        };

        // Contar tareas directas del tema (solo disponibles hoy)
        // Conteo de configuradas (tema nivel)
        themeStats.configTotalTasks += (theme.tasks || []).length;

        (theme.tasks || []).forEach(task => {
            if (!isTaskAvailableToday(task, today)) return;
            const done = isTaskCompletedToday(task, todayStr);
            stats.totalTasks++;
            themeStats.totalTasks++;
            if (done) {
                stats.completedTasks++;
                themeStats.completedTasks++;
            } else {
                stats.pendingTasks++;
                themeStats.pendingTasks++;
            }
        });

        // Contar tareas de subtemas (solo disponibles hoy)
        (theme.subthemes || []).forEach(subtheme => {
            // Conteo de configuradas (subtemas nivel)
            themeStats.configTotalTasks += (subtheme.tasks || []).length;
            (subtheme.tasks || []).forEach(task => {
                if (!isTaskAvailableToday(task, today)) return;
                const done = isTaskCompletedToday(task, todayStr);
                stats.totalTasks++;
                themeStats.totalTasks++;
                if (done) {
                    stats.completedTasks++;
                    themeStats.completedTasks++;
                } else {
                    stats.pendingTasks++;
                    themeStats.pendingTasks++;
                }
            });
        });

        // Calcular tasa de completado para el tema
        themeStats.completionRate = themeStats.totalTasks > 0 
            ? Math.round((themeStats.completedTasks / themeStats.totalTasks) * 100) 
            : 0;

        stats.themes.push(themeStats);
        stats.configTotalTasks += themeStats.configTotalTasks;
    });

    // Calcular tasa de completado general
    stats.completionRate = stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0;

    return stats;
}

function renderStats(appData) {
    const statsContainer = document.getElementById('stats-content');
    const stats = calculateStats(appData);
    
    statsContainer.innerHTML = `
        <div class="stats-overview">
            <div class="metric-card info">
                <div class="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 7h18M3 12h18M3 17h18"/>
                    </svg>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${stats.configTotalTasks}</div>
                    <div class="metric-label">Tareas Configuradas</div>
                </div>
            </div>
            <div class="metric-card primary">
                <div class="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                    </svg>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${stats.totalTasks}</div>
                    <div class="metric-label">Tareas de Hoy</div>
                </div>
            </div>
            
            <div class="metric-card success">
                <div class="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3l8-8"></path>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.51 0 2.93 0.37 4.18 1.03"></path>
                    </svg>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${stats.completedTasks}</div>
                    <div class="metric-label">Completadas</div>
                </div>
            </div>
            
            <div class="metric-card warning">
                <div class="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${stats.pendingTasks}</div>
                    <div class="metric-label">Pendientes</div>
                </div>
            </div>
            
            <div class="metric-card info">
                <div class="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                </div>
                <div class="metric-content">
                    <div class="metric-value">${stats.completionRate}%</div>
                    <div class="metric-label">Progreso</div>
                </div>
            </div>
        </div>
        
        <div class="stats-charts">
            <div class="chart-container">
                <div class="chart-header">
                    <h3>Progreso General</h3>
                    <div class="chart-legend">
                        <span class="legend-item completed">
                            <span class="legend-color"></span>
                            Completadas (${stats.completedTasks})
                        </span>
                        <span class="legend-item pending">
                            <span class="legend-color"></span>
                            Pendientes (${stats.pendingTasks})
                        </span>
                    </div>
                </div>
                <div class="progress-chart">
                    <div class="progress-ring">
                        <svg class="progress-svg" width="120" height="120">
                <circle cx="60" cy="60" r="50" stroke="#e5e7eb" stroke-width="8" fill="none"/>
                <circle cx="60" cy="60" r="50" stroke="var(--accent-secondary)" stroke-width="8" 
                                    fill="none" stroke-linecap="round" 
                                    stroke-dasharray="${2 * Math.PI * 50}" 
                                    stroke-dashoffset="${2 * Math.PI * 50 * (1 - stats.completionRate / 100)}"
                                    transform="rotate(-90 60 60)"/>
                        </svg>
                        <div class="progress-text">
                            <span class="progress-percentage">${stats.completionRate}%</span>
                            <span class="progress-label">Completado</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h3>Distribución por Tema</h3>
                </div>
                <div class="themes-chart">
                    ${renderThemeDistribution(stats.themes)}
                </div>
            </div>
            
            <div class="chart-container full-width">
                <div class="chart-header">
                    <h3>Progreso por Tema</h3>
                </div>
                <div class="progress-bars">
                    ${renderThemeProgress(stats.themes)}
                </div>
            </div>
        </div>
    `;
}

function renderThemeDistribution(themes) {
    if (!themes || themes.length === 0) {
        return '<p class="no-data">No hay datos para mostrar</p>';
    }
    
    const maxTasks = Math.max(...themes.map(t => t.configTotalTasks || 0), 1);
    
    return themes.map(theme => `
        <div class="theme-bar">
            <div class="theme-info">
                <span class="theme-name">${theme.name}</span>
                <span class="theme-count">${theme.configTotalTasks} tareas</span>
            </div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${(theme.configTotalTasks / maxTasks * 100)}%"></div>
            </div>
        </div>
    `).join('');
}

function renderThemeProgress(themes) {
    if (!themes || themes.length === 0) {
        return '<p class="no-data">No hay datos para mostrar</p>';
    }
    
    return themes.map(theme => {
        const progress = theme.totalTasks > 0 ? (theme.completedTasks / theme.totalTasks * 100) : 0;
        return `
            <div class="progress-item">
                <div class="progress-header">
                    <span class="progress-theme">${theme.name}</span>
                    <span class="progress-stats">${theme.completedTasks}/${theme.totalTasks} (${Math.round(progress)}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Funciones para exportar datos
function exportStatsToCSV(appData) {
    const stats = calculateStats(appData);
    let csvContent = "data:text/csv;charset=utf-8,Tema,Total Tareas,Completadas,Pendientes,Porcentaje Completado\n";
    
    stats.themes.forEach(theme => {
        csvContent += `"${theme.name}",${theme.totalTasks},${theme.completedTasks},${theme.pendingTasks},${theme.completionRate}%\n`;
    });
    
    csvContent += `"TOTAL",${stats.totalTasks},${stats.completedTasks},${stats.pendingTasks},${stats.completionRate}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estadisticas_todolist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
}
