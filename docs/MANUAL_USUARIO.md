# Manual de Usuario - WIGAC

## Índice
1. [Introducción](#introducción)
2. [Inicio de Sesión](#inicio-de-sesión)
3. [Dashboard](#dashboard)
4. [Gestión de Proyectos](#gestión-de-proyectos)
5. [Gestión de Tareas](#gestión-de-tareas)
6. [Registros de Trabajo (Diary)](#registros-de-trabajo-diary)
7. [Vista Kanban](#vista-kanban)
8. [Wiki](#wiki)
9. [Perfil de Usuario](#perfil-de-usuario)
10. [Temas y Personalización](#temas-y-personalización)

---

## Introducción

WIGAC (Work Intelligence & Governance Application Control) es una aplicación de gestión de proyectos y seguimiento de tiempo diseñada para equipos de desarrollo y trabajo remoto. Permite organizar proyectos, tareas, registrar tiempo de trabajo y documentar procesos.

### Características Principales
- Gestión de proyectos y tareas
- Registro detallado de tiempo de trabajo
- Vista Kanban para seguimiento visual
- Sistema de documentación Wiki integrado
- Generación automática de reportes
- Modo oscuro/claro
- Registro de Regac (sistema interno)

---

## Inicio de Sesión

### Acceso a la Aplicación
1. Accede a la URL de la aplicación
2. Introduce tu correo electrónico y contraseña
3. Haz clic en "Iniciar Sesión"

### Registro de Nueva Cuenta
1. En la página de inicio de sesión, haz clic en "Registrarse"
2. Completa el formulario con:
   - Nombre completo
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
3. Haz clic en "Crear Cuenta"

---

## Dashboard

El Dashboard es la página principal tras iniciar sesión. Muestra un resumen de tu actividad:

### Estadísticas Visibles
- **Proyectos Activos**: Número total de proyectos en estado activo
- **Tareas Pendientes**: Tareas en estado pendiente o en progreso
- **Horas esta semana**: Total de horas trabajadas en la semana actual
- **Completadas**: Porcentaje de tareas completadas

### Notas Rápidas
- Área de texto para notas personales
- **Guardado automático**: Cada 30 segundos
- **Guardado manual**: Ctrl+S o Cmd+S
- Las notas se guardan en la base de datos (no solo localmente)
- Muestra la hora del último guardado

### Actividad Reciente
- Lista de las últimas tareas completadas o en progreso
- Muestra el estado de cada tarea
- Fecha de última actualización

---

## Gestión de Proyectos

### Crear un Proyecto
1. Ve a la sección "Proyectos"
2. Haz clic en el botón "+" (naranja)
3. Completa el formulario:
   - **Nombre**: Nombre descriptivo del proyecto
   - **Descripción**: Detalles del proyecto (opcional)
   - **Cliente**: Nombre del cliente o empresa
   - **Estado**: Selecciona entre:
     - `Activo`: Proyecto en curso
     - `Pausado`: Temporalmente detenido
     - `Completado`: Proyecto finalizado
     - `Cancelado`: Proyecto cancelado
4. Haz clic en "Crear Proyecto"

### Ver Detalles de un Proyecto
1. Haz clic en cualquier proyecto de la lista
2. Verás:
   - Información del proyecto
   - Lista de tareas asociadas
   - Estadísticas del proyecto
   - Tiempo total invertido

### Editar un Proyecto
1. En la vista de detalle del proyecto
2. Haz clic en el botón de editar (icono de lápiz)
3. Modifica los campos necesarios
4. Guarda los cambios

### Eliminar un Proyecto
1. En la vista de detalle del proyecto
2. Haz clic en el botón de eliminar (icono de papelera)
3. Confirma la eliminación
4. **Nota**: Se eliminan también todas las tareas asociadas

---

## Gestión de Tareas

### Crear una Tarea
1. Dentro de un proyecto, haz clic en "Nueva Tarea"
2. Completa el formulario:
   - **Título**: Nombre descriptivo de la tarea
   - **Descripción**: Detalles adicionales (opcional)
   - **Estado**: 
     - `Pendiente`: No iniciada
     - `En Proceso`: En desarrollo
     - `Completada`: Finalizada
     - `Transversal`: Tarea que afecta múltiples áreas
   - **Fecha de Vencimiento**: Fecha límite (opcional)
   - **Usuario Asignado**: Responsable de la tarea
3. Haz clic en "Crear Tarea"

### Estados de Tareas
- **Pendiente** (Amarillo): Tareas por iniciar
- **En Proceso** (Azul): Tareas actualmente en desarrollo
- **Completada** (Verde): Tareas finalizadas
- **Transversal** (Morado): Tareas que cruzan múltiples proyectos

### Editar una Tarea
1. Haz clic en el icono de editar (lápiz) en la tarea
2. Modifica los campos necesarios
3. Guarda los cambios

### Eliminar una Tarea
1. Haz clic en el icono de eliminar (papelera)
2. Confirma la eliminación
3. **Nota**: Se eliminan también todos los registros de tiempo asociados

---

## Registros de Trabajo (Diary)

El Diary es donde registras el tiempo dedicado a cada tarea diariamente.

### Ver Registros
- Los registros se agrupan por fecha
- Cada día muestra:
  - Fecha completa
  - Número de registros
  - Tiempo total del día
- Los últimos 3 días se expanden automáticamente

### Crear un Registro
1. Haz clic en el botón "+" (naranja) en un día específico
2. O haz clic en "Nuevo Registro" en la parte superior
3. Completa el formulario:
   - **Tarea**: Selecciona la tarea (obligatorio)
   - **Fecha**: Día del trabajo (obligatorio)
   - **Hora de Inicio**: Cuándo comenzaste (obligatorio)
   - **Hora de Fin**: Cuándo terminaste (obligatorio)
   - **Descripción**: Detalle de lo realizado (opcional)
4. El tiempo se calcula automáticamente
5. Haz clic en "Guardar"

### Editar un Registro
1. Haz clic en el icono de lápiz en el registro
2. Modifica los campos necesarios
3. Guarda los cambios

### Eliminar un Registro
1. Haz clic en el icono de papelera
2. Confirma la eliminación

### Generar Parte de Trabajo (Correo)
1. En cada día, hay un botón de correo (icono de sobre)
2. Al hacer clic, se abre una modal de preview con:
   - Destinatarios configurados
   - Asunto del correo
   - Cuerpo del mensaje formateado
3. Puedes:
   - **Cancelar**: Cerrar sin enviar
   - **Enviar Correo**: Abre tu cliente de correo (Thunderbird)
4. El correo incluye:
   - Tareas realizadas ese día
   - Descripción del trabajo
   - Estado de cada tarea (Finalizado/En desarrollo)
   - Horas totales imputadas
   - Firma automática con tu nombre

### Registro en Regac
1. Cada día tiene un botón de registro Regac (icono de círculo)
2. Estados:
   - **Círculo vacío (gris)**: No registrado en Regac
   - **CheckCircle (verde)**: Ya registrado en Regac
3. Haz clic para cambiar el estado
4. Esto ayuda a llevar control del registro en el sistema interno de la empresa

### Exportar Reportes
En la parte superior derecha hay un menú de exportación:
1. **Reporte Diario**: Descarga o copia registros de un día específico
2. **Reporte de Progreso**: Resume el avance de tareas
3. Formatos disponibles:
   - Descargar archivo `.txt`
   - Copiar al portapapeles

---

## Vista Kanban

Vista visual tipo tablero para gestionar tareas arrastrando y soltando.

### Columnas
- **Por Hacer**: Tareas pendientes
- **En Progreso**: Tareas en desarrollo
- **Completado**: Tareas finalizadas

### Mover Tareas
1. Haz clic y mantén presionado en una tarea
2. Arrastra a la columna deseada
3. Suelta para cambiar el estado
4. El cambio se guarda automáticamente

### Información en las Tarjetas
Cada tarjeta muestra:
- Título de la tarea
- Descripción (si existe)
- Estado con color
- Proyecto asociado
- Tiempo total invertido

### Scroll en Columnas
- Cada columna tiene altura fija (80vh - header)
- Si hay muchas tareas, aparece scroll interno en la columna
- La página principal no hace scroll
- Scrollbar estilizado (delgado y discreto)

---

## Wiki

Sistema de documentación integrado para crear y organizar páginas en Markdown.

### Estructura
- **Sin clasificar**: Páginas sin proyecto asignado
- **Por Proyecto**: Páginas agrupadas por proyecto
- **Por Tarea**: Páginas específicas de tareas dentro de proyectos

### Crear una Página
1. Haz clic en el botón "+" (naranja)
2. Completa el formulario:
   - **Título**: Nombre de la página
   - **Proyecto**: Asociar a un proyecto (opcional)
   - **Tarea**: Asociar a una tarea del proyecto (opcional)
3. Se crea con contenido inicial
4. Haz clic en "Crear página"

### Editar una Página
1. Haz clic en cualquier página de la lista
2. Se abre el editor de Markdown
3. Usa la sintaxis Markdown para formatear:
   - `# Título` para encabezados
   - `**negrita**` para texto en negrita
   - `*cursiva*` para cursiva
   - `[texto](url)` para enlaces
   - ` ```código``` ` para bloques de código
4. Vista previa en tiempo real
5. Guarda con Ctrl+S o botón de guardar

### Navegación
Panel izquierdo con árbol de navegación:
- Carpetas naranjas: Proyectos
- Iconos de check naranja: Tareas
- Iconos de documento: Páginas
- Haz clic para expandir/colapsar
- Haz clic en una página para abrirla

### Editar Metadatos
1. Botón de editar (lápiz) en cada página
2. Permite cambiar:
   - Título de la página
   - Proyecto asociado
   - Tarea asociada
3. Mueve la página en la estructura

### Eliminar una Página
1. Haz clic en el icono de papelera
2. Confirma la eliminación
3. **No se puede deshacer**

### Páginas Recientes
Panel derecho muestra las 10 páginas más recientemente modificadas con:
- Título
- Proyecto y tarea (si aplica)
- Fecha de última modificación

---

## Perfil de Usuario

### Acceder al Perfil
1. Haz clic en tu nombre en la esquina superior derecha
2. Selecciona "Mi Perfil"

### Avatar
- Muestra la inicial de tu nombre
- Fondo color naranja
- Se muestra en el perfil y en la barra superior

### Editar Información
Puedes modificar:
- **Nombre**: Tu nombre completo
- **Correo Electrónico**: Tu email de acceso

### Cambiar Contraseña
1. En la sección "Cambiar Contraseña"
2. Completa:
   - **Contraseña actual**: Tu contraseña actual (requerido)
   - **Nueva contraseña**: Mínimo 6 caracteres (requerido)
   - **Confirmar contraseña**: Repite la nueva contraseña (requerido)
3. Si no quieres cambiar la contraseña, deja los campos vacíos

### Guardar Cambios
1. Haz clic en "Guardar Cambios"
2. Los cambios se aplican inmediatamente
3. La sesión se mantiene activa

### Cerrar Sesión
1. Haz clic en tu nombre en la esquina superior derecha
2. Selecciona "Cerrar Sesión"
3. Serás redirigido a la página de inicio de sesión

---

## Temas y Personalización

### Cambiar entre Modo Claro y Oscuro
1. En la barra superior, busca el icono de sol/luna
2. Haz clic para cambiar entre temas:
   - **Modo Claro**: Fondo blanco, texto oscuro
   - **Modo Oscuro**: Fondo oscuro, texto claro
3. La preferencia se guarda automáticamente
4. Se aplica a toda la aplicación

### Colores del Sistema
- **Naranja**: Color principal de acción (botones, iconos activos)
- **Azul**: Información secundaria
- **Verde**: Éxito, completado
- **Amarillo**: Advertencia, pendiente
- **Rojo**: Error, eliminar
- **Morado**: Transversal, especial

### Navegación
Menú lateral izquierdo con acceso a:
- Dashboard
- Registros (Diary)
- Proyectos
- Kanban
- Wiki

---

## Atajos de Teclado

- **Ctrl+S / Cmd+S**: Guardar (en Notas Rápidas, Wiki)
- **Esc**: Cerrar modales
- **Tab**: Navegar entre campos en formularios

---

## Consejos y Mejores Prácticas

### Organización de Proyectos
- Usa nombres descriptivos y consistentes
- Mantén actualizado el estado de los proyectos
- Asigna todos los proyectos a un cliente

### Gestión de Tareas
- Divide tareas grandes en subtareas más pequeñas
- Actualiza el estado de las tareas regularmente
- Usa descripciones claras y detalladas
- Asigna fechas de vencimiento realistas

### Registro de Tiempo
- Registra tu tiempo diariamente
- Sé específico en las descripciones
- Revisa que las horas de inicio y fin sean correctas
- Usa el registro Regac para llevar control interno

### Documentación Wiki
- Documenta decisiones importantes
- Mantén la información actualizada
- Usa formato Markdown para mejor legibilidad
- Organiza por proyectos y tareas

### Reportes
- Genera reportes semanalmente
- Revisa tu productividad regularmente
- Usa los reportes para reuniones con el equipo

---

## Solución de Problemas

### No puedo iniciar sesión
- Verifica que el correo y contraseña sean correctos
- Asegúrate de tener conexión a internet
- Si olvidaste la contraseña, contacta al administrador

### Los cambios no se guardan
- Verifica tu conexión a internet
- Asegúrate de hacer clic en "Guardar"
- Revisa que los campos obligatorios estén completos

### No veo mis registros
- Verifica que estés filtrando por las fechas correctas
- Asegúrate de haber expandido el día correcto
- Verifica que tengas permisos para ver los registros

### El Kanban no responde
- Asegúrate de arrastrar desde el centro de la tarjeta
- Verifica que no estés en modo móvil (requiere arrastre táctil)
- Refresca la página si el problema persiste

### La Wiki no carga
- Verifica tu conexión a internet
- Refresca la página
- Verifica que tengas permisos para ver la página

---

## Soporte Técnico

Para soporte adicional o reportar problemas:
- Contacta al administrador del sistema
- Documenta el error con capturas de pantalla
- Proporciona la hora exacta en que ocurrió el problema

---

## Actualizaciones y Cambios

Esta aplicación se actualiza regularmente con nuevas funcionalidades y mejoras. Mantente atento a los anuncios de nuevas características.

### Versión Actual
- Sistema de notas rápidas con guardado en BD
- Registro Regac integrado
- Preview de correos antes de enviar
- Scroll optimizado en Kanban
- Modo oscuro completo

---

## Glosario

- **Dashboard**: Página principal con resumen de actividades
- **Diary**: Registro diario de tiempo de trabajo
- **Kanban**: Vista de tablero para gestión visual de tareas
- **Wiki**: Sistema de documentación interna
- **Regac**: Sistema interno de registro de la empresa
- **Subtask**: Registro individual de tiempo en una tarea
- **Transversal**: Tarea que afecta múltiples proyectos o áreas

---

*Última actualización: 26 de noviembre de 2025*
