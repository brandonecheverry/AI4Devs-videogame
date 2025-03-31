class Powerup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Inicializar el sprite con la textura del tipo de power-up
        super(scene, x, y, `powerup_${type}`);
        
        // Añadir el power-up a la escena y habilitar física
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar propiedades físicas y visuales
        this.body.setSize(24, 24);        // Ajustar el área de colisión
        this.body.setOffset(4, 4);        // Centrar la colisión con el sprite
        this.setDepth(1);                 // Asegurar que el power-up se dibuje sobre el fondo
        this.body.setBounce(0.4);         // Rebote ligero
        this.body.setCollideWorldBounds(true); // Evitar que salga del mundo
        
        // Tipo de power-up
        this.type = type;
        
        // Estado
        this.isCollected = false;
        
        // Efecto de animación (flotar arriba y abajo)
        this.floatEffect();
        
        // Para power-ups que necesitan desaparecer después de un tiempo
        if (type === 'invincible' || type === 'points') {
            this.setLifespan(10000); // 10 segundos de vida
        }
    }
    
    // Efecto visual de flotar
    floatEffect() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Brillo pulsante
        this.scene.tweens.add({
            targets: this,
            alpha: 0.8,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    // Establecer tiempo de vida para power-ups temporales
    setLifespan(time) {
        // Parpadeo final
        this.scene.time.delayedCall(time - 3000, () => {
            if (!this.active || this.isCollected) return;
            
            // Animación de parpadeo para indicar que va a desaparecer
            this.scene.tweens.add({
                targets: this,
                alpha: 0.2,
                duration: 200,
                ease: 'Linear',
                yoyo: true,
                repeat: 8
            });
        });
        
        // Auto-destrucción
        this.scene.time.delayedCall(time, () => {
            if (!this.active || this.isCollected) return;
            
            // Animación de desaparición
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                y: this.y - 20,
                duration: 500,
                ease: 'Back.easeIn',
                onComplete: () => {
                    this.destroy();
                }
            });
        });
    }
    
    // Método para cuando el power-up es recogido
    collect() {
        if (this.isCollected || !this.active || !this.scene) return false;
        
        this.isCollected = true;
        
        // Asegurarnos de que el cuerpo físico exista antes de desactivarlo
        if (this.body) {
            this.body.enable = false;
        }
        
        console.log(`Power-up ${this.type} recogido`);
        
        // Reproducir sonido de recolección
        if (this.scene.cache && this.scene.cache.audio && this.scene.cache.audio.exists('powerup-collect')) {
            this.scene.sound.play('powerup-collect', { volume: 0.5 });
        }
        
        // Animación de recolección
        if (this.scene.tweens) {
            this.scene.tweens.add({
                targets: this,
                y: this.y - 30,
                alpha: 0,
                scale: 1.5,
                duration: 500,
                ease: 'Back.easeIn',
                onComplete: () => {
                    if (this.active) {
                        this.destroy();
                    }
                }
            });
        } else {
            // Si no se puede hacer la animación, destruir directamente
            this.destroy();
        }
        
        // Verificar que el jugador exista antes de procesar efectos
        if (!this.scene.player || !this.scene.player.active) {
            return true;
        }
        
        // Aplicar efectos según tipo
        switch (this.type) {
            case 'armor':
                // Restaurar armadura
                if (this.scene.hasOwnProperty('hasArmor')) {
                    this.scene.hasArmor = true;
                    this.scene.player.clearTint();
                }
                
                // Mostrar efecto visual de armadura
                if (this.scene.armorSprite && this.scene.armorSprite.active) {
                    this.scene.armorSprite.setPosition(this.scene.player.x, this.scene.player.y);
                    this.scene.armorSprite.setVisible(true);
                    this.scene.armorSprite.setAlpha(0);
                    
                    // Tween para hacer aparecer la armadura
                    this.scene.tweens.add({
                        targets: this.scene.armorSprite,
                        alpha: 1,
                        duration: 500,
                        ease: 'Sine.easeOut',
                        onComplete: () => {
                            if (this.scene && this.scene.armorSprite && this.scene.armorSprite.active) {
                                this.scene.armorSprite.setVisible(false);
                            }
                        }
                    });
                } else {
                    // Si no existe el sprite de armadura, al menos reproducir un efecto de sonido
                    if (this.scene.cache.audio.exists('armor')) {
                        this.scene.sound.play('armor', { volume: 0.6 });
                    }
                }
                break;
                
            case 'points':
                // Añadir puntos
                if (this.scene && this.scene.hasOwnProperty('score')) {
                    this.scene.score += 500;
                    if (typeof this.scene.updateScoreText === 'function') {
                        this.scene.updateScoreText();
                    }
                    
                    // Mostrar texto de puntos ganados
                    this.showFloatingText('+500', 0xFFD700);
                }
                break;
                
            case 'magic':
                // Recuperar vida
                if (this.scene && this.scene.hasOwnProperty('lives') && this.scene.lives < 5) {
                    this.scene.lives++;
                    if (typeof this.scene.updateLivesText === 'function') {
                        this.scene.updateLivesText();
                    }
                    
                    // Mostrar texto de vida extra
                    this.showFloatingText('¡VIDA EXTRA!', 0x00FF00);
                }
                break;
                
            case 'invincible':
                // Dar invencibilidad temporal
                if (!this.scene || !this.scene.player || !this.scene.player.active) return;
                
                this.scene.isInvulnerable = true;
                
                // Efecto visual de invencibilidad
                const originalTint = this.scene.player.tintTopLeft;
                
                // Aplicar efecto de parpadeo
                const invincibilityEffect = this.scene.time.addEvent({
                    delay: 100,
                    callback: () => {
                        if (!this.scene || !this.scene.player || !this.scene.player.active) return;
                        
                        if (this.scene.player.tintTopLeft === 0xFFFFFF) {
                            this.scene.player.setTint(0xFFFF00);
                        } else {
                            this.scene.player.setTint(0xFFFFFF);
                        }
                    },
                    loop: true
                });
                
                // Mostrar texto de invencibilidad
                this.showFloatingText('¡INVENCIBLE!', 0xFFD700);
                
                // Temporizador para quitar la invencibilidad
                this.scene.time.delayedCall(10000, () => {
                    if (!this.scene || !this.scene.player || !this.scene.player.active) {
                        if (invincibilityEffect) invincibilityEffect.remove();
                        return;
                    }
                    
                    this.scene.isInvulnerable = false;
                    if (invincibilityEffect) invincibilityEffect.remove();
                    this.scene.player.setTint(originalTint);
                });
                break;
                
            default:
                // Por defecto, dar algunos puntos
                if (this.scene && this.scene.hasOwnProperty('score')) {
                    this.scene.score += 100;
                    if (typeof this.scene.updateScoreText === 'function') {
                        this.scene.updateScoreText();
                    }
                }
                break;
        }
        
        return true;
    }
    
    // Mostrar texto flotante para feedback
    showFloatingText(text, color = 0xFFFFFF) {
        if (!this.scene || !this.active) return;
        
        const floatingText = this.scene.add.text(
            this.x,
            this.y - 30,
            text,
            {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: `#${color.toString(16).padStart(6, '0')}`,
                stroke: '#000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        if (this.scene.tweens) {
            this.scene.tweens.add({
                targets: floatingText,
                y: floatingText.y - 40,
                alpha: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (floatingText && floatingText.active) {
                        floatingText.destroy();
                    }
                }
            });
        }
    }
    
    // Actualizar estado
    update() {
        if (!this.active || !this.body) return;
        
        // Hacer que el power-up rebote si toca el suelo
        if (this.body.touching.down && this.body.velocity.y > 0) {
            this.body.setVelocityY(-150);
        }
    }
}

export default Powerup; 