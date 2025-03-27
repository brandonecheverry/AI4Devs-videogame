# Entorno Básico con Planck.js

Un proyecto básico que utiliza Planck.js para crear un entorno físico 2D con Canvas.

## Descripción

Este proyecto implementa un escenario estático simple con:
- Un suelo estático que ocupa todo el ancho inferior
- Dos plataformas estáticas en los extremos izquierdo y derecho
- Renderizado con Canvas para visualizar los objetos

El código está modularizado en archivos independientes:
- `Environment.js`: Gestiona el entorno físico y los objetos
- `Renderer.js`: Se encarga de la visualización de los objetos en el canvas

## Instalación

1. Clona este repositorio
2. Instala las dependencias:
```
npm install
```

## Ejecución

Para ejecutar el proyecto:
```
npm start
```

Luego abre tu navegador en `http://localhost:3000`

## Estructura del Proyecto

```
├── index.html          # Página principal con el canvas
├── index.js            # Punto de entrada que inicializa el entorno
├── Environment.js      # Módulo para el entorno físico
├── Renderer.js         # Módulo para la visualización
├── package.json        # Configuración y dependencias
└── README.md           # Este archivo
```

## Tecnologías Utilizadas

- [Planck.js](https://github.com/shakiba/planck.js/): Motor de física 2D
- JavaScript (ES6+)
- HTML5 Canvas 