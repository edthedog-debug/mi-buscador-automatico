const fs = require('fs');
const palabra = process.env.PALABRA_BUSQUEDA;

if (!palabra) {
  console.error("No se proporcionó ninguna palabra.");
  process.exit(1);
}

async function buscarEnInternet() {
  try {
    console.log(`Buscando en la web: ${palabra}`);
    
    // Nos conectamos a la versión básica de DuckDuckGo para evitar bloqueos
    const response = await fetch('https://lite.duckduckgo.com/lite/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: `q=${encodeURIComponent(palabra)}`
    });

    if (!response.ok) throw new Error('El buscador rechazó la conexión.');
    
    const html = await response.text();
    
    // Extraemos el primer resultado de la web buscando en el código de la página
    const regexSnippet = /<td class='result-snippet'>([\s\S]*?)<\/td>/;
    const regexLink = /<a rel="nofollow" href="([^"]+)"/;

    const snippetMatch = html.match(regexSnippet);
    const linkMatch = html.match(regexLink);

    if (!snippetMatch) {
        throw new Error(`No se encontró nada en internet para "${palabra}"`);
    }

    // Limpiamos el texto de código residual
    const textoLimpio = snippetMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
    // Si no logramos extraer el enlace exacto, enviamos al usuario a la página de resultados
    const urlDestino = linkMatch ? linkMatch[1] : `https://duckduckgo.com/?q=${encodeURIComponent(palabra)}`;

    const resultado = {
      palabra: palabra,
      titulo: `Búsqueda Web: ${palabra}`,
      resumen: textoLimpio,
      // Usamos una imagen genérica de lupa porque la búsqueda general no devuelve fotos limpias fácilmente
      imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Magnifying_glass_icon.svg/512px-Magnifying_glass_icon.svg.png", 
      link: urlDestino,
      fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
    };

    // Guardamos el resultado exacto como el HTML lo espera
    fs.writeFileSync('datos.json', JSON.stringify(resultado, null, 2));
    console.log("¡Datos web guardados correctamente!");

  } catch (error) {
    fs.writeFileSync('datos.json', JSON.stringify({ error: error.message }));
  }
}

buscarEnInternet();
