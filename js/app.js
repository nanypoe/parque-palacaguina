// Variables globales
let todasLasPlantas = [];
let plantaActual = null;
let indiceActual = -1;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function () {
    cargarPlantas();

    // Si estamos en planta.html, cargar la planta específica
    if (window.location.pathname.includes('planta.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const plantaId = urlParams.get('planta');
        if (plantaId) {
            cargarPlantaIndividual(plantaId);
        }
    }
});

// Cargar todas las plantas
function cargarPlantas() {
    fetch('data/plantas.json')
        .then(response => response.json())
        .then(data => {
            todasLasPlantas = data.plantas;

            if (window.location.pathname.includes('index.html') ||
                window.location.pathname === '/' ||
                window.location.pathname.endsWith('/')) {
                mostrarPlantasEnListado();
                cargarFiltros();
                configurarBusqueda();
            }
        })
        .catch(error => {
            console.error('Error cargando plantas:', error);
            document.getElementById('listado-plantas').innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Error cargando las plantas. Por favor, intenta más tarde.
                    </div>
                </div>
            `;
        });
}

// Mostrar plantas en el listado principal
function mostrarPlantasEnListado(plantasFiltradas = null) {
    const plantas = plantasFiltradas || todasLasPlantas;
    const contenedor = document.getElementById('listado-plantas');

    if (plantas.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    No se encontraron plantas que coincidan con tu búsqueda.
                </div>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = '';

    plantas.forEach(planta => {
        const plantaHTML = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 planta-card shadow-sm">
                    <img src="${planta.imagen || 'https://via.placeholder.com/300x200?text=Imagen+No+Disponible'}" 
                         class="card-img-top" 
                         alt="${planta.nombre_comun}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${planta.nombre_comun}</h5>
                        <p class="card-text text-muted small flex-grow-1">${planta.nombre_cientifico}</p>
                        <p class="card-text small">${planta.descripcion_corta.substring(0, 100)}...</p>
                        <div class="mt-auto">
                            <a href="planta.html?planta=${planta.id}" class="btn btn-success btn-sm w-100">
                                Ver Detalles
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += plantaHTML;
    });
}

// Cargar filtros de familia
function cargarFiltros() {
    const filtroFamilia = document.getElementById('filtro-familia');
    if (!filtroFamilia) return;

    const familias = [...new Set(todasLasPlantas.map(p => p.familia))].sort();

    familias.forEach(familia => {
        const option = document.createElement('option');
        option.value = familia;
        option.textContent = familia;
        filtroFamilia.appendChild(option);
    });

    filtroFamilia.addEventListener('change', filtrarPlantas);
}

// Configurar búsqueda
function configurarBusqueda() {
    const buscador = document.getElementById('buscador');
    if (!buscador) return;

    buscador.addEventListener('input', filtrarPlantas);
}

// Filtrar plantas
function filtrarPlantas() {
    const textoBusqueda = document.getElementById('buscador').value.toLowerCase();
    const familiaSeleccionada = document.getElementById('filtro-familia').value;

    let plantasFiltradas = todasLasPlantas;

    // Filtrar por búsqueda de texto
    if (textoBusqueda) {
        plantasFiltradas = plantasFiltradas.filter(planta =>
            planta.nombre_comun.toLowerCase().includes(textoBusqueda) ||
            planta.nombre_cientifico.toLowerCase().includes(textoBusqueda) ||
            planta.familia.toLowerCase().includes(textoBusqueda)
        );
    }

    // Filtrar por familia
    if (familiaSeleccionada) {
        plantasFiltradas = plantasFiltradas.filter(planta =>
            planta.familia === familiaSeleccionada
        );
    }

    mostrarPlantasEnListado(plantasFiltradas);
}

// Cargar planta individual para planta.html
// Cargar planta individual para planta.html
function cargarPlantaIndividual(plantaId) {
    console.log('Buscando planta:', plantaId);
    console.log('Plantas disponibles:', todasLasPlantas);
    
    // Esperar a que se carguen las plantas si es necesario
    if (todasLasPlantas.length === 0) {
        console.log('Esperando a que carguen las plantas...');
        setTimeout(() => {
            cargarPlantaIndividual(plantaId);
        }, 500);
        return;
    }
    
    const planta = todasLasPlantas.find(p => p.id === plantaId);
    
    if (!planta) {
        // Mostrar error más descriptivo (sin botón de admin)
        document.body.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger">
                    <h4>🌿 Planta no encontrada</h4>
                    <p>La planta con ID "<strong>${plantaId}</strong>" no existe en nuestra base de datos.</p>
                    <p class="small text-muted">Plantas disponibles: ${todasLasPlantas.map(p => p.id).join(', ')}</p>
                    <div class="mt-3">
                        <a href="index.html" class="btn btn-primary">Volver al Listado</a>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Resto del código para mostrar la planta...
    plantaActual = planta;
    indiceActual = todasLasPlantas.findIndex(p => p.id === plantaId);

    // Actualizar la página con los datos de la planta
    document.title = `${planta.nombre_comun} - Parque de Flora`;
    document.getElementById('nombre-planta').textContent = planta.nombre_comun;
    document.getElementById('nombre-cientifico').textContent = planta.nombre_cientifico;

    // Imagen
    const imgElement = document.getElementById('imagen-planta');
    imgElement.src = planta.imagen || 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible';
    imgElement.alt = planta.nombre_comun;
    imgElement.onerror = function () {
        this.src = 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible';
    };

    // Información taxonómica
    document.getElementById('info-reino').textContent = planta.reino || '-';
    document.getElementById('info-division').textContent = planta.division || '-';
    document.getElementById('info-orden').textContent = planta.orden || '-';
    document.getElementById('info-familia').textContent = planta.familia || '-';
    document.getElementById('info-especie').textContent = planta.especie || '-';

    // Descripciones
    document.getElementById('descripcion-corta').textContent = planta.descripcion_corta;
    document.getElementById('texto-descripcion-larga').textContent = planta.descripcion_larga;
    document.getElementById('texto-usos').textContent = planta.usos;
    document.getElementById('texto-distribucion').textContent = planta.distribucion;

    // Configurar navegación
    configurarNavegacion();
}

// Configurar botones de navegación anterior/siguiente
function configurarNavegacion() {
    const btnAnterior = document.getElementById('btn-anterior');
    const btnSiguiente = document.getElementById('btn-siguiente');

    if (indiceActual > 0) {
        btnAnterior.onclick = () => {
            const plantaAnterior = todasLasPlantas[indiceActual - 1];
            window.location.href = `planta.html?planta=${plantaAnterior.id}`;
        };
    } else {
        btnAnterior.disabled = true;
        btnAnterior.classList.add('disabled');
    }

    if (indiceActual < todasLasPlantas.length - 1) {
        btnSiguiente.onclick = () => {
            const plantaSiguiente = todasLasPlantas[indiceActual + 1];
            window.location.href = `planta.html?planta=${plantaSiguiente.id}`;
        };
    } else {
        btnSiguiente.disabled = true;
        btnSiguiente.classList.add('disabled');
    }
}