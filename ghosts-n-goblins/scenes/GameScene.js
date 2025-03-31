import Zombie from '../entities/Zombie.js';
import Weapon from '../entities/Weapon.js';
import WeaponPickup from '../entities/WeaponPickup.js';
import Chest from '../entities/Chest.js';
import Powerup from '../entities/Powerup.js';
import Boss from '../entities/Boss.js';
import Skeleton from '../entities/Skeleton.js';
import Gargoyle from '../entities/Gargoyle.js';
import Demon from '../entities/Demon.js';
import AudioManager from '../utils/AudioManager.js';
import AudioControls from '../ui/AudioControls.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Variables de estado del juego
        this.score = 0;
        this.lives = 3;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.pointsMultiplier = 1;
        this.zombiesKilled = 0;
        
        // Variables del jugador
        this.isDead = false;
        this.isJumping = false;
        this.isThrowingWeapon = false;
        this.facingLeft = false;
        this.walkSoundPlaying = false;
        this.doubleJumping = false;
        
        // Variables para salto múltiple
        this.jumpCount = 0;
        this.maxJumps = 3; // Aumentar a 3 saltos (triple salto)
        this.hasDoubleJump = true;
        this.canDoubleJump = false;
        this.isFalling = false;
        this.jumpBoostTime = 0; // Tiempo para rastrear pulsaciones rápidas
        this.jumpBoostWindow = 300; // Ventana de tiempo para potenciar el salto (ms)
        this.jumpHeight = -350; // Altura base del salto
        this.jumpBoostFactor = 1.0; // Factor de potenciación del salto
        
        // Sistema de daño
        this.hasArmor = true; // Arthur comienza con armadura
        this.isInvulnerable = false; // Flag para controlar invulnerabilidad después de un golpe
        this.invulnerabilityTime = 2000; // 2 segundos de invulnerabilidad
        this.invulnerabilityFlicker = 0; // Control del efecto de parpadeo
        
        // Sistema de armas
        this.currentWeapon = 'spear'; // Arma por defecto
        this.weaponCooldown = 500; // ms entre disparos
        this.canThrow = true;
        this.weaponTypes = ['spear', 'dagger', 'torch', 'axe'];
        
        // Tamaño del nivel
        this.levelWidth = 3200; // El doble del ancho del fondo
        
        // Modo de depuración
        this.debugMode = false;
    }

    create() {
        // Configurar mundo físico para el nivel más grande
        this.physics.world.setBounds(0, 0, this.levelWidth, 600);
        
        // Fondo del cementerio
        this.background = this.add.tileSprite(0, 0, 1600, 600, 'stage1-background')
            .setOrigin(0, 0)
            .setScrollFactor(0.2); // Parallax scrolling
        
        // Variables del juego
        this.score = 0;
        this.lives = 3;
        
        // Crear grupos para los elementos del escenario
        this.platforms = this.physics.add.staticGroup();
        this.decorations = this.add.group();
        
        // Crear el nivel
        this.createLevel();
        
        // Crear UI
        this.createUI();
        
        // Crear al jugador con el nuevo sprite
        this.player = this.physics.add.sprite(100, 450, 'arthur-idle');
        
        // Verificar si el sprite se cargó correctamente
        if (!this.textures.exists('arthur-idle')) {
            console.error('Error: No se pudo cargar la textura "arthur-idle"');
            return; // Evitar continuar si no existe la textura
        }
        
        // Inicializar las propiedades del jugador
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.hasArmor = true; // Inicialmente Arthur tiene armadura
        this.player.isInvulnerable = false; // Flag para controlar invulnerabilidad
        this.player.invulnerableTime = 0; // Tiempo restante de invulnerabilidad
        
        // Ajustar el tamaño del cuerpo de colisión para que se ajuste mejor al sprite
        this.player.body.setSize(30, 44);
        this.player.body.setOffset(5, 8);
        
        // Colisión entre el jugador y las plataformas
        // this.physics.add.collider(this.player, this.platforms);
        
        // Configurar cámara para seguir al jugador
        this.setupCamera();
        
        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Tecla para lanzar arma (tecla espaciadora)
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Instrucciones para el doble salto
        const jumpInstructions = this.add.text(this.cameras.main.width / 2, 50, 
            'Pulsa ↑ repetidamente para alcanzar plataformas más altas', {
            fontSize: '16px',
            fill: '#ffff00',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setScrollFactor(0).setOrigin(0.5);
        
        // Hacer que las instrucciones desaparezcan después de un tiempo
        this.time.delayedCall(10000, () => {
            this.tweens.add({
                targets: jumpInstructions,
                alpha: 0,
                duration: 1000,
                ease: 'Power2'
            });
        });
        
        // Inicializar AudioManager
        this.audioManager = new AudioManager(this);
        
        // Crear controles de audio
        this.audioControls = new AudioControls(this, this.audioManager);
        
        // Reproducir música del juego
        this.audioManager.playMusic('game-music', { volume: 0.5, loop: true });
        
        // Definir animaciones del jugador con los nuevos sprites
        
        console.log('Configurando animaciones del jugador...');
        
        // Verificar que las texturas estén cargadas
        const requiredTextures = ['arthur-idle', 'arthur-run', 'arthur-jump', 'arthur-throw', 'arthur-death', 'arthur-armor'];
        requiredTextures.forEach(texture => {
            if (this.textures.exists(texture)) {
                console.log(`Textura '${texture}' cargada correctamente`);
        } else {
                console.warn(`¡Textura '${texture}' no encontrada!`);
        }
        });
        
        // Animación de estado quieto (idle)
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('arthur-idle', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        console.log('Animación "idle" creada');
        
        // Animación de idle sin armadura
        this.anims.create({
            key: 'underwear-idle',
            frames: this.anims.generateFrameNumbers('arthur-underwear-idle', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        console.log('Animación "underwear-idle" creada');
        
        // Animación de correr hacia la derecha
        this.anims.create({
            key: 'run-right',
            frames: this.anims.generateFrameNumbers('arthur-run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        console.log('Animación "run-right" creada');
        
        // Animación de correr hacia la derecha sin armadura
        this.anims.create({
            key: 'underwear-run-right',
            frames: this.anims.generateFrameNumbers('arthur-underwear-run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        console.log('Animación "underwear-run-right" creada');
        
        // Animación de correr hacia la izquierda (mismos frames pero volteados)
        this.anims.create({
            key: 'run-left',
            frames: this.anims.generateFrameNumbers('arthur-run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        console.log('Animación "run-left" creada');
        
        // Animación de correr hacia la izquierda sin armadura
        this.anims.create({
            key: 'underwear-run-left',
            frames: this.anims.generateFrameNumbers('arthur-underwear-run', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        console.log('Animación "underwear-run-left" creada');
        
        // Animación de salto
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('arthur-jump', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        console.log('Animación "jump" creada');
        
        // Animación de lanzar arma
        this.anims.create({
            key: 'throw',
            frames: this.anims.generateFrameNumbers('arthur-throw', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: 0
        });
        console.log('Animación "throw" creada');
        
        // Animación de lanzar arma sin armadura
        this.anims.create({
            key: 'underwear-throw',
            frames: this.anims.generateFrameNumbers('arthur-underwear-throw', { start: 0, end: 3 }),
            frameRate: 12,
            repeat: 0
        });
        console.log('Animación "underwear-throw" creada');
        
        // Animación de muerte
        this.anims.create({
            key: 'player_death',
            frames: this.anims.generateFrameNumbers('arthur-death', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
        });
        console.log('Animación "player_death" creada');
        
        // Animación de pérdida de armadura
        this.anims.create({
            key: 'armor-break',
            frames: this.anims.generateFrameNumbers('arthur-armor', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        console.log('Animación "armor-break" creada');
        
        // Iniciar con la animación idle
        this.player.anims.play('idle', true);
        console.log('Primera animación "idle" iniciada');
        
        // Eventos para las animaciones - versión mejorada
        // Cada evento de animación completa tiene su nombre exacto como está definido
        
        // Evento para cuando termina la animación de muerte
        this.player.on('animationcomplete-player_death', () => {
            console.log('Animación de muerte completada');
            // Detener en el último frame
            if (this.player.anims.currentAnim) {
                this.player.anims.pause();
            }
        });
        
        // Evento para cuando termina la animación de ruptura de armadura
        this.player.on('animationcomplete-armor-break', () => {
            console.log('Animación de ruptura de armadura completada');
            // Volver a la animación apropiada (siempre sin armadura)
            if (this.player.body.touching.down) {
                if (this.player.body.velocity.x !== 0) {
                    this.player.anims.play(`underwear-${this.facingLeft ? 'run-left' : 'run-right'}`, true);
            } else {
                    this.player.anims.play('underwear-idle', true);
                }
            } else {
                this.player.anims.play('underwear-jump', true);
            }
        });
        
        // Crear sistema de partículas mejorado para el doble salto
        this.createJumpParticleEffects();
        
        // Añadir efectos de sonido
        this.jumpSound = null;
        if (this.cache.audio.exists('double-jump')) {
            this.jumpSound = this.sound.add('double-jump', { volume: 0.4 });
        }
        
        // Grupo de zombies
        this.zombies = this.add.group({
            classType: Zombie,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada zombie
        });
        
        // Grupo de esqueletos
        this.skeletons = this.add.group({
            classType: Skeleton,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada esqueleto
        });
        
        // Grupo de gárgolas
        this.gargoyles = this.add.group({
            classType: Gargoyle,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada gárgola
        });
        
        // Grupo de demonios
        this.demons = this.add.group({
            classType: Demon,
            runChildUpdate: true // Esto llamará automáticamente al método update de cada demonio
        });
        
        // Grupos para el sistema de armas
        this.weapons = this.physics.add.group({
            classType: Weapon,
            runChildUpdate: true
        });
        
        this.weaponPickups = this.physics.add.group({
            classType: WeaponPickup
        });
        
        // Configurar spawns de zombies
        this.zombieSpawnPoints = [
            { x: 400, y: 450 },
            { x: 800, y: 450 },
            { x: 1200, y: 450 },
            { x: 1600, y: 450 },
            { x: 2000, y: 450 },
            { x: 2400, y: 450 },
            { x: 2800, y: 450 }
        ];
        
        // Configurar spawns de esqueletos (diferentes a los de los zombies)
        this.skeletonSpawnPoints = [
            { x: 600, y: 450 },
            { x: 1000, y: 450 },
            { x: 1400, y: 450 },
            { x: 1800, y: 450 },
            { x: 2200, y: 450 },
            { x: 2600, y: 450 },
            { x: 3000, y: 450 }
        ];
        
        // Configurar spawns de gárgolas (posiciones elevadas)
        this.gargoyleSpawnPoints = [
            { x: 500, y: 350 },  // Más alto que otros enemigos
            { x: 900, y: 350 },
            { x: 1300, y: 350 },
            { x: 1700, y: 350 },
            { x: 2100, y: 350 },
            { x: 2500, y: 350 },
            { x: 2900, y: 350 }
        ];
        
        // Configurar spawns de demonios
        this.demonSpawnPoints = [
            { x: 700, y: 450 },
            { x: 1100, y: 450 },
            { x: 1500, y: 450 },
            { x: 1900, y: 450 },
            { x: 2300, y: 450 },
            { x: 2700, y: 450 },
            { x: 3100, y: 450 }
        ];
        
        // Timer para spawn de zombies (más frecuente para pruebas)
        this.time.addEvent({
            delay: 2000, // Cada 2 segundos en lugar de 5
            callback: this.spawnZombie,
            callbackScope: this,
            loop: true
        });
        
        // Timer para spawn de esqueletos (menos frecuente que los zombies)
        this.time.addEvent({
            delay: 4000, // Cada 4 segundos
            callback: this.spawnSkeleton,
            callbackScope: this,
            loop: true
        });

        // Timer para spawn de gárgolas (menos frecuente que los zombies)
        this.time.addEvent({
            delay: 5000, // Cada 5 segundos
            callback: this.spawnGargoyle,
            callbackScope: this,
            loop: true
        });

        // Spawnear un zombie inicial para pruebas
        this.spawnZombie();
        
        // Spawnear un esqueleto inicial para pruebas
        this.spawnSkeleton();
        
        // Spawnear una gárgola inicial para pruebas
        this.spawnGargoyle();
        
        // Colisiones entre zombies y plataformas
        this.physics.add.collider(this.zombies, this.platforms);
        
        // Colisión entre jugador y zombies
        this.physics.add.overlap(
            this.player,
            this.zombies,
            this.handlePlayerZombieCollision,
            null,
            this
        );
        
        // Colisión entre esqueletos y plataformas
        this.physics.add.collider(this.skeletons, this.platforms);
        
        // Colisión entre jugador y esqueletos
        this.physics.add.overlap(
            this.player,
            this.skeletons,
            this.handlePlayerSkeletonCollision,
            null,
            this
        );
        
        // Colisión entre armas y zombies
        this.physics.add.overlap(
            this.weapons,
            this.zombies,
            this.handleWeaponZombieCollision,
            null,
            this
        );
        
        // Colisión entre armas y esqueletos
        this.physics.add.overlap(
            this.weapons,
            this.skeletons,
            this.handleWeaponSkeletonCollision,
            null,
            this
        );
        
        // Colisión entre gárgolas y plataformas
        this.physics.add.collider(this.gargoyles, this.platforms);
        
        // Colisión entre jugador y gárgolas
        this.physics.add.overlap(
            this.player,
            this.gargoyles,
            this.handlePlayerGargoyleCollision,
            null,
            this
        );
        
        // Colisión entre armas y gárgolas
        this.physics.add.overlap(
            this.weapons,
            this.gargoyles,
            this.handleWeaponGargoyleCollision,
            null,
            this
        );
        
        // Colisión entre demonios y plataformas
        // this.physics.add.collider(this.demons, this.platforms);
        
        // Colisión entre jugador y demonios
        // this.physics.add.overlap(
        //    this.player,
        //    this.demons,
        //    this.handlePlayerDemonCollision,
        //    null,
        //    this
        // );
        
        // Colisión entre armas y demonios
        // this.physics.add.overlap(
        //    this.weapons,
        //    this.demons,
        //    this.handleWeaponDemonCollision,
        //    null,
        //    this
        // );
        
        // Colisión entre armas y plataformas
        this.physics.add.collider(
            this.weapons,
            this.platforms,
            this.handleWeaponPlatformCollision,
            null,
            this
        );
        
        // Colisión entre jugador y pickups de armas
        this.physics.add.overlap(
            this.player,
            this.weaponPickups,
            this.handlePlayerPickupCollision,
            null,
            this
        );
        
        // Añadir sprite de armadura
        this.armorSprite = this.add.sprite(this.player.x, this.player.y, 'arthur-armor');
        this.armorSprite.setVisible(false);
        
        // Crear pickup inicial de arma para pruebas
        this.spawnWeaponPickup(300, 450, 'dagger');
        
        // Pickups adicionales para pruebas - uno de cada tipo
        this.spawnWeaponPickup(350, 450, 'spear');
        this.spawnWeaponPickup(400, 450, 'torch');
        this.spawnWeaponPickup(450, 450, 'axe');
        
        console.log('Pickups de armas creados para pruebas');
        
        // Test de armas - crear una para probar
        const testWeapon = new Weapon(this, 250, 450, 'spear');
        testWeapon.fire(250, 450, 1); // Lanzarla hacia la derecha
        this.weapons.add(testWeapon);
        console.log('Arma de prueba creada');
        
        // Grupos para el sistema de cofres y power-ups
        this.chests = this.physics.add.staticGroup({
            classType: Chest,
            runChildUpdate: false
        });
        
        this.powerups = this.physics.add.group({
            classType: Powerup,
            runChildUpdate: true
        });
        
        // Colisión entre power-ups y plataformas
        this.physics.add.collider(this.powerups, this.platforms);
        
        // Colisión entre jugador y power-ups
        this.physics.add.overlap(
            this.player,
            this.powerups,
            this.handlePlayerPowerupCollision,
            null,
            this
        );
        
        // Colisión entre armas y cofres
        this.physics.add.collider(
            this.weapons,
            this.chests,
            this.handleWeaponChestCollision,
            null,
            this
        );
        
        // Añadir cofres al nivel
        this.spawnChests();
        
        console.log('Verificando texturas del jefe...');
        // Eliminar la llamada a verifyBossTextures ya que esta función no existe
        // this.verifyBossTextures();
        
        console.log('Creando jefe final...');
        // Crear el jefe final al final del nivel
        this.createBoss();
        console.log('Jefe final creado, estado:', this.boss ? `activo=${this.boss.active}, estado=${this.boss.state}` : 'null');
        
        // Inicializar modo de depuración - activar para ver información y efectos de depuración
        this.debugMode = false;
        
        // Crear gráficos de depuración para trazado de líneas, etc.
        if (this.debugMode) {
            this.debugGraphics = this.add.graphics();
            this.debugGraphics.setDepth(100); // Por encima de todo
            
            // Texto de depuración para mostrar información durante el juego
            this.debugText = this.add.text(16, 150, '', {
                fontSize: '18px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 }
            });
            this.debugText.setScrollFactor(0); // Fijo en la cámara
            this.debugText.setDepth(100);
        }

        // Asegurar que el audio está correctamente inicializado
        try {
            // Inicializar AudioManager si no existe
            if (!this.audioManager) {
                console.log('Inicializando AudioManager...');
                this.audioManager = new AudioManager(this);
                
                // Verificar si se cargaron los sonidos
                const soundsToCheck = ['jump', 'double-jump', 'throw', 'player-hurt', 'pickup', 'powerup'];
                soundsToCheck.forEach(sound => {
                    if (this.cache.audio.exists(sound)) {
                        console.log(`Sonido '${sound}' cargado correctamente`);
                    } else {
                        console.warn(`Sonido '${sound}' no encontrado en cache`);
                    }
                });
            }
            
            // Crear controles de audio
            this.audioControls = new AudioControls(this, this.audioManager);
            
            // Reproducir música del juego
            if (this.audioManager) {
                this.audioManager.playMusic('game-music', { volume: 0.5, loop: true });
                console.log('Música del juego iniciada');
            }
        } catch (error) {
            console.error('Error inicializando audio:', error);
        }
        
        // Verificar que todas las animaciones necesarias existan
        this.ensureAnimationsExist();
        
        // Método para configurar todas las colisiones del juego
        this.setupCollisions();
        
        // Ya no intentamos registrar eventos a nivel global de esta manera
        // Los eventos de animación se manejan por instancia
    }

    // Método para crear el nivel
    createLevel() {
        console.log('Creando nivel del cementerio...');
        
        // Fondo con efectos parallax
        this.background1 = this.add.tileSprite(0, 0, 1600, 600, 'stage1-background')
            .setOrigin(0, 0)
            .setScrollFactor(0.1); // Capa más lejana
            
        this.background2 = this.add.tileSprite(0, 0, 1600, 600, 'stage1-midground')
            .setOrigin(0, 0)
            .setScrollFactor(0.4); // Capa media
        
        // Piso principal - plataformas extendidas a lo largo del nivel
        for (let x = 0; x < this.levelWidth; x += 256) {
            // Piso base con tierra
            this.platforms.create(x, 584, 'extended-ground')
                .setOrigin(0, 1)
                .refreshBody()
                .setDepth(1);
        }
        
        // Distribuir plataformas formando un recorrido interesante
        // Primera sección (0-800px) - Tutorial y primeros enemigos
        this.platforms.create(200, 450, 'platform').setDepth(1);
        this.platforms.create(350, 350, 'platform').setDepth(1);
        this.platforms.create(500, 450, 'platform').setDepth(1);
        this.platforms.create(650, 350, 'platform').setDepth(1);
        
        // Segunda sección (800-1600px) - Dificultad incrementada
        this.platforms.create(850, 400, 'platform').setDepth(1);
        this.platforms.create(1000, 300, 'platform').setDepth(1);
        this.platforms.create(1150, 400, 'platform').setDepth(1);
        this.platforms.create(1300, 350, 'platform').setDepth(1);
        this.platforms.create(1450, 250, 'platform').setDepth(1);
        
        // Tercera sección (1600-2400px) - Sección con plataformas irregulares
        this.platforms.create(1650, 350, 'platform').setDepth(1);
        this.platforms.create(1800, 450, 'platform').setDepth(1);
        this.platforms.create(1950, 350, 'platform').setDepth(1);
        this.platforms.create(2100, 250, 'platform').setDepth(1);
        this.platforms.create(2250, 350, 'platform').setDepth(1);
        
        // Cuarta sección (2400-3200px) - Final del nivel con el jefe
        this.platforms.create(2450, 400, 'platform').setDepth(1);
        this.platforms.create(2600, 350, 'platform').setDepth(1);
        this.platforms.create(2800, 300, 'platform').setDepth(1);
        this.platforms.create(3000, 350, 'platform').setDepth(1);
        
        // Añadir decoraciones densas para dar atmósfera de cementerio
        this.addCemeteryDecorations();
        
        // Añadir efectos visuales como niebla
        this.addCemeteryEffects();
        
        console.log('Nivel creado exitosamente');
    }
    
    // Método para añadir decoraciones del cementerio
    addCemeteryDecorations() {
        // Primera sección - Tumbas básicas y pocos árboles
        this.addTombstone(120, 520, 1);
        this.addTombstone(220, 520, 2);
        this.addTombstone(320, 520, 3);
        this.addTombstone(420, 520, 1);
        this.addDeadTree(270, 520);
        this.addDeadTree(470, 520);
        
        // Decoraciones en plataformas altas
        this.addTombstone(200, 385, 2);
        this.addTombstone(350, 285, 1);
        
        // Segunda sección - Cementerio más denso
        this.addTombstone(650, 520, 2);
        this.addTombstone(720, 520, 3);
        this.addTombstone(790, 520, 1);
        this.addTombstone(860, 520, 2);
        this.addDeadTree(700, 520);
        this.addDeadTree(830, 520);
        
        // Cruces en plataformas
        this.addTombstone(850, 335, 1);
        this.addTombstone(1000, 235, 3);
        
        // Tercera sección - Tumbas antiguas y árboles muertos
        this.addTombstone(1200, 520, 3);
        this.addTombstone(1300, 520, 2);
        this.addTombstone(1400, 520, 1);
        this.addTombstone(1500, 520, 3);
        this.addDeadTree(1250, 520);
        this.addDeadTree(1450, 520);
        
        // Cuarta sección - Cementerio antiguo con muchas cruces y árboles muertos
        this.addTombstone(1700, 520, 2);
        this.addTombstone(1800, 520, 1);
        this.addTombstone(1900, 520, 3);
        this.addTombstone(2000, 520, 2);
        this.addDeadTree(1750, 520);
        this.addDeadTree(1950, 520);
        
        // Sección del jefe - Tumbas antiguas y un altar
        this.addTombstone(2500, 520, 1);
        this.addTombstone(2600, 520, 3);
        this.addTombstone(2700, 520, 2);
        this.addDeadTree(2550, 520);
        this.addDeadTree(2650, 520);
        
        // Añadir altar o tumba especial para el jefe final
        if (this.textures.exists('boss-altar')) {
            this.decorations.add(
                this.add.image(3000, 520, 'boss-altar').setOrigin(0.5, 1).setDepth(1)
            );
        }
    }
    
    // Método para añadir efectos visuales al cementerio
    addCemeteryEffects() {
        // Crear sistema de partículas para la niebla
        if (this.textures.exists('fog')) {
            this.fogEmitter = this.add.particles('fog').createEmitter({
                x: 0,
                y: 550,
                angle: { min: 0, max: 180 },
                speed: { min: 10, max: 30 },
                gravityY: -10,
                scale: { start: 0.4, end: 0.1 },
                alpha: { start: 0.3, end: 0 },
                lifespan: 15000,
                blendMode: 'ADD',
                frequency: 500
            });
            
            // Hacer que la niebla cubra todo el nivel
            this.fogEmitter.setEmitZone({
                source: new Phaser.Geom.Rectangle(0, 0, this.levelWidth, 20),
                type: 'random'
            });
        }
        
        // Añadir emisor de luces fantasmales
        if (this.textures.exists('ghost-light')) {
            this.ghostLightEmitter = this.add.particles('ghost-light').createEmitter({
                x: { min: 0, max: this.levelWidth },
                y: { min: 300, max: 550 },
                scale: { start: 0.2, end: 0.1 },
                alpha: { start: 0.3, end: 0 },
                lifespan: 10000,
                blendMode: 'ADD',
                frequency: 3000
            });
            
            // Añadir movimiento a las luces fantasmales
            this.tweens.add({
                targets: this.ghostLightEmitter,
                y: '-=100',
                yoyo: true,
                repeat: -1,
                duration: 5000,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    // Métodos para añadir decoraciones
    addTombstone(x, y, type) {
        const tombstone = this.add.image(x, y, `tombstone${type}`).setOrigin(0.5, 1).setDepth(1);
        this.decorations.add(tombstone);
        
        // Añadir un toque de interactividad aleatoria a algunas tumbas
        if (Math.random() < 0.2) {
            this.tweens.add({
                targets: tombstone,
                angle: { from: -1, to: 1 },
                duration: 2000 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    addDeadTree(x, y) {
        const tree = this.add.image(x, y, 'dead-tree').setOrigin(0.5, 1).setDepth(1);
        this.decorations.add(tree);
        
        // Añadir movimiento suave a los árboles como si el viento los moviera
        this.tweens.add({
            targets: tree,
            angle: { from: -2, to: 2 },
            duration: 3000 + Math.random() * 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Método para configurar los sistemas de partículas del salto
    createJumpParticleEffects() {
        // Crear varios emisores para las diferentes partículas de salto
        this.jumpParticlesGroup = [];
        
        // Configurar 8 diferentes emisores de partículas usando los assets jump_particle_*_*
        for (let i = 0; i < 8; i++) {
            const particleKey = `jump_particle_${i}`;
            const emitter = this.add.particles(particleKey).createEmitter({
            x: 0,
            y: 0,
                speed: { min: 50, max: 100 },
                angle: { min: 230, max: 310 },
                scale: { start: 0.8, end: 0.2 },
                alpha: { start: 1, end: 0 },
                lifespan: { min: 400, max: 600 },
                gravityY: 250,
                quantity: 1,
                frequency: -1, // Solo emitir cuando explícitamente se llame
                blendMode: 'ADD' // Modo de mezcla aditivo para efecto brillante
            });
            this.jumpParticlesGroup.push(emitter);
        }
        
        // Emisor para partículas más intensas (para saltos potenciados)
        this.powerJumpEmitter = this.add.particles('jump_particle_8').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 80, max: 150 },
            angle: { min: 180, max: 360 },
            scale: { start: 1, end: 0.2 },
            alpha: { start: 1, end: 0 },
            tint: [0xFFFFFF, 0x77DDFF, 0xFFEEAA],
            lifespan: { min: 500, max: 800 },
            gravityY: 200,
            quantity: 1,
            frequency: -1,
            blendMode: 'ADD'
        });
        
        // Emisor para estela de partículas (trailing effect)
        this.trailEmitter = this.add.particles('jump_trail').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 10, max: 30 },
            scale: { start: 0.4, end: 0.1 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            quantity: 1,
            frequency: -1,
            blendMode: 'ADD'
        });
        
        // Nuevas partículas para el aterrizaje
        this.landingEmitter = this.add.particles('jump_particle_2').createEmitter({
            x: 0,
            y: 0,
            speed: { min: 30, max: 70 },
            angle: { min: 230, max: 310 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            gravityY: 200,
            quantity: 1,
            frequency: -1,
            blendMode: 'NORMAL'
        });
    }

    showJumpParticles() {
        // Mostrar partículas en saltos múltiples
        if (this.doubleJumping) {
            console.log('Mostrando partículas de salto múltiple');
            
            // Calcular intensidad basada en el factor de impulso
            const intensity = Math.min(3, Math.floor(this.jumpBoostFactor * 1.5));
            
            // Posición base para las partículas
            const baseX = this.player.x;
            const baseY = this.player.y + 20;
            
            // Emitir partículas normales
            for (let i = 0; i < this.jumpParticlesGroup.length; i++) {
                const emitter = this.jumpParticlesGroup[i];
                const offsetX = Math.random() * 20 - 10;
                const offsetY = Math.random() * 10 - 5;
                
                // Cantidad de partículas basada en la intensidad
                const particles = intensity * (i % 2 === 0 ? 2 : 1);
                
                // Configurar escala según intensidad
                const scale = { 
                    start: 0.4 + (0.2 * intensity), 
                    end: 0.1 
                };
                emitter.setScale(scale);
                
                // Emitir partículas
                emitter.explode(particles, baseX + offsetX, baseY + offsetY);
            }
            
            // Para saltos potentes, añadir estela y partículas especiales
            if (this.jumpBoostFactor >= 1.4) {
                // Partículas de salto poderoso
                const powerParticles = Math.floor(this.jumpBoostFactor * 5);
                this.powerJumpEmitter.explode(powerParticles, baseX, baseY);
                
                // Efecto de estela
                for (let i = 0; i < 3; i++) {
                    const trailY = baseY + (i * 5);
                    this.trailEmitter.explode(2, baseX, trailY);
                }
                
                // Efecto visual de "explosión" en saltos muy potentes
                if (this.jumpBoostFactor >= 1.8) {
                    // Onda expansiva
                    this.cameras.main.shake(100, Math.min(0.01 * this.jumpBoostFactor, 0.02));
                    
                    // Flash rápido
                    this.player.setTint(0xFFFFAA);
                    this.time.delayedCall(100, () => {
                        this.player.clearTint();
                    });
                }
            }
        }
    }
    
    showLandingParticles() {
        // Mostrar partículas al aterrizar desde una altura
        if (this.player.body.velocity.y > 100) {  // Solo si cae con cierta velocidad
            console.log('Mostrando partículas de aterrizaje');
            const intensity = Math.min(15, Math.abs(Math.floor(this.player.body.velocity.y / 20)));
            this.landingEmitter.explode(intensity, this.player.x, this.player.y + 30);
            
            // Si la caída es muy rápida, añadir más efectos
            if (this.player.body.velocity.y > 300) {
                // Emisión de partículas adicionales para caídas fuertes
                for (let i = 0; i < 3; i++) {
                    const particleIdx = i % this.jumpParticlesGroup.length;
                    const emitter = this.jumpParticlesGroup[particleIdx];
                    const offsetX = (Math.random() * 40) - 20;
                    emitter.explode(5, this.player.x + offsetX, this.player.y + 30);
                }
                
                // Pequeña sacudida de cámara para caídas fuertes
                const shakeIntensity = Math.min(0.01, Math.abs(this.player.body.velocity.y / 10000));
                this.cameras.main.shake(150, shakeIntensity);
            }
        }
    }

    spawnZombie() {
        // Seleccionar un punto de spawn aleatorio
        const spawnPoint = Phaser.Utils.Array.GetRandom(this.zombieSpawnPoints);
        
        // Verificar si hay un jugador cerca (para no spawnear zombies muy cerca del jugador)
        const distanceToPlayer = Phaser.Math.Distance.Between(
            spawnPoint.x, spawnPoint.y,
            this.player.x, this.player.y
        );
        
        console.log('Intentando spawnear zombie. Distancia al jugador:', distanceToPlayer);
        
        if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
            console.log('Spawneando zombie en:', spawnPoint.x, spawnPoint.y);
            
            // Llamar al método con coordenadas explícitas
            return this.spawnZombie(spawnPoint.x, spawnPoint.y);
        } else {
            console.log('Zombie demasiado cerca del jugador, no spawneando');
            return null;
        }
    }
    
    spawnSkeleton() {
        try {
            // Seleccionar un punto de spawn aleatorio
            const spawnPoint = Phaser.Utils.Array.GetRandom(this.skeletonSpawnPoints);
            
            // Verificar si hay un jugador cerca (para no spawnear esqueletos muy cerca del jugador)
            const distanceToPlayer = Phaser.Math.Distance.Between(
                spawnPoint.x, spawnPoint.y,
                this.player.x, this.player.y
            );
            
            console.log('Intentando spawnear esqueleto. Distancia al jugador:', distanceToPlayer);
            
            if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
                console.log('Spawneando esqueleto en:', spawnPoint.x, spawnPoint.y);
                
                // Llamar al método con coordenadas explícitas
                return this.spawnSkeleton(spawnPoint.x, spawnPoint.y);
            } else {
                console.log('Esqueleto demasiado cerca del jugador, no spawneando');
                return null;
            }
        } catch (error) {
            console.error('Error al spawnear esqueleto:', error);
            return null;
        }
    }
    
    spawnGargoyle() {
        try {
            // Seleccionar un punto de spawn aleatorio
            const spawnPoint = Phaser.Utils.Array.GetRandom(this.gargoyleSpawnPoints);
            
            // Verificar si hay un jugador cerca (para no spawnear gárgolas muy cerca del jugador)
            const distanceToPlayer = Phaser.Math.Distance.Between(
                spawnPoint.x, spawnPoint.y,
                this.player.x, this.player.y
            );
            
            console.log('Intentando spawnear gárgola. Distancia al jugador:', distanceToPlayer);
            
            if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
                console.log('Spawneando gárgola en:', spawnPoint.x, spawnPoint.y);
                
                // Llamar al método con coordenadas explícitas
                return this.spawnGargoyle(spawnPoint.x, spawnPoint.y);
            } else {
                console.log('Gárgola demasiado cerca del jugador, no spawneando');
                return null;
            }
        } catch (error) {
            console.error('Error al spawnear gárgola:', error);
            return null;
        }
    }
    
    spawnDemon() {
        try {
            // Seleccionar un punto de spawn aleatorio
            const spawnPoint = Phaser.Utils.Array.GetRandom(this.demonSpawnPoints);
        
            // Verificar si hay un jugador cerca (para no spawnear demonios muy cerca del jugador)
            const distanceToPlayer = Phaser.Math.Distance.Between(
                spawnPoint.x, spawnPoint.y,
                this.player.x, this.player.y
            );
        
            console.log('Intentando spawnear demonio. Distancia al jugador:', distanceToPlayer);
        
            if (distanceToPlayer > 300) { // Solo spawnear si el jugador está lejos
                console.log('Spawneando demonio en:', spawnPoint.x, spawnPoint.y);
                
                // Llamar al método con coordenadas explícitas
                return this.spawnDemon(spawnPoint.x, spawnPoint.y);
            } else {
                console.log('Demonio demasiado cerca del jugador, no spawneando');
                return null;
            }
        } catch (error) {
            console.error('Error al spawnear demonio:', error);
            return null;
        }
    }
    
    // Métodos de colisión entre jugador y enemigos unificados
    handlePlayerZombieCollision(player, zombie) {
        if (zombie.active && !this.isInvulnerable && !this.isDead) {
            console.log('¡Colisión con zombie!');
            this.applyPlayerDamage('zombie');
        }
    }
    
    handlePlayerSkeletonCollision(player, skeleton) {
        if (skeleton.active && !this.isInvulnerable && !this.isDead) {
            console.log('¡Colisión con esqueleto!');
            this.applyPlayerDamage('skeleton');
        }
    }
    
    handlePlayerGargoyleCollision(player, gargoyle) {
        if (gargoyle.active && !this.isInvulnerable && !this.isDead) {
            console.log('¡Colisión con gárgola!');
            this.applyPlayerDamage('gargoyle');
        }
    }
    
    handlePlayerDemonCollision(player, demon) {
        if (demon.active && !this.isInvulnerable && !this.isDead) {
            console.log('¡Colisión con demonio!');
            this.applyPlayerDamage('demon');
        }
    }
    
    // Método centralizado para aplicar daño al jugador
    applyPlayerDamage(source = 'enemy') {
        // Si el jugador ya está invulnerable o muerto, ignorar
        if (this.isInvulnerable || this.isDead || !this.player.active) {
            console.log('Jugador invulnerable o muerto, ignorando daño');
            return;
        }

        console.log(`Jugador recibe daño de ${source}. Vidas: ${this.lives}, Armadura: ${this.hasArmor}`);
        
        // Establecer invulnerabilidad temporal
        this.isInvulnerable = true;
        
        // Reproducir sonido de daño
        if (this.audioManager) {
            this.audioManager.playSfx('hit', { volume: 0.6 });
        }
        
        // Efecto visual de daño (parpadeo)
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 100,
            ease: 'Linear',
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.player.alpha = 1;
            }
        });
        
        // Pequeño retroceso para feedback visual
        const knockbackDirection = this.facingLeft ? 1 : -1;
        this.player.setVelocity(knockbackDirection * 150, -100);
        
        // Si tiene armadura, perderla en lugar de una vida
        if (this.hasArmor) {
            this.hasArmor = false;
            
            // Cambiar el aspecto del jugador (sin armadura)
            this.player.setTexture('arthur-underwear-idle');
            
            // Mostrar el efecto de ruptura de armadura
            this.showArmorBreakEffect();
            
            // Reproducir animación de pérdida de armadura
            if (this.anims.exists('armor-break')) {
                this.player.play('armor-break');
            } else {
                // Si no existe la animación, usar idle como fallback
                this.player.play('idle');
            }
            
            // Reproducir sonido de ruptura de armadura
            if (this.audioManager) {
                this.audioManager.playSfx('armor-break', { volume: 0.6 });
            }
            
            // Mostrar texto flotante
            this.showFloatingText(
                this.player.x,
                this.player.y - 50,
                '¡Armadura perdida!',
                0xFF0000
            );
        } else {
            // Sin armadura, perder una vida
            this.lives--;
            this.updateLivesText();
            
            // Mostrar texto flotante de pérdida de vida
            this.showFloatingText(
                this.player.x,
                this.player.y - 50,
                '-1 Vida',
                0xFF0000
            );
            
            // Si no quedan vidas, game over
            if (this.lives <= 0) {
                console.log('Jugador sin vidas, iniciando secuencia de muerte');
                this.playerDeath();
                return;
            }
        }
        
        // Timer para quitar la invulnerabilidad
        this.time.delayedCall(this.invulnerabilityTime, () => {
            if (this.player && this.player.active && !this.isDead) {
                this.isInvulnerable = false;
                console.log('Invulnerabilidad terminada');
            }
        });
    }
    
    // Método para mostrar el efecto de ruptura de armadura
    showArmorBreakEffect() {
        try {
            // Crear un efecto de partículas para la armadura rompiéndose
            if (!this.armorParticles) {
                this.armorParticles = this.add.particles('particle');
            }
            
            const emitter = this.armorParticles.createEmitter({
                x: this.player.x,
                y: this.player.y,
                speed: { min: 50, max: 100 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                lifespan: 800,
                tint: 0xCCCCCC,
                quantity: 15,
                blendMode: 'ADD'
            });
            
            // Detener emisión después de la explosión inicial
            this.time.delayedCall(100, () => {
                emitter.stop();
                
                // Limpiar después de que las partículas desaparezcan
                this.time.delayedCall(1000, () => {
                    emitter.remove();
                });
            });
            
            // Mostrar un breve destello en la pantalla
            this.cameras.main.flash(200, 255, 255, 255, 0.3);
            
        } catch (error) {
            console.error('Error en showArmorBreakEffect:', error);
        }
    }
    
    // Método para manejar la muerte del jugador
    playerDeath() {
        try {
            console.log('El jugador ha muerto');
            
            // Asegurar que se establezca el estado de muerte
            this.isDead = true;
            
            // Detener al jugador y reproducir animación de muerte
            this.player.setVelocity(0, 0);
            this.player.play('player_death');
            
            // Guardar puntuación alta si corresponde
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore);
                console.log('¡Nueva puntuación alta guardada!:', this.highScore);
            }
            
            // Detener cualquier sonido que se esté reproduciendo
            if (this.audioManager) {
                console.log('Deteniendo todos los sonidos');
                this.audioManager.stopAllSounds();
                // Reproducir sonido de muerte
                this.audioManager.playSfx('death', { volume: 0.7 });
            }
            
            // Pausar la física del juego
            this.physics.pause();
            
            // Efectos visuales de muerte
            this.cameras.main.shake(500, 0.02);
            this.cameras.main.flash(300, 255, 0, 0);
            
            // Cambiar a escena de Game Over después de un pequeño delay
            this.time.delayedCall(2000, () => {
                this.scene.start('GameOverScene', {
                    score: this.score,
                    highScore: this.highScore,
                    level: 1,
                    zombiesKilled: this.zombiesKilled
                });
            });
        } catch (error) {
            console.error('Error en playerDeath:', error);
            // Intentar ir a GameOverScene incluso si hay error
            this.scene.start('GameOverScene', { score: this.score });
        }
    }
    
    handleWeaponZombieCollision(weapon, zombie) {
        try {
            // Verificar que tanto el arma como el zombie estén activos
            if (!weapon || !zombie || !weapon.active || !zombie.active) return;
            
            // Solo procesar si el zombie está activo y el arma no está ya impactando
            if (zombie.isActive && !weapon.isImpacting) {
                console.log('Impacto de arma detectado con zombie');
                
                // Aplicar daño al zombie
                const zombieMuerto = zombie.takeDamage(weapon.damage);
                
                // Hacer que el arma impacte
                weapon.impact();
                
                // Si el zombie murió, añadir puntos y posible drop
                if (zombieMuerto) {
                    // Añadir puntos con multiplicador
                    const pointsEarned = 100 * this.pointsMultiplier;
                    this.score += pointsEarned;
                    this.updateScoreText();
                    
                    // Incrementar contador de zombies eliminados
                    this.zombiesKilled++;
                    
                    // Mostrar texto de puntos
                    this.showFloatingText(
                        zombie.x, 
                        zombie.y - 30, 
                        `+${pointsEarned}`, 
                        0xFFD700
                    );
                    
                    // Probabilidad de soltar un pickup
                    const rand = Math.random();
                    if (rand < 0.1) { // 10% de probabilidad de cofre
                        this.spawnRandomChest(zombie.x, zombie.y);
                    } else if (rand < 0.3) { // 20% de probabilidad de arma
                        this.spawnWeaponPickup(zombie.x, zombie.y);
                    }
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponZombieCollision:', error);
        }
    }

    // Método para mostrar el efecto de ruptura de armadura
    showArmorBreakEffect() {
        try {
            // Crear partículas para el efecto de ruptura
            const particles = this.add.particles('particle');
            
            // Configurar el emisor de partículas
            const emitter = particles.createEmitter({
                x: this.player.x,
                y: this.player.y,
                speed: { min: 50, max: 200 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.5, end: 0 },
                lifespan: 500,
                quantity: 20,
                blendMode: 'ADD'
            });
            
            // Emitir las partículas de una vez
            emitter.explode();
            
            // Destruir el emisor después de un tiempo
            this.time.delayedCall(800, () => {
                particles.destroy();
            });
        } catch (error) {
            console.error('Error en showArmorBreakEffect:', error);
        }
    }

    // Método para manejar colisión entre armas y esqueletos
    handleWeaponSkeletonCollision(weapon, skeleton) {
        try {
            // Verificar que tanto el arma como el esqueleto estén activos
            if (!weapon || !skeleton || !weapon.active || !skeleton.active) return;
            
            // Solo procesar si el esqueleto está activo y el arma no está ya impactando
            if (skeleton.isActive && !weapon.isImpacting) {
                console.log('Impacto de arma detectado con esqueleto');
                
                // Aplicar daño al esqueleto
                const skeletonMuerto = skeleton.takeDamage(weapon.damage);
                
                // Hacer que el armaimpacte
                weapon.impact();
                
                // Si el esqueleto murió, añadir puntos y posible drop
                if (skeletonMuerto) {
                    // Añadir puntos con multiplicador (esqueletos valen más que zombies)
                    const pointsEarned = 200 * this.pointsMultiplier;
                    this.score += pointsEarned;
                    this.updateScoreText();
                    
                    // Incrementar contador de zombies eliminados (usamos el mismo contador)
                    this.zombiesKilled++;
                    
                    // Mostrar texto de puntos
                    this.showFloatingText(
                        skeleton.x, 
                        skeleton.y - 30, 
                        `+${pointsEarned}`, 
                        0xFFD700
                    );
                    
                    // Probabilidad de soltar un pickup de arma o generar un cofre (esqueletos tienen mejor loot)
                    const rand = Math.random();
                    if (rand < 0.15) { // 15% de probabilidad de cofre
                        this.spawnRandomChest(skeleton.x, skeleton.y);
                    } else if (rand < 0.4) { // 25% de probabilidad de arma
                        this.spawnWeaponPickup(skeleton.x, skeleton.y);
                    }
                    
                    // Cada 10 enemigos eliminados, aumentar el multiplicador de puntos
                    if (this.zombiesKilled % 10 === 0) {
                        this.increasePointsMultiplier();
                    }
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponSkeletonCollision:', error);
        }
    }

    handleWeaponGargoyleCollision(weapon, gargoyle) {
        try {
            if (gargoyle.isPetrified && gargoyle.isImmortal) {
                // Si está petrificada e inmortal, la arma simplemente rebota
                weapon.deflect();
                return;
            }
            
            console.log('Arma golpea a gárgola');
            
            // Aplicar daño a la gárgola
            if (gargoyle.takeDamage) {
                gargoyle.takeDamage(weapon.damage);
            }
            
            // Si el arma no es penetrante, destruirla al impactar
            if (!weapon.isPenetrating) {
                weapon.handleImpact();
            }
            
            // Actualizar puntuación
            this.addPoints(50);
        } catch (error) {
            console.error('Error en handleWeaponGargoyleCollision:', error);
        }
    }
    
    handleWeaponDemonCollision(weapon, demon) {
        try {
            if (demon.isImmortal) {
                // Si está en estado inmortal, el arma simplemente rebota
                weapon.deflect();
                return;
            }
            
            console.log('Arma golpea a demonio');
            
            // Aplicar daño al demonio
            if (demon.takeDamage) {
                demon.takeDamage(weapon.damage);
            }
            
            // Si el arma no es penetrante, destruirla al impactar
            if (!weapon.isPenetrating) {
                weapon.handleImpact();
            }
            
            // Actualizar puntuación
            this.addPoints(100);
        } catch (error) {
            console.error('Error en handleWeaponDemonCollision:', error);
        }
    }
    
    // Método para mostrar mensaje de victoria
    showVictoryMessage() {
        try {
            // Texto de victoria
            const victoryText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 - 50,
                '¡VICTORIA!',
                {
                    fontSize: '64px',
                    fontFamily: 'Arial',
                    color: '#FFFF00',
                    stroke: '#000000',
                    strokeThickness: 6,
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5);
            
            // Texto de puntuación final
            const finalScoreText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 20,
                `Puntuación final: ${this.score}`,
                {
                    fontSize: '32px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    strokeThickness: 4,
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5);
            
            // Texto para continuar
            const continueText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 80,
                'Presiona SPACE para continuar',
                {
                    fontSize: '24px',
                    fontFamily: 'Arial',
                    color: '#FFFF00',
                    stroke: '#000000',
                    strokeThickness: 3,
                    align: 'center'
                }
            ).setScrollFactor(0).setOrigin(0.5);
            
            // Hacer parpadear el texto de continuar
            this.tweens.add({
                targets: continueText,
                alpha: 0.2,
                duration: 500,
                ease: 'Power2',
                yoyo: true,
                repeat: -1
            });
            
            // Evento para volver al menú principal
            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('MainMenuScene');
            });
        } catch (error) {
            console.error('Error en showVictoryMessage:', error);
        }
    }
    
    // Método para generar power-ups especiales al derrotar al jefe
    spawnSpecialPowerup(x, y) {
        try {
            // Crear varios power-ups alrededor de la posición del jefe
            const types = ['health', 'invincibility', 'doubleScore'];
            
            // Distribuir power-ups en círculo
            for (let i = 0; i < types.length; i++) {
                const angle = (i / types.length) * Math.PI * 2;
                const distance = 100;
                const powerupX = x + Math.cos(angle) * distance;
                const powerupY = y + Math.sin(angle) * distance - 50; // Ajustar altura
                
                const powerup = new Powerup(this, powerupX, powerupY, types[i]);
                this.powerups.add(powerup);
                
                // Animación de aparición
                powerup.setAlpha(0);
                this.tweens.add({
                    targets: powerup,
                    alpha: 1,
                    y: powerupY - 20,
                    duration: 800,
                    ease: 'Bounce.easeOut',
                    delay: i * 200
                });
            }
        } catch (error) {
            console.error('Error en spawnSpecialPowerup:', error);
        }
    }
    
    // Método para generar cofres en el nivel
    spawnChests() {
        try {
            // Posiciones de los cofres en el nivel
            const chestPositions = [
                { x: 500, y: 320 },   // Sobre plataforma
                { x: 1000, y: 270 },  // Sobre plataforma
                { x: 1700, y: 320 },  // Sobre plataforma
                { x: 2300, y: 320 },  // Sobre plataforma
                { x: 2900, y: 320 }   // Sobre plataforma
            ];
            
            // Crear los cofres
            chestPositions.forEach(pos => {
                const chest = new Chest(this, pos.x, pos.y);
                this.chests.add(chest);
            });
        } catch (error) {
            console.error('Error en spawnChests:', error);
        }
    }
    
    // Método para generar un cofre aleatorio cuando se mata a un enemigo
    spawnRandomChest(x, y) {
        try {
            const chest = new Chest(this, x, y - 10);
            this.chests.add(chest);
            
            // Añadir animación de aparición
            chest.setScale(0);
            this.tweens.add({
                targets: chest,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
        } catch (error) {
            console.error('Error en spawnRandomChest:', error);
        }
    }
    
    // Método para manejar colisión entre armas y cofres
    handleWeaponChestCollision(weapon, chest) {
        try {
            if (!chest.isOpen) {
                console.log('Cofre golpeado por arma');
                chest.open();
                
                // Generar recompensas aleatorias
                const rand = Math.random();
                
                if (rand < 0.4) { // 40% probabilidad de arma
                    this.spawnWeaponPickup(chest.x, chest.y - 30);
                } else if (rand < 0.7) { // 30% probabilidad de power-up
                    const powerupTypes = ['health', 'invincibility', 'doubleScore'];
                    const randomType = Phaser.Utils.Array.GetRandom(powerupTypes);
                    const powerup = new Powerup(this, chest.x, chest.y - 30, randomType);
                    this.powerups.add(powerup);
                } else { // 30% probabilidad de puntos
                    const points = 500;
                    this.addPoints(points);
                    this.showFloatingText(chest.x, chest.y - 30, `+${points}`, 0xFFD700);
                }
                
                // Si el arma no es penetrante, destruirla al impactar
                if (!weapon.isPenetrating) {
                    weapon.handleImpact();
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponChestCollision:', error);
        }
    }
    
    // Método para generar pickup de arma
    spawnWeaponPickup(x, y, type = null) {
        try {
            // Si no se especifica un tipo, seleccionar uno aleatorio
            if (!type) {
                // Excluir el arma actual del jugador para obtener una diferente
                const availableWeapons = this.weaponTypes.filter(weapon => weapon !== this.currentWeapon);
                type = Phaser.Utils.Array.GetRandom(availableWeapons);
            }
            
            console.log('Creando pickup de arma:', type, 'en posición:', x, y);
            
            // Verificar que la textura existe
            const textureName = `${type}-pickup`;
            if (!this.textures.exists(textureName)) {
                console.error(`Textura ${textureName} no encontrada. Texturas disponibles:`, 
                    Array.from(this.textures.keys()));
                return null;
            }
            
            // Crear el pickup
            try {
                const pickup = new WeaponPickup(this, x, y, type);
                this.weaponPickups.add(pickup);
                
                // Aplicar una pequeña física para que el pickup "salte" al ser creado
                pickup.setVelocity(Phaser.Math.Between(-50, 50), -200);
                
                console.log('Pickup creado exitosamente');
                return pickup;
            } catch (innerError) {
                console.error('Error al crear WeaponPickup:', innerError);
                // Crear un sprite básico como fallback
                const fallbackPickup = this.physics.add.sprite(x, y, textureName);
                fallbackPickup.type = type;
                fallbackPickup.weaponType = type;
                this.weaponPickups.add(fallbackPickup);
                return fallbackPickup;
            }
        } catch (error) {
            console.error('Error en spawnWeaponPickup:', error);
            return null;
        }
    }
    
    // Método para manejar la colisión entre el jugador y los pickups de armas
    handlePlayerPickupCollision(player, pickup) {
        try {
            // Obtener el tipo de arma del pickup
            const weaponType = pickup.type || pickup.weaponType || 'spear';
            
            console.log('Pickup recogido:', weaponType);
            
            // Cambiar el arma actual del jugador
            this.currentWeapon = weaponType;
            
            // Actualizar el texto del arma
            this.updateWeaponIndicator();
            
            // Reproducir sonido de recoger arma
            if (this.audioManager) {
                this.audioManager.playSfx('pickup', { volume: 0.5 });
                console.log('Sonido de pickup reproducido');
            }
            
            // Mostrar texto flotante
            this.showFloatingText(
                pickup.x,
                pickup.y - 30,
                `Arma: ${weaponType.toUpperCase()}`,
                0x00FFFF
            );
            
            // Ejecutar método collect del pickup si existe
            if (pickup.collect && typeof pickup.collect === 'function') {
                pickup.collect();
            } else {
                // Si no tiene método collect, destruirlo directamente
                pickup.destroy();
            }
        } catch (error) {
            console.error('Error en handlePlayerPickupCollision:', error);
            // En caso de error, destruir el pickup
            if (pickup && pickup.active) {
                pickup.destroy();
            }
        }
    }
    
    // Método para manejar colisión entre las armas y las plataformas
    handleWeaponPlatformCollision(weapon, platform) {
        try {
            // Solo procesar si el arma no es penetrante
            if (!weapon.isPenetrating) {
                weapon.handleImpact();
            }
        } catch (error) {
            console.error('Error en handleWeaponPlatformCollision:', error);
        }
    }
    
    // Método para actualizar información de depuración
    updateDebugInfo() {
        try {
            if (!this.debugText) return;
            
            // Recopilar información del jugador
            const playerInfo = {
                x: Math.round(this.player.x),
                y: Math.round(this.player.y),
                vx: Math.round(this.player.body.velocity.x),
                vy: Math.round(this.player.body.velocity.y),
                onGround: this.player.body.touching.down,
                isJumping: this.isJumping,
                jumpCount: this.jumpCount,
                weapon: this.currentWeapon,
                health: this.hasArmor ? 'Armored' : `Lives: ${this.lives}`,
                enemies: this.zombies.countActive() + this.skeletons.countActive() + 
                         this.gargoyles.countActive() // Demonios desactivados: + this.demons.countActive()
            };
            
            // Actualizar el texto de depuración
            this.debugText.setText([
                `Pos: (${playerInfo.x}, ${playerInfo.y})`,
                `Vel: (${playerInfo.vx}, ${playerInfo.vy})`,
                `Grounded: ${playerInfo.onGround}`,
                `Jump: ${playerInfo.isJumping} (#${playerInfo.jumpCount})`,
                `Weapon: ${playerInfo.weapon}`,
                `Health: ${playerInfo.health}`,
                `Enemies: ${playerInfo.enemies}`
            ]);
        } catch (error) {
            console.error('Error en updateDebugInfo:', error);
        }
    }

    showJumpParticles() {
        // Mostrar partículas en saltos múltiples
        if (this.doubleJumping) {
            console.log('Mostrando partículas de salto múltiple');
            
            // Calcular intensidad basada en el factor de impulso
            const intensity = Math.min(3, Math.floor(this.jumpBoostFactor * 1.5));
            
            // Posición base para las partículas
            const baseX = this.player.x;
            const baseY = this.player.y + 20;
            
            // Emitir partículas normales
            for (let i = 0; i < this.jumpParticlesGroup.length; i++) {
                const emitter = this.jumpParticlesGroup[i];
                const offsetX = Math.random() * 20 - 10;
                const offsetY = Math.random() * 10 - 5;
                
                // Cantidad de partículas basada en la intensidad
                const particles = intensity * (i % 2 === 0 ? 2 : 1);
                
                // Configurar escala según intensidad
                const scale = { 
                    start: 0.4 + (0.2 * intensity), 
                    end: 0.1 
                };
                emitter.setScale(scale);
                
                // Emitir partículas
                emitter.explode(particles, baseX + offsetX, baseY + offsetY);
            }
            
            // Para saltos potentes, añadir estela y partículas especiales
            if (this.jumpBoostFactor >= 1.4) {
                // Partículas de salto poderoso
                const powerParticles = Math.floor(this.jumpBoostFactor * 5);
                this.powerJumpEmitter.explode(powerParticles, baseX, baseY);
                
                // Efecto de estela
                for (let i = 0; i < 3; i++) {
                    const trailY = baseY + (i * 5);
                    this.trailEmitter.explode(2, baseX, trailY);
                }
                
                // Efecto visual de "explosión" en saltos muy potentes
                if (this.jumpBoostFactor >= 1.8) {
                    // Onda expansiva
                    this.cameras.main.shake(100, Math.min(0.01 * this.jumpBoostFactor, 0.02));
                    
                    // Flash rápido
                    this.player.setTint(0xFFFFAA);
                    this.time.delayedCall(100, () => {
                        this.player.clearTint();
                    });
                }
            }
        }
    }
    
    showLandingParticles() {
        // Mostrar partículas al aterrizar desde una altura
        if (this.player.body.velocity.y > 100) {  // Solo si cae con cierta velocidad
            console.log('Mostrando partículas de aterrizaje');
            const intensity = Math.min(15, Math.abs(Math.floor(this.player.body.velocity.y / 20)));
            this.landingEmitter.explode(intensity, this.player.x, this.player.y + 30);
            
            // Si la caída es muy rápida, añadir más efectos
            if (this.player.body.velocity.y > 300) {
                // Emisión de partículas adicionales para caídas fuertes
                for (let i = 0; i < 3; i++) {
                    const particleIdx = i % this.jumpParticlesGroup.length;
                    const emitter = this.jumpParticlesGroup[particleIdx];
                    const offsetX = (Math.random() * 40) - 20;
                    emitter.explode(5, this.player.x + offsetX, this.player.y + 30);
                }
                
                // Pequeña sacudida de cámara para caídas fuertes
                const shakeIntensity = Math.min(0.01, Math.abs(this.player.body.velocity.y / 10000));
                this.cameras.main.shake(150, shakeIntensity);
            }
        }
    }

    // Método para verificar que todas las animaciones necesarias estén definidas
    ensureAnimationsExist() {
        console.log('Verificando que las animaciones críticas existan...');
        
        // Lista de animaciones críticas que deben existir
        const criticalAnimations = [
            'idle', 
            'run-right', 
            'run-left', 
            'jump', 
            'throw', 
            'player_death',
            'armor-break'
        ];
        
        // Verificar cada animación
        criticalAnimations.forEach(anim => {
            if (!this.anims.exists(anim)) {
                console.warn(`¡Animación crítica '${anim}' no encontrada! Creando una versión básica.`);
                
                // Determinar qué textura usar para esta animación
                let textureKey = 'arthur-idle';
                let frameCount = 4;
                
                switch(anim) {
                    case 'run-right':
                    case 'run-left':
                        textureKey = 'arthur-run';
                        break;
                    case 'jump':
                        textureKey = 'arthur-jump';
                        break;
                    case 'throw':
                        textureKey = 'arthur-throw';
                        break;
                    case 'player_death':
                        textureKey = 'arthur-death';
                        break;
                    case 'armor-break':
                        textureKey = 'arthur-armor';
                        break;
                }
                
                // Verificar que la textura existe
                if (this.textures.exists(textureKey)) {
                    // Crear una animación básica como fallback
                    this.anims.create({
                        key: anim,
                        frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: frameCount - 1 }),
                        frameRate: 8,
                        repeat: anim.includes('death') || anim.includes('armor-break') ? 0 : -1
                    });
                    console.log(`Animación '${anim}' creada como fallback`);
            } else {
                    console.error(`No se puede crear animación fallback para '${anim}': textura '${textureKey}' no encontrada`);
                }
            } else {
                console.log(`Animación '${anim}' verificada correctamente`);
            }
        });
    }

    // Añadir después del método createLevel()
    createUI() {
        // Textos para puntuación, vidas y multiplicador
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);
        
        this.livesText = this.add.text(16, 50, 'LIVES: ' + this.lives, {
            fontSize: '18px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);
        
        this.multiplierText = this.add.text(16, 84, 'Multiplicador: x1.0', {
            fontSize: '16px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);
        
        // Indicador de arma actual
        this.weaponIndicator = this.add.text(
            this.cameras.main.width - 20, 
            16, 
            'Arma: LANZA', 
            {
                fontSize: '16px',
                fill: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setScrollFactor(0).setOrigin(1, 0);
        
        this.updateWeaponIndicator();
        
        console.log('UI creada exitosamente');
    }

    // Método auxiliar para actualizar el indicador de arma
    updateWeaponIndicator() {
        // Formatear el texto del arma actual
        let weaponName = '';
        switch(this.currentWeapon) {
            case 'spear':
                weaponName = 'LANZA';
                break;
            case 'dagger':
                weaponName = 'DAGA';
                break;
            case 'torch':
                weaponName = 'ANTORCHA';
                break;
            case 'axe':
                weaponName = 'HACHA';
                break;
            default:
                weaponName = this.currentWeapon.toUpperCase();
        }
        
        // Actualizar el texto
        if (this.weaponIndicator) {
            this.weaponIndicator.setText('Arma: ' + weaponName);
        }
    }

    // Método para mostrar texto flotante (puntos, mensajes, etc.)
    showFloatingText(x, y, message, color = 0xffffff) {
        const text = this.add.text(x, y, message, {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: color ? '#' + color.toString(16).padStart(6, '0') : '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Animación de desvanecimiento hacia arriba
        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
        
        return text;
    }

    // Método para actualizar el texto de puntuación
    updateScoreText() {
        if (this.scoreText) {
            this.scoreText.setText('SCORE: ' + this.score);
        }
    }

    // Método para actualizar el texto de vidas
    updateLivesText() {
        if (this.livesText) {
            this.livesText.setText('LIVES: ' + this.lives);
        }
    }

    // Método para aumentar el multiplicador de puntos
    increasePointsMultiplier() {
        this.pointsMultiplier += 0.1;
        if (this.multiplierText) {
            this.multiplierText.setText('Multiplicador: x' + this.pointsMultiplier.toFixed(1));
        }
        
        // Mostrar texto flotante
                        this.showFloatingText(
            this.cameras.main.width / 2,
            this.cameras.main.height / 3,
            '¡Multiplicador aumentado!',
            0xffff00
        );
    }

    // Añadir después del método ensureAnimationsExist()
    createBoss() {
        try {
            console.log('Creando jefe final...');
            
            // Posición del jefe (al final del nivel)
            const bossX = this.levelWidth - 400;
            const bossY = 450;
            
            // Verificar si la clase Boss existe
            if (typeof Boss !== 'undefined') {
                // Crear instancia del jefe
                this.boss = new Boss(this, bossX, bossY);
                
                // Añadir el jefe al mundo del juego
                if (this.boss) {
                    // Colisión entre el jefe y las plataformas
                    this.physics.add.collider(this.boss, this.platforms);
                    
                    // Colisión entre el jugador y el jefe
                    this.physics.add.overlap(
                        this.player,
                        this.boss,
                        this.handlePlayerBossCollision,
                        null,
                        this
                    );
                    
                    // Colisión entre armas y el jefe
                    this.physics.add.overlap(
                        this.weapons,
                        this.boss,
                        this.handleWeaponBossCollision,
                        null,
                        this
                    );
                    
                    console.log('Jefe creado exitosamente en:', bossX, bossY);
                    return this.boss;
                }
            } else {
                console.warn('La clase Boss no está disponible. No se pudo crear el jefe.');
            }
        } catch (error) {
            console.error('Error al crear el jefe:', error);
        }
        
        // Si llegamos aquí, es que hubo algún problema
        this.boss = null;
        return null;
    }

    // Método para manejar colisión entre el jugador y el jefe
    handlePlayerBossCollision(player, boss) {
        // Solo procesar si el jefe está activo y el jugador no es invulnerable
        if (boss.active && !this.isInvulnerable && !this.isDead) {
            console.log('¡Colisión con el jefe!');
            
            // Aplicar daño al jugador (más daño que enemigos normales)
            this.applyPlayerDamage('boss');
        }
    }

    // Método para manejar colisión entre armas y el jefe
    handleWeaponBossCollision(weapon, boss) {
        try {
            // Verificar que tanto el arma como el jefe estén activos
            if (!weapon || !boss || !weapon.active || !boss.active) return;
            
            // Solo procesar si el jefe no está en estado invulnerable
            if (!boss.isInvulnerable && !weapon.isImpacting) {
                console.log('Impacto de arma detectado con el jefe');
                
                // Aplicar daño al jefe
                if (boss.takeDamage) {
                    const bossDefeated = boss.takeDamage(weapon.damage);
                    
                    // Hacer que el arma impacte
                    weapon.impact();
                    
                    // Si el jefe fue derrotado
                    if (bossDefeated) {
                        console.log('¡Jefe derrotado!');
                        
                        // Añadir puntos (el jefe vale muchos puntos)
                        const pointsEarned = 5000 * this.pointsMultiplier;
                        this.score += pointsEarned;
                        this.updateScoreText();
                        
                        // Mostrar texto de puntos
                        this.showFloatingText(
                            boss.x, 
                            boss.y - 50, 
                            `+${pointsEarned}`, 
                            0xFFFF00
                        );
                        
                        // Generar power-ups especiales
                        this.spawnSpecialPowerup(boss.x, boss.y);
                        
                        // Mostrar mensaje de victoria
                        this.time.delayedCall(2000, () => {
                            this.showVictoryMessage();
                        });
                    }
                }
            } else {
                // Si el jefe está en estado invulnerable, el arma simplemente rebota
                if (weapon.deflect) {
                    weapon.deflect();
                } else if (!weapon.isPenetrating) {
                    weapon.handleImpact();
                }
            }
        } catch (error) {
            console.error('Error en handleWeaponBossCollision:', error);
        }
    }
    
    // Método para manejar el movimiento del jugador
    handlePlayerMovement() {
        try {
            // Verificar si el personaje existe
            if (!this.player || !this.cursors) return;
            
            // No permitir movimiento si está muerto
            if (this.isDead) {
                // Detener cualquier sonido de caminar
                if (this.walkSoundPlaying && this.audioManager) {
                    this.audioManager.playSfx('walk', { stop: true });
                    this.walkSoundPlaying = false;
                }
            return;
        }
            
            // No permitir movimiento durante el lanzamiento de armas
            if (this.isThrowingWeapon) return;
            
            // Variables para seguimiento de cambios
            const wasOnGround = this.player.body.onFloor();
            const wasMovingHorizontally = Math.abs(this.player.body.velocity.x) > 10;
            
            // Determinar prefijo de animación basado en si tiene armadura o no
            const animPrefix = this.hasArmor ? '' : 'underwear-';
            
            // Movimiento horizontal
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.facingLeft = true;
                
                if (this.player.body.touching.down) {
                    this.player.anims.play(`${animPrefix}run-left`, true);
                    
                    // Sonido de pasos al caminar solo si no se estaba reproduciendo ya
                    if (this.audioManager && !this.walkSoundPlaying) {
                        this.walkSoundPlaying = true;
                        this.audioManager.playSfx('walk', { volume: 0.3, loop: true });
                        console.log('Reproduciendo sonido de caminar');
                    }
                }
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.facingLeft = false;
                
                if (this.player.body.touching.down) {
                    this.player.anims.play(`${animPrefix}run-right`, true);
                    
                    // Sonido de pasos al caminar solo si no se estaba reproduciendo ya
                    if (this.audioManager && !this.walkSoundPlaying) {
                        this.walkSoundPlaying = true;
                        this.audioManager.playSfx('walk', { volume: 0.3, loop: true });
                        console.log('Reproduciendo sonido de caminar');
                    }
                }
            } else {
                // Detener movimiento horizontal
                this.player.setVelocityX(0);
                
                // Detener sonido de caminar
                if (this.walkSoundPlaying) {
                    if (this.audioManager) {
                        this.audioManager.playSfx('walk', { stop: true });
                    }
                    this.walkSoundPlaying = false;
                }
                
                // Animación idle si está en el suelo y no está saltando o lanzando
                if (this.player.body.touching.down && !this.isJumping && !this.isThrowingWeapon) {
                    this.player.anims.play(`${animPrefix}idle`, true);
                }
            }
            
            // Verificar si debemos detener el sonido de caminar por estar en el aire
            if (this.walkSoundPlaying && !this.player.body.touching.down) {
                if (this.audioManager) {
                    this.audioManager.playSfx('walk', { stop: true });
                }
                this.walkSoundPlaying = false;
            }
            
            // Salto cuando se presiona la tecla de flecha arriba
            if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                const currentTime = this.time.now;
                
                if (this.player.body.touching.down) {
                    // Primer salto
                    this.player.setVelocityY(this.jumpHeight);
                this.isJumping = true;
                    this.jumpCount = 1;
                    this.canDoubleJump = true;
                    this.jumpBoostTime = currentTime;
                    this.jumpBoostFactor = 1.0;
                    this.player.anims.play(`${animPrefix}jump`, true);
                    
                    // Detener sonido de caminar cuando salta
                    if (this.walkSoundPlaying) {
                        if (this.audioManager) {
                            this.audioManager.playSfx('walk', { stop: true });
                        }
                        this.walkSoundPlaying = false;
                    }
                    
                    // Sonido de salto
                    if (this.audioManager) {
                        this.audioManager.playSfx('jump', { volume: 0.5 });
                        console.log('Reproduciendo sonido de salto');
                    }
                    
                    // Mostrar partículas de salto
                    this.showJumpParticles();
                } 
                else if (this.canDoubleJump && this.jumpCount < this.maxJumps) {
                    // Saltos adicionales (segundo o tercer salto)
                    // Calcular factor de impulso basado en el tiempo desde el último salto
                    if (currentTime - this.jumpBoostTime < this.jumpBoostWindow) {
                        this.jumpBoostFactor += 0.2; // Aumentar el impulso con pulsaciones rápidas
                        console.log(`Impulso de salto: ${this.jumpBoostFactor.toFixed(1)}x`);
                    } else {
                        this.jumpBoostFactor = 1.0;
                    }
                    
                    // Aplicar el salto con el impulso
                    const boostedJumpHeight = this.jumpHeight * this.jumpBoostFactor;
                    this.player.setVelocityY(boostedJumpHeight);
                    this.jumpCount++;
                    this.jumpBoostTime = currentTime;
                    this.doubleJumping = true;
                    
                    // Efecto visual especial para los saltos múltiples
                    this.showJumpParticles();
                    
                    // Sonido de doble/triple salto
                    if (this.audioManager) {
                        this.audioManager.playSfx('double-jump', { volume: 0.7 });
                        console.log(`Reproduciendo sonido de salto múltiple #${this.jumpCount}`);
                    }
                }
            }
            
            // Detectar cuando está cayendo (para cambiar animación)
            if (this.player.body.velocity.y > 0 && !this.player.body.touching.down) {
                this.isFalling = true;
                
                // Mantener la animación de salto mientras cae
                if (!this.isThrowingWeapon) {
                    this.player.anims.play(`${animPrefix}jump`, true);
            }
            } else if (this.player.body.touching.down) {
                // Si acaba de aterrizar
                if (this.isFalling) {
                    this.isFalling = false;
                    this.doubleJumping = false;
                    
                    // Efecto visual de aterrizaje
                    this.showLandingParticles();
                }
                
                this.isJumping = false;
                
                // Resetear contadores de salto al tocar el suelo
                this.jumpCount = 0;
            }
            
            // Voltear el sprite según la dirección 
            if (this.facingLeft) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
            
            // Verificar animaciones
            if (!this.player.anims.isPlaying && !this.isDead) {
                console.log('No hay animación activa, forzando idle');
                this.player.anims.play(`${animPrefix}idle`, true);
            }
        } catch (error) {
            console.error('Error en handlePlayerMovement:', error);
        }
    }
    
    // Configurar cámara para seguir al jugador
    setupCamera() {
        console.log('Configurando sistema de cámara...');
        
        // Configurar límites de la cámara para que coincidan con el nivel
        this.cameras.main.setBounds(0, 0, this.levelWidth, 600);
        
        // Hacer que la cámara siga al jugador con un seguimiento suave
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        
        // Añadir zona muerta pequeña para evitar movimientos de cámara pequeños
        this.cameras.main.setDeadzone(100, 50);
        
        // Añadir efecto de temblor a la cámara cuando el jugador caiga desde altura
        this.physics.world.on('worldbounds', (body) => {
            // Si el jugador toca los límites del mundo y está cayendo a alta velocidad
            if (body.gameObject === this.player && body.blocked.down && body.velocity.y > 300) {
                this.cameras.main.shake(200, 0.005);
            }
        });
        
        // Mejorar efectos parallax cuando la cámara se mueve
        this.cameras.main.on('camerascroll', (camera, x, y) => {
            if (this.background1) {
                this.background1.tilePositionX = camera.scrollX * 0.1;
            }
            
            if (this.background2) {
                this.background2.tilePositionX = camera.scrollX * 0.4;
            }
        });
        
        // Añadir efecto de flash cuando el jugador recibe daño
        this.playerFlashEffect = {
            duration: 0,
            active: false
        };
    }
    
    // Método para hacer parpadear la cámara (usado para daño, etc)
    flashCamera(color = 0xff0000, duration = 100, intensity = 0.2) {
        this.cameras.main.flash(duration, color[0], color[1], color[2], intensity);
    }
    
    // Método para hacer vibrar la cámara
    shakeCamera(duration = 100, intensity = 0.01) {
        this.cameras.main.shake(duration, intensity);
    }
    
    // Método para configurar todas las colisiones del juego
    setupCollisions() {
        console.log('Configurando colisiones...');
        
        // Colisiones del jugador con el entorno
        this.physics.add.collider(this.player, this.platforms, this.handlePlayerPlatformCollision, null, this);
        
        // Colisiones de los enemigos con el entorno
        this.physics.add.collider(this.zombies, this.platforms);
        this.physics.add.collider(this.skeletons, this.platforms);
        this.physics.add.collider(this.gargoyles, this.platforms);
        
        // Colisiones de armas con el entorno
        this.physics.add.collider(this.weapons, this.platforms, this.handleWeaponPlatformCollision, null, this);
        
        // Colisiones del jugador con los enemigos
        this.physics.add.overlap(this.player, this.zombies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.skeletons, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.gargoyles, this.handlePlayerEnemyCollision, null, this);
        
        // Colisiones de armas con enemigos
        this.physics.add.overlap(this.weapons, this.zombies, this.handleWeaponEnemyCollision, null, this);
        this.physics.add.overlap(this.weapons, this.skeletons, this.handleWeaponEnemyCollision, null, this);
        this.physics.add.overlap(this.weapons, this.gargoyles, this.handleWeaponEnemyCollision, null, this);
        
        // Colisión del jugador con items
        this.physics.add.overlap(this.player, this.chests, this.handlePlayerChestCollision, null, this);
        this.physics.add.overlap(this.player, this.weaponPickups, this.handlePlayerWeaponPickupCollision, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.handlePlayerPowerupCollision, null, this);
        
        console.log('Colisiones configuradas exitosamente');
    }
    
    // Callback para colisión entre jugador y plataforma
    handlePlayerPlatformCollision(player, platform) {
        // Si el jugador estaba cayendo y ahora está en el suelo
        if (this.isFalling && player.body.touching.down) {
            this.isFalling = false;
            
            // Mostrar efecto de aterrizaje
            this.showLandingParticles();
            
            // Reproducir sonido de aterrizaje si la velocidad era alta
            if (Math.abs(player.body.velocity.y) > 300 && this.audioManager) {
                this.audioManager.playSfx('land', { volume: 0.4 });
            }
            
            // Hacer que la cámara tiemble ligeramente en aterrizajes duros
            if (Math.abs(player.body.velocity.y) > 400) {
                this.shakeCamera(200, 0.005);
            }
        }
    }
    
    // Callback para colisión entre arma y plataforma
    handleWeaponPlatformCollision(weapon, platform) {
        // Mostrar efecto de impacto
        if (weapon.active) {
            this.showWeaponImpactEffect(weapon.x, weapon.y, weapon.weaponType);
            
            // Reproducir sonido de impacto
                if (this.audioManager) {
                this.audioManager.playSfx(`${weapon.weaponType}-impact`, { volume: 0.3 });
            }
            
            // Desactivar el arma
            weapon.destroy();
        }
    }
    
    // Callback para colisión entre jugador y enemigo
    handlePlayerEnemyCollision(player, enemy) {
        // Evitar colisión si el jugador es invulnerable o está muerto
        if (this.isInvulnerable || this.isDead) return;
        
        // Aplicar daño al jugador
        this.handlePlayerTakeDamage();
        
        // Reproducir sonido de daño
        if (this.audioManager) {
            this.audioManager.playSfx('player-hit', { volume: 0.5 });
        }
        
        // Hacer parpadear la cámara
        this.flashCamera(0xff0000, 200, 0.3);
        
        // Aplicar ligero knockback al jugador
        const knockbackDirection = player.x < enemy.x ? -1 : 1;
        player.setVelocity(knockbackDirection * 150, -150);
    }
    
    // Callback para colisión entre arma y enemigo
    handleWeaponEnemyCollision(weapon, enemy) {
        // Verificar que tanto el arma como el enemigo estén activos
        if (!weapon.active || !enemy.active) return;
        
        try {
            // Determinar el tipo de enemigo basado en las propiedades o constructor
            let enemyType = '';
            
            if (enemy instanceof Zombie || enemy.texture.key.includes('zombie')) {
                enemyType = 'zombie';
                this.handleWeaponZombieCollision(weapon, enemy);
            } else if (enemy instanceof Skeleton || enemy.texture.key.includes('skeleton')) {
                enemyType = 'skeleton';
                this.handleWeaponSkeletonCollision(weapon, enemy);
            } else if (enemy instanceof Gargoyle || enemy.texture.key.includes('gargoyle')) {
                enemyType = 'gargoyle';
                this.handleWeaponGargoyleCollision(weapon, enemy);
            } else if (enemy instanceof Demon || enemy.texture.key.includes('demon')) {
                enemyType = 'demon';
                this.handleWeaponDemonCollision(weapon, enemy);
            } else {
                // Fallback para otros tipos de enemigos
                console.log('Tipo de enemigo no reconocido:', enemy.texture.key);
                
                                this.player.anims.play(`${animPrefix}idle`, true);
                            }
                        } else {
                            this.player.anims.play(`${animPrefix}jump`, true);
                        }
                    }
                });
                
                // Reproducir sonido de lanzamiento
                if (this.audioManager) {
                    this.audioManager.playSfx('throw', { volume: 0.4 });
                    console.log('Sonido de lanzamiento reproducido');
                }
                
                // Temporizador de seguridad para resetear isThrowingWeapon después de un tiempo
                this.time.delayedCall(500, () => {
                    if (this.isThrowingWeapon) {
                        console.log('Temporizador de seguridad: reseteando estado de lanzamiento');
                        this.isThrowingWeapon = false;
                    }
                });
            } catch (error) {
                console.error('Error al crear arma:', error);
                // En caso de error, resetear el estado
                this.isThrowingWeapon = false;
            }
        }
    }

    // Método para actualizar efectos de fondo
    updateBackgroundEffects(time) {
        // Actualizar fondos con parallax
        if (this.background1) {
            this.background1.tilePositionX = this.cameras.main.scrollX * 0.1;
        }
        
        if (this.background2) {
            this.background2.tilePositionX = this.cameras.main.scrollX * 0.4;
        }
        
        // Actualizar efectos de niebla si existen
        if (this.fogLayer) {
            this.fogLayer.tilePositionX = this.cameras.main.scrollX * 0.2;
            
            // Efecto de movimiento suave
            this.fogLayer.tilePositionY = Math.sin(time / 1000) * 10;
            
            // Variar la opacidad para efecto más realista
            this.fogLayer.alpha = 0.3 + Math.sin(time / 2000) * 0.1;
        }
        
        // Actualizar luces fantasmales si existen
        if (this.ghostLights && Array.isArray(this.ghostLights)) {
            this.ghostLights.forEach((light, index) => {
                // Movimiento flotante único para cada luz
                light.y = light.initialY + Math.sin((time / 2000) + index) * 20;
                
                // Pulso de opacidad
                light.alpha = 0.5 + Math.sin((time / 1500) + (index * 0.5)) * 0.3;
            });
        }
    }
}

export default GameScene; 