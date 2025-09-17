
# 📝 Mi Productividad - Todo List + Dashboard App

### 🔹 PROYECTO 2: APP DE HÁBITOS PERSONALES (LO QUE NECESITO DISEÑAR)

Quiero una app **sencilla, sin backend, basada en localStorage**, que me ayude a construir hábitos con disciplina real, sin culpa ni arrastre.

#### 🎯 Filosofía central:
> “Hoy es un nuevo día. Lo que no hice ayer… no importa. Hoy decido qué hacer.  
> Lo importante no es la perfección, es la consistencia consciente.”

#### 🧩 Estructura del sistema:

##### 1. **Niveles de organización**
- **Tema** → Ej: *Ejercicio*, *Sopladores*, *Tecnomata*
- **Subtema (opcional)** → Ej: *Carne y pisto* (dentro de Tecnomata)
- **Tarea principal** → Ej: *Ir al gym*, *Publicar en LinkedIn*, *Linkbuilding*
- **Subtarea (opcional)** → Ej: *Diseño* y *Artículo de blog* (bajo *Sitio web*)

> ⚠️ Regla clave: Una tarea **solo se marca como completada si todas sus subtareas están completadas**.  
> Si no tiene subtareas, se marca directamente.

##### 2. **Frecuencias de ejecución (elige UNA por tarea)**
Cada tarea debe tener una frecuencia asignada:
- **Diario** → Se muestra todos los días. Se resetea cada medianoche.
- **Lunes a Viernes** → Solo aparece de lunes a viernes. Sábados/domingos no aparece.
- **Lunes a Sábado** → Igual, pero incluye sábado.
- **Una vez a la semana** → Elige un día fijo (ej: “miércoles”). Solo aparece ese día.
- **Una vez al mes** → Elige un día fijo (ej: “15”). Solo aparece ese día del mes.

> ❌ **No hay arrastre.**  
> Si no haces “Ir al gym” hoy, mañana no aparece como “pendiente de ayer”.  
> Simplemente… no aparece hasta su próximo día programado.  
> La meta es **consistencia intencional**, no acumulación de culpa.

##### 3. **Estadísticas (obligatorias)**
La app debe registrar y mostrar:
- **Diarias**: ¿Qué tareas completé hoy? ¿Cuántas de las disponibles?
- **Semanales**: 
  - Por tema: % de cumplimiento (ej: Ejercicio: 5/7 días)
  - Tarea más realizada / menos realizada (en la semana)
- **Mensuales**:
  - Total de días completos
  - Tendencia: ¿Mejoré, empeoré o mantuve?
  - Ranking de tareas: “Top 3 más completadas este mes”

##### 4. **Interfaz mínima (MVP)**
- Vista por tema (desplegable).
- Dentro de cada tema: subtemas (si existen).
- Bajo cada subtema o tema: lista de tareas principales con:
  - Checkbox grande
  - Etiqueta de frecuencia: 📅 Diario | 📆 L-V | 🗓️ Miércoles | 🗓️ 15
  - Si tiene subtareas: icono ▶️ que las expande (cada subtarea tiene su checkbox)
- Al final del día, puedes ver:
  - ✅ “Hoy completaste 4/6 tareas disponibles”
  - 📊 “Esta semana hiciste ‘Ir al gym’ 5 veces (83%)”
  - 🏆 “Tu tarea más constante este mes: Publicar en LinkedIn (22/30 días)”

##### 5. **Reglas técnicas**
- Datos guardados en `localStorage` (no requiere servidor).
- No se borran tareas completadas. Solo se marcan como “hechas hoy”.
- Cada tarea tiene un historial de fechas de completado (para estadísticas).
- Al cambiar la fecha del sistema, la app debe detectar el cambio y actualizar estados automáticamente.
- No hay notificaciones. Solo visualización limpia, sin distracciones.

##### 6. **Ejemplos reales de uso**
- **Tema: Ejercicio**  
  - Tarea: Ir al gym → Frecuencia: Diario  
  - Hoy: ✔️  
  - Mañana: aparece de nuevo. Si no la hago, no pasa nada.  

- **Tema: Sopladores**  
  - Tarea: Publicar en LinkedIn → Frecuencia: Lunes a Viernes  
  - Hoy es viernes: ✔️  
  - Sábado: no aparece.  

- **Tema: Tecnomata → Subtema: Carne y pisto**  
  - Tarea: Sitio web  
    - Subtarea: Diseño  
    - Subtarea: Artículo de blog  
  - Hoy: ✔️ Diseño, ❌ Artículo de blog → Entonces: ❌ Sitio web (no se palomea)  
  - Mañana: vuelven a aparecer ambas subtareas.  
  - Cuando ambas estén ✔️ → entonces ✔️ Sitio web

##### 7. **Bonus (no obligatorio, pero ideal)**
- Permitir exportar estadísticas mensuales como CSV.
- Permitir agrupar temas en categorías mayores: “Negocio”, “Salud”, “Personal”.
- Modo oscuro.
- Botón “Resetear todo este mes” (por si quiero empezar desde cero).

---

### 💬 Mi intención final:
No quiero una app que me recuerde lo que debo hacer.  
Quiero una app que me **muestre lo que elegí hacer**, y me **ayude a ver mis patrones sin juicio**.

Una herramienta para decirme:  
> “Hoy elegiste no hacerlo. Y está bien.  
> Pero mira: en los últimos 30 días, hiciste esto 24 veces.  
> Eso es poder. Eso es disciplina.”  

No quiero motivación.  
Quiero **claridad**.

---

### 🛠️ Tu tarea:
1. Diseña el **modelo de datos JSON** que represente esta estructura (incluyendo frecuencias, historial, subtareas, etc.).
2. Describe la **lógica de validación**:  
   - ¿Cómo sabes si una tarea está disponible hoy?  
   - ¿Cómo actualizas el estado cuando cambia el día?  
   - ¿Cómo calculas las estadísticas semanales/mensuales?
3. Propón una **UI simple en texto** (wireframe en palabras): cómo se vería el panel al abrir la app.
4. Identifica los **3 riesgos técnicos más críticos** (ej: corrupción de localStorage, errores de fecha, inconsistencias en el historial).
5. Propón **3 mejoras concretas, implementables en menos de 2 días**, que elevarán esta app de “útil” a “legendaria”.
6. Finalmente, responde con honestidad absoluta:
> “¿Esta app cumplirá exactamente con lo que quiero?  
> ¿Me ayudará a construir hábitos reales, sin culpa ni arrastre?  
> ¿La usaría yo mismo?”

No me digas “es posible”.  
Dime **cómo lo harías**.  
Con claridad.  
Con precisión.  
Sin jerga innecesaria.