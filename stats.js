// Helper function para obtener fecha local en formato YYYY-MM-DD
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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

function getDateRange(period) {
    const today = new Date();
    let startDate, endDate;
    
    switch (period) {
        case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            break;
        case 'yesterday':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            endDate = new Date(startDate);
            break;
        case 'week':
            // Esta semana (Lunes a Domingo)
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Domingo = 0, queremos que Lunes = inicio
            startDate = new Date(today);
            startDate.setDate(today.getDate() + mondayOffset);
            endDate = new Date(today);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        default:
            startDate = new Date(today);
            endDate = new Date(today);
    }
    
    return {
        start: getLocalDateString(startDate),
        end: getLocalDateString(endDate),
        dates: getDatesInRange(startDate, endDate)
    };
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(getLocalDateString(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function isTaskCompletedOnDate(task, dateStr) {
    if (task.subtasks && task.subtasks.length > 0) {
        return task.subtasks.every(st => st.completedOn === dateStr);
    }
    return Array.isArray(task.history) && task.history.includes(dateStr);
}

function calculateStats(appData, period = 'today') {
    const dateRange = getDateRange(period);
    const stats = {
        period: period,
        periodLabel: getPeriodLabel(period),
        dateRange: dateRange,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        themes: [],
        configTotalTasks: 0,
        dailyBreakdown: [] // Para períodos que incluyen múltiples días
    };

    // Para períodos de múltiples días, crear breakdown diario
    if (period === 'week' || period === 'month') {
        dateRange.dates.forEach(dateStr => {
            const dayStats = calculateDayStats(appData, dateStr);
            stats.dailyBreakdown.push({
                date: dateStr,
                dateLabel: new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                ...dayStats
            });
        });
        
        // Calcular totales del período
        stats.totalTasks = stats.dailyBreakdown.reduce((sum, day) => sum + day.totalTasks, 0);
        stats.completedTasks = stats.dailyBreakdown.reduce((sum, day) => sum + day.completedTasks, 0);
        stats.pendingTasks = stats.totalTasks - stats.completedTasks;
    } else {
        // Para un solo día (hoy o ayer)
        const targetDate = period === 'yesterday' ? dateRange.start : dateRange.end;
        const dayStats = calculateDayStats(appData, targetDate);
        Object.assign(stats, dayStats);
    }

    appData.themes.forEach(theme => {
        const themeStats = calculateThemeStats(theme, dateRange, period);
        stats.themes.push(themeStats);
        stats.configTotalTasks += themeStats.configTotalTasks;
    });

    // Calcular tasa de completado general
    stats.completionRate = stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
        : 0;

    return stats;
}

function calculateDayStats(appData, dateStr) {
    const dayStats = {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
    };
    
    const targetDate = new Date(dateStr + 'T00:00:00');

    appData.themes.forEach(theme => {
        // Tareas directas del tema
        (theme.tasks || []).forEach(task => {
            if (!isTaskAvailableToday(task, targetDate)) return;
            dayStats.totalTasks++;
            if (isTaskCompletedOnDate(task, dateStr)) {
                dayStats.completedTasks++;
            } else {
                dayStats.pendingTasks++;
            }
        });

        // Tareas de subtemas
        (theme.subthemes || []).forEach(subtheme => {
            (subtheme.tasks || []).forEach(task => {
                if (!isTaskAvailableToday(task, targetDate)) return;
                dayStats.totalTasks++;
                if (isTaskCompletedOnDate(task, dateStr)) {
                    dayStats.completedTasks++;
                } else {
                    dayStats.pendingTasks++;
                }
            });
        });
    });

    return dayStats;
}

function calculateThemeStats(theme, dateRange, period) {
    const themeStats = {
        name: theme.name,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        configTotalTasks: 0
    };

    // Contar tareas configuradas
    themeStats.configTotalTasks += (theme.tasks || []).length;
    (theme.subthemes || []).forEach(subtheme => {
        themeStats.configTotalTasks += (subtheme.tasks || []).length;
    });

    // Calcular estadísticas según el período
    if (period === 'week' || period === 'month') {
        // Para períodos múltiples, contar tareas únicas disponibles en el rango
        const uniqueTasks = new Set();
        
        dateRange.dates.forEach(dateStr => {
            const targetDate = new Date(dateStr + 'T00:00:00');
            
            (theme.tasks || []).forEach(task => {
                if (isTaskAvailableToday(task, targetDate)) {
                    uniqueTasks.add(`theme-${task.id}`);
                    const isCompleted = isTaskCompletedOnDate(task, dateStr);
                    if (isCompleted) {
                        themeStats.completedTasks++;
                    }
                }
            });

            (theme.subthemes || []).forEach(subtheme => {
                (subtheme.tasks || []).forEach(task => {
                    if (isTaskAvailableToday(task, targetDate)) {
                        uniqueTasks.add(`subtheme-${task.id}`);
                        const isCompleted = isTaskCompletedOnDate(task, dateStr);
                        if (isCompleted) {
                            themeStats.completedTasks++;
                        }
                    }
                });
            });
        });
        
        themeStats.totalTasks = dateRange.dates.length * uniqueTasks.size;
        themeStats.pendingTasks = themeStats.totalTasks - themeStats.completedTasks;
    } else {
        // Para un solo día
        const targetDate = new Date(dateRange.start + 'T00:00:00');
        
        (theme.tasks || []).forEach(task => {
            if (!isTaskAvailableToday(task, targetDate)) return;
            themeStats.totalTasks++;
            if (isTaskCompletedOnDate(task, dateRange.start)) {
                themeStats.completedTasks++;
            } else {
                themeStats.pendingTasks++;
            }
        });

        (theme.subthemes || []).forEach(subtheme => {
            (subtheme.tasks || []).forEach(task => {
                if (!isTaskAvailableToday(task, targetDate)) return;
                themeStats.totalTasks++;
                if (isTaskCompletedOnDate(task, dateRange.start)) {
                    themeStats.completedTasks++;
                } else {
                    themeStats.pendingTasks++;
                }
            });
        });
    }

    themeStats.completionRate = themeStats.totalTasks > 0 
        ? Math.round((themeStats.completedTasks / themeStats.totalTasks) * 100) 
        : 0;

    return themeStats;
}

function getPeriodLabel(period) {
    const labels = {
        'today': 'Hoy',
        'yesterday': 'Ayer', 
        'week': 'Esta Semana',
        'month': 'Este Mes'
    };
    return labels[period] || 'Hoy';
}

function renderStats(appData, period = 'today') {
    const statsContainer = document.getElementById('stats-content');
    const stats = calculateStats(appData, period);
    
    let dailyBreakdownHtml = '';
    if (stats.dailyBreakdown && stats.dailyBreakdown.length > 0) {
        dailyBreakdownHtml = `
            <div class="daily-breakdown">
                <h3>📅 Breakdown Diario - ${stats.periodLabel}</h3>
                <div class="daily-grid">
                    ${stats.dailyBreakdown.map(day => `
                        <div class="day-card">
                            <div class="day-header">${day.dateLabel}</div>
                            <div class="day-stats">
                                <span class="completed">${day.completedTasks}</span>
                                <span class="separator">/</span>
                                <span class="total">${day.totalTasks}</span>
                            </div>
                            <div class="day-rate">${day.totalTasks > 0 ? Math.round((day.completedTasks / day.totalTasks) * 100) : 0}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    statsContainer.innerHTML = `
        <div class="stats-overview">
            <div class="period-info">
                <h3>📊 Estadísticas - ${stats.periodLabel}</h3>
                ${stats.dateRange ? `<p class="date-range">Del ${new Date(stats.dateRange.start + 'T00:00:00').toLocaleDateString('es-ES')} al ${new Date(stats.dateRange.end + 'T00:00:00').toLocaleDateString('es-ES')}</p>` : ''}
            </div>
            
            <div class="metrics-grid">
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
                        <div class="metric-label">Tareas del Período</div>
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
        </div>
        
        ${dailyBreakdownHtml}
        
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
    // Obtener estadísticas de todos los períodos
    const todayStats = calculateStats(appData, 'today');
    const yesterdayStats = calculateStats(appData, 'yesterday');
    const weekStats = calculateStats(appData, 'week');
    const monthStats = calculateStats(appData, 'month');
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header principal
    csvContent += "ESTADÍSTICAS COMPLETAS - MI PRODUCTIVIDAD\n";
    csvContent += `Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}\n\n`;
    
    // Resumen general por períodos
    csvContent += "RESUMEN GENERAL POR PERÍODOS\n";
    csvContent += "Período,Total Tareas,Completadas,Pendientes,Porcentaje Completado\n";
    csvContent += `Hoy,${todayStats.totalTasks},${todayStats.completedTasks},${todayStats.pendingTasks},${todayStats.completionRate}%\n`;
    csvContent += `Ayer,${yesterdayStats.totalTasks},${yesterdayStats.completedTasks},${yesterdayStats.pendingTasks},${yesterdayStats.completionRate}%\n`;
    csvContent += `Esta Semana,${weekStats.totalTasks},${weekStats.completedTasks},${weekStats.pendingTasks},${weekStats.completionRate}%\n`;
    csvContent += `Este Mes,${monthStats.totalTasks},${monthStats.completedTasks},${monthStats.pendingTasks},${monthStats.completionRate}%\n\n`;
    
    // Breakdown diario de la semana
    if (weekStats.dailyBreakdown && weekStats.dailyBreakdown.length > 0) {
        csvContent += "BREAKDOWN DIARIO - ESTA SEMANA\n";
        csvContent += "Fecha,Día,Total Tareas,Completadas,Pendientes,Porcentaje\n";
        weekStats.dailyBreakdown.forEach(day => {
            const percentage = day.totalTasks > 0 ? Math.round((day.completedTasks / day.totalTasks) * 100) : 0;
            csvContent += `${day.date},${day.dateLabel},${day.totalTasks},${day.completedTasks},${day.pendingTasks},${percentage}%\n`;
        });
        csvContent += "\n";
    }
    
    // Breakdown diario del mes
    if (monthStats.dailyBreakdown && monthStats.dailyBreakdown.length > 0) {
        csvContent += "BREAKDOWN DIARIO - ESTE MES\n";
        csvContent += "Fecha,Día,Total Tareas,Completadas,Pendientes,Porcentaje\n";
        monthStats.dailyBreakdown.forEach(day => {
            const percentage = day.totalTasks > 0 ? Math.round((day.completedTasks / day.totalTasks) * 100) : 0;
            csvContent += `${day.date},${day.dateLabel},${day.totalTasks},${day.completedTasks},${day.pendingTasks},${percentage}%\n`;
        });
        csvContent += "\n";
    }
    
    // Estadísticas por tema - HOY
    csvContent += "ESTADÍSTICAS POR TEMA - HOY\n";
    csvContent += "Tema,Total Tareas,Completadas,Pendientes,Porcentaje Completado,Tareas Configuradas\n";
    todayStats.themes.forEach(theme => {
        csvContent += `"${theme.name}",${theme.totalTasks},${theme.completedTasks},${theme.pendingTasks},${theme.completionRate}%,${theme.configTotalTasks}\n`;
    });
    csvContent += `"TOTAL HOY",${todayStats.totalTasks},${todayStats.completedTasks},${todayStats.pendingTasks},${todayStats.completionRate}%,${todayStats.configTotalTasks}\n\n`;
    
    // Estadísticas por tema - AYER
    csvContent += "ESTADÍSTICAS POR TEMA - AYER\n";
    csvContent += "Tema,Total Tareas,Completadas,Pendientes,Porcentaje Completado\n";
    yesterdayStats.themes.forEach(theme => {
        csvContent += `"${theme.name}",${theme.totalTasks},${theme.completedTasks},${theme.pendingTasks},${theme.completionRate}%\n`;
    });
    csvContent += `"TOTAL AYER",${yesterdayStats.totalTasks},${yesterdayStats.completedTasks},${yesterdayStats.pendingTasks},${yesterdayStats.completionRate}%\n\n`;
    
    // Estadísticas por tema - ESTA SEMANA
    csvContent += "ESTADÍSTICAS POR TEMA - ESTA SEMANA\n";
    csvContent += "Tema,Total Tareas,Completadas,Pendientes,Porcentaje Completado\n";
    weekStats.themes.forEach(theme => {
        csvContent += `"${theme.name}",${theme.totalTasks},${theme.completedTasks},${theme.pendingTasks},${theme.completionRate}%\n`;
    });
    csvContent += `"TOTAL SEMANA",${weekStats.totalTasks},${weekStats.completedTasks},${weekStats.pendingTasks},${weekStats.completionRate}%\n\n`;
    
    // Estadísticas por tema - ESTE MES
    csvContent += "ESTADÍSTICAS POR TEMA - ESTE MES\n";
    csvContent += "Tema,Total Tareas,Completadas,Pendientes,Porcentaje Completado\n";
    monthStats.themes.forEach(theme => {
        csvContent += `"${theme.name}",${theme.totalTasks},${theme.completedTasks},${theme.pendingTasks},${theme.completionRate}%\n`;
    });
    csvContent += `"TOTAL MES",${monthStats.totalTasks},${monthStats.completedTasks},${monthStats.pendingTasks},${monthStats.completionRate}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estadisticas_completas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
}
