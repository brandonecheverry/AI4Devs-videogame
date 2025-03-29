# Breakout Arcade

Un juego de Breakout clásico desarrollado con HTML, CSS y JavaScript puro para navegadores web.

![Breakout Game Screenshot](screenshot.png)

## Descripción

Breakout es un juego arcade clásico donde el jugador controla una pala en la parte inferior de la pantalla y debe destruir todos los ladrillos en la parte superior haciendo rebotar una pelota. El juego incluye:

- Mecánica de rebote realista
- Sistema de puntuación
- Vidas múltiples
- Sistema completo de 10 niveles
- Ladrillos especiales con comportamientos únicos
- Sistema de pausa
- Efectos visuales y sonoros

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- No requiere instalación adicional

## Cómo jugar

1. Clona o descarga este repositorio.
2. Abre el archivo `index.html` en tu navegador web.
3. Haz clic en el botón "JUGAR" para acceder a la selección de niveles.
4. Selecciona un nivel para comenzar a jugar.
5. Utiliza las teclas de flecha izquierda y derecha (o el ratón) para mover la pala.
6. Pausa el juego con la tecla "P" o haciendo clic en el canvas.
7. Si necesitas abandonar la partida, puedes usar el botón "SALIR" en la pantalla de juego.
8. Intenta mantener la pelota en juego y destruir todos los ladrillos.

## Características

- **Mecánica del juego**: Pelota que rebota en paredes, pala y ladrillos.
- **Control del jugador**: Usa las teclas de flecha (← →) o el ratón para mover la pala.
- **Sistema de pausa**: Pausa el juego con la tecla "P" o clic en la pantalla.
- **Botón de salida**: Abandona la partida actual y vuelve al menú principal en cualquier momento.
- **Sistema de puntuación**: Gana puntos por cada ladrillo destruido.
- **Vidas**: El jugador tiene 3 vidas. Pierde una vida cuando la pelota cae por debajo de la pala.
- **Condición de victoria**: Destruir todos los ladrillos destructibles en el nivel.
- **Sistema de niveles**: 10 niveles diferentes con dificultad progresiva.
- **Ladrillos especiales**:
  - **Indestructibles**: No se rompen, solo rebotan la pelota.
  - **Explosivos**: Destruyen los ladrillos cercanos al romperse.
  - **Regenerativos**: Se regeneran después de unos segundos.
  - **Móviles**: Cambian de posición aleatoriamente cada cierto tiempo.
- **Diferentes estados del juego**: Pantalla de inicio, selección de nivel, juego, game over y victoria.
- **Efectos de sonido**: Incluye sonidos para rebotes, destrucción de ladrillos, victoria y derrota.

## Estructura del proyecto

```
breakout-LBN/
├── index.html          # Archivo HTML principal
├── css/                # Estilos CSS
│   └── styles.css      # Estilos del juego
├── js/                 # Archivos JavaScript
│   ├── juego.js        # Lógica principal del juego
│   └── niveles.js      # Definición de los 10 niveles
└── sonidos/            # Efectos de sonido
    ├── rebote.mp3      # Sonido de rebote
    ├── romper.mp3      # Sonido de destrucción de ladrillos
    ├── explosion.mp3   # Sonido de ladrillos explosivos
    ├── regeneracion.mp3# Sonido de ladrillos regenerativos
    ├── movimiento.mp3  # Sonido de ladrillos móviles
    ├── pausa.mp3       # Sonido de pausa/reanudar
    ├── victoria.mp3    # Sonido de victoria
    ├── derrota.mp3     # Sonido de derrota
    └── perderVida.mp3  # Sonido de pérdida de vida
```

## Sistema de niveles

El juego incluye 10 niveles diferentes con las siguientes características:

1. **Nivel 1**: Ladrillos normales, introducción básica.
2. **Nivel 2**: Introduce ladrillos indestructibles en posiciones específicas.
3. **Nivel 3**: Introduce ladrillos explosivos que destruyen los ladrillos cercanos.
4. **Nivel 4**: Introduce ladrillos regenerativos que reaparecen después de un tiempo.
5. **Nivel 5**: Introduce ladrillos móviles que cambian de posición aleatoriamente.
6. **Nivel 6**: Patrón más complejo con ladrillos indestructibles.
7. **Nivel 7**: Patrón más complejo con ladrillos explosivos.
8. **Nivel 8**: Patrón más complejo con ladrillos regenerativos.
9. **Nivel 9**: Patrón más complejo con ladrillos móviles.
10. **Nivel 10**: Nivel final con mezcla de todos los tipos de ladrillos.

Todos los niveles están disponibles desde el inicio. Los niveles completados se marcan con un color verde y un símbolo de verificación para facilitar el seguimiento del progreso.

## Personalización

Puedes personalizar el juego modificando las siguientes configuraciones en los archivos `js/juego.js` y `js/niveles.js`:

- Velocidad de la pelota y la pala
- Tamaño y apariencia de los elementos
- Disposición y tipos de ladrillos en cada nivel
- Comportamiento de los ladrillos especiales
- Tiempos de regeneración y movimiento
- Efectos sonoros y visuales

## Seguridad

Este proyecto implementa buenas prácticas de seguridad siguiendo las recomendaciones de OWASP:

- No utiliza eval() ni otras funciones potencialmente peligrosas
- Manipula correctamente los eventos del DOM
- No almacena información sensible
- Utiliza rutas relativas seguras

## Contribuciones

Las contribuciones son bienvenidas. Para proponer cambios:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Ver el archivo LICENSE para más detalles. 