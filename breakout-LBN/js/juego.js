// Elementos del DOM
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaSeleccionNivel = document.getElementById('pantalla-seleccion-nivel');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaGameOver = document.getElementById('pantalla-game-over');
const pantallaVictoria = document.getElementById('pantalla-victoria');
const pausaOverlay = document.getElementById('pausa-overlay');
const gridNiveles = document.querySelector('.grid-niveles');

// Botones
const btnJugar = document.getElementById('btn-jugar');
const btnVolverInicio = document.getElementById('btn-volver-inicio');
const btnReiniciarGO = document.getElementById('btn-reiniciar-go');
const btnReiniciarV = document.getElementById('btn-reiniciar-v');
const btnSiguienteNivel = document.getElementById('btn-siguiente-nivel');
const btnMenuNivelesGO = document.getElementById('btn-menu-niveles-go');
const btnMenuNivelesV = document.getElementById('btn-menu-niveles-v');
const btnSalir = document.getElementById('btn-salir');

// Canvas y elementos de información
const canvas = document.getElementById('juego');
const ctx = canvas.getContext('2d');
const puntuacionElement = document.getElementById('puntuacion');
const nivelElement = document.getElementById('nivel');
const vidasElement = document.getElementById('vidas');
const tipoLadrilloElement = document.getElementById('tipo-ladrillo');
const puntuacionFinalElement = document.getElementById('puntuacion-final');
const puntuacionVictoriaElement = document.getElementById('puntuacion-victoria');

// Variables del juego
let puntuacion = 0;
let nivelActual = 1;
let vidas = 3;
let juegoEnCurso = false;
let juegoEnPausa = false;
let animacionId;
let tiempoUltimoPausado = 0;
let ladrillosRegenerandose = [];
let tiempoUltimoMovimiento = 0;
let tipoLadrilloActual = 'normal';

// Configuración del juego
const configuracion = {
    velocidadPala: 8,
    velocidadInicial: 4,
    incrementoVelocidad: 0.05,
    intervaloRegeneracion: 5000, // 5 segundos
    intervaloMovimiento: 2000,   // 2 segundos
    radioExplosion: 2           // número de ladrillos afectados por explosión
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

// Array para almacenar los bloques
const bloques = [];

// Función para crear los botones de niveles
function crearBotonesNiveles() {
    gridNiveles.innerHTML = '';
    
    for (let i = 0; i < niveles.length; i++) {
        const nivelNum = i + 1;
        const btnNivel = document.createElement('button');
        btnNivel.textContent = nivelNum;
        btnNivel.classList.add('btn-nivel');
        
        // Determinar estado del nivel
        if (estadoNiveles.nivelesCompletados[i]) {
            btnNivel.classList.add('nivel-completado');
        } else if (nivelNum === estadoNiveles.nivelActual) {
            btnNivel.classList.add('nivel-actual');
        }
        
        // Todos los niveles están disponibles
        btnNivel.addEventListener('click', () => {
            nivelActual = nivelNum;
            iniciarNivel(nivelNum);
        });
        
        gridNiveles.appendChild(btnNivel);
    }
}

// Creación de bloques según el nivel
function crearBloques(nivelIndex = 0) {
    bloques.length = 0; // Limpiamos el array de bloques existentes
    ladrillosRegenerandose = []; // Resetear ladrillos regenerándose
    
    const nivel = niveles[nivelIndex];
    const disposicion = nivel.disposicion;
    const filas = nivel.filas;
    const columnas = nivel.columnas;
    tipoLadrilloActual = nivel.tipoLadrillo;
    tipoLadrilloElement.textContent = nivel.nombre;
    
    // Calcular dimensiones de los ladrillos basadas en el tamaño del canvas y el número de columnas
    const anchoBloques = (canvas.width - 50) / columnas;
    const altoBloques = 25;
    
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            // Verificar el tipo de ladrillo según la disposición
            const tipoLadrillo = disposicion[fila][columna];
            
            if (tipoLadrillo > 0) { // Si hay un ladrillo en esta posición
                const bloque = {
                    x: columna * anchoBloques + 25,
                    y: fila * altoBloques + 50,
                    ancho: anchoBloques - 5,
                    alto: altoBloques - 5,
                    color: obtenerColorLadrillo(tipoLadrillo, fila),
                    activo: true,
                    tipo: tipoLadrillo,
                    fila: fila,
                    columna: columna
                };
                
                bloques.push(bloque);
            }
        }
    }
}

