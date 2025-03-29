// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true // Activamos el debug para ver las físicas
        }
    },
    input: {
        keyboard: {
            // Evitar que la barra espaciadora haga scroll en la página
            capture: [Phaser.Input.Keyboard.KeyCodes.SPACE]
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Variables globales
let player;
let startLine;
let finishLine;
let trafficLight;
let trafficLightState = 'green'; // 'green' o 'red'
let cursors;
let spaceBar;
let isMoving = false;
let gameState = 'waiting'; // 'waiting', 'moving', 'paused', 'balancing', 'finished', 'dead'
let playerSpeed = 0;
let maxSpeed = 300;
let acceleration = 5;
let lightTimer;

// Variables para el minijuego de equilibrio
let balanceBar;
let balanceTarget;
let balancePointer;
let balanceActive = false;
let balanceSuccess = false;
let balanceFails = 0;
let maxBalanceFails = 3;

// Iniciar el juego
const game = new Phaser.Game(config);

// Cargar assets
function preload() {
    // No necesitamos precargar ningún asset por ahora
}

// Crear elementos del juego
function create() {
    // Crear línea de inicio (verde) - Ahora a la izquierda
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x00ff00, 1);
    graphics1.fillRect(100, 100, 5, 400);
    
    // Crear línea de meta (roja) - Ahora a la derecha
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0000, 1);
    graphics2.fillRect(700, 100, 5, 400);
    
    // Crear el jugador usando un círculo gráfico
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillCircle(120, 300, 15);
    
    // Crear el jugador como un cuerpo físico
    player = this.physics.add.sprite(120, 300, '');
    player.setCircle(15);
    player.setDisplaySize(30, 30);
    player.setVisible(false); // Hacemos el sprite invisible ya que usamos el gráfico
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    
    // Guardar referencia al gráfico del jugador
    player.playerGraphic = playerGraphics;
    
    // Crear semáforo - Reposicionado arriba
    trafficLight = this.add.circle(400, 50, 30, 0x00ff00);
    
    // Texto de instrucciones
    this.add.text(400, 550, 'Mantén presionado ESPACIO para moverte', {
        fontSize: '18px',
        fill: '#fff'
    }).setOrigin(0.5);
    
    // Configurar controles
    cursors = this.input.keyboard.createCursorKeys();
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Zona de meta - Ahora a la derecha
    finishZone = this.add.zone(700, 300).setSize(20, 400);
    this.physics.world.enable(finishZone);
    finishZone.body.setAllowGravity(false);
    finishZone.body.moves = false;
    
    // Colisión con meta
    this.physics.add.overlap(player, finishZone, reachFinish, null, this);
    
    // Iniciar temporizador para cambiar las luces
    this.time.addEvent({
        delay: Phaser.Math.Between(3000, 8000),
        callback: toggleLight,
        callbackScope: this,
        loop: false
    });
    
    // Texto de depuración
    this.debugText = this.add.text(10, 10, 'Debug: Esperando movimiento', {
        fontSize: '14px',
        fill: '#fff',
        backgroundColor: '#000'
    });
    
    // Testear tecla
    this.input.keyboard.on('keydown-SPACE', function() {
        console.log("TECLA ESPACIO PRESIONADA - EVENTO TECLADO");
    });
    
    // Crear elementos del minijuego de equilibrio (inicialmente invisibles) - DESACTIVADO
    // createBalanceGame.call(this);
}

// Crear elementos para el minijuego de equilibrio
function createBalanceGame() {
    // Contenedor para el minijuego
    const balanceContainer = this.add.container(400, 300);
    balanceContainer.setVisible(false);
    
    // Fondo
    const balanceBg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.7);
    
    // Barra de equilibrio
    balanceBar = this.add.rectangle(0, 0, 300, 20, 0x888888);
    
    // Zona segura
    balanceTarget = this.add.rectangle(0, 0, 60, 20, 0x00ff00);
    
    // Puntero
    balancePointer = this.add.triangle(0, -40, 0, 0, 10, -15, -10, -15, 0xff0000);
    
    // Texto de instrucciones
    const balanceText = this.add.text(0, 50, 'Presiona ESPACIO cuando el puntero esté en la zona verde', {
        fontSize: '14px',
        fill: '#fff'
    }).setOrigin(0.5);
    
    // Añadir todos los elementos al contenedor
    balanceContainer.add([balanceBg, balanceBar, balanceTarget, balancePointer, balanceText]);
    
    // Guardar referencia al contenedor
    this.balanceContainer = balanceContainer;
}

