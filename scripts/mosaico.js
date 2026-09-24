// ===== CONFIGURACIÓN =====
const CLOUD_NAME = 'duwcgmivc';
const TAG = 'mosaico';

// ===== OBTENER IMÁGENES DE CLOUDINARY =====
async function obtenerImagenesCloudinary() {
    try {
        const timestamp = new Date().getTime();
        const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG}.json?t=${timestamp}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        return data.resources || [];
    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        return [];
    }
}

// ===== LIGHTBOX =====
function abrirLightbox(imagenUrl, titulo, descripcion) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImagen');
    const tituloEl = document.getElementById('lightboxTitulo');
    // const fechaEl = document.getElementById('lightboxFecha');
    const descEl = document.getElementById('lightboxDescripcion');
    
    if (!lightbox) {
        console.error('No se encontró #lightbox');
        return;
    }
    
    img.src = imagenUrl;
    img.alt = titulo || 'Evento';
    tituloEl.textContent = titulo || 'Evento';
    // fechaEl.textContent = fecha || '';
    descEl.textContent = descripcion || '';
    
    lightbox.classList.add('visible');
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('visible');
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ===== EVENTOS DEL LIGHTBOX =====
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarLightbox();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarLightbox();
        }
    });
    
    const cerrarBtn = document.getElementById('lightboxCerrar');
    if (cerrarBtn) {
        cerrarBtn.addEventListener('click', cerrarLightbox);
    }
});

// ===== MOSAICO =====
function generarMosaico(imagenes) {
    const grid = document.getElementById('mosaicoGrid');
    if (!grid) {
        console.error('No se encontró #mosaicoGrid');
        return;
    }
    
    grid.innerHTML = '';
    
    if (!imagenes || imagenes.length === 0) {
        for (let i = 0; i < 6; i++) {
            const item = document.createElement('div');
            item.className = 'mosaico-item';
            const placeholder = document.createElement('div');
            placeholder.className = 'mosaico-placeholder';
            const colores = ['#3c0035', '#5235a1', '#7d28bb', '#1e1e2f', '#2d1b3d'];
            placeholder.style.background = `linear-gradient(135deg, ${colores[i % colores.length]}, ${colores[(i + 1) % colores.length]})`;
            placeholder.textContent = `Evento ${i + 1}`;
            item.appendChild(placeholder);
            grid.appendChild(item);
        }
        return;
    }
    
    const maxImagenes = 12;
    const imagenesMostrar = imagenes.slice(0, maxImagenes);
    
    imagenesMostrar.forEach((img, index) => {
        const imageUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.public_id}`;
        const nombre = img.public_id.split('/').pop() || `Evento ${index + 1}`;
        const titulo = nombre.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
        // const fecha = img.created_at ? new Date(img.created_at).toLocaleDateString('es-ES', {
        //     year: 'numeric',
        //     month: 'long',
        //     day: 'numeric'
        // }) : '';
        
        const item = document.createElement('div');
        item.className = 'mosaico-item';
        item.setAttribute('data-title', titulo);
        
        item.addEventListener('click', function() {
            abrirLightbox(imageUrl, titulo, 'Evento del capítulo estudiantil NUKU');
        });
        
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = titulo;
        imgElement.loading = 'lazy';
        item.appendChild(imgElement);
        
        grid.appendChild(item);
    });
}

// ===== EJECUTAR =====
document.addEventListener('DOMContentLoaded', async function() {
    // console.log('Cargando mosaico...');
    const imagenes = await obtenerImagenesCloudinary();
    generarMosaico(imagenes);
});