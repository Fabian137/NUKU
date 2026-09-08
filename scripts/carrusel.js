// ===== CONFIGURACIÓN =====
const CLOUD_NAME_CARRUSEL = 'duwcgmivc';
const TAG_CARRUSEL = 'mosaico'; // Usa la misma tag que tus imágenes
const INTERVALO = 13000; // Cambiar imagen cada 13 segundos

// ===== OBTENER IMÁGENES =====
async function obtenerImagenesCloudinary() {
    try {
        const timestamp = new Date().getTime();
        const url = `https://res.cloudinary.com/${CLOUD_NAME_CARRUSEL}/image/list/${TAG_CARRUSEL}.json?t=${timestamp}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        console.log('Imágenes obtenidas del carrusel:', data.resources);
        return data.resources || [];
    } catch (error) {
        console.error('Error al obtener imágenes del carrusel:', error);
        return [];
    }
}

// ===== INICIALIZAR CARRUSEL =====
function inicializarCarrusel(imagenes) {
    const contenedor = document.getElementById('carruselFondo');
    const indicadores = document.getElementById('carruselIndicadores');
    
    if (!contenedor) {
        console.error('No se encontró #carruselFondo');
        return;
    }
    
    // Si no hay imágenes, mostrar color sólido
    if (imagenes.length === 0) {
        contenedor.innerHTML = `
            <div class="slide activo" style="background: linear-gradient(135deg, #330036, #3c0035, #7d28bb);"></div>
        `;
        if (indicadores) indicadores.innerHTML = '';
        return;
    }
    
    // Limitar a máximo 5 imágenes
    const slides = imagenes.slice(0, 10);
    
    // Generar slides
    contenedor.innerHTML = slides.map((img, index) => `
        <div class="slide ${index === 0 ? 'activo' : ''}" 
             style="background-image: url('https://res.cloudinary.com/${CLOUD_NAME_CARRUSEL}/image/upload/${img.public_id}'); background-size: cover; background-position: center;">
        </div>
    `).join('');
    
    // Generar indicadores (puntos)
    if (indicadores) {
        indicadores.innerHTML = slides.map((_, index) => `
            <button class="punto ${index === 0 ? 'activo' : ''}" data-index="${index}" aria-label="Ir a imagen ${index + 1}"></button>
        `).join('');
    }
    
    let slideActual = 0;
    const totalSlides = slides.length;
    let intervaloId;
    
    function irASlide(index) {
        if (index === slideActual) return;
        
        const slidesElements = contenedor.querySelectorAll('.slide');
        const puntos = indicadores ? indicadores.querySelectorAll('.punto') : [];
        
        slidesElements[slideActual].classList.remove('activo');
        if (puntos.length > 0) puntos[slideActual].classList.remove('activo');
        
        slideActual = index;
        
        slidesElements[slideActual].classList.add('activo');
        if (puntos.length > 0) puntos[slideActual].classList.add('activo');
    }
    
    function siguienteSlide() {
        const next = (slideActual + 1) % totalSlides;
        irASlide(next);
    }
    
    function reiniciarIntervalo() {
        clearInterval(intervaloId);
        intervaloId = setInterval(siguienteSlide, INTERVALO);
    }
    
    // Event listeners para indicadores
    if (indicadores) {
        indicadores.querySelectorAll('.punto').forEach(punto => {
            punto.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                irASlide(index);
                reiniciarIntervalo();
            });
        });
    }
    
    // Iniciar auto-reproducción
    intervaloId = setInterval(siguienteSlide, INTERVALO);
    
    // Pausar al pasar el mouse
    const header = document.querySelector('.carrusel-header');
    if (header) {
        header.addEventListener('mouseenter', () => clearInterval(intervaloId));
        header.addEventListener('mouseleave', () => {
            clearInterval(intervaloId);
            intervaloId = setInterval(siguienteSlide, INTERVALO);
        });
    }
}

// ===== EJECUTAR =====
document.addEventListener('DOMContentLoaded', async function() {
    const imagenes = await obtenerImagenesCloudinary();
    inicializarCarrusel(imagenes);
});