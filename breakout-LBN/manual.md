# Manual de Usuario - Breakout Arcade

Este manual proporciona toda la información necesaria para disfrutar al máximo del juego Breakout Arcade.

## Índice
1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Controles](#controles)
4. [Reglas del juego](#reglas-del-juego)
5. [Elementos del juego](#elementos-del-juego)
6. [Estados del juego](#estados-del-juego)
7. [Consejos y trucos](#consejos-y-trucos)
8. [Solución de problemas](#solución-de-problemas)

---

## Introducción

Breakout es un juego arcade clásico donde controlas una pala en la parte inferior de la pantalla para hacer rebotar una pelota y destruir todos los ladrillos en la parte superior. El objetivo es eliminar todos los ladrillos sin dejar caer la pelota.

---

## Instalación

### Requisitos del sistema
- Navegador web moderno (Chrome, Firefox, Safari o Edge)
- JavaScript habilitado
- Conexión a internet (solo para la descarga inicial)

### Pasos para jugar
1. Descarga o clona el repositorio del juego
2. Descomprime el archivo si es necesario
3. Abre el archivo `index.html` en tu navegador web
4. ¡Listo para jugar!

---

## Controles

El juego permite dos métodos de control para mover la pala:

### Teclado
- **Flecha izquierda (←)**: Mover la pala hacia la izquierda
- **Flecha derecha (→)**: Mover la pala hacia la derecha

### Ratón
- **Mover el ratón**: La pala seguirá la posición horizontal del cursor del ratón

---

## Reglas del juego

1. **Objetivo principal**: Destruir todos los ladrillos en pantalla haciendo que la pelota rebote contra ellos.
2. **Vidas**: Comienzas con 3 vidas.
3. **Pérdida de vida**: Si la pelota cae por debajo de la pala, perderás una vida.
4. **Fin del juego**: El juego termina cuando:
   - Destruyes todos los ladrillos (¡victoria!)
   - Pierdes todas tus vidas (game over)
5. **Puntuación**: Cada ladrillo destruido suma 10 puntos.

---

## Elementos del juego

### Pelota
- Rebota en paredes, pala y ladrillos
- Cambia de dirección dependiendo de dónde golpee en la pala
- Aumenta ligeramente su velocidad con el tiempo

### Pala (controlada por el jugador)
- Se mueve horizontalmente en la parte inferior de la pantalla
- No puede salir de los límites del área de juego
- La posición de impacto de la pelota influye en el ángulo de rebote

### Ladrillos
- Organizados en filas y columnas en la parte superior
- Diferentes colores según la fila
- Desaparecen al ser golpeados por la pelota

### Indicadores en pantalla
- **Puntuación**: Muestra los puntos acumulados
- **Nivel**: Indica el nivel actual (preparado para expansión futura)
- **Vidas**: Muestra el número de vidas restantes

---

## Estados del juego

El juego tiene cuatro estados principales:

1. **Pantalla de inicio**
   - Muestra el título del juego
   - Botón "JUGAR" para iniciar la partida

2. **En juego**
   - El juego está activo
   - La pelota rebota y el jugador controla la pala
   - Se muestran puntuación, nivel y vidas

3. **Game Over**
   - Se muestra cuando pierdes todas las vidas
   - Muestra tu puntuación final
   - Botón para reiniciar el juego

4. **Victoria**
   - Se muestra cuando destruyes todos los ladrillos
   - Muestra tu puntuación final
   - Botón para reiniciar el juego

---

## Consejos y trucos

1. **Control del ángulo**: El punto donde la pelota golpea la pala afecta su dirección. Golpear con los extremos de la pala provocará rebotes más angulados.

2. **Mantén la calma**: A medida que la pelota aumenta su velocidad, mantén la calma y anticipa su trayectoria.

3. **Usa los rebotes laterales**: Puedes usar las paredes para alcanzar ladrillos difíciles.

4. **Muévete con anticipación**: No esperes a que la pelota esté a punto de caer para mover la pala; anticipa la trayectoria.

5. **Práctica el control con ratón**: Aunque ambos métodos de control funcionan bien, el ratón suele ofrecer mayor precisión para jugadores experimentados.

---

## Solución de problemas

### El juego va lento o tiene lag
- Cierra otras aplicaciones o pestañas del navegador
- Actualiza la página (F5)
- Prueba con otro navegador

### No se reproduce el sonido
- Verifica que tu dispositivo no esté en silencio
- Comprueba que los archivos de sonido estén en la carpeta correcta
- Algunos navegadores requieren interacción del usuario antes de reproducir sonido

### El juego no responde a los controles
- Asegúrate de que la ventana del juego está seleccionada (haz clic en ella)
- Comprueba que tu teclado/ratón funciona correctamente
- Actualiza la página

### La pelota desaparece o se comporta de forma extraña
- Esto puede ocurrir raramente debido a algún error. Reinicia el juego

---

¡Disfruta jugando a Breakout Arcade! Si tienes alguna sugerencia o encuentras algún problema, no dudes en contactar con el desarrollador a través del repositorio del proyecto. 