// Función para obtener color según tipo de ladrillo y fila
function obtenerColorLadrillo(tipo, fila) {
    // Colores base para ladrillos normales
    const coloresBase = ['#FF5252', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3'];
    
    switch(tipo) {
        case LADRILLO_INDESTRUCTIBLE:
            return '#999';
        case LADRILLO_EXPLOSIVO:
            return '#ff4500';
        case LADRILLO_REGENERATIVO:
            return '#4CAF50';
        case LADRILLO_MOVIL:
            return '#2196F3';
        default:
            return coloresBase[fila % coloresBase.length];
    }
}

// Control de pala y pausa
let teclaIzquierdaPresionada = false;
let teclaDerechaPresionada = false;
let posicionRaton = null;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        teclaIzquierdaPresionada = true;
    } else if (e.key === 'ArrowRight') {
        teclaDerechaPresionada = true;
    } else if (e.key === 'p' || e.key === 'P') {
        if (juegoEnCurso) {
            togglePausa();
        }
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

// Añadir control de pausa con clic en el canvas
canvas.addEventListener('click', () => {
    if (juegoEnCurso) {
        togglePausa();
    }
});

// Añadir control de pausa con clic en el overlay
pausaOverlay.addEventListener('click', () => {
    if (juegoEnCurso && juegoEnPausa) {
        togglePausa();
    }
});

// Función para alternar pausa
function togglePausa() {
    juegoEnPausa = !juegoEnPausa;
    
    if (juegoEnPausa) {
        pausaOverlay.classList.remove('oculto');
        cancelAnimationFrame(animacionId);
    } else {
        pausaOverlay.classList.add('oculto');
        animacionId = requestAnimationFrame(actualizarJuego);
    }
    
    reproducirSonido('pausa');
}

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
            
            // Agregar indicadores visuales para tipos especiales
            if (bloque.tipo === LADRILLO_INDESTRUCTIBLE) {
                ctx.beginPath();
                ctx.moveTo(bloque.x, bloque.y);
                ctx.lineTo(bloque.x + bloque.ancho, bloque.y + bloque.alto);
                ctx.moveTo(bloque.x + bloque.ancho, bloque.y);
                ctx.lineTo(bloque.x, bloque.y + bloque.alto);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (bloque.tipo === LADRILLO_EXPLOSIVO) {
                ctx.beginPath();
                ctx.arc(bloque.x + bloque.ancho/2, bloque.y + bloque.alto/2, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            } else if (bloque.tipo === LADRILLO_REGENERATIVO) {
                ctx.beginPath();
                ctx.rect(bloque.x + bloque.ancho/4, bloque.y + bloque.alto/4, bloque.ancho/2, bloque.alto/2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            } else if (bloque.tipo === LADRILLO_MOVIL) {
                ctx.beginPath();
                ctx.moveTo(bloque.x + bloque.ancho/2, bloque.y + 5);
                ctx.lineTo(bloque.x + bloque.ancho - 5, bloque.y + bloque.alto/2);
                ctx.lineTo(bloque.x + bloque.ancho/2, bloque.y + bloque.alto - 5);
                ctx.lineTo(bloque.x + 5, bloque.y + bloque.alto/2);
                ctx.closePath();
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
            
            ctx.closePath();
        }
    });
}

function dibujarPuntuacion() {
    puntuacionElement.textContent = puntuacion;
    nivelElement.textContent = nivelActual;
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
                
                // Comportamiento según tipo de ladrillo
                switch (bloque.tipo) {
                    case LADRILLO_NORMAL:
                        bloque.activo = false;
                        puntuacion += 10;
                        reproducirSonido('romperBloque');
                        break;
                        
                    case LADRILLO_INDESTRUCTIBLE:
                        // Solo rebota, no se rompe
                        reproducirSonido('rebote');
                        break;
                        
                    case LADRILLO_EXPLOSIVO:
                        bloque.activo = false;
                        puntuacion += 20;
                        reproducirSonido('explosion');
                        // Explotar ladrillos cercanos
                        explotarLadrillosCercanos(bloque);
                        break;
                        
                    case LADRILLO_REGENERATIVO:
                        bloque.activo = false;
                        puntuacion += 15;
                        reproducirSonido('romperBloque');
                        // Programar regeneración
                        programarRegeneracion(bloque);
                        break;
                        
                    case LADRILLO_MOVIL:
                        bloque.activo = false;
                        puntuacion += 15;
                        reproducirSonido('romperBloque');
                        break;
                }
                
                // Verificar si todos los bloques están destruidos
                verificarVictoria();
                
                // Romper el bucle para evitar múltiples colisiones en un frame
                break;
            }
        }
    }
}

