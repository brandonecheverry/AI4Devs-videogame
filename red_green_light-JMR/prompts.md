1) Que tecnologia crees que es la mas adecuada para implementar este juego?

2) Perfecto utilicemos Phaser.js
Comencemos implementando el ecenario dell juego y el personaje que sea solamente una pelotita que parta en la linea de inico.
al apretar la barra espacio se mueve hacia la meta

3) Quiero que la Horientacion sea hacia el lado que el personaje parta a la izquierda y se mueva a la derecha.
La barra espacio no esta moviendo el personaje

4) Aun no se mueve la pelotita, estos son los errores....

5) Aun no carges los audios elimina la implementacion de los audios

6) Los logs son:
Tecla ESPACIO presionada
game.js:297 Cambiando a estado moving
game.js:309 Velocidad: 5
game.js:309 Velocidad: 10
game.js:309 Velocidad: 15
game.js:309 Velocidad: 20
game.js:309 Velocidad: 25
game.js:309 Velocidad: 30
game.js:309 Velocidad: 35
game.js:309 Velocidad: 40
game.js:309 Velocidad: 45
game.js:319 Deteniendo jugador
26game.js:290 Tecla ESPACIO presionada

Si bien esto pasa la pelotita no se mueve.
Comenta por ahora la implementacion del mini Juego.

7) Perfecto, Ahora quiero que implementes la Inercia del Jugador que acelere de a poco y frene de a poco.

8) Guando la luz sea verde pon la musica de assets/audio/greenLight.mp3.
Para la musica y luego cambia el semaforo de color con 0.2 segundos despues si alguien cuando el semaforo esta en rojo se mueve pierde

9) Creo que hay un error al cargar el audio.
index.html:1 Access to XMLHttpRequest at 'file:///Users/rkm/Desktop/Estudio/lidr/AI4Devs-videogame/red_green_light-JMR/assets/audio/greenLight.mp3' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, chrome-extension, chrome-untrusted, data, http, https, isolated-app.Comprende este errorAI
phaser.min.js:1 Uncaught Error: Audio key "greenLight" missing from cache
    at new initialize (phaser.min.js:1:523701)
    at initialize.add (phaser.min.js:1:521060)
    at initialize.create (game.js:96:34)
    at initialize.create (phaser.min.js:1:491015)
    at initialize.loadComplete (phaser.min.js:1:490466)
    at o.emit (phaser.min.js:1:7809)
    at initialize.loadComplete (phaser.min.js:1:944358)
    at initialize.fileProcessComplete (phaser.min.js:1:944058)
    at initialize.nextFile (phaser.min.js:1:943649)
    at initialize.onError (phaser.min.js:1:20816)
initialize @ phaser.min.js:1
add @ phaser.min.js:1
create @ game.js:96
create @ phaser.min.js:1
loadComplete @ phaser.min.js:1
o.emit @ phaser.min.js:1
loadComplete @ phaser.min.js:1
fileProcessComplete @ phaser.min.js:1
nextFile @ phaser.min.js:1
onError @ phaser.min.js:1
XMLHttpRequest.send
t.exports @ phaser.min.js:1
load @ phaser.min.js:1
(anónimas) @ phaser.min.js:1
each @ phaser.min.js:1
checkLoadQueue @ phaser.min.js:1
start @ phaser.min.js:1
bootScene @ phaser.min.js:1
start @ phaser.min.js:1
bootQueue @ phaser.min.js:1
o.emit @ phaser.min.js:1
texturesReady @ phaser.min.js:1
o.emit @ phaser.min.js:1
updatePending @ phaser.min.js:1
o.emit @ phaser.min.js:1
checkKey.n.onload @ phaser.min.js:1Comprende este errorAI
phaser.min.js:1 
            
            
           GET file:///Users/rkm/Desktop/Estudio/lidr/AI4Devs-videogame/red_green_light-JMR/assets/audio/greenLight.mp3 net::ERR_FAILED

