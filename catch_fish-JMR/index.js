/**
 * index.js - Punto de entrada para la aplicación
 * Inicializa el entorno físico y el renderizador
 */

import Environment from './Environment.js';
import Renderer from './Renderer.js';

// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el elemento canvas
    const canvas = document.getElementById('canvas');
    
    // Comprobar si el navegador soporta canvas
    if (!canvas.getContext) {
        console.error('Tu navegador no soporta el elemento canvas');
        return;
    }
    
    // Crear el entorno físico
    const environment = new Environment();
    
    // Crear el renderizador
    const renderer = new Renderer(
        canvas, 
        environment.worldWidth, 
        environment.worldHeight
    );
    
    // Configurar un bucle de animación para la simulación
    let lastTime;
    const fps = 60;
    const timeStep = 1 / fps;
    
    function animate(time) {
        // Calcular el tiempo delta si es la primera iteración
        if (lastTime === undefined) {
            lastTime = time;
        }
        
        // Ejecutar un paso en la simulación física
        environment.step(timeStep);
        
        // Obtener todos los cuerpos para renderizar
        const bodies = environment.getBodies();
        
        // Renderizar los cuerpos
        renderer.render(bodies);
        
        // Actualizar la última marca de tiempo
        lastTime = time;
        
        // Solicitar el siguiente frame de animación
        requestAnimationFrame(animate);
    }
    
    // Iniciar el bucle de animación
    requestAnimationFrame(animate);
    
    console.log('Entorno de simulación iniciado correctamente');
}); 