// Función para explotar ladrillos cercanos
function explotarLadrillosCercanos(bloqueExplosivo) {
    for (let i = 0; i < bloques.length; i++) {
        const bloque = bloques[i];
        if (bloque.activo && bloque.tipo !== LADRILLO_INDESTRUCTIBLE) {
            // Calcular la distancia en filas y columnas
            const distanciaFila = Math.abs(bloque.fila - bloqueExplosivo.fila);
            const distanciaCol = Math.abs(bloque.columna - bloqueExplosivo.columna);
            
            // Si está dentro del radio de explosión
            if (distanciaFila <= configuracion.radioExplosion && 
                distanciaCol <= configuracion.radioExplosion &&
                (bloque !== bloqueExplosivo)) {
                bloque.activo = false;
                puntuacion += 5; // Puntos extra por explosión
            }
        }
    }
}

// Función para programar la regeneración de un ladrillo
function programarRegeneracion(bloque) {
    // Guardar una copia del bloque con un temporizador
    const bloqueInfo = {
        bloque: bloque,
        tiempoRegeneracion: Date.now() + configuracion.intervaloRegeneracion
    };
    
    ladrillosRegenerandose.push(bloqueInfo);
}

// Función para verificar y realizar regeneraciones
function actualizarLadrillosRegenerativos() {
    const ahora = Date.now();
    
    for (let i = ladrillosRegenerandose.length - 1; i >= 0; i--) {
        const info = ladrillosRegenerandose[i];
        
        if (ahora >= info.tiempoRegeneracion) {
            // Regenerar el ladrillo
            info.bloque.activo = true;
            // Eliminar de la lista de regeneración
            ladrillosRegenerandose.splice(i, 1);
            reproducirSonido('regeneracion');
        }
    }
}

// Función para mover ladrillos móviles
function moverLadrillosMoviles() {
    const ahora = Date.now();
    
    // Mover cada cierto intervalo
    if (ahora - tiempoUltimoMovimiento > configuracion.intervaloMovimiento) {
        let hayMoviles = false;
        
        for (let i = 0; i < bloques.length; i++) {
            const bloque = bloques[i];
            if (bloque.activo && bloque.tipo === LADRILLO_MOVIL) {
                hayMoviles = true;
                
                // Generar nueva posición aleatoria dentro del área de juego
                const margenX = 50; // Margen desde los bordes
                const margenY = 200; // Evitar bajar demasiado
                
                bloque.x = Math.random() * (canvas.width - bloque.ancho - margenX * 2) + margenX;
                bloque.y = Math.random() * (canvas.height - bloque.alto - margenY) + 50;
            }
        }
        
        if (hayMoviles) {
            reproducirSonido('movimiento');
            tiempoUltimoMovimiento = ahora;
        }
    }
}

