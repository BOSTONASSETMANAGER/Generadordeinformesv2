# Guía para Crear Nuevas Páginas - Boston Asset Manager

## Introducción

Esta guía proporciona las pautas y estándares para crear nuevas páginas en el proyecto de Boston Asset Manager. El proyecto está implementado como código HTML estático personalizado dentro de páginas de WordPress Gutenberg.

## Estructura del Proyecto

### Arquitectura General
- **Plataforma**: WordPress con páginas Gutenberg personalizadas
- **Implementación**: HTML estático con CSS inline y JavaScript cuando sea necesario
- **Viewport**: Diseño responsive que se extiende a todo el ancho del viewport
- **Contenedor**: Sin etiquetas `<html>`, `<head>` o `<body>` globales (solo secciones)

### Tipos de Archivos
- **Páginas completas**: Archivos `.html` con estructura completa (ej: `Inicio.html`, `dashboard_nuevo.html`)
- **Secciones modulares**: Componentes reutilizables (ej: `Educacionfinancierainicio.html`, `calculadoras.html`)
- **Funciones**: `functions.php` para funcionalidades WordPress

## Paleta de Colores y Variables CSS

### Variables CSS Estándar
Todas las páginas deben usar estas variables CSS consistentes:

```css
.nombre-seccion-estatico {
  --saas-primary: #1d3969;      /* Azul principal */
  --saas-accent: #2563eb;       /* Azul de acento */
  --saas-light: #f8fafc;        /* Gris claro de fondo */
  --saas-border: #e2e8f0;       /* Bordes */
  --saas-text: #374151;         /* Texto principal */
  --saas-muted: #64748b;        /* Texto secundario */
  --saas-success: #059669;      /* Verde de éxito */
}
```

### Colores Adicionales
- **Gradientes**: `linear-gradient(135deg, var(--saas-primary), var(--saas-accent))`
- **Fondo general**: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)`
- **Sombras**: `rgba(29, 57, 105, 0.1)` a `rgba(29, 57, 105, 0.3)`

## Iconos y Emojis - Guía de Estilo

### Estilo Visual Obligatorio
**IMPORTANTE**: Todos los iconos y emojis deben seguir el estilo minimalista con contenedor de fondo.

### Estructura de Iconos
Los iconos deben estar contenidos en un div con las siguientes características:

```css
.icono-contenedor {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, rgba(29, 57, 105, 0.08), rgba(37, 99, 235, 0.08));
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
}
```

### Iconos SVG Recomendados
Usar iconos SVG de Lucide/Feather con estas características:
- **Stroke width**: 2
- **Tamaño**: 20-24px
- **Color**: `currentColor` (hereda del contenedor)
- **Estilo**: Line icons (outline, no fill)

### Ejemplos de Implementación

#### Tarjetas con Iconos
```html
<div class="card">
    <div class="card-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
    </div>
    <h3 class="card-title">Título</h3>
</div>
```

#### Iconos en Títulos
```html
<h3 class="section-title">
    <span class="title-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
        </svg>
    </span>
    Título de Sección
</h3>
```

### Iconos Comunes y Sus SVG

#### Finanzas y Dinero
```html
<!-- Dólar/Dinero -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
</svg>

<!-- Gráfico de Barras -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
</svg>
```

#### Navegación y Acciones
```html
<!-- Globo/Internacional -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
</svg>

<!-- Objetivo/Target -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
</svg>

<!-- Visión/Ojo -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
</svg>

<!-- Estrella/Valores -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>
```

### NO Usar
❌ **Evitar**:
- Emojis sin contenedor de fondo
- Iconos de diferentes estilos mezclados
- Iconos con fill (relleno sólido) sin ser consistente
- Tamaños inconsistentes
- Colores directos en lugar de currentColor

✅ **Usar**:
- Iconos SVG con stroke
- Contenedores con fondo gradiente sutil
- Tamaños consistentes (60px para tarjetas, 50px para títulos)
- Border-radius de 10-12px
- currentColor para heredar colores

## Estructura de Archivos

### Para Páginas Completas
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título de la Página - Boston Asset Manager</title>
    <style>
        /* CSS aquí */
    </style>
</head>
<body>
    <!-- Contenido de la página -->
</body>
</html>
```

