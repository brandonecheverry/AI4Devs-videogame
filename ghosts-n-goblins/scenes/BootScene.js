class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Mostrar texto de carga
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Cargando...',
            { 
                font: '20px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Mostrar barra de progreso
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        // Eventos de carga
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('fileprogress', function (file) {
            console.log('Cargando: ' + file.src);
        });
        
        // Manejar errores
        this.load.on('loaderror', function (file) {
            console.error('Error cargando: ' + file.src);
            // Continuar cargando otros archivos
        });
        
        // Cargar assets básicos
        this.load.image('title-bg', 'assets/images/title-bg.png');
        
        // Cargar assets del Escenario 1 (Cementerio)
        this.load.image('stage1-background', 'assets/images/stage1/background.png');
        this.load.image('stage1-midground', 'assets/images/stage1/midground.png');
        this.load.image('ground', 'assets/images/stage1/ground.png');
        this.load.image('platform', 'assets/images/stage1/platform.png');
        this.load.image('extended-ground', 'assets/images/stage1/extended_ground.png');
        this.load.image('tombstone1', 'assets/images/stage1/tombstone1.png');
        this.load.image('tombstone2', 'assets/images/stage1/tombstone2.png');
        this.load.image('tombstone3', 'assets/images/stage1/tombstone3.png');
        this.load.image('dead-tree', 'assets/images/stage1/dead_tree.png');
        this.load.image('boss-altar', 'assets/images/stage1/boss_altar.png');
        
        // Elementos atmosféricos
        this.load.image('fog', 'assets/effects/fog.png');
        this.load.image('ghost-light', 'assets/effects/ghost_light.png');
        
        // Cargar efectos visuales para el salto
        // Cargar partículas con el formato correcto según los archivos existentes
        for (let i = 0; i < 12; i++) {
            this.load.image(`jump_particle_${i}`, `assets/effects/jump_particle_${i}.png`);
            // Cargar versiones con diferentes niveles de transparencia
            for (let alpha of [8, 6, 4, 2]) {
                this.load.image(`jump_particle_${i}_${alpha}`, `assets/effects/jump_particle_${i}_${alpha}.png`);
            }
        }
        this.load.image('jump_trail', 'assets/effects/jump_trail.png');
        
        // Cargar los nuevos sprites de Arthur (guerrero enano)
        this.load.spritesheet('arthur-idle', 'assets/images/Arthur/Idle.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        // Cargar los sprites de Arthur sin armadura (underwear)
        this.load.spritesheet('arthur-underwear-idle', 'assets/images/Arthur/Underwear/Idle.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });

        this.load.spritesheet('arthur-underwear-run', 'assets/images/Arthur/Underwear/Run.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        this.load.spritesheet('arthur-underwear-jump', 'assets/images/Arthur/Underwear/Jump.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        this.load.spritesheet('arthur-underwear-throw', 'assets/images/Arthur/Underwear/Throw.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        // Cargar sprites de enemigos
        this.load.spritesheet('zombie', 'assets/images/Enemies/Zombie.png', {
            frameWidth: 64,    // 384/6 frames = 64 píxeles por frame
            frameHeight: 64,   // Altura real de la imagen
            margin: 0,
            spacing: 0
        });
        
        // Cargar sprite de la armadura (para el efecto de pérdida de armadura)
        this.load.spritesheet('arthur-armor', 'assets/images/Arthur/Armor.png', {
            frameWidth: 40,
            frameHeight: 52
        });
        
        // Cargar sprites para cofres y power-ups
        this.load.spritesheet('chest', 'assets/images/Items/chest_spritesheet.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('chest-glow', 'assets/images/Items/chest_glow.png');
        
        // Cargar sprites de power-ups
        this.load.image('powerup_armor', 'assets/images/Items/powerup_armor.png');
        this.load.image('powerup_points', 'assets/images/Items/powerup_points.png');
        this.load.image('powerup_weapon_spear', 'assets/images/Items/powerup_weapon_spear.png');
        this.load.image('powerup_weapon_dagger', 'assets/images/Items/powerup_weapon_dagger.png');
        this.load.image('powerup_weapon_torch', 'assets/images/Items/powerup_weapon_torch.png');
        this.load.image('powerup_weapon_axe', 'assets/images/Items/powerup_weapon_axe.png');
        this.load.image('powerup_magic', 'assets/images/Items/powerup_magic.png');
        this.load.image('powerup_invincible', 'assets/images/Items/powerup_invincible.png');
        
        this.load.spritesheet('arthur-run', 'assets/images/Arthur/Run.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        this.load.spritesheet('arthur-jump', 'assets/images/Arthur/Jump.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        this.load.spritesheet('arthur-throw', 'assets/images/Arthur/Throw.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        this.load.spritesheet('arthur-death', 'assets/images/Arthur/Death.png', { 
            frameWidth: 40, 
            frameHeight: 52 
        });
        
        // Mantener la carga del sprite original para compatibilidad
        this.load.spritesheet('arthur', 'assets/images/arthur.png', { 
            frameWidth: 32, 
            frameHeight: 48 
        });
        
        // Cargar sprites de armas
        this.load.spritesheet('Spear', 'assets/images/Weapons/Spear.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('Dagger', 'assets/images/Weapons/Dagger.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('Torch', 'assets/images/Weapons/Torch.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.spritesheet('Axe', 'assets/images/Weapons/Axe.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Cargar sprites de pickups de armas
        this.load.image('spear-pickup', 'assets/images/Weapons/spear-pickup.png');
        this.load.image('dagger-pickup', 'assets/images/Weapons/dagger-pickup.png');
        this.load.image('torch-pickup', 'assets/images/Weapons/torch-pickup.png');
        this.load.image('axe-pickup', 'assets/images/Weapons/axe-pickup.png');
        
        // Cargar efectos de partículas
        this.load.image('sparkle', 'assets/images/Weapons/sparkle.png');
        // Partícula genérica para efectos de impacto
        this.load.image('particle', 'assets/effects/jump_particle_1.png');
        
        // Cargar efectos de sonido para armas
        this.load.audio('throw', 'assets/audio/weapons/throw.mp3');
        this.load.audio('pickup', 'assets/audio/weapons/pickup.mp3');
        this.load.audio('spear-impact', 'assets/audio/weapons/spear_impact.mp3');
        this.load.audio('dagger-impact', 'assets/audio/weapons/dagger_impact.mp3');
        this.load.audio('torch-impact', 'assets/audio/weapons/torch_impact.mp3');
        this.load.audio('axe-impact', 'assets/audio/weapons/axe_impact.mp3');
        this.load.audio('impact', 'assets/audio/weapons/spear_impact.mp3');
        
        // Configuración para audio (mejora de compatibilidad)
        this.sound.pauseOnBlur = false; // Evitar que el audio se detenga cuando la ventana pierde el foco
        
        // Cargar audio (especificar formato explícitamente) - Mejorado para compatibilidad
        try {
            // Música del juego
            this.load.audio('title-music', 'assets/audio/music/title-music.mp3');
            this.load.audio('game-music', 'assets/audio/music/background_music.mp3');
            this.load.audio('gameover-music', 'assets/audio/music/game-over.mp3');
            this.load.audio('victory-theme', 'assets/audio/music/victory-theme.mp3');
            this.load.audio('boss-theme', 'assets/audio/music/boss-theme.mp3');
            
            // Efectos de sonido de Arthur
            this.load.audio('jump', 'assets/audio/player/jump.mp3');
            this.load.audio('double-jump', 'assets/audio/player/double-jump.mp3');
            this.load.audio('walk', 'assets/audio/player/walk.mp3');
            this.load.audio('death', 'assets/audio/player/death.mp3');
            this.load.audio('hit', 'assets/audio/player/hit.mp3');
            this.load.audio('armor-break', 'assets/audio/player/armor-break.mp3');
            
            // Efectos de sonido para armas
            this.load.audio('throw', 'https://cdn.freesound.org/previews/350/350985_1873964-lq.mp3');
            this.load.audio('pickup', 'https://cdn.freesound.org/previews/178/178347_1100252-lq.mp3');
            this.load.audio('spear-impact', 'https://cdn.freesound.org/previews/467/467374_8429234-lq.mp3');
            this.load.audio('dagger-impact', 'https://cdn.freesound.org/previews/416/416676_6980534-lq.mp3');
            this.load.audio('torch-impact', 'https://cdn.freesound.org/previews/184/184654_3201971-lq.mp3');
            this.load.audio('axe-impact', 'https://cdn.freesound.org/previews/333/333387_5702864-lq.mp3');
            this.load.audio('impact', 'https://cdn.freesound.org/previews/467/467374_8429234-lq.mp3');
            
            // Efectos de sonido para enemigos
            this.load.audio('zombie-emerge', 'https://cdn.freesound.org/previews/399/399090_3397472-lq.mp3');
            this.load.audio('zombie-hit', 'https://cdn.freesound.org/previews/76/76983_634166-lq.mp3');
            this.load.audio('zombie-death', 'https://cdn.freesound.org/previews/221/221550_4164123-lq.mp3');
            
            // Efectos de sonido para cofres y power-ups
            this.load.audio('chest-open', 'https://cdn.freesound.org/previews/425/425491_7043-lq.mp3');
            this.load.audio('powerup-collect', 'https://cdn.freesound.org/previews/415/415762_1915500-lq.mp3');
            this.load.audio('invincible', 'https://cdn.freesound.org/previews/561/561301_12024490-lq.mp3');
            this.load.audio('magic', 'https://cdn.freesound.org/previews/444/444918_7434491-lq.mp3');
            this.load.audio('armor', 'https://cdn.freesound.org/previews/220/220173_4100852-lq.mp3');
            this.load.audio('points', 'https://cdn.freesound.org/previews/344/344523_3905081-lq.mp3');
            this.load.audio('weapon-pickup', 'https://cdn.freesound.org/previews/495/495002_9962663-lq.mp3');
            
            // Sonidos del jefe
            this.load.audio('boss-roar', 'https://cdn.freesound.org/previews/527/527510_1921967-lq.mp3');
            this.load.audio('boss-hit', 'https://cdn.freesound.org/previews/391/391660_4284968-lq.mp3');
            this.load.audio('boss-attack', 'https://cdn.freesound.org/previews/394/394418_7361044-lq.mp3');
            this.load.audio('boss-death', 'https://cdn.freesound.org/previews/458/458641_3745868-lq.mp3');
            this.load.audio('fireball-impact', 'https://cdn.freesound.org/previews/316/316913_5703955-lq.mp3');
            
            console.log('Audio cargado correctamente');
        } catch (error) {
            console.error('Error cargando archivos de audio:', error);
        }
        
        // Cargar los sprites del jefe
        this.load.spritesheet('boss_flying', 'assets/images/Boss/boss_flying.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        this.load.spritesheet('boss_attack', 'assets/images/Boss/boss_attack.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        this.load.spritesheet('boss_death', 'assets/images/Boss/boss_death.png', {
            frameWidth: 128,
            frameHeight: 128
        });
        
        this.load.image('boss_fireball', 'assets/images/Boss/boss_fireball.png');
        
        // Cargar los sprites del esqueleto
        this.load.image('skeleton_standing', 'assets/sprites/enemies/skeleton_standing.png');
        this.load.image('skeleton_throwing', 'assets/sprites/enemies/skeleton_throwing.png');
        this.load.image('skeleton_emerging', 'assets/sprites/enemies/skeleton_emerging.png');
        this.load.image('bone_projectile', 'assets/sprites/enemies/bone_projectile.png');
        
        // Cargar los sprites de la gárgola
        this.load.image('gargoyle_standing', 'assets/sprites/enemies/gargoyle_standing.png');
        this.load.image('gargoyle_stone', 'assets/sprites/enemies/gargoyle_stone.png');
        this.load.image('gargoyle_swooping', 'assets/sprites/enemies/gargoyle_swooping.png');
        
        // Cargar los sprites del demonio
        this.load.image('demon_standing', 'assets/sprites/enemies/demon_standing.png');
        this.load.image('demon_attack', 'assets/sprites/enemies/demon_attack.png');
        this.load.image('demon_fireball', 'assets/sprites/enemies/demon_fireball.png');
        
        // Sonidos para el esqueleto
        this.load.audio('skeleton-attack', 'https://cdn.freesound.org/previews/350/350986_1422404-lq.mp3');
        this.load.audio('skeleton-hit', 'https://cdn.freesound.org/previews/458/458394_4770-lq.mp3');
        this.load.audio('skeleton-death', 'https://cdn.freesound.org/previews/434/434462_5121236-lq.mp3');
        this.load.audio('bone-throw', 'https://cdn.freesound.org/previews/416/416844_7757823-lq.mp3');
        this.load.audio('bone-impact', 'https://cdn.freesound.org/previews/417/417752_2689281-lq.mp3');
        this.load.audio('ground-break', 'https://cdn.freesound.org/previews/146/146389_2597876-lq.mp3');
        
        // Sonidos para la gárgola
        this.load.audio('gargoyle-screech', 'https://cdn.freesound.org/previews/334/334262_5121236-lq.mp3');
        this.load.audio('gargoyle-hit', 'https://cdn.freesound.org/previews/378/378267_6687666-lq.mp3');
        this.load.audio('gargoyle-death', 'https://cdn.freesound.org/previews/352/352193_4094101-lq.mp3');
        this.load.audio('stone-transform', 'https://cdn.freesound.org/previews/420/420621_7004792-lq.mp3');
        
        // Sonidos para el demonio
        this.load.audio('demon-roar', 'https://cdn.freesound.org/previews/536/536785_5465847-lq.mp3');
        this.load.audio('demon-hit', 'https://cdn.freesound.org/previews/431/431479_8374303-lq.mp3');
        this.load.audio('demon-death', 'https://cdn.freesound.org/previews/367/367337_6687666-lq.mp3');
        this.load.audio('demon-fireball', 'https://cdn.freesound.org/previews/370/370486_6687666-lq.mp3');
        
        // Evento cuando la carga está completa
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            
            // Verificar si las imágenes principales se cargaron
            if (!this.textures.exists('arthur-idle')) {
                const errorText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'Error: No se pudo cargar el sprite del jugador',
                    { font: '16px Arial', fill: '#ff0000' }
                ).setOrigin(0.5);
                
                // Mostrar el error por 3 segundos y luego continuar
                this.time.delayedCall(3000, () => {
                    errorText.destroy();
                    this.scene.start('TitleScene');
                });
            } else {
                this.scene.start('TitleScene');
            }
        });
    }
    
    create() {
        // Desbloquear audio tan pronto como sea posible
        if (this.sound.locked) {
            console.log('Intentando desbloquear audio...');
            
            // Agregar evento para desbloquear audio con cualquier interacción
            this.input.once('pointerdown', () => {
                this.sound.unlock();
                console.log('Audio desbloqueado con interacción de ratón');
            });
            
            this.input.keyboard.once('keydown', () => {
                this.sound.unlock();
                console.log('Audio desbloqueado con teclado');
            });
        } else {
            console.log('Audio ya desbloqueado');
        }
    }
}

export default BootScene; 