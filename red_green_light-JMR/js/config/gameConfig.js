/**
 * Configuración del juego "Luz Roja, Luz Verde"
 * Este archivo contiene todas las constantes y configuraciones del juego
 */

// Configuración general del juego
export const GAME_CONFIG = {
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    debug: true
};

// Configuración del jugador
export const PLAYER_CONFIG = {
    radius: 15,
    maxSpeed: 300,
    acceleration: 5,
    deceleration: 3,
    minSpeedThreshold: 5,
    spriteSize: {
        width: 40,
        height: 40
    },
    initialPosition: {
        x: 120,
        y: 300
    }
};

// Configuración del semáforo
export const TRAFFIC_LIGHT_CONFIG = {
    position: {
        x: 400,
        y: 50
    },
    radius: 30,
    greenColor: 0x00ff00,
    redColor: 0xff0000,
    greenDuration: {
        min: 3000,
        max: 8000
    },
    redDuration: {
        min: 2000,
        max: 5000
    }
};

// Configuración de la línea de inicio y meta
export const LINES_CONFIG = {
    startLine: {
        x: 100,
        y: 100,
        width: 5,
        height: 400,
        color: 0x00ff00
    },
    finishLine: {
        x: 700,
        y: 100,
        width: 5,
        height: 400,
        color: 0xff0000
    }
};

// Estados del juego
export const GAME_STATES = {
    WAITING: 'waiting',
    MOVING: 'moving',
    PAUSED: 'paused',
    BALANCING: 'balancing',
    FINISHED: 'finished',
    DEAD: 'dead'
};

// Estados del semáforo
export const TRAFFIC_LIGHT_STATES = {
    GREEN: 'green',
    RED: 'red'
};

// Configuración del audio
export const AUDIO_CONFIG = {
    greenLightVolume: 0.5,
    indicatorText: '♪ SONANDO',
    indicatorPosition: {
        x: 650,
        y: 20
    }
};

// Textos del juego
export const GAME_TEXTS = {
    instructions: [
        {
            text: 'Mantén presionado ESPACIO para acelerar',
            position: { x: 400, y: 520 }
        },
        {
            text: 'Suelta ESPACIO para frenar gradualmente',
            position: { x: 400, y: 550 }
        },
        {
            text: 'Debes detenerte cuando el semáforo está ROJO',
            position: { x: 400, y: 580 }
        }
    ],
    gameOver: {
        title: '¡ELIMINADO!',
        restart: 'Presiona R para reiniciar'
    },
    victory: {
        title: '¡META ALCANZADA!',
        restart: 'Presiona R para reiniciar'
    }
};

export default {
    GAME_CONFIG,
    PLAYER_CONFIG,
    TRAFFIC_LIGHT_CONFIG,
    LINES_CONFIG,
    GAME_STATES,
    TRAFFIC_LIGHT_STATES,
    AUDIO_CONFIG,
    GAME_TEXTS
}; 