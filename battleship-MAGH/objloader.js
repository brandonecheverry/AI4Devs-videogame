/**
 * Cargador de modelos OBJ simplificado para el juego Battleship 3D
 * Este cargador permite cargar modelos 3D en formato OBJ y renderizarlos
 * usando CSS 3D transforms.
 */
class OBJLoader {
  constructor() {
    this.modelsCache = {};
  }

  /**
   * Carga un modelo OBJ desde una URL
   * @param {string} url - La URL del archivo OBJ
   * @returns {Promise} - Promesa que resuelve al objeto parseado
   */
  loadModel(url) {
    // Si el modelo ya está en caché, devolvemos la promesa existente
    if (this.modelsCache[url]) {
      return Promise.resolve(this.modelsCache[url]);
    }

    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al cargar el modelo: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        const model = this.parseOBJ(data);
        this.modelsCache[url] = model;
        return model;
      });
  }

  /**
   * Analiza el contenido de un archivo OBJ
   * @param {string} data - Contenido del archivo OBJ
   * @returns {Object} - Objeto con vertices, normals, faces
   */
  parseOBJ(data) {
    const vertices = [];
    const normals = [];
    const faces = [];
    
    // Dividir el archivo en líneas
    const lines = data.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      // Saltamos líneas vacías o comentarios
      if (!line || line.startsWith('#')) continue;
      
      const elements = line.split(/\s+/);
      const type = elements[0];
      
      switch (type) {
        case 'v': // Vértice
          vertices.push({
            x: parseFloat(elements[1]),
            y: parseFloat(elements[2]),
            z: parseFloat(elements[3])
          });
          break;
          
        case 'vn': // Normal
          normals.push({
            x: parseFloat(elements[1]),
            y: parseFloat(elements[2]),
            z: parseFloat(elements[3])
          });
          break;
          
        case 'f': // Cara
          const face = [];
          // Procesamos elementos de la cara (formato f v/vt/vn)
          for (let i = 1; i < elements.length; i++) {
            const vertexData = elements[i].split('/');
            face.push({
              vertexIndex: parseInt(vertexData[0]) - 1, // OBJ indexa desde 1
              normalIndex: vertexData[2] ? parseInt(vertexData[2]) - 1 : -1
            });
          }
          faces.push(face);
          break;
      }
    }
    
    return { vertices, normals, faces };
  }

  /**
   * Crea una representación CSS 3D del modelo
   * @param {Object} model - El modelo parseado
   * @param {HTMLElement} container - El contenedor donde poner el modelo
   * @param {Object} options - Opciones de renderizado
   */
  renderModelAsCSS3D(model, container, options = {}) {
    const { scale = 1, rotationX = 0, rotationY = 0, rotationZ = 0, color = '#64ffda' } = options;
    
    // Limpiamos el contenedor
    container.innerHTML = '';
    
    // Calculamos el centro del modelo para centrar correctamente
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (const vertex of model.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    // Creamos un elemento para cada cara
    for (const face of model.faces) {
      const faceElement = document.createElement('div');
      faceElement.className = 'face';
      
      // Calculamos la posición promedio de los vértices de la cara
      let avgX = 0, avgY = 0, avgZ = 0;
      
      for (const vertex of face) {
        const v = model.vertices[vertex.vertexIndex];
        avgX += v.x;
        avgY += v.y;
        avgZ += v.z;
      }
      
      avgX = (avgX / face.length - centerX) * scale;
      avgY = (avgY / face.length - centerY) * scale;
      avgZ = (avgZ / face.length - centerZ) * scale;
      
      // Aplicamos transformaciones CSS
      faceElement.style.position = 'absolute';
      faceElement.style.width = '10px';
      faceElement.style.height = '10px';
      faceElement.style.backgroundColor = color;
      faceElement.style.opacity = '0.8';
      faceElement.style.transform = `translate3d(${avgX}px, ${avgY}px, ${avgZ}px)`;
      faceElement.style.transformOrigin = 'center';
      
      container.appendChild(faceElement);
    }
    
    // Aplicamos rotación al contenedor
    container.style.transformStyle = 'preserve-3d';
    container.style.transform = 
      `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
  }

  /**
   * Crea una representación simplificada de un barco en CSS
   * @param {string} type - Tipo de barco (destroyer, submarine, etc)
   * @param {number} size - Tamaño del barco en celdas
   * @param {HTMLElement} container - Contenedor donde poner el modelo
   * @param {boolean} isVertical - Si el barco está orientado verticalmente
   */
  createShipModel(type, size, container, isVertical = false) {
    // Limpiamos el contenedor
    container.innerHTML = '';
    container.style.transformStyle = 'preserve-3d';
    
    const shipElement = document.createElement('div');
    shipElement.className = 'ship-3d-model';
    
    // Configuración específica según el tipo de barco
    let shipColor, shipHeight;
    
    switch(type) {
      case 'carrier':
        shipColor = '#64ffda';
        shipHeight = 15;
        break;
      case 'battleship':
        shipColor = '#4cded9';
        shipHeight = 12;
        break;
      case 'cruiser':
        shipColor = '#40c9c9';
        shipHeight = 10;
        break;
      case 'submarine':
        shipColor = '#36b1b1';
        shipHeight = 8;
        break;
      case 'destroyer':
        shipColor = '#2a8a8a';
        shipHeight = 6;
        break;
      default:
        shipColor = '#64ffda';
        shipHeight = 10;
    }
    
    // Creamos el cuerpo principal del barco
    const shipBody = document.createElement('div');
    shipBody.className = 'ship-body';
    
    const width = isVertical ? '80%' : `${size * 100 - 20}%`;
    const height = isVertical ? `${size * 100 - 20}%` : '80%';
    
    shipBody.style.position = 'absolute';
    shipBody.style.width = width;
    shipBody.style.height = height;
    shipBody.style.backgroundColor = shipColor;
    shipBody.style.left = isVertical ? '10%' : '0';
    shipBody.style.top = isVertical ? '0' : '10%';
    shipBody.style.transformStyle = 'preserve-3d';
    shipBody.style.transform = `translateZ(${shipHeight}px)`;
    shipBody.style.borderRadius = '5px';
    
    // Añadimos sombra para efecto de profundidad
    const shadow = document.createElement('div');
    shadow.className = 'ship-shadow';
    shadow.style.position = 'absolute';
    shadow.style.width = width;
    shadow.style.height = height;
    shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    shadow.style.left = isVertical ? '15%' : '5%';
    shadow.style.top = isVertical ? '5%' : '15%';
    shadow.style.borderRadius = '5px';
    shadow.style.filter = 'blur(5px)';
    
    // Elementos de detalle (cabina, cañones, etc.)
    if (size > 2) {
      const cabin = document.createElement('div');
      cabin.className = 'ship-cabin';
      cabin.style.position = 'absolute';
      
      if (isVertical) {
        cabin.style.width = '60%';
        cabin.style.height = '20%';
        cabin.style.left = '20%';
        cabin.style.top = '20%';
      } else {
        cabin.style.width = '20%';
        cabin.style.height = '60%';
        cabin.style.left = '20%';
        cabin.style.top = '20%';
      }
      
      cabin.style.backgroundColor = '#0a192f';
      cabin.style.transform = `translateZ(${shipHeight + 5}px)`;
      cabin.style.borderRadius = '3px';
      
      shipBody.appendChild(cabin);
    }
    
    // Añadimos todos los elementos al contenedor
    shipElement.appendChild(shadow);
    shipElement.appendChild(shipBody);
    container.appendChild(shipElement);
  }
} 