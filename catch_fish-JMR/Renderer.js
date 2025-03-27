/**
 * Renderer.js - Módulo para renderizar los objetos físicos en el canvas
 */

export default class Renderer {
    /**
     * Constructor del renderizador
     * @param {HTMLCanvasElement} canvas - El elemento canvas para renderizar
     * @param {number} worldWidth - Ancho del mundo en unidades de Planck
     * @param {number} worldHeight - Alto del mundo en unidades de Planck
     */
    constructor(canvas, worldWidth, worldHeight) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        // Calcular la escala para la conversión de unidades del mundo a píxeles
        this.scale = Math.min(
            this.canvas.width / this.worldWidth,
            this.canvas.height / this.worldHeight
        );
    }
    
    /**
     * Limpia el canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Renderiza todos los cuerpos del mundo
     * @param {Array} bodies - Lista de cuerpos a renderizar
     */
    render(bodies) {
        this.clear();
        
        // Para cada cuerpo en el mundo
        bodies.forEach(body => {
            // Solo renderizar si el cuerpo tiene fixtures
            const position = body.getPosition();
            const angle = body.getAngle();
            
            // Para cada fixture del cuerpo
            for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                // Configurar el estilo de renderizado
                this.ctx.fillStyle = '#3498db'; // Color azul para todos los objetos
                
                // Guardar el estado actual del contexto
                this.ctx.save();
                
                // Transformar el contexto según la posición y rotación del cuerpo
                this.ctx.translate(
                    position.x * this.scale,
                    position.y * this.scale
                );
                this.ctx.rotate(angle);
                
                // Obtener la forma del fixture
                const shape = fixture.getShape();
                
                // Renderizar según el tipo de forma
                switch (shape.getType()) {
                    case 'polygon':
                        this.renderPolygon(shape);
                        break;
                    case 'circle':
                        this.renderCircle(shape);
                        break;
                    // Aquí podrían añadirse más casos para otros tipos de formas
                }
                
                // Restaurar el estado del contexto
                this.ctx.restore();
            }
        });
    }
    
    /**
     * Renderiza una forma poligonal (incluyendo cajas)
     * @param {Object} shape - La forma a renderizar
     */
    renderPolygon(shape) {
        const vertices = shape.m_vertices;
        
        if (vertices.length === 0) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x * this.scale, vertices[0].y * this.scale);
        
        for (let i = 1; i < vertices.length; i++) {
            this.ctx.lineTo(vertices[i].x * this.scale, vertices[i].y * this.scale);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * Renderiza una forma circular
     * @param {Object} shape - La forma a renderizar
     */
    renderCircle(shape) {
        const radius = shape.m_radius;
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * this.scale, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#2980b9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
} 