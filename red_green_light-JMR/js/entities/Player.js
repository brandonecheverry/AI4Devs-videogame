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
            radius: 15, // Mantenemos para cálculos de colisión
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
        // Crear el sprite del jugador
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'penguin_walk1');
        
        // Configurar el tamaño y la física
        this.sprite.setDisplaySize(40, 40); // Ajustar según el tamaño del sprite
        this.sprite.setBodySize(30, 30);    // Ajustar la hitbox para colisiones
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setBounce(0);
        
        // Actualizar la animación inicial
        this.updateAnimation();
    }
    
    /**
     * Actualiza la animación del jugador según su estado
     */
    updateAnimation() {
        switch (this.state) {
            case 'waiting':
                this.sprite.setTexture('penguin_walk1');
                this.sprite.anims.stop();
                break;
            case 'moving':
                if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== 'walk') {
                    this.sprite.play('walk');
                }
                break;
            case 'paused':
                // Mostrar al pingüino estático en lugar de deslizándose
                this.sprite.setTexture('penguin_walk1');
                this.sprite.anims.stop();
                break;
            case 'finished':
                this.sprite.setTexture('penguin_walk1');
                this.sprite.anims.stop();
                // Podríamos añadir una animación de victoria si tuviéramos
                break;
            case 'dead':
                // La animación de muerte se maneja en el método kill()
                break;
            default:
                break;
        }
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
        
        // Actualizar animación
        this.updateAnimation();
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
            this.updateAnimation();
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
        this.updateAnimation();
    }
    
    /**
     * Elimina al jugador (cuando pierde)
     */
    kill() {
        if (this.state === 'dead') return;
        
        this.state = 'dead';
        
        // Detener inmediatamente toda velocidad e inercia
        this.speed = 0;
        this.sprite.setVelocity(0);
        
        // Reproducir efecto de sonido de pistola
        if (this.scene.cache.audio.exists('pistol')) {
            this.scene.sound.play('pistol', { volume: 0.5 });
        }
        
        // Reproducir la animación de muerte
        this.sprite.play('die');
        
        // Efecto de salto al morir
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 50, // Primero salta hacia arriba
            duration: 300,
            ease: 'Power1',
            onComplete: () => {
                // Luego cae al suelo
                this.scene.tweens.add({
                    targets: this.sprite,
                    y: this.sprite.y + 80, // Cae más abajo que la posición original
                    duration: 500,
                    ease: 'Bounce.Out',
                    onComplete: () => {
                        // Crear múltiples manchas de sangre donde cayó el jugador
                        this.createBloodSplatter(this.sprite.x, this.sprite.y);
                        
                        // Mensaje de game over
                        this.scene.add.text(400, 300, '¡ELIMINADO!', {
                            fontSize: '48px',
                            fill: '#ff0000',
                            stroke: '#000000',
                            strokeThickness: 4,
                            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
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
        });
    }
    
    /**
     * Crea un efecto de salpicadura de sangre
     * @param {number} x - Posición X 
     * @param {number} y - Posición Y
     */
    createBloodSplatter(x, y) {
        // Mancha principal
        this.scene.add.circle(x, y + 15, 20, 0xff0000, 0.8);
        
        // Manchas más pequeñas alrededor
        for (let i = 0; i < 5; i++) {
            const offsetX = Phaser.Math.Between(-30, 30);
            const offsetY = Phaser.Math.Between(-10, 20);
            const size = Phaser.Math.Between(5, 10);
            const alpha = Phaser.Math.FloatBetween(0.4, 0.7);
            
            this.scene.add.circle(x + offsetX, y + 15 + offsetY, size, 0xff0000, alpha);
        }
    }
    
    /**
     * Marca al jugador como ganador
     */
    reachFinish() {
        if (this.state === 'dead' || this.state === 'finished') return;
        
        this.state = 'finished';
        this.sprite.setVelocity(0);
        
        // Establecer animación de victoria (usar el primer frame de caminar)
        this.sprite.setTexture('penguin_walk1');
        this.sprite.setTint(0x00ff00); // Tinte verde para indicar victoria
        
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
        // Solo actualizar la animación si el jugador está vivo
        if (this.state !== 'dead') {
            this.updateAnimation();
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