### Para Secciones Modulares (WordPress Gutenberg)
```html
<div class="nombre-seccion-estatico">
    <!-- Secciones aquí -->
    <section class="nombre-section">
        <div class="nombre-container">
            <!-- Contenido -->
        </div>
    </section>
</div>

<style>
/* Prevenir scroll horizontal global */
body {
    overflow-x: hidden;
}

/* CSS scoped solo para esta sección */
.nombre-seccion-estatico {
    /* Variables CSS */
}

.nombre-seccion-estatico * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Resto de estilos */
</style>
```

## Componentes y Secciones Estándar

### 1. Hero Section
Estructura típica para secciones principales:

```html
<section class="hero-section">
    <div class="hero-container">
        <div class="hero-content">
            <h1 class="hero-title">Título Principal</h1>
            <p class="hero-subtitle">Subtítulo descriptivo</p>
            <p class="hero-description">Descripción detallada del contenido.</p>
            <a href="#" class="hero-cta">Botón de Acción</a>
        </div>
        <div class="hero-image">
            <!-- Imagen o contenido visual -->
        </div>
    </div>
</section>
```

#### Background Animado para Hero
Para agregar un fondo animado con puntos flotantes al hero section:

```css
.hero-section {
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    position: relative;
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
    animation: hero-float 20s infinite linear;
}

@keyframes hero-float {
    0% {
        transform: translateY(0px) rotate(0deg);
    }
    100% {
        transform: translateY(-100px) rotate(360deg);
    }
}

.hero-container {
    position: relative;
    z-index: 2;
}
```

**Nota**: Este patrón crea un efecto de puntos blancos semi-transparentes que flotan y rotan continuamente, agregando dinamismo visual al hero sin distraer del contenido.

### 2. Cards/Tarjetas
Para mostrar información en formato de tarjetas:

```html
<div class="cards-grid">
    <div class="card-item">
        <div class="card-content">
            <div class="card-icon">
                <!-- SVG o icono -->
            </div>
            <h3 class="card-title">Título de la Tarjeta</h3>
            <p class="card-description">Descripción del contenido.</p>
            <a href="#" class="card-cta">Ver más</a>
        </div>
    </div>
</div>
```

### 3. Secciones de Estadísticas
Para mostrar números y métricas:

```html
<div class="stats-grid">
    <div class="stat-item">
        <div class="stat-icon">
            <!-- Icono -->
        </div>
        <div class="stat-number">9.520</div>
        <div class="stat-label">Descripción</div>
    </div>
</div>
```

## Estilos CSS Estándar

### Reset y Base
```css
/* IMPORTANTE: Prevenir scroll horizontal global */
body {
    overflow-x: hidden;
}

.seccion-estatico * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.seccion-estatico .seccion-section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: white;
    color: var(--saas-text);
    padding: 100px 0;
    position: relative;
    overflow: hidden;
    /* EXTENSIÓN A TODO EL VIEWPORT */
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    min-height: 800px;
}
```

### Ajuste de Espaciado con Navbar y Footer
**IMPORTANTE**: Para eliminar el espacio blanco entre el navbar y el contenido, y entre el contenido y el footer:

```css
/* Aplicar margin-top: -60px en la PRIMERA SECCIÓN (hero/header) */
.seccion-estatico .primera-seccion {
    margin-top: -60px;
}

/* Aplicar margin-bottom: -60px en la ÚLTIMA SECCIÓN */
.seccion-estatico .ultima-seccion {
    margin-bottom: -60px;
}
```

**Ejemplo completo:**
```css
/* Hero Section - Primera sección de la página */
.seccion-estatico .seccion-hero {
    position: relative;
    overflow: hidden;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-top: -60px;  /* Elimina espacio con navbar */
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    padding: 100px 0 80px 0;
    min-height: 350px;
}

/* Última sección de la página */
.seccion-estatico .seccion-final {
    margin-bottom: -60px;  /* Elimina espacio con footer */
}
```

**Nota**: El `margin-top: -60px` debe aplicarse directamente en el section hero/primera sección, NO en el contenedor padre `.seccion-estatico`.

### Contenedores
```css
.seccion-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 30px;
    position: relative;
    z-index: 2;
    width: 100%;
}
```

