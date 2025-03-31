class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'random') {
        // Inicializamos el sprite con la textura del cofre cerrado
        super(scene, x, y, 'chest');
        
        // Añadir el cofre a la escena y habilitar física
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // true = cuerpo estático
        
        // Configurar propiedades físicas y visuales
        this.body.setSize(28, 24);        // Ajustar el área de colisión
        this.body.setOffset(2, 8);        // Centrar la colisión con el sprite
        this.setDepth(1);                 // Asegurar que el cofre se dibuje sobre el fondo
        
        // Estado del cofre
        this.isOpen = false;              // El cofre empieza cerrado
        this.isOpening = false;           // Flag para la animación de apertura
        this.hasBeenHit = false;          // Flag para detectar si ya fue golpeado
        
        // Tipo de contenido (si es random se decidirá al abrir)
        this.contentType = type;
        
        // Posibles tipos de contenido
        this.contentTypes = [
            'armor',
            'points',
            'weapon_spear',
            'weapon_dagger',
            'weapon_torch',
            'weapon_axe',
            'magic',
            'invincible'
        ];
        
        // Probabilidades para cada tipo (puntos más probable, invencibilidad menos)
        this.contentProbabilities = {
            'armor': 0.15,
            'points': 0.30,
            'weapon_spear': 0.10,
            'weapon_dagger': 0.12,
            'weapon_torch': 0.12,
            'weapon_axe': 0.10,
            'magic': 0.08,
            'invincible': 0.03
        };
        
        // Crear animaciones para el cofre
        this.createAnimations();
    }
    
    createAnimations() {
        // Comprobar si ya existen las animaciones para evitar errores
        if (!this.scene.anims.exists('chest-open')) {
            this.scene.anims.create({
                key: 'chest-open',
                frames: this.scene.anims.generateFrameNumbers('chest', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: 0
            });
        }
    }
    
    // Método para cuando el cofre es golpeado
    hit() {
        // Evitar abrir un cofre ya abierto o en proceso de apertura
        if (this.isOpen || this.isOpening || this.hasBeenHit) return false;
        
        this.hasBeenHit = true;
        this.isOpening = true;
        
        console.log('Cofre golpeado en:', this.x, this.y);
        
        // Reproducir sonido de apertura del cofre
        if (this.scene.cache.audio.exists('chest-open')) {
            this.scene.sound.play('chest-open', { volume: 0.6 });
        }
        
        // Reproducir animación de apertura
        this.play('chest-open');
        
        // Crear efecto de brillo/partículas al abrir
        this.createOpeningEffect();
        
        // Esperar a que termine la animación para generar el contenido
        this.on('animationcomplete-chest-open', this.spawnContent, this);
        
        // Marcar como abierto después de un breve retraso
        this.scene.time.delayedCall(300, () => {
            this.isOpen = true;
            this.isOpening = false;
        });
        
        return true;
    }
    
    // Efecto visual de apertura
    createOpeningEffect() {
        // Brillo alrededor del cofre
        const glow = this.scene.add.sprite(this.x, this.y, 'chest-glow');
        glow.setAlpha(0);
        glow.setScale(0.5);
        
        // Tween para hacer aparecer y desaparecer el brillo
        this.scene.tweens.add({
            targets: glow,
            alpha: 0.7,
            scale: 1,
            duration: 300,
            yoyo: true,
            ease: 'Sine.easeOut',
            onComplete: () => {
                glow.destroy();
            }
        });
        
        // Partículas doradas
        if (this.scene.add.particles) {
            const particles = this.scene.add.particles('jump_particle_1'); // Reutilizamos partículas existentes
            
            const emitter = particles.createEmitter({
                x: this.x,
                y: this.y - 10,
                speed: { min: 50, max: 200 },
                angle: { min: -100, max: -80 },
                scale: { start: 0.5, end: 0 },
                lifespan: 800,
                blendMode: 'ADD',
                gravityY: 300,
                quantity: 1,
                frequency: 20
            });
            
            // Detener emisión después de un tiempo
            this.scene.time.delayedCall(500, () => {
                emitter.stop();
                
                // Eliminar el emisor después de que todas las partículas desaparezcan
                this.scene.time.delayedCall(1000, () => {
                    particles.destroy();
                });
            });
        }
    }
    
    // Generar contenido aleatorio basado en probabilidades
    getRandomContent() {
        if (this.contentType !== 'random') {
            return this.contentType;
        }
        
        const rand = Math.random();
        let cumulativeProbability = 0;
        
        for (const type of this.contentTypes) {
            cumulativeProbability += this.contentProbabilities[type];
            if (rand < cumulativeProbability) {
                return type;
            }
        }
        
        // Por defecto, dar puntos
        return 'points';
    }
    
    // Generar el contenido cuando se abre el cofre
    spawnContent() {
        if (!this.scene || !this.active) return;
        
        // Obtener tipo de contenido
        const contentType = this.getRandomContent();
        console.log(`Cofre generando contenido: ${contentType}`);
        
        // Crear animación de salida del contenido
        const content = this.scene.add.sprite(this.x, this.y - 20, `powerup_${contentType}`);
        content.setAlpha(0);
        
        // Animación para hacer aparecer el contenido
        this.scene.tweens.add({
            targets: content,
            y: this.y - 40,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Crear el objeto de recolección real
                if (contentType.startsWith('weapon_')) {
                    // Es un arma, crea un pickup de arma
                    const weaponType = contentType.replace('weapon_', '');
                    this.scene.spawnWeaponPickup(this.x, this.y - 40, weaponType);
                } else {
                    // Es otro tipo de power-up
                    this.scene.spawnPowerup(this.x, this.y - 40, contentType);
                }
                
                // Eliminar el sprite de animación
                content.destroy();
            }
        });
    }
}

export default Chest; 