function verificarVictoria() {
    // Verificar si quedan ladrillos destructibles
    const quedanLadrillos = bloques.some(bloque => 
        bloque.activo && bloque.tipo !== LADRILLO_INDESTRUCTIBLE
    );
    
    if (!quedanLadrillos) {
        // Marcar nivel como completado
        estadoNiveles.nivelesCompletados[nivelActual - 1] = true;
        
        // Desbloquear siguiente nivel si no es el último
        if (nivelActual < niveles.length) {
            estadoNiveles.nivelMaximoDesbloqueado = Math.max(
                estadoNiveles.nivelMaximoDesbloqueado,
                nivelActual + 1
            );
        }
        
        // Actualizar nivel actual si no es el último
        if (nivelActual < niveles.length) {
            estadoNiveles.nivelActual = nivelActual + 1;
        }
        
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

// Efectos de sonido
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
            case 'pausa':
                sonido.src = 'sonidos/pausa.mp3';
                break;
            case 'explosion':
                sonido.src = 'sonidos/explosion.mp3';
                break;
            case 'regeneracion':
                sonido.src = 'sonidos/regeneracion.mp3';
                break;
            case 'movimiento':
                sonido.src = 'sonidos/movimiento.mp3';
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
    if (!juegoEnCurso || juegoEnPausa) return;
    
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
    
    // Actualizar ladrillos especiales
    if (tipoLadrilloActual === 'regenerativo') {
        actualizarLadrillosRegenerativos();
    }
    
    if (tipoLadrilloActual === 'movil') {
        moverLadrillosMoviles();
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
    pantallaSeleccionNivel.classList.add('oculto');
    pantallaJuego.classList.add('oculto');
    pantallaGameOver.classList.add('oculto');
    pantallaVictoria.classList.add('oculto');
    
    switch (pantalla) {
        case 'inicio':
            pantallaInicio.classList.remove('oculto');
            break;
        case 'seleccionNivel':
            crearBotonesNiveles();
            pantallaSeleccionNivel.classList.remove('oculto');
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
    mostrarPantalla('seleccionNivel');
}

function iniciarNivel(nivel) {
    juegoEnCurso = true;
    juegoEnPausa = false;
    pausaOverlay.classList.add('oculto');
    
    nivelActual = nivel;
    
    // Configurar nivel
    const infoNivel = niveles[nivel - 1];
    pelota.velocidadX = infoNivel.velocidadInicial * (Math.random() > 0.5 ? 1 : -1);
    pelota.velocidadY = -infoNivel.velocidadInicial;
    
    vidas = 3;
    
    if (nivel === 1) {
        puntuacion = 0;
    }
    
    crearBloques(nivel - 1);
    reiniciarPosiciones();
    mostrarPantalla('juego');
    actualizarJuego();
}

function siguienteNivel() {
    if (nivelActual < niveles.length) {
        nivelActual++;
        iniciarNivel(nivelActual);
    } else {
        mostrarPantalla('seleccionNivel');
    }
}

function detenerJuego() {
    juegoEnCurso = false;
    cancelAnimationFrame(animacionId);
}

function reiniciarJuego() {
    detenerJuego();
    puntuacion = 0;
    nivelActual = 1;
    iniciarNivel(nivelActual);
}

// Función para salir del juego y volver a la pantalla de inicio
function salirJuego() {
    // Reproducir sonido si es necesario
    reproducirSonido('pausa');
    
    // Detener el juego
    detenerJuego();
    
    // Mostrar pantalla de inicio
    mostrarPantalla('inicio');
}

// Event listeners para botones
btnJugar.addEventListener('click', iniciarJuego);
btnVolverInicio.addEventListener('click', () => mostrarPantalla('inicio'));
btnReiniciarGO.addEventListener('click', reiniciarJuego);
btnReiniciarV.addEventListener('click', reiniciarJuego);
btnSiguienteNivel.addEventListener('click', siguienteNivel);
btnMenuNivelesGO.addEventListener('click', () => mostrarPantalla('seleccionNivel'));
btnMenuNivelesV.addEventListener('click', () => mostrarPantalla('seleccionNivel'));
btnSalir.addEventListener('click', salirJuego);

// Inicializar pantalla de inicio
window.addEventListener('load', () => {
    mostrarPantalla('inicio');
});

// Anti-bloqueo de la pelota
setInterval(() => {
    if (juegoEnCurso && !juegoEnPausa) {
        // Verificar si la pelota está "atascada" en movimiento vertical
        if (Math.abs(pelota.velocidadX) < 0.5) {
            pelota.velocidadX = (Math.random() * 2 - 1) * 2; // Darle un empujón
        }
    }
}, 3000); 