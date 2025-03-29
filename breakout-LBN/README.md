# Breakout Arcade

Un juego de Breakout clásico desarrollado con HTML, CSS y JavaScript puro para navegadores web.

![Breakout Game Screenshot](screenshot.png)

## Descripción

Breakout es un juego arcade clásico donde el jugador controla una pala en la parte inferior de la pantalla y debe destruir todos los ladrillos en la parte superior haciendo rebotar una pelota. El juego incluye:

- Mecánica de rebote realista
- Sistema de puntuación
- Vidas múltiples
- Efectos visuales y sonoros
- Diferentes niveles de dificultad (preparado para expansión)

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- No requiere instalación adicional

## Cómo jugar

1. Clona o descarga este repositorio.
2. Abre el archivo `index.html` en tu navegador web.
3. Haz clic en el botón "JUGAR" para iniciar el juego.
4. Utiliza las teclas de flecha izquierda y derecha (o el ratón) para mover la pala.
5. Intenta mantener la pelota en juego y destruir todos los ladrillos.

## Características

- **Mecánica del juego**: Pelota que rebota en paredes, pala y ladrillos.
- **Control del jugador**: Usa las teclas de flecha (← →) o el ratón para mover la pala.
- **Sistema de puntuación**: Gana puntos por cada ladrillo destruido.
- **Vidas**: El jugador tiene 3 vidas. Pierde una vida cuando la pelota cae por debajo de la pala.
- **Condición de victoria**: Destruir todos los ladrillos en el nivel.
- **Diferentes estados del juego**: Pantalla de inicio, juego, game over y victoria.
- **Diseño responsive**: Se adapta a diferentes tamaños de pantalla.
- **Efectos de sonido**: Incluye sonidos para rebotes, destrucción de ladrillos, victoria y derrota.

## Estructura del proyecto

```
breakout-LBN/
├── index.html          # Archivo HTML principal
├── css/                # Estilos CSS
│   └── styles.css      # Estilos del juego
├── js/                 # Archivos JavaScript
│   └── juego.js        # Lógica del juego
└── sonidos/            # Efectos de sonido
    ├── rebote.mp3      # Sonido de rebote
    ├── romper.mp3      # Sonido de destrucción de ladrillos
    ├── victoria.mp3    # Sonido de victoria
    ├── derrota.mp3     # Sonido de derrota
    └── perderVida.mp3  # Sonido de pérdida de vida
```

## Personalización

Puedes personalizar el juego modificando las siguientes configuraciones en el archivo `js/juego.js`:

- Velocidad de la pelota
- Tamaño y apariencia de los elementos
- Número de filas y columnas de ladrillos
- Colores de los elementos
- Comportamiento de la física del juego

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