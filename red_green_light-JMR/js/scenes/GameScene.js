/**
 * GameScene - Escena principal del juego "Luz Roja, Luz Verde"
 */
import Player from '../entities/Player.js';
import TrafficLight from '../entities/TrafficLight.js';
import { 
    GAME_CONFIG, 
    PLAYER_CONFIG, 
    LINES_CONFIG, 
    GAME_STATES,
    TRAFFIC_LIGHT_STATES,
    GAME_TEXTS,
    AUDIO_CONFIG
} from '../config/gameConfig.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Cargar el archivo de audio para la luz verde
        this.load.audio('greenLight', 'assets/audio/greenLight.mp3');
        
        // Cargar sprites del pingüino
        this.load.image('penguin_walk1', 'assets/sprites/penguin_walk01.png');
        this.load.image('penguin_walk2', 'assets/sprites/penguin_walk02.png');
        this.load.image('penguin_walk3', 'assets/sprites/penguin_walk03.png');
        this.load.image('penguin_walk4', 'assets/sprites/penguin_walk04.png');
        
        this.load.image('penguin_slide1', 'assets/sprites/penguin_slide01.png');
        this.load.image('penguin_slide2', 'assets/sprites/penguin_slide02.png');
        
        this.load.image('penguin_die1', 'assets/sprites/penguin_die01.png');
        this.load.image('penguin_die2', 'assets/sprites/penguin_die02.png');
        this.load.image('penguin_die3', 'assets/sprites/penguin_die03.png');
        this.load.image('penguin_die4', 'assets/sprites/penguin_die04.png');
        
        this.load.image('penguin_hurt', 'assets/sprites/penguin_hurt.png');
    }

    create() {
        // Inicializar variables
        this.gameWidth = this.sys.game.config.width;
        this.gameHeight = this.sys.game.config.height;
        
        // Crear animaciones para el pingüino
        this.setupAnimations();
        
        // Crear líneas de inicio y meta
        this.createLines();
        
        // Crear el jugador
        this.createPlayer();
        
        // Crear el semáforo
        this.createTrafficLight();
        
        // Configurar controles
        this.setupControls();
        
        // Añadir zona de meta
        this.createFinishZone();
        
        // Crear elementos de UI
        this.createUI();
        
        // Configurar audio
        this.setupAudio();
        
        // Iniciar el semáforo
        this.trafficLight.start();
    }
    
    /**
     * Configura las animaciones del juego
     */
    setupAnimations() {
        // Animación de caminar
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'penguin_walk1' },
                { key: 'penguin_walk2' },
                { key: 'penguin_walk3' },
                { key: 'penguin_walk4' }
            ],
            frameRate: 10,
            repeat: -1
        });
        
        // Animación de deslizamiento
        this.anims.create({
            key: 'slide',
            frames: [
                { key: 'penguin_slide1' },
                { key: 'penguin_slide2' }
            ],
            frameRate: 8,
            repeat: -1
        });
        
        // Animación de muerte
        this.anims.create({
            key: 'die',
            frames: [
                { key: 'penguin_die1' },
                { key: 'penguin_die2' },
                { key: 'penguin_die3' },
                { key: 'penguin_die4' }
            ],
            frameRate: 8,
            repeat: 0
        });
        
        // Animación de daño/herida
        this.anims.create({
            key: 'hurt',
            frames: [{ key: 'penguin_hurt' }],
            frameRate: 1,
            repeat: 0
        });
    }
    
    /**
     * Crea las líneas de inicio y meta
     */
    createLines() {
        // Línea de inicio (verde)
        const startLineConfig = LINES_CONFIG.startLine;
        const startGraphics = this.add.graphics();
        startGraphics.fillStyle(startLineConfig.color, 1);
        startGraphics.fillRect(
            startLineConfig.x, 
            startLineConfig.y, 
            startLineConfig.width, 
            startLineConfig.height
        );
        
        // Línea de meta (roja)
        const finishLineConfig = LINES_CONFIG.finishLine;
        const finishGraphics = this.add.graphics();
        finishGraphics.fillStyle(finishLineConfig.color, 1);
        finishGraphics.fillRect(
            finishLineConfig.x, 
            finishLineConfig.y, 
            finishLineConfig.width, 
            finishLineConfig.height
        );
    }
    
    /**
     * Crea el jugador
     */
    createPlayer() {
        const { x, y } = PLAYER_CONFIG.initialPosition;
        this.player = new Player(this, x, y, PLAYER_CONFIG);
    }
    
    /**
     * Crea el semáforo
     */
    createTrafficLight() {
        this.trafficLight = new TrafficLight(this);
        
        // Configurar callback para cambios de estado
        this.trafficLight.setStateChangeCallback((state) => {
            if (state === TRAFFIC_LIGHT_STATES.GREEN) {
                // Iniciar música cuando cambia a verde
                if (this.greenLightMusic) {
                    this.greenLightMusic.play();
                    this.audioIndicator.setVisible(true);
                }
            } else {
                // Detener música cuando cambia a rojo
                if (this.greenLightMusic) {
                    this.greenLightMusic.pause();
                    this.audioIndicator.setVisible(false);
                }
                
                // Verificar si el jugador está en movimiento con luz roja
                if (this.player.isPlayerMoving() && this.player.getState() === GAME_STATES.MOVING) {
                    this.player.kill();
                }
            }
        });
    }
    
    /**
     * Configura los controles del juego
     */
    setupControls() {
        // Crear cursores
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Configurar barra espaciadora
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    /**
     * Crea la zona de meta
     */
    createFinishZone() {
        // Usar la posición de la línea de meta
        const { x, y, height } = LINES_CONFIG.finishLine;
        
        // Crear zona
        this.finishZone = this.add.zone(x, y + height/2).setSize(20, height);
        this.physics.world.enable(this.finishZone);
        this.finishZone.body.setAllowGravity(false);
        this.finishZone.body.moves = false;
        
        // Añadir colisión con el jugador
        this.physics.add.overlap(
            this.player.getSprite(), 
            this.finishZone, 
            this.handleFinish, 
            null, 
            this
        );
    }
    
    /**
     * Crea los elementos de UI
     */
    createUI() {
        // Texto de depuración
        this.debugText = this.add.text(10, 10, 'Debug: Iniciando...', {
            fontSize: '14px',
            fill: '#fff',
            backgroundColor: '#000'
        });
        
        // Texto de instrucciones
        GAME_TEXTS.instructions.forEach(instruction => {
            this.add.text(instruction.position.x, instruction.position.y, instruction.text, {
                fontSize: '18px',
                fill: '#fff'
            }).setOrigin(0.5);
        });
        
        // Crear indicador de audio (inicialmente invisible)
        this.audioIndicator = this.add.text(
            AUDIO_CONFIG.indicatorPosition.x, 
            AUDIO_CONFIG.indicatorPosition.y, 
            AUDIO_CONFIG.indicatorText, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#00aa00',
                padding: { x: 5, y: 2 }
            }
        ).setVisible(false);
    }
    
    /**
     * Configura el sistema de audio
     */
    setupAudio() {
        // Verificar si el archivo de audio está disponible
        if (this.cache.audio.exists('greenLight')) {
            try {
                this.greenLightMusic = this.sound.add('greenLight', {
                    loop: true,
                    volume: AUDIO_CONFIG.greenLightVolume
                });
                
                // Si el semáforo está en verde, iniciar la música
                if (this.trafficLight.isGreen() && !this.sound.locked) {
                    this.greenLightMusic.play();
                    this.audioIndicator.setVisible(true);
                }
            } catch (error) {
                console.error('Error al crear el audio:', error);
                this.greenLightMusic = null;
            }
        } else {
            console.warn('Audio "greenLight" no encontrado en caché');
            this.greenLightMusic = null;
        }
    }
    
    /**
     * Maneja cuando el jugador llega a la meta
     */
    handleFinish() {
        // Verificar que el jugador no esté ya muerto o en meta
        if (this.player.getState() === GAME_STATES.MOVING || 
            this.player.getState() === GAME_STATES.PAUSED) {
            
            // Detener música si está sonando
            if (this.greenLightMusic && this.greenLightMusic.isPlaying) {
                this.greenLightMusic.stop();
                this.audioIndicator.setVisible(false);
            }
            
            // Marcar como ganador
            this.player.reachFinish();
            
            // Detener el semáforo
            this.trafficLight.stop();
        }
    }
    
    update() {
        // Actualizar texto de depuración
        this.updateDebugText();
        
        // Manejar controles
        this.handleControls();
        
        // Actualizar el jugador
        this.player.update();
    }
    
    /**
     * Maneja los controles del jugador
     */
    handleControls() {
        const playerState = this.player.getState();
        
        // Control con barra espaciadora
        if (this.spaceBar.isDown && 
           (playerState === GAME_STATES.WAITING || 
            playerState === GAME_STATES.PAUSED || 
            playerState === GAME_STATES.MOVING)) {
            
            // Acelerar al jugador
            this.player.accelerate();
        } 
        else if (playerState === GAME_STATES.MOVING) {
            // Aplicar desaceleración cuando no se presiona la barra espaciadora
            this.player.decelerate();
        }
        
        // Detectar movimiento durante luz roja
        if (this.trafficLight.isRed() && 
            this.player.isPlayerMoving() && 
            playerState === GAME_STATES.MOVING) {
            
            this.player.kill();
        }
    }
    
    /**
     * Actualiza el texto de depuración
     */
    updateDebugText() {
        const playerSprite = this.player.getSprite();
        
        this.debugText.setText(
            `Debug: Estado: ${this.player.getState()}, ` +
            `Moviendo: ${this.player.isPlayerMoving()}, ` +
            `Velocidad: ${this.player.speed.toFixed(1)}, ` +
            `PosX: ${playerSprite.x.toFixed(1)}, ` +
            `Semáforo: ${this.trafficLight.getState()}`
        );
    }
}

export default GameScene; 