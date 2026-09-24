async function cargarSesionesSMAA() {
  const url = 'https://res.cloudinary.com/duwcgmivc/raw/upload/v1786174351/smaa-sessions_q6myxw.json';
  const tbody = document.querySelector('.sessions-table tbody');
  
  if (!tbody) {
    console.error('No se encontró el tbody de la tabla');
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
    const data = await response.json();
    const sessions = data.sessions || [];
    
    // 1. Generar tabla (igual que antes)
    renderTabla(tbody, sessions);
    
    // 2. Llenar bloque de próxima ponencia
    renderProximaPonencia(sessions);
    
    // 3. Mostrar semestre
    const semesterElement = document.getElementById('semester-display');
    if (semesterElement && data.semester) {
      semesterElement.textContent = `Semestre ${data.semester}`;
    }
    
  } catch (error) {
    console.error('Error al cargar las sesiones:', error);
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">Error al cargar los datos. Intenta más tarde.</td></tr>`;
  }
}

// Función para generar la tabla
function renderTabla(tbody, sessions) {
  tbody.innerHTML = '';
  sessions.forEach(session => {
    const tr = document.createElement('tr');
    tr.className = session.confirmed === false ? 'pending-session' : 'confirmed-session';
    tr.innerHTML = `
      <td class="session-date">${session.displayDate || session.date}</td>
      <td class="session-presenter">${session.speaker}</td>
      <td>${session.topic}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para llenar el bloque de la próxima ponencia
function renderProximaPonencia(sessions) {
  if (!sessions || sessions.length === 0) return;
  
  // Elegir la sesión: la más próxima (fecha futura más cercana)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
  
  const proximas = sessions
    .filter(s => new Date(s.date) >= hoy)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Si no hay futuras, usar la última pasada
  const proxima = proximas[0] || sessions[sessions.length - 1];
  
  // Actualizar elementos del DOM
  const tituloEl = document.getElementById('next-title');
  const ponenteEl = document.getElementById('next-presenter');
  const descripcionEl = document.getElementById('next-description');
  const fechaEl = document.getElementById('next-date');

  if (tituloEl) tituloEl.textContent = proxima.topic || 'Tema por definir';
  if (ponenteEl) ponenteEl.textContent = proxima.speaker || 'Ponente por confirmar';
  if (descripcionEl) descripcionEl.textContent = proxima.description || 'Descripción pendiente';
  if (fechaEl) fechaEl.textContent = proxima.displayDate || proxima.date || 'Fecha por definir';
}

document.addEventListener('DOMContentLoaded', cargarSesionesSMAA);