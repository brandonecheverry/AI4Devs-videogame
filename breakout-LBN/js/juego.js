// Elementos del DOM
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaGameOver = document.getElementById('pantalla-game-over');
const pantallaVictoria = document.getElementById('pantalla-victoria');
const btnJugar = document.getElementById('btn-jugar');
const btnReiniciarGO = document.getElementById('btn-reiniciar-go');
const btnReiniciarV = document.getElementById('btn-reiniciar-v');
const canvas = document.getElementById('juego');
const ctx = canvas.getContext('2d');
const puntuacionElement = document.getElementById('puntuacion');
const nivelElement = document.getElementById('nivel');
const vidasElement = document.getElementById('vidas');
const puntuacionFinalElement = document.getElementById('puntuacion-final');
const puntuacionVictoriaElement = document.getElementById('puntuacion-victoria');

// Variables del juego
let puntuacion = 0;
let nivel = 1;
let vidas = 3;
let juegoEnCurso = false;
let animacionId;

// Configuración del juego
const configuracion = {
    velocidadPala: 8,
    velocidadInicial: 4,
    incrementoVelocidad: 0.05,
    filasBloques: 5,
    columnasBloques: 10,
    colorBloques: ['#FF5252', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3']
};

// Objetos del juego
const pelota = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radio: 10,
    velocidadX: configuracion.velocidadInicial,
    velocidadY: -configuracion.velocidadInicial,
    color: '#FFFFFF'
};

const pala = {
    ancho: 100,
    alto: 15,
    x: (canvas.width - 100) / 2,
    y: canvas.height - 20,
    color: '#4CAF50'
};

// Creación de bloques
const bloques = [];
const anchoBloques = (canvas.width - 50) / configuracion.columnasBloques;
const altoBloques = 25;

function crearBloques() {
    bloques.length = 0; // Limpiamos el array de bloques existentes
    
    for (let fila = 0; fila < configuracion.filasBloques; fila++) {
        for (let columna = 0; columna < configuracion.columnasBloques; columna++) {
            bloques.push({
                x: columna * anchoBloques + 25,
                y: fila * altoBloques + 50,
                ancho: anchoBloques - 5,
                alto: altoBloques - 5,
                color: configuracion.colorBloques[fila],
                activo: true
            });
        }
    }
}

// Control de pala
let teclaIzquierdaPresionada = false;
let teclaDerechaPresionada = false;
let posicionRaton = null;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        teclaIzquierdaPresionada = true;
    } else if (e.key === 'ArrowRight') {
        teclaDerechaPresionada = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        teclaIzquierdaPresionada = false;
    } else if (e.key === 'ArrowRight') {
        teclaDerechaPresionada = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    posicionRaton = e.clientX - rect.left;
});

// Dibujar los elementos
function dibujarPelota() {
    ctx.beginPath();
    ctx.arc(pelota.x, pelota.y, pelota.radio, 0, Math.PI * 2);
    ctx.fillStyle = pelota.color;
    ctx.fill();
    ctx.closePath();
}

function dibujarPala() {
    ctx.beginPath();
    ctx.rect(pala.x, pala.y, pala.ancho, pala.alto);
    ctx.fillStyle = pala.color;
    ctx.fill();
    ctx.closePath();
}

function dibujarBloques() {
    bloques.forEach(bloque => {
        if (bloque.activo) {
            ctx.beginPath();
            ctx.rect(bloque.x, bloque.y, bloque.ancho, bloque.alto);
            ctx.fillStyle = bloque.color;
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }
    });
}

function dibujarPuntuacion() {
    puntuacionElement.textContent = puntuacion;
    nivelElement.textContent = nivel;
    vidasElement.textContent = vidas;
}

// Detección de colisiones
function detectarColisionPared() {
    // Colisión con paredes laterales
    if (pelota.x + pelota.velocidadX > canvas.width - pelota.radio || 
        pelota.x + pelota.velocidadX < pelota.radio) {
        pelota.velocidadX = -pelota.velocidadX;
        reproducirSonido('rebote');
    }
    
    // Colisión con pared superior
    if (pelota.y + pelota.velocidadY < pelota.radio) {
        pelota.velocidadY = -pelota.velocidadY;
        reproducirSonido('rebote');
    }
}

function detectarColisionPala() {
    if (pelota.y + pelota.velocidadY > canvas.height - pelota.radio - pala.alto) {
        if (pelota.x > pala.x && pelota.x < pala.x + pala.ancho) {
            // Calcular la dirección de rebote según donde golpee la pala
            const impacto = (pelota.x - (pala.x + pala.ancho / 2)) / (pala.ancho / 2);
            pelota.velocidadX = impacto * 5; // Influencia del lugar de golpeo
            pelota.velocidadY = -pelota.velocidadY;
            reproducirSonido('rebote');
        } else if (pelota.y + pelota.velocidadY > canvas.height - pelota.radio) {
            // La pelota cae fuera de la pala
            perderVida();
        }
    }
}

function detectarColisionBloques() {
    for (let i = 0; i < bloques.length; i++) {
        const bloque = bloques[i];
        if (bloque.activo) {
            // Detección básica de colisión con bloques
            if (pelota.x > bloque.x && pelota.x < bloque.x + bloque.ancho &&
                pelota.y > bloque.y && pelota.y < bloque.y + bloque.alto) {
                
                // Determinar el lado más cercano para un rebote más realista
                const dx = Math.min(
                    Math.abs(pelota.x - bloque.x),
                    Math.abs(pelota.x - (bloque.x + bloque.ancho))
                );
                const dy = Math.min(
                    Math.abs(pelota.y - bloque.y),
                    Math.abs(pelota.y - (bloque.y + bloque.alto))
                );
                
                if (dx < dy) {
                    pelota.velocidadX = -pelota.velocidadX;
                } else {
                    pelota.velocidadY = -pelota.velocidadY;
                }
                
                bloque.activo = false;
                puntuacion += 10;
                reproducirSonido('romperBloque');
                
                // Verificar si todos los bloques están destruidos
                verificarVictoria();
            }
        }
    }
}

