// Variables globales
let plantas = [];
let plantaEditando = null;

// Cargar plantas al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarPlantas();
    
    document.getElementById('planta-form').addEventListener('submit', guardarPlanta);
    document.getElementById('btn-cancelar').addEventListener('click', cancelarEdicion);
    
    // Nuevo: Event listener para cargar archivo JSON
    document.getElementById('cargar-json').addEventListener('change', cargarArchivoJSON);
});

// Cargar plantas desde el JSON
function cargarPlantas() {
    fetch('data/plantas.json')
        .then(response => response.json())
        .then(data => {
            plantas = data.plantas;
            mostrarPlantas();
        })
        .catch(error => {
            console.error('Error cargando plantas:', error);
            plantas = [];
        });
}

// Mostrar plantas en la lista
function mostrarPlantas() {
    const contenedor = document.getElementById('plantas-lista');
    contenedor.innerHTML = '';

    plantas.forEach((planta, index) => {
        const plantaHTML = `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card planta-card">
                    <div class="card-body">
                        <h6 class="card-title">${planta.nombre_comun}</h6>
                        <p class="card-text text-muted small">${planta.nombre_cientifico}</p>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editarPlanta(${index})">Editar</button>
                            <button class="btn btn-outline-danger" onclick="eliminarPlanta(${index})">Eliminar</button>
                            <button class="btn btn-outline-success" onclick="verPlanta('${planta.id}')">Ver</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += plantaHTML;
    });
}

// Guardar planta (crear o actualizar)
function guardarPlanta(event) {
    event.preventDefault();
    
    const planta = {
        id: document.getElementById('id').value,
        nombre_comun: document.getElementById('nombre_comun').value,
        nombre_cientifico: document.getElementById('nombre_cientifico').value,
        familia: document.getElementById('familia').value,
        reino: document.getElementById('reino').value,
        orden: document.getElementById('orden').value,
        especie: document.getElementById('especie').value,
        division: document.getElementById('division').value,
        imagen: document.getElementById('imagen').files[0] ? 'images/' + document.getElementById('imagen').files[0].name : '',
        descripcion_corta: document.getElementById('descripcion_corta').value,
        descripcion_larga: document.getElementById('descripcion_larga').value,
        usos: document.getElementById('usos').value,
        distribucion: document.getElementById('distribucion').value
    };

    // El resto del código se mantiene igual...
    if (plantaEditando !== null) {
        plantas[plantaEditando] = planta;
        plantaEditando = null;
        document.getElementById('btn-cancelar').style.display = 'none';
        document.getElementById('form-title').textContent = 'Agregar Nueva Planta';
    } else {
        plantas.push(planta);
    }

    guardarJSON();
    document.getElementById('planta-form').reset();
    mostrarPlantas();
}

// Editar planta
function editarPlanta(index) {
    const planta = plantas[index];
    
    // Llenar formulario con datos de la planta
    document.getElementById('id').value = planta.id;
    document.getElementById('nombre_comun').value = planta.nombre_comun;
    document.getElementById('nombre_cientifico').value = planta.nombre_cientifico;
    document.getElementById('familia').value = planta.familia;
    document.getElementById('reino').value = planta.reino || '';
    document.getElementById('orden').value = planta.orden || '';
    document.getElementById('especie').value = planta.especie || '';
    document.getElementById('division').value = planta.division || '';
    document.getElementById('descripcion_corta').value = planta.descripcion_corta;
    document.getElementById('descripcion_larga').value = planta.descripcion_larga;
    document.getElementById('usos').value = planta.usos;
    document.getElementById('distribucion').value = planta.distribucion;
    
    plantaEditando = index;
    document.getElementById('btn-cancelar').style.display = 'inline-block';
    document.getElementById('form-title').textContent = 'Editar Planta';
    
    document.getElementById('planta-form').scrollIntoView();
}

// Cancelar edición
function cancelarEdicion() {
    plantaEditando = null;
    document.getElementById('planta-form').reset();
    document.getElementById('btn-cancelar').style.display = 'none';
    document.getElementById('form-title').textContent = 'Agregar Nueva Planta';
}

// Eliminar planta
function eliminarPlanta(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta planta?')) {
        plantas.splice(index, 1);
        guardarJSON();
        mostrarPlantas();
    }
}

// Ver planta (para probar)
function verPlanta(id) {
    window.open(`planta.html?planta=${id}`, '_blank');
}

// Guardar en JSON (simulado - luego implementaremos guardado real)
function guardarJSON() {
    const data = { plantas: plantas };
    
    // 1. Guardar en LocalStorage como respaldo
    localStorage.setItem('plantasData', JSON.stringify(data));
    
    // 2. Crear y descargar archivo JSON
    descargarJSON(data);
    
    // 3. Mostrar instrucciones para GitHub
    mostrarInstruccionesGitHub();
}

// Función para descargar el JSON
function descargarJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantas.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para mostrar instrucciones de GitHub
function mostrarInstruccionesGitHub() {
    const instruccionesHTML = `
        <div class="alert alert-info mt-3">
            <h6>📋 Instrucciones para actualizar en GitHub:</h6>
            <ol class="mb-0">
                <li>Se descargó el archivo <strong>plantas.json</strong></li>
                <li>Ve a tu repositorio en GitHub</li>
                <li>Navega a la carpeta <strong>data/</strong></li>
                <li>Haz clic en "Add file" → "Upload files"</li>
                <li>Sube el archivo plantas.json que acabas de descargar</li>
                <li>Haz commit con los cambios</li>
            </ol>
        </div>
    `;
    
    // Buscar si ya existe una alerta de instrucciones
    let alertaExistente = document.getElementById('instrucciones-github');
    if (!alertaExistente) {
        const contenedor = document.querySelector('.container');
        const nuevaAlerta = document.createElement('div');
        nuevaAlerta.id = 'instrucciones-github';
        nuevaAlerta.innerHTML = instruccionesHTML;
        contenedor.appendChild(nuevaAlerta);
    }
}

// Función para cargar desde LocalStorage (si existe)
function cargarDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem('plantasData');
    if (datosGuardados) {
        try {
            const data = JSON.parse(datosGuardados);
            plantas = data.plantas || [];
            mostrarPlantas();
            
            // Mostrar aviso que se cargó desde respaldo
            mostrarAvisoLocalStorage();
        } catch (error) {
            console.error('Error cargando desde LocalStorage:', error);
        }
    }
}

// Mostrar aviso cuando se carga desde LocalStorage
function mostrarAvisoLocalStorage() {
    const avisoHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>📁 Datos cargados desde respaldo local</strong>
            <br>Estos son los cambios no guardados en GitHub. Recuerda descargar y subir el JSON actualizado.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const contenedor = document.querySelector('.container');
    contenedor.insertAdjacentHTML('afterbegin', avisoHTML);
}

// Función para cargar archivo JSON local (para actualizar datos)
function cargarArchivoJSON(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                plantas = data.plantas || [];
                localStorage.setItem('plantasData', JSON.stringify(data));
                mostrarPlantas();
                alert('✅ Datos cargados correctamente desde el archivo JSON');
            } catch (error) {
                alert('❌ Error al cargar el archivo JSON: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Actualizamos la función cargarPlantas para intentar LocalStorage primero
function cargarPlantas() {
    // Primero intentamos cargar desde el JSON online
    fetch('data/plantas.json')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar el JSON');
            return response.json();
        })
        .then(data => {
            plantas = data.plantas;
            // Guardamos también en LocalStorage como respaldo
            localStorage.setItem('plantasData', JSON.stringify(data));
            mostrarPlantas();
        })
        .catch(error => {
            console.log('No se pudo cargar plantas.json, intentando LocalStorage...');
            // Si falla, intentamos cargar desde LocalStorage
            cargarDesdeLocalStorage();
        });
}