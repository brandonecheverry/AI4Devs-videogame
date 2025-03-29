/**
 * Clase Player - Encapsula toda la lógica relacionada con el jugador
 * en el juego "Luz Roja, Luz Verde"
 */
class Player {
    /**
     * Constructor de la clase Player
     * @param {Phaser.Scene} scene - La escena a la que pertenece el jugador
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {Object} config - Configuración adicional del jugador
     */
    constructor(scene, x, y, config = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Configuración del jugador
        this.config = {
            color: 0x3498db,
            radius: 15,
            maxSpeed: 300,
            acceleration: 5,
            deceleration: 3,
            minSpeedThreshold: 5,
            ...config
        };
        
        // Estado del jugador
        this.speed = 0;
        this.isMoving = false;
        this.state = 'waiting'; // 'waiting', 'moving', 'paused', 'finished', 'dead'
        
        // Crear el jugador en la escena
        this.create();
    }
    
    /**
     * Crea el jugador en la escena
     */
    create() {
        // Crear el gráfico para representar al jugador
        this.graphics = this.scene.add.graphics();
        this.updateGraphics();
        
        // Crear el cuerpo físico del jugador
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, '');
        this.sprite.setCircle(this.config.radius);
        this.sprite.setDisplaySize(this.config.radius * 2, this.config.radius * 2);
        this.sprite.setVisible(false); // El sprite es invisible, usamos el gráfico
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        
        // Vinculamos el gráfico con el sprite para acceso más fácil
        this.sprite.playerGraphic = this.graphics;
    }
    
    /**
     * Actualiza el gráfico del jugador
     * @param {number} color - Color opcional para dibujar el jugador 
     */
    updateGraphics(color = null) {
        const drawColor = color || this.config.color;
        
        this.graphics.clear();
        this.graphics.fillStyle(drawColor, 1);
        this.graphics.fillCircle(
            this.sprite ? this.sprite.x : this.x, 
            this.sprite ? this.sprite.y : this.y, 
            this.config.radius
        );
    }
    
    /**
     * Acelera al jugador
     */
    accelerate() {
        if (this.state === 'dead' || this.state === 'finished') return;
        
        if (this.state !== 'moving') {
            this.state = 'moving';
            console.log("Cambiando a estado moving");
        }
        
        this.isMoving = true;
        
        // Aumentar velocidad (aceleración)
        if (this.speed < this.config.maxSpeed) {
            this.speed += this.config.acceleration;
            if (this.speed > this.config.maxSpeed) this.speed = this.config.maxSpeed;
        }
        
        // Mover al jugador hacia la derecha
        this.sprite.setVelocityX(this.speed);
        
        // Actualizar gráfico
        this.updateGraphics();
    }
    
    /**
     * Desacelera al jugador gradualmente
     * @returns {boolean} - Retorna true si el jugador se ha detenido completamente
     */
    decelerate() {
        if (this.state !== 'moving' || this.speed <= 0) return true;
        
        // Aplicar desaceleración
        this.speed -= this.config.deceleration;
        
        // Comprobar si se ha detenido
        if (this.speed <= this.config.minSpeedThreshold) {
            this.stop();
            return true;
        } else {
            // Seguir moviendo pero más lento
            this.sprite.setVelocityX(this.speed);
            this.updateGraphics();
            return false;
        }
    }
    
    /**
     * Detiene al jugador completamente
     */
    stop() {
        this.speed = 0;
        this.isMoving = false;
        this.state = 'paused';
        this.sprite.setVelocity(0);
        this.updateGraphics();
    }
    
    /**
     * Elimina al jugador (cuando pierde)
     */
    kill() {
        if (this.state === 'dead') return;
        
        this.state = 'dead';
        
        // Efecto visual de muerte
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.5,
            alpha: 0,
            y: this.sprite.y + 30,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Mancha de sangre donde murió el jugador
                this.scene.add.circle(this.sprite.x, this.sprite.y, 20, 0xff0000);
                
                // Limpiar el gráfico del jugador
                this.graphics.clear();
                
                // Mensaje de game over
                this.scene.add.text(400, 300, '¡ELIMINADO!', {
                    fontSize: '48px',
                    fill: '#ff0000'
                }).setOrigin(0.5);
                
                this.scene.add.text(400, 350, 'Presiona R para reiniciar', {
                    fontSize: '18px',
                    fill: '#fff'
                }).setOrigin(0.5);
                
                // Permitir reiniciar
                this.enableRestart();
            }
        });
    }
    
    /**
     * Marca al jugador como ganador
     */
    reachFinish() {
        if (this.state === 'dead' || this.state === 'finished') return;
        
        this.state = 'finished';
        this.sprite.setVelocity(0);
        
        // Cambiar color del jugador a verde al ganar
        this.updateGraphics(0x00ff00);
        
        // Mensaje de victoria
        this.scene.add.text(400, 300, '¡META ALCANZADA!', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        this.scene.add.text(400, 350, 'Presiona R para reiniciar', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Permitir reiniciar
        this.enableRestart();
    }
    
    /**
     * Habilita la opción de reiniciar con la tecla R
     */
    enableRestart() {
        this.scene.input.keyboard.once('keydown-R', () => {
            this.scene.scene.restart();
        });
    }
    
    /**
     * Actualiza el jugador en cada frame
     */
    update() {
        // Solo actualizar el gráfico si el jugador está vivo
        if (this.state !== 'dead') {
            this.updateGraphics();
        }
    }
    
    /**
     * Retorna el estado actual del jugador
     * @returns {string} - Estado del jugador
     */
    getState() {
        return this.state;
    }
    
    /**
     * Retorna si el jugador está en movimiento
     * @returns {boolean} - true si está moviéndose
     */
    isPlayerMoving() {
        return this.isMoving;
    }
    
    /**
     * Retorna el sprite físico del jugador
     * @returns {Phaser.Physics.Arcade.Sprite} - Sprite del jugador
     */
    getSprite() {
        return this.sprite;
    }
}

// Exportar la clase para poder utilizarla en otros archivos
export default Player; 