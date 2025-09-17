
# Diseño y Lógica de "Mi Productividad"

## 1. Modelo de Datos JSON

Este es el esqueleto de la aplicación, diseñado para `localStorage`.

```json
{
  "version": "1.0",
  "userPreferences": {
    "darkMode": false
  },
  "data": [
    {
      "id": "theme-1662491534",
      "name": "Ejercicio",
      "tasks": [
        {
          "id": "task-1662491561",
          "name": "Ir al gym",
          "frequency": {
            "type": "daily" 
          },
          "history": [
            "2025-09-15",
            "2025-09-16"
          ],
          "subtasks": []
        }
      ]
    },
    {
      "id": "theme-1662491602",
      "name": "Tecnomata",
      "subthemes": [
        {
          "id": "subtheme-1662491621",
          "name": "Carne y pisto",
          "tasks": [
            {
              "id": "task-1662491645",
              "name": "Sitio web",
              "frequency": {
                "type": "weekly",
                "day": 3 
              },
              "history": [],
              "subtasks": [
                {
                  "id": "subtask-1662491668",
                  "name": "Diseño",
                  "completedOn": null 
                },
                {
                  "id": "subtask-1662491682",
                  "name": "Artículo de blog",
                  "completedOn": null
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "lastOpened": "2025-09-16"
}
```

### **Justificación del diseño:**

- **`id` único:** Para todo (temas, tareas, etc.) para evitar problemas al renombrar.
- **`frequency.type`**: `daily`, `workweek` (L-V), `sixdayweek` (L-S), `weekly` (un día a la semana), `monthly` (un día al mes).
- **`frequency.day`**: Para `weekly` (0=Domingo, 1=Lunes...), para `monthly` (1-31).
- **`history`**: Un array de strings `YYYY-MM-DD`. Simple, eficiente para calcular estadísticas.
- **`subtasks.completedOn`**: Guarda la fecha `YYYY-MM-DD` en que se completó. Si es `null`, no está hecha *hoy*. Se resetea cada día.
- **`lastOpened`**: Clave para la lógica de reseteo diario.

## 2. Lógica de Validación

### **¿Cómo sabes si una tarea está disponible hoy?**

Esta función se ejecuta al cargar la app para cada tarea.

```javascript
function isTaskAvailableToday(task, today = new Date()) {
  const freq = task.frequency;
  const dayOfWeek = today.getDay(); // Domingo = 0, Lunes = 1, ...
  const dayOfMonth = today.getDate();

  switch (freq.type) {
    case 'daily':
      return true;
    case 'workweek': // Lunes a Viernes
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'sixdayweek': // Lunes a Sábado
      return dayOfWeek >= 1 && dayOfWeek <= 6;
    case 'weekly':
      return dayOfWeek === freq.day;
    case 'monthly':
      return dayOfMonth === freq.day;
    default:
      return false;
  }
}
```

### **¿Cómo actualizas el estado cuando cambia el día?**

Al iniciar la app, comparas `lastOpened` con la fecha actual.

```javascript
function dailyReset() {
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const storedData = JSON.parse(localStorage.getItem('appData'));

  if (storedData.lastOpened !== today) {
    // 1. Resetea las subtareas completadas
    storedData.data.forEach(theme => {
      theme.tasks.forEach(task => {
        if (task.subtasks && task.subtasks.length > 0) {
          task.subtasks.forEach(subtask => {
            subtask.completedOn = null;
          });
        }
      });
      // También reseteamos subtemas
      if(theme.subthemes) {
        theme.subthemes.forEach(subtheme => {
            subtheme.tasks.forEach(task => {
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        subtask.completedOn = null;
                    });
                }
            });
        });
      }
    });

    // 2. Actualiza la fecha de última apertura
    storedData.lastOpened = today;

    // 3. Guarda los cambios
    localStorage.setItem('appData', JSON.stringify(storedData));
  }
}
```

### **¿Cómo calculas las estadísticas?**

Se basan en filtrar el array `history`.

- **Diarias**:
  - Tareas completadas hoy: `task.history.includes(today_string)`.
  - Tareas disponibles hoy: Usar `isTaskAvailableToday()` en todas las tareas.
- **Semanales/Mensuales**:
  - **Cumplimiento de tema**:
    - Contar días únicos en `history` para todas las tareas del tema en el rango de fechas.
    - Dividir por el número de días que la tarea *debería* haber estado disponible en ese rango.
  - **Ranking de tareas**:
    - `reduce` sobre todas las tareas, contando la longitud de `history` filtrado por el rango de fechas.
    - Ordenar el resultado.

