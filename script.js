const fs = require('fs');
const palabra = process.env.PALABRA_BUSQUEDA;

if (!palabra) {
  console.error("No se proporcionó ninguna palabra.");
  process.exit(1);
}

async function buscarInformacion() {
  try {
    console.log(`Buscando: ${palabra}`);
    // Conectamos con la API de Wikipedia para obtener un resumen automático
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(palabra)}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('No se encontró información.');
    const data = await response.json();
    
    const resultado = {
      palabra: palabra,
      titulo: data.title,
      resumen: data.extract,
      imagen: data.originalimage ? data.originalimage.source : null,
      link: data.content_urls.desktop.page,
      fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
    };

    fs.writeFileSync('datos.json', JSON.stringify(resultado, null, 2));
    console.log("¡Datos guardados!");

  } catch (error) {
    fs.writeFileSync('datos.json', JSON.stringify({ error: `No se encontró información para "${palabra}"` }));
  }
}

buscarInformacion();