### Tipografía
```css
/* Títulos principales */
.title {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 20px;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--saas-primary);
}

/* Subtítulos */
.subtitle {
    font-size: 1.4rem;
    margin-bottom: 30px;
    opacity: 0.9;
    line-height: 1.5;
    color: var(--saas-muted);
}

/* Descripción */
.description {
    font-size: 1.2rem;
    margin-bottom: 40px;
    opacity: 0.8;
    line-height: 1.6;
    color: var(--saas-text);
}
```

### Botones CTA
```css
.cta-button {
    display: inline-block;
    background: linear-gradient(135deg, var(--saas-primary), var(--saas-accent));
    color: white;
    padding: 15px 35px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 700;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(29, 57, 105, 0.3);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
    color: white;
    text-decoration: none;
}
```

## Responsive Design

### Breakpoints Estándar
```css
/* Móvil */
@media (max-width: 768px) {
    .seccion-section {
        width: 100%;
        margin-left: 0;
        padding: 60px 0;
    }
    
    .seccion-container {
        padding: 0 15px;
    }
    
    .title {
        font-size: 2.2rem;
    }
}

/* Tablet */
@media (max-width: 1024px) {
    .seccion-container {
        padding: 0 30px;
    }
}
```

## Animaciones

### Efectos de Entrada
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animated-element {
    animation: fadeInUp 0.6s ease-out forwards;
}
```

### Hover Effects
```css
.hover-element {
    transition: all 0.3s ease;
}

.hover-element:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(29, 57, 105, 0.12);
}
```

## Nomenclatura y Convenciones

### Clases CSS
- **Contenedor principal**: `.nombre-seccion-estatico`
- **Sección**: `.nombre-section`
- **Contenedor**: `.nombre-container`
- **Elementos**: `.nombre-element`

### Archivos
- **Páginas completas**: `nombre-pagina.html`
- **Secciones**: `nombre-seccion.html`
- **Documentación**: `nombre-documento.md`

## Integración con WordPress

### Shortcodes Comunes
- **Gráficos**: `[ninja_charts id="1"]`
- **Testimonios**: `[trustindex no-registration=google]`
- **Formularios**: Usar plugins de WordPress

### Enlaces
- **Internos**: `https://bostonam.ar/pagina-interna/`
- **Externos**: Agregar `target="_blank"`
- **WhatsApp**: `https://wa.me/5491234567890`

## Checklist para Nuevas Páginas

### Antes de Crear
- [ ] Definir el propósito y contenido de la página
- [ ] Identificar si es página completa o sección modular
- [ ] Revisar páginas similares existentes para consistencia

### Durante la Creación
- [ ] Usar variables CSS estándar
- [ ] Implementar estructura responsive
- [ ] Agregar animaciones apropiadas
- [ ] Optimizar para viewport completo
- [ ] Incluir estados hover y focus

### Después de Crear
- [ ] Probar en diferentes dispositivos
- [ ] Verificar accesibilidad
- [ ] Validar HTML y CSS
- [ ] Probar enlaces y funcionalidades
- [ ] Documentar componentes nuevos

## Ejemplos de Referencia

### Páginas Completas
- `Inicio.html` - Página de inicio con múltiples secciones
- `dashboard_nuevo.html` - Dashboard con tabs y contenido dinámico
- `financiamiento.html` - Página de servicios

### Secciones Modulares
- `Educacionfinancierainicio.html` - Sección educativa
- `calculadoras.html` - Grid de herramientas
- `hero-lecaps.html` - Sección hero específica

## Notas Importantes

1. **Texto Inmutable**: El texto de las páginas debe respetarse exactamente como se proporciona, sin modificaciones.

2. **HTML Completo**: Siempre proporcionar archivos HTML completos para copiar y pegar.

3. **Código Estático**: Usar solo HTML, CSS y JavaScript vanilla - no frameworks externos.

4. **Viewport Completo**: Las secciones deben extenderse a todo el ancho del viewport usando:
   ```css
   width: 100vw;
   margin-left: calc(-50vw + 50%);
   ```

5. **Scoped CSS**: Para secciones modulares, todo el CSS debe estar scoped al contenedor principal.

6. **Prevenir Scroll Horizontal**: **SIEMPRE** incluir al inicio del CSS:
   ```css
   body {
       overflow-x: hidden;
   }
   ```
   Esto es **OBLIGATORIO** en todas las páginas para evitar desplazamiento horizontal no deseado causado por elementos que se extienden al 100vw.

Esta guía debe seguirse para mantener la consistencia visual y funcional en todo el proyecto de Boston Asset Manager.