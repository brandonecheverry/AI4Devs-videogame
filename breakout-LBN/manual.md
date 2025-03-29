# Manual de Usuario - Breakout Arcade

Este manual proporciona toda la información necesaria para disfrutar al máximo del juego Breakout Arcade.

## Índice
1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Controles](#controles)
4. [Reglas del juego](#reglas-del-juego)
5. [Sistema de niveles](#sistema-de-niveles)
6. [Tipos de ladrillos](#tipos-de-ladrillos)
7. [Sistema de powerups](#sistema-de-powerups)
8. [Sistema de combo](#sistema-de-combo)
9. [Sistema de pausa](#sistema-de-pausa)
10. [Elementos del juego](#elementos-del-juego)
11. [Estados del juego](#estados-del-juego)
12. [Consejos y trucos](#consejos-y-trucos)
13. [Solución de problemas](#solución-de-problemas)

---

## Introducción

Breakout es un juego arcade clásico donde controlas una pala en la parte inferior de la pantalla para hacer rebotar una pelota y destruir todos los ladrillos en la parte superior. El objetivo es eliminar todos los ladrillos sin dejar caer la pelota. Esta versión moderna incluye múltiples niveles, tipos especiales de ladrillos, powerups, un sistema de combo y efectos visuales para una experiencia más inmersiva.

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
4. Haz clic en el botón "JUGAR" para comenzar
5. Selecciona el nivel que deseas jugar

---

## Controles

El juego permite varios métodos de control:

### Movimiento de la pala
- **Flecha izquierda (←)**: Mover la pala hacia la izquierda
- **Flecha derecha (→)**: Mover la pala hacia la derecha
- **Mover el ratón**: La pala seguirá la posición horizontal del cursor del ratón

### Pausa
- **Tecla P**: Pausar/reanudar el juego
- **Clic con el ratón**: Pausar/reanudar el juego durante la partida

### Salir del juego
- **Botón SALIR**: Permite terminar la partida actual y volver a la pantalla de inicio en cualquier momento.

### Navegación por menús
- **Botones en pantalla**: Utiliza los botones para navegar entre menús, iniciar partida, seleccionar nivel o reiniciar el juego.

---

## Reglas del juego

1. **Objetivo principal**: Destruir todos los ladrillos destructibles en pantalla haciendo que la pelota rebote contra ellos.
2. **Vidas**: Comienzas con 3 vidas en cada nivel.
3. **Pérdida de vida**: Si la pelota cae por debajo de la pala, perderás una vida.
4. **Fin del juego**: El juego termina cuando:
   - Destruyes todos los ladrillos destructibles (¡victoria!)
   - Pierdes todas tus vidas (game over)
5. **Puntuación**:
   - Ladrillos normales: 10 puntos
   - Ladrillos explosivos: 20 puntos
   - Ladrillos regenerativos: 15 puntos
   - Ladrillos móviles: 15 puntos
   - Ladrillos destruidos por explosión: 5 puntos

---

## Sistema de niveles

El juego cuenta con 10 niveles diferentes, cada uno con patrones y comportamientos de ladrillos específicos:

1. **Nivel 1**: Nivel básico con ladrillos normales.
2. **Nivel 2**: Introduce ladrillos indestructibles.
3. **Nivel 3**: Introduce ladrillos explosivos.
4. **Nivel 4**: Introduce ladrillos regenerativos.
5. **Nivel 5**: Introduce ladrillos móviles.
6. **Nivel 6**: Patrón más complejo con ladrillos indestructibles.
7. **Nivel 7**: Patrón más complejo con ladrillos explosivos.
8. **Nivel 8**: Patrón más complejo con ladrillos regenerativos.
9. **Nivel 9**: Patrón más complejo con ladrillos móviles.
10. **Nivel 10**: Nivel final con todos los tipos de ladrillos.

### Acceso a los niveles
- Todos los niveles están disponibles desde el inicio.
- Puedes jugar cualquier nivel en cualquier orden.
- Los niveles completados se marcan con un color verde y un símbolo de verificación.
- El nivel actual se marca con color naranja.

### Pantalla de selección de nivel
- Selecciona cualquier nivel haciendo clic en su botón correspondiente.
- Puedes volver a jugar niveles ya completados para mejorar tu puntuación.
- La pantalla muestra claramente qué niveles has completado para llevar un seguimiento de tu progreso.

---

## Tipos de ladrillos

El juego incluye varios tipos de ladrillos con comportamientos especiales:

### Ladrillos normales
- Color: Variado según la fila
- Comportamiento: Se destruyen al ser golpeados por la pelota.
- Puntuación: 10 puntos

### Ladrillos indestructibles
- Apariencia: Gris con una "X" blanca
- Comportamiento: No pueden ser destruidos, solo rebotan la pelota.
- Puntuación: 0 puntos

### Ladrillos explosivos
- Apariencia: Degradado rojo-naranja con un círculo blanco en el centro
- Comportamiento: Al ser destruidos, hacen explotar los ladrillos cercanos.
- Radio de explosión: 2 ladrillos en todas direcciones
- Puntuación: 20 puntos + 5 por cada ladrillo adicional destruido

### Ladrillos regenerativos
- Apariencia: Degradado verde con un cuadrado blanco en el centro
- Comportamiento: Se regeneran 5 segundos después de ser destruidos.
- Puntuación: 15 puntos

### Ladrillos móviles
- Apariencia: Degradado azul con una flecha blanca
- Comportamiento: Cambian de posición aleatoriamente cada 2 segundos.
- Puntuación: 15 puntos

---

## Sistema de powerups

Los powerups aparecen aleatoriamente cuando rompes un ladrillo normal. Caen desde la posición del ladrillo y debes atraparlos con la pala para activarlos.

### Tipos de powerups

#### Powerups positivos
- **Pala Grande (G)**: Color naranja. Aumenta el tamaño de la pala en un 50%
- **Pelota Lenta (L)**: Color azul. Reduce la velocidad de la pelota en un 30%
- **Vida Extra (+)**: Color verde. Otorga una vida adicional

#### Powerups negativos
- **Pala Pequeña (P)**: Color rojo. Reduce el tamaño de la pala en un 30%
- **Pelota Rápida (R)**: Color rosa. Aumenta la velocidad de la pelota en un 30%

### Duración
Todos los powerups (excepto Vida Extra) tienen una duración limitada de 8 segundos.

---

## Sistema de combo

El juego incluye un sistema de combo que multiplica los puntos obtenidos por romper ladrillos:

- Cada vez que rompes un ladrillo, se inicia o continúa un combo
- Si rompes otro ladrillo dentro de los 2 segundos siguientes, el combo aumenta
- El valor del combo multiplica los puntos base de cada ladrillo
- El combo se reinicia si pasan más de 2 segundos sin romper un ladrillo
- Un combo alto se indica en pantalla (por ejemplo, "COMBO x3")

---

## Sistema de pausa

Durante la partida, puedes pausar el juego de dos formas:

1. **Presionando la tecla P**
2. **Haciendo clic con el ratón en cualquier parte del área de juego**

Cuando el juego está en pausa:
- Se muestra un mensaje de "JUEGO EN PAUSA" en la pantalla
- La pelota y todos los elementos dejan de moverse
- El tiempo y las animaciones se detienen

Para reanudar el juego, simplemente:
- Presiona la tecla P nuevamente, o
- Haz clic con el ratón en cualquier parte del área de juego

La función de pausa es útil cuando necesitas hacer una breve pausa durante la partida.

## Salir del juego

En cualquier momento durante la partida, puedes utilizar el botón **SALIR** ubicado en la parte superior de la pantalla de juego para:

- Terminar inmediatamente la partida actual
- Volver a la pantalla de inicio

Ten en cuenta que al usar esta función:
- No se guardará tu progreso en el nivel actual
- Tu puntuación de la partida se perderá
- Tendrás que comenzar desde el principio si decides jugar nuevamente

Esta opción es útil cuando deseas abandonar una partida y volver al menú principal sin tener que esperar a perder todas las vidas.

---

## Elementos del juego

### Pelota
- Rebota en paredes, pala y ladrillos
- Cambia de dirección dependiendo de dónde golpee en la pala
- Aumenta ligeramente su velocidad con el tiempo
- Velocidad inicial incrementa en niveles superiores

### Pala (controlada por el jugador)
- Se mueve horizontalmente en la parte inferior de la pantalla
- No puede salir de los límites del área de juego
- La posición de impacto de la pelota influye en el ángulo de rebote

### Ladrillos
- Organizados en filas y columnas en la parte superior
- Diferentes tipos y comportamientos según el nivel
- Cada nivel tiene una disposición única de ladrillos

### Indicadores en pantalla
- **Puntuación**: Muestra los puntos acumulados
- **Nivel**: Indica el nivel actual
- **Vidas**: Muestra el número de vidas restantes
- **Tipo de ladrillo**: Muestra el tipo especial de ladrillo del nivel actual

---

## Estados del juego

El juego tiene cinco estados principales:

1. **Pantalla de inicio**
   - Muestra el título del juego
   - Botón "JUGAR" para acceder a la selección de niveles

2. **Selección de nivel**
   - Muestra los niveles disponibles (desbloqueados)
   - Permite seleccionar un nivel para jugar
   - Botón para volver a la pantalla de inicio

3. **En juego**
   - El juego está activo
   - La pelota rebota y el jugador controla la pala
   - Se muestran puntuación, nivel, vidas y tipo de ladrillo
   - Se puede pausar el juego

4. **Game Over**
   - Se muestra cuando pierdes todas las vidas
   - Muestra tu puntuación final
   - Botones para reiniciar o volver a la selección de niveles

5. **Victoria**
   - Se muestra cuando destruyes todos los ladrillos destructibles
   - Muestra tu puntuación final
   - Botones para avanzar al siguiente nivel, reiniciar o volver a la selección de niveles

---

## Consejos y trucos

1. **Control del ángulo**: El punto donde la pelota golpea la pala afecta su dirección. Golpear con los extremos de la pala provocará rebotes más angulados.

2. **Utiliza los ladrillos indestructibles a tu favor**: Puedes usar los ladrillos indestructibles como rebotadores para alcanzar ladrillos difíciles.

3. **Aprovecha los explosivos**: Intenta golpear primero los ladrillos explosivos que estén rodeados de muchos otros ladrillos para maximizar su efecto.

4. **Ten cuidado con los regenerativos**: Si no eres rápido, puede que tengas que destruir el mismo ladrillo varias veces. Planifica tu estrategia.

5. **Anticipa los movimientos**: Para ladrillos móviles, intenta anticipar hacia dónde se moverán y posicionate estratégicamente.

6. **Usa la pausa**: Si la pelota va muy rápido o necesitas un momento para planificar, usa la función de pausa.

7. **Prioriza los ladrillos especiales**: Intenta eliminar primero los ladrillos explosivos y móviles, ya que pueden facilitar la destrucción de los demás.

8. **Mantén la calma**: A medida que avanzas en los niveles, la velocidad aumenta. Mantén la calma y concéntrate.

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
- Verifica que el juego no está en pausa (el mensaje "JUEGO EN PAUSA" desaparece)
- Actualiza la página

### La pelota desaparece o se comporta de forma extraña
- Esto puede ocurrir raramente debido a algún error. Reinicia el nivel

### Los ladrillos no funcionan correctamente
- Si los ladrillos regenerativos no reaparecen o los móviles no se mueven, podría ser un problema de rendimiento. Cierra otras aplicaciones para liberar recursos

---

¡Disfruta jugando a Breakout Arcade! Si tienes alguna sugerencia o encuentras algún problema, no dudes en contactar con el desarrollador a través del repositorio del proyecto. 