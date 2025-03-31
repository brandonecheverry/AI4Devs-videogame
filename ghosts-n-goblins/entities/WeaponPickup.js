class WeaponPickup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        // Tipos de armas disponibles
        const WEAPON_TYPES = {
            SPEAR: 'spear',
            DAGGER: 'dagger',
            TORCH: 'torch',
            AXE: 'axe'
        };
        
        // Validar el tipo
        if (!Object.values(WEAPON_TYPES).includes(type)) {
            console.error(`Tipo de arma inválido: ${type}`);
            type = WEAPON_TYPES.DAGGER; // Por defecto
        }
        
        // Inicializar sprite
        super(scene, x, y, `${type}-pickup`);
        
        this.type = type;
        
        // Añadir a la escena y habilitar física
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurar físicas
        this.body.setSize(24, 24);
        this.body.setOffset(4, 4);
        this.body.setAllowGravity(false); // No afectado por gravedad
        
        // Añadir efecto de flotación
        this.createFloatingEffect();
        
        // Brillo intermitente
        this.createGlowEffect();
    }
    
    createFloatingEffect() {
        // Crear efecto de flotación con un tween
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    createGlowEffect() {
        // Crear efecto de brillo intermitente
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    collect() {
        // Reproducir sonido de recolección si existe
        if (this.scene.cache.audio.exists('pickup')) {
            try {
                this.scene.sound.play('pickup', { volume: 0.5 });
            } catch (error) {
                console.warn('Error reproduciendo sonido pickup:', error);
            }
        }
        
        // Crear efecto visual de recolección
        this.createCollectEffect();
        
        // Desactivar físicas y hacer invisible
        this.body.enable = false;
        this.setVisible(false);
        
        // Destruir después de la animación
        this.scene.time.delayedCall(500, () => {
            this.destroy();
        });
        
        return this.type;
    }
    
    createCollectEffect() {
        // Crear partículas para el efecto de recolección
        const particles = this.scene.add.particles(this.x, this.y, 'sparkle', {
            speed: 100,
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            blendMode: 'ADD',
            quantity: 10
        });
        
        // Autodestruir el emisor después de 500ms
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }
}

export default WeaponPickup; 