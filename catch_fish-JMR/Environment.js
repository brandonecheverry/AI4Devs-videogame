/**
 * Environment.js - Módulo para configurar el entorno físico y los objetos estáticos
 */

// Exportamos la clase Environment
export default class Environment {
    constructor() {
        // Crear el mundo con gravedad
        this.world = planck.World({
            gravity: planck.Vec2(0, 10) // Gravedad vertical hacia abajo
        });
        
        // Inicializar el mundo con objetos estáticos
        this.initializeWorld();
    }
    
    /**
     * Inicializa el mundo con objetos estáticos: suelo y plataformas
     */
    initializeWorld() {
        // Dimensiones del mundo
        this.worldWidth = 80; // En unidades de Planck (metros)
        this.worldHeight = 60;
        
        // Crear el suelo estático
        this.createGround();
        
        // Crear las plataformas en los extremos
        this.createLeftPlatform();
        this.createRightPlatform();
    }
    
    /**
     * Crea el suelo estático en la parte inferior
     */
    createGround() {
        // Crear un cuerpo estático para el suelo
        const ground = this.world.createBody({
            type: 'static',
            position: planck.Vec2(this.worldWidth / 2, this.worldHeight - 1)
        });
        
        // Añadir fixture rectangular para el suelo
        ground.createFixture({
            shape: planck.Box(this.worldWidth / 2, 1), // Ancho completo, altura de 1
            friction: 0.6
        });
    }
    
    /**
     * Crea una plataforma en el extremo izquierdo
     */
    createLeftPlatform() {
        // Crear un cuerpo estático para la plataforma izquierda
        const leftPlatform = this.world.createBody({
            type: 'static',
            position: planck.Vec2(10, this.worldHeight - 15)
        });
        
        // Añadir fixture rectangular para la plataforma
        leftPlatform.createFixture({
            shape: planck.Box(8, 0.5), // Dimensiones de la plataforma
            friction: 0.6
        });
    }
    
    /**
     * Crea una plataforma en el extremo derecho
     */
    createRightPlatform() {
        // Crear un cuerpo estático para la plataforma derecha
        const rightPlatform = this.world.createBody({
            type: 'static',
            position: planck.Vec2(this.worldWidth - 10, this.worldHeight - 15)
        });
        
        // Añadir fixture rectangular para la plataforma
        rightPlatform.createFixture({
            shape: planck.Box(8, 0.5), // Dimensiones de la plataforma
            friction: 0.6
        });
    }
    
    /**
     * Realiza un paso en la simulación física
     * @param {number} timeStep - Paso de tiempo en segundos
     */
    step(timeStep) {
        this.world.step(timeStep);
    }
    
    /**
     * Obtiene todos los cuerpos del mundo para renderizar
     * @returns {Array} - Lista de cuerpos en el mundo
     */
    getBodies() {
        const bodies = [];
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            bodies.push(body);
        }
        return bodies;
    }
} 