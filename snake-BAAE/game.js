const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configuración
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = "RIGHT";
let gameLoop;

// Dibujar elementos
function draw() {
    // Limpiar canvas
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar serpiente
    ctx.fillStyle = "#0f0";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Dibujar comida
    ctx.fillStyle = "#f00";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// Actualizar juego
function update() {
    const head = { ...snake[0] };

    // Mover cabeza
    switch (direction) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
    }

    // Verificar colisiones
    if (head.x < 0 || head.x >= canvas.width / gridSize || 
        head.y < 0 || head.y >= canvas.height / gridSize ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameLoop);
        alert("Game Over!");
        document.location.reload();
    }

    // Añadir nueva cabeza
    snake.unshift(head);

    // Comer comida
    if (head.x === food.x && head.y === food.y) {
        generateFood();
    } else {
        snake.pop(); // Quitar cola si no comió
    }
}

// Generar comida aleatoria
function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

// Controles
document.addEventListener("keydown", e => {
    switch (e.key) {
        case "ArrowUp": if (direction !== "DOWN") direction = "UP"; break;
        case "ArrowDown": if (direction !== "UP") direction = "DOWN"; break;
        case "ArrowLeft": if (direction !== "RIGHT") direction = "LEFT"; break;
        case "ArrowRight": if (direction !== "LEFT") direction = "RIGHT"; break;
    }
});

// Iniciar juego
function startGame() {
    gameLoop = setInterval(() => {
        update();
        draw();
    }, 100); // Velocidad
}

startGame();