function verificarVictoria() {
    const quedanBloques = bloques.some(bloque => bloque.activo);
    if (!quedanBloques) {
        mostrarPantalla('victoria');
        puntuacionVictoriaElement.textContent = puntuacion;
        reproducirSonido('victoria');
        detenerJuego();
    }
}

function perderVida() {
    vidas--;
    if (vidas <= 0) {
        mostrarPantalla('gameOver');
        puntuacionFinalElement.textContent = puntuacion;
        reproducirSonido('derrota');
        detenerJuego();
    } else {
        reiniciarPosiciones();
        reproducirSonido('perderVida');
    }
}

function reiniciarPosiciones() {
    pelota.x = canvas.width / 2;
    pelota.y = canvas.height - 30;
    pelota.velocidadX = (Math.random() * 2 - 1) * configuracion.velocidadInicial;
    pelota.velocidadY = -configuracion.velocidadInicial;
    pala.x = (canvas.width - pala.ancho) / 2;
}

// Efectos de sonido (opcional)
function reproducirSonido(tipo) {
    try {
        const sonido = new Audio();
        switch (tipo) {
            case 'rebote':
                sonido.src = 'sonidos/rebote.mp3';
                break;
            case 'romperBloque':
                sonido.src = 'sonidos/romper.mp3';
                break;
            case 'victoria':
                sonido.src = 'sonidos/victoria.mp3';
                break;
            case 'derrota':
                sonido.src = 'sonidos/derrota.mp3';
                break;
            case 'perderVida':
                sonido.src = 'sonidos/perderVida.mp3';
                break;
        }
        sonido.volume = 0.3;
        sonido.play().catch(e => {
            // Silenciar errores de audio (común en navegadores)
            console.log("Error de audio:", e);
        });
    } catch (e) {
        console.log("Audio no soportado");
    }
}

// Loop principal del juego
function actualizarJuego() {
    if (!juegoEnCurso) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar elementos
    dibujarPelota();
    dibujarPala();
    dibujarBloques();
    dibujarPuntuacion();
    
    // Mover la pala con teclado
    if (teclaIzquierdaPresionada && pala.x > 0) {
        pala.x -= configuracion.velocidadPala;
    } else if (teclaDerechaPresionada && pala.x < canvas.width - pala.ancho) {
        pala.x += configuracion.velocidadPala;
    }
    
    // Mover la pala con ratón
    if (posicionRaton !== null) {
        const nuevaX = posicionRaton - pala.ancho / 2;
        if (nuevaX >= 0 && nuevaX <= canvas.width - pala.ancho) {
            pala.x = nuevaX;
        }
    }
    
    // Detectar colisiones
    detectarColisionPared();
    detectarColisionPala();
    detectarColisionBloques();
    
    // Actualizar posición de la pelota
    pelota.x += pelota.velocidadX;
    pelota.y += pelota.velocidadY;
    
    // Incrementar velocidad gradualmente
    const velocidadTotal = Math.sqrt(pelota.velocidadX * pelota.velocidadX + pelota.velocidadY * pelota.velocidadY);
    if (velocidadTotal < 12) { // Velocidad máxima
        pelota.velocidadX *= (1 + configuracion.incrementoVelocidad / 1000);
        pelota.velocidadY *= (1 + configuracion.incrementoVelocidad / 1000);
    }
    
    animacionId = requestAnimationFrame(actualizarJuego);
}

// Control de pantallas del juego
function mostrarPantalla(pantalla) {
    pantallaInicio.classList.add('oculto');
    pantallaJuego.classList.add('oculto');
    pantallaGameOver.classList.add('oculto');
    pantallaVictoria.classList.add('oculto');
    
    switch (pantalla) {
        case 'inicio':
            pantallaInicio.classList.remove('oculto');
            break;
        case 'juego':
            pantallaJuego.classList.remove('oculto');
            break;
        case 'gameOver':
            pantallaGameOver.classList.remove('oculto');
            break;
        case 'victoria':
            pantallaVictoria.classList.remove('oculto');
            break;
    }
}

// Iniciar y detener el juego
function iniciarJuego() {
    juegoEnCurso = true;
    puntuacion = 0;
    nivel = 1;
    vidas = 3;
    crearBloques();
    reiniciarPosiciones();
    mostrarPantalla('juego');
    actualizarJuego();
}

function detenerJuego() {
    juegoEnCurso = false;
    cancelAnimationFrame(animacionId);
}

function reiniciarJuego() {
    detenerJuego();
    iniciarJuego();
}

// Event listeners para botones
btnJugar.addEventListener('click', iniciarJuego);
btnReiniciarGO.addEventListener('click', reiniciarJuego);
btnReiniciarV.addEventListener('click', reiniciarJuego);

// Inicializar pantalla de inicio
window.addEventListener('load', () => {
    mostrarPantalla('inicio');
});

// Anti-bloqueo de la pelota
setInterval(() => {
    if (juegoEnCurso) {
        // Verificar si la pelota está "atascada" en movimiento vertical
        if (Math.abs(pelota.velocidadX) < 0.5) {
            pelota.velocidadX = (Math.random() * 2 - 1) * 2; // Darle un empujón
        }
    }
}, 3000); 