# Guía de Estilo Apple-like

## 🎨 Filosofía de Diseño

El diseño de Wigac está inspirado en los principios de diseño de Apple: **simplicidad, claridad y elegancia**. Cada elemento debe ser funcional y hermoso a la vez.

### Principios Fundamentales

1. **Minimalismo**: Menos es más. Elimina lo innecesario.
2. **Jerarquía Visual**: Usa tamaño, color y espacio para guiar al usuario.
3. **Consistencia**: Mantén patrones consistentes en toda la app.
4. **Atención al Detalle**: Los pequeños detalles marcan la diferencia.
5. **Animaciones Sutiles**: Movimiento significativo, no decorativo.

## 🎨 Paleta de Colores

### Colores Principales

```javascript
// Apple Blue - Acción primaria
primary: '#007aff'

// Grises - Textos y fondos
gray-50: '#fafafa'
gray-100: '#f5f5f7'
gray-200: '#e8e8ed'
gray-300: '#d2d2d7'
gray-500: '#86868b'
gray-700: '#515154'
gray-900: '#1d1d1f'
```

### Colores Semánticos

```javascript
// Success
green: '#34c759'

// Warning
orange: '#ff9500'

// Error
red: '#ff3b30'

// Info
blue: '#007aff'

// Purple
purple: '#af52de'
```

### Uso de Colores

- **Fondos**: Grises muy claros (50, 100, 200)
- **Textos principales**: gray-900
- **Textos secundarios**: gray-600, gray-500
- **Acciones primarias**: Apple Blue (#007aff)
- **Bordes sutiles**: gray-200, gray-300

## 📝 Tipografía

### Fuente Principal

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
             'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
```

### Escala Tipográfica

```javascript
text-xs: 12px    // Subtextos, metadatos
text-sm: 14px    // Textos secundarios
text-base: 16px  // Textos normales
text-lg: 18px    // Títulos pequeños
text-xl: 20px    // Títulos medianos
text-2xl: 24px   // Títulos grandes
text-3xl: 30px   // Títulos principales
```

### Pesos de Fuente

```javascript
font-light: 300     // Textos delicados
font-normal: 400    // Textos normales
font-medium: 500    // Textos destacados
font-semibold: 600  // Títulos
font-bold: 700      // Énfasis fuerte
```

## 🔲 Espaciado

### Sistema de Espaciado 8px

Usa múltiplos de 8px para consistencia:

```javascript
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-6: 24px
space-8: 32px
space-12: 48px
space-16: 64px
```

### Aplicación

```jsx
// Padding en cards
p-6  // 24px - estándar para contenido

// Gap entre elementos
gap-3  // 12px - elementos relacionados
gap-4  // 16px - elementos separados
gap-6  // 24px - secciones

// Margin entre secciones
space-y-6  // 24px vertical
space-y-8  // 32px vertical
```

## 🔘 Bordes Redondeados

```javascript
// Esquinas redondeadas estilo Apple
rounded-apple: 12px      // Botones, inputs, cards
rounded-apple-lg: 16px   // Cards grandes
rounded-apple-xl: 20px   // Modales, containers

// Elementos circulares
rounded-full            // Avatares, badges
```

## 🎭 Glassmorphism

### Efecto Glass

```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-dark {
  background: rgba(29, 29, 31, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Uso

- Navbars y headers
- Modales y overlays
- Cards flotantes
- Sidebars semitransparentes

## 🌑 Sombras

### Sombras Sutiles

```javascript
// Sombras tipo Apple
shadow-apple: '0 2px 10px rgba(0, 0, 0, 0.08)'
shadow-apple-lg: '0 4px 20px rgba(0, 0, 0, 0.12)'
shadow-apple-xl: '0 8px 30px rgba(0, 0, 0, 0.15)'
```

### Aplicación

```jsx
// Cards estáticos
shadow-apple

// Cards con hover
hover:shadow-apple-lg

// Modales y elementos flotantes
shadow-apple-xl
```

## 🔘 Botones

### Variantes

```jsx
// Primary - Acción principal
<Button variant="primary">
  // bg-apple-blue-500, text-white

// Secondary - Acción secundaria
<Button variant="secondary">
  // glass effect, text-gray-900

// Ghost - Acción terciaria
<Button variant="ghost">
  // transparent bg, hover:bg-gray-100

// Danger - Acción destructiva
<Button variant="danger">
  // bg-red-500, text-white
```

### Tamaños

```jsx
<Button size="sm">  // px-3 py-1.5 text-sm
<Button size="md">  // px-4 py-2.5 text-base (default)
<Button size="lg">  // px-6 py-3 text-lg
```

### Estados

- **Default**: Estado normal
- **Hover**: Cambio sutil de color/shadow
- **Active**: Ligeramente más oscuro
- **Disabled**: Opacity 50%, cursor not-allowed
- **Loading**: Spinner animado

## 📦 Cards

### Estructura

```jsx
<Card hover glass>
  <CardHeader>
    <h2>Título</h2>
  </CardHeader>
  <CardBody>
    Contenido principal
  </CardBody>
  <CardFooter>
    Acciones o metadata
  </CardFooter>
</Card>
```

### Propiedades

- `glass`: Efecto glassmorphism
- `hover`: Animación al pasar el mouse
- `className`: Clases adicionales

## 📝 Inputs y Forms

### Inputs

```jsx
<Input
  label="Email"
  placeholder="tu@email.com"
  icon={<Mail />}
  error="Error message"
/>
```

### Características

- Border radius: 12px
- Border color: gray-300
- Focus: Blue ring sutil
- Error state: Red border + message
- Icon support: Posición left

### Switch

```jsx
<Switch
  checked={value}
  onChange={setValue}
  label="Notificaciones"
/>
```

Estilo iOS:
- Verde cuando activo (#34c759)
- Gris cuando inactivo
- Animación suave de transición

## 🎯 Iconos

### Librería: Lucide React

```jsx
import { Plus, Edit, Trash, Check } from 'lucide-react'

<Plus className="w-5 h-5" />
```

### Tamaños Estándar

- `w-4 h-4`: 16px - Iconos pequeños
- `w-5 h-5`: 20px - Iconos normales
- `w-6 h-6`: 24px - Iconos grandes
- `w-8 h-8`: 32px - Iconos destacados

## ✨ Animaciones

### Transiciones

```css
// Transición estándar
transition-all duration-200 ease-in-out

// Hover effects
hover:scale-105 transition-transform
```

### Animaciones Custom

```javascript
// Fade in
animate-fade-in: 'fadeIn 0.3s ease-in-out'

// Slide in
animate-slide-in: 'slideIn 0.3s ease-out'

// Slide up
animate-slide-up: 'slideUp 0.3s ease-out'
```

### Uso

- Aparición de modales: fade-in + slide-up
- Hover en cards: scale + shadow
- Transiciones de página: fade-in
- Loading states: spinner rotation

## 📱 Responsive Design

### Breakpoints

```javascript
sm: '640px'    // Móvil grande
md: '768px'    // Tablet
lg: '1024px'   // Desktop
xl: '1280px'   // Desktop grande
```

### Grid Layout

```jsx
// Cards responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Mobile First

- Diseñar primero para móvil
- Agregar complejidad en pantallas grandes
- Sidebar colapsable en móvil

## 🎨 Componentes Específicos

### Sidebar

- Width: 256px (w-64)
- Glass effect
- Border right sutil
- Hover en items: bg-gray-100
- Active item: bg-blue-500 + white text

### Header

- Glass effect
- Fixed position
- z-index alto
- Border bottom sutil
- Search bar con icon

### Modal

- Backdrop: black/30 + blur
- Content: glass effect
- Border radius: 20px
- Shadow: xl
- Close button: subtle

### Table

- Header: bg-gray-50
- Hover row: bg-gray-50
- Border: subtle gray-200
- Cell padding: px-6 py-4

### Tags

- Rounded: full
- Size: sm/md
- Colors: semantic
- Font: medium

## 📐 Layout Patterns

### Dashboard Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map(stat => <StatCard />)}
</div>
```

### Main Content

```jsx
<main className="p-8 space-y-8">
  <Header />
  <Content />
</main>
```

### Spacing

- Padding contenedor: p-8 (32px)
- Gap entre cards: gap-6 (24px)
- Space entre secciones: space-y-8 (32px)

## ✅ Checklist de Diseño

Al crear un nuevo componente, verifica:

- [ ] Usa la paleta de colores Apple
- [ ] Bordes redondeados (12px+)
- [ ] Sombras sutiles
- [ ] Espaciado consistente (múltiplos de 8)
- [ ] Tipografía SF Pro
- [ ] Transiciones suaves
- [ ] Estados hover/active definidos
- [ ] Responsive design
- [ ] Glassmorphism donde aplique
- [ ] Iconos Lucide de tamaño correcto

## 🎯 Ejemplos Prácticos

### Card con Glassmorphism

```jsx
<Card glass hover className="transition-all duration-200">
  <CardBody className="flex items-center gap-4">
    <div className="p-3 rounded-apple bg-blue-100">
      <Icon className="w-6 h-6 text-blue-500" />
    </div>
    <div>
      <p className="text-sm text-gray-600">Label</p>
      <p className="text-2xl font-semibold text-gray-900">Value</p>
    </div>
  </CardBody>
</Card>
```

### Button con Icon

```jsx
<Button
  variant="primary"
  icon={<Plus className="w-5 h-5" />}
  className="shadow-apple hover:shadow-apple-lg"
>
  Nuevo Proyecto
</Button>
```

### Modal Backdrop

```jsx
<div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40">
  <div className="glass rounded-apple-xl shadow-apple-xl">
    {/* Content */}
  </div>
</div>
```

---

**Última actualización**: 2024-01-15
**Inspirado en**: Apple Human Interface Guidelines