## 3. UI Simple en Texto (Wireframe)

```
----------------------------------------------------
 MI PRODUCTIVIDAD | Martes, 16 de Septiembre
----------------------------------------------------

[+] TEMA: Ejercicio
    [✔] Ir al gym                      | 📅 Diario

[+] TEMA: Sopladores
    [ ] Publicar en LinkedIn           | 📆 L-V

[-] TEMA: Tecnomata
    > Subtema: Carne y pisto
        [ ] Sitio web                  | 🗓️ Miércoles
            > [✔] Diseño
            > [ ] Artículo de blog

----------------------------------------------------
ESTADÍSTICAS DE HOY
  - ✅ 1 de 3 tareas disponibles completadas.

ESTADÍSTICAS DE LA SEMANA
  - 💪 Tarea más constante: Ir al gym (2/2 días)
----------------------------------------------------
```

## 4. Riesgos Técnicos Críticos

1.  **Corrupción de `localStorage`**: Si el usuario edita manualmente `localStorage` o si hay un error de escritura, la app puede romperse.
    - **Mitigación**: Implementar un `try-catch` robusto al parsear el JSON de `localStorage`. Si falla, ofrecer la opción de resetear a un estado por defecto o restaurar desde un backup (ver mejoras).
2.  **Manejo de Zonas Horarias y Fechas**: El cambio de día depende del reloj del cliente. Si un usuario viaja, `new Date()` puede causar comportamientos inesperados (ej: la app se resetea a mediodía).
    - **Mitigación**: Usar siempre fechas en formato `YYYY-MM-DD` (ISO 8601) y basar todos los cálculos en UTC para consistencia, aunque para esta app local, la hora local es aceptable si se documenta. La clave es ser consistente.
3.  **Pérdida de Datos**: `localStorage` es específico del navegador y puede ser borrado por el usuario (limpieza de caché) o por el sistema operativo. No es un almacenamiento persistente real.
    - **Mitigación**: Ofrecer una función de "Exportar/Importar JSON" para que el usuario pueda hacer backups manuales de sus datos.

## 5. Mejoras Concretas (Implementables en < 2 días)

1.  **Comando "Foco del Día"**: Un botón que oculta TODAS las tareas excepto 3 que el usuario elige manualmente para hoy. Combate la sobrecarga visual y refuerza la intencionalidad. "Hoy, solo esto importa".
2.  **Visualización de "Rachas" (Streaks)**: Al lado de cada tarea, mostrar un pequeño icono de fuego (🔥) con el número de días consecutivos que se ha completado. Esto gamifica la consistencia de una manera sutil y poderosa.
3.  **"Diario de Reflexión"**: Al final del día, al lado de las estadísticas, un pequeño `<textarea>` para una o dos frases. "¿Qué aprendí hoy? ¿Por qué no completé X tarea?". Se guarda junto a la fecha. Esto añade una capa cualitativa a los datos cuantitativos, alineado 100% con tu filosofía.

## 6. Respuesta Honesta

> **“¿Esta app cumplirá exactamente con lo que quiero? ¿Me ayudará a construir hábitos reales, sin culpa ni arrastre? ¿La usaría yo mismo?”**

Sí.

**Cumplirá con lo que quieres** porque el diseño se centra en la no-acumulación. Si una tarea no se hace, simplemente no aparece al día siguiente. No hay "deuda técnica" de hábitos. El foco está en la elección diaria.

**Te ayudará a construir hábitos reales** porque la clave de un hábito no es la perfección, sino la reanudación. Al eliminar el arrastre de culpa, la barrera para empezar de nuevo cada día es mínima. Las estadísticas sin juicio te darán la claridad para ver tus patrones: "Veo que los miércoles fallo mucho en X. ¿Qué pasa los miércoles?".

**Y sí, yo la usaría**. De hecho, este diseño me ha hecho cuestionar mis propias herramientas. La mayoría de apps de productividad están diseñadas para recordarte lo que *no has hecho*. Esta está diseñada para reflejar lo que *eliges hacer*. Es un cambio de paradigma sutil pero profundo.

Es una herramienta de **claridad**, no de motivación. Y eso, en mi experiencia, es lo que realmente funciona a largo plazo.