// Iniciar minijuego de equilibrio
function startBalanceGame() {
    gameState = 'balancing';
    balanceActive = true;
    balanceSuccess = false;
    
    // Hacer visible el contenedor
    this.balanceContainer.setVisible(true);
    
    // Posición inicial aleatoria del puntero
    const startX = Phaser.Math.Between(-120, 120);
    balancePointer.x = startX;
    
    // Agregar tweens para mover el puntero de lado a lado
    this.tweens.add({
        targets: balancePointer,
        x: -130,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

// Comprobar equilibrio
function checkBalance() {
    // Verificar si el puntero está dentro del objetivo
    if (Math.abs(balancePointer.x - balanceTarget.x) < 30) {
        balanceSuccess = true;
        endBalanceGame.call(this, true);
    } else {
        balanceFails++;
        if (balanceFails >= maxBalanceFails) {
            endBalanceGame.call(this, false);
        } else {
            // Continuar con el juego del equilibrio
            this.time.delayedCall(500, function() {
                balanceActive = true;
            }, [], this);
        }
    }
}

// Finalizar minijuego de equilibrio
function endBalanceGame(success) {
    balanceActive = false;
    this.balanceContainer.setVisible(false);
    
    // Detener el tween del puntero
    this.tweens.killTweensOf(balancePointer);
    
    if (success) {
        gameState = 'paused';
        playerSpeed = 0;
    } else {
        killPlayer.call(this);
    }
}

// Cambiar el estado del semáforo
function toggleLight() {
    if (trafficLightState === 'green') {
        // Cambiar a luz roja
        trafficLightState = 'red';
        trafficLight.setFillStyle(0xff0000);
        
        // Detectar si el jugador sigue moviéndose
        this.time.delayedCall(500, function() {
            if (isMoving && gameState === 'moving') {
                killPlayer.call(this);
            }
        }, [], this);
        
        // Programar cambio a luz verde
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: toggleLight,
            callbackScope: this,
            loop: false
        });
    } else {
        // Cambiar a luz verde
        trafficLightState = 'green';
        trafficLight.setFillStyle(0x00ff00);
        
        // Programar cambio a luz roja
        this.time.addEvent({
            delay: Phaser.Math.Between(3000, 8000),
            callback: toggleLight,
            callbackScope: this,
            loop: false
        });
    }
}

// Eliminar al jugador
function killPlayer() {
    gameState = 'dead';
    
    // Efecto visual de muerte
    this.tweens.add({
        targets: player,
        scale: 1.5,
        alpha: 0,
        y: player.y + 30,
        duration: 800,
        ease: 'Power2',
        onComplete: function() {
            // Mancha de sangre donde murió el jugador
            this.add.circle(player.x, player.y, 20, 0xff0000);
            
            // Limpiar el gráfico del jugador
            player.playerGraphic.clear();
            
            // Mensaje de game over
            this.add.text(400, 300, '¡ELIMINADO!', {
                fontSize: '48px',
                fill: '#ff0000'
            }).setOrigin(0.5);
            
            this.add.text(400, 350, 'Presiona R para reiniciar', {
                fontSize: '18px',
                fill: '#fff'
            }).setOrigin(0.5);
            
            // Tecla para reiniciar
            this.input.keyboard.once('keydown-R', function() {
                this.scene.restart();
            }, this);
        },
        callbackScope: this
    });
}

// Actualizar el juego
function update() {
    // Actualizar texto de depuración
    this.debugText.setText(`Debug: Estado: ${gameState}, Moviendo: ${isMoving}, Velocidad: ${playerSpeed}, PosX: ${player.x}`);
    
    // Control de movimiento con barra espaciadora
    if (spaceBar.isDown && (gameState === 'waiting' || gameState === 'paused' || gameState === 'moving')) {
        if (gameState !== 'moving') {
            gameState = 'moving';
            console.log("Cambiando a estado moving");
        }
        
        isMoving = true;
        
        // Aumentar velocidad mientras se mantiene pulsado
        if (playerSpeed < maxSpeed) {
            playerSpeed += acceleration;
        }
        
        // Mover al jugador hacia la derecha
        player.setVelocityX(playerSpeed);
        console.log("Velocidad: " + playerSpeed);
    } 
    else if (spaceBar.isUp && gameState === 'moving') {
        isMoving = false;
        player.setVelocity(0);
        console.log("Deteniendo jugador");
        
        // Sin minijuego, solo cambiamos al estado 'paused'
        gameState = 'paused';
        playerSpeed = 0;
    }
    
    // Detectar movimiento durante luz roja
    if (trafficLightState === 'red' && isMoving && gameState === 'moving') {
        killPlayer.call(this);
    }
    
    // Actualizar la posición del gráfico para que siga al cuerpo físico
    if (gameState !== 'dead') {
        player.playerGraphic.clear();
        player.playerGraphic.fillStyle(0x3498db, 1);
        player.playerGraphic.fillCircle(player.x, player.y, 15);
    }
}

// Función para cuando el jugador llega a la meta
function reachFinish() {
    if (gameState === 'moving' || gameState === 'paused') {
        gameState = 'finished';
        player.setVelocity(0);
        
        // Cambiar color del jugador a verde al ganar
        player.playerGraphic.clear();
        player.playerGraphic.fillStyle(0x00ff00, 1);
        player.playerGraphic.fillCircle(player.x, player.y, 15);
        
        // Mensaje de victoria
        this.add.text(400, 300, '¡META ALCANZADA!', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        this.add.text(400, 350, 'Presiona R para reiniciar', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Tecla para reiniciar
        this.input.keyboard.once('keydown-R', function() {
            this.scene.restart();
        }, this);
    }
} 