// ============================
// Configuración base
// ============================

// URL de la API
const API_URL = "https://18.216.175.230:4031/api/reservaciones";


// ============================
// Validación de formulario
// ============================

function validarFormulario() {
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    const apellido = document.querySelector('input[name="apellido"]').value.trim();
    const telefono = document.querySelector('input[name="telefono"]').value.trim();
    const habitacion = document.querySelector('input[name="habitacion"]').value.trim();
    const fechaEntrada = document.querySelector('input[name="fecha_entrada"]').value;
    const fechaSalida = document.querySelector('input[name="fecha_salida"]').value;
    const precio = document.querySelector('input[name="precio"]').value.trim();

    if (!nombre || !apellido || !telefono || !habitacion || !fechaEntrada || !fechaSalida || !precio) {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    if (isNaN(precio) || precio <= 0) {
        alert("El precio debe ser un número positivo.");
        return false;
    }

    if (new Date(fechaEntrada) >= new Date(fechaSalida)) {
        alert("La fecha de entrada debe ser anterior a la fecha de salida.");
        return false;
    }

    return true;
}


// ============================
// API (fetch)
// ============================

async function getReservaciones() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener reservaciones");
    return res.json();
}

async function createReservacion(data) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al crear reservación");
    return res.json();
}

async function updateReservacion(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al actualizar reservación");
    return res.json();
}

async function deleteReservacion(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar reservación");
}


// ============================
// UI Helpers
// ============================

function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    return new Date(fechaISO).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

function desformatearFecha(fechaLocal) {
    const [dia, mes, anio] = fechaLocal.split("/");
    return `${anio}-${mes}-${dia}`;
}

function renderFila(reservacion) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td data-label="Nombre">${reservacion.nombre}</td>
        <td data-label="Apellido">${reservacion.apellido}</td>
        <td data-label="Teléfono">${reservacion.telefono}</td>
        <td data-label="Habitación">${reservacion.habitacion}</td>
        <td data-label="Entrada">${formatearFecha(reservacion.fecha_entrada)}</td>
        <td data-label="Salida">${formatearFecha(reservacion.fecha_salida)}</td>
        <td data-label="Precio">$${reservacion.precio}</td>
        <td data-label="Acciones">
            <div class="btn-group">
                <button class="btn-edit" data-id="${reservacion._id}">Editar</button>
                <button class="btn-delete" data-id="${reservacion._id}">Eliminar</button>
            </div>
        </td>
    `;
    return fila;
}

async function cargarReservaciones() {
    const tbody = document.querySelector("#tabla-contactos tbody");
    tbody.innerHTML = "";
    try {
        const reservaciones = await getReservaciones();
        reservaciones.forEach(res => tbody.appendChild(renderFila(res)));
        agregarListenersBotones();
    } catch (error) {
        alert("No se pudieron cargar las reservaciones.");
        console.error(error);
    }
}


// ============================
// Manejo de eventos
// ============================

// ============================
// Captura de Valores a Editar
// ============================


function rellenarFormulario(valores) {
    document.querySelector('input[name="nombre"]').value = valores[0];
    document.querySelector('input[name="apellido"]').value = valores[1];
    document.querySelector('input[name="telefono"]').value = valores[2];
    document.querySelector('input[name="habitacion"]').value = valores[3];
    document.querySelector('input[name="fecha_entrada"]').value = desformatearFecha(valores[4]);
    document.querySelector('input[name="fecha_salida"]').value = desformatearFecha(valores[5]);
    document.querySelector('input[name="precio"]').value = valores[6].replace("$", "");
}

// ============================
// Funciones Bandera de Activación de Boton según seleccion - Creación - Edición
// ============================

async function agregarReservacion(event) {
    event.preventDefault(); // evita recarga del formulario

    if (!validarFormulario()) return;

    const form = document.getElementById("formulario");
    const data = Object.fromEntries(new FormData(form));
    data.precio = Number(data.precio); // aseguramos que precio sea numérico

    try {
        await createReservacion(data); // llama a la API
        cargarReservaciones();         // refresca la tabla
        form.reset();                  // limpia los campos
    } catch (error) {
        alert("No se pudo guardar la reservación.");
        console.error(error);
    }
}

function activarModoCreacion() {
    const form = document.getElementById("formulario");
    form.reset();
    form.removeEventListener("submit", form._actualizarHandler);
    form.addEventListener("submit", agregarReservacion);
    form._actualizarHandler = null;
}

function activarModoEdicion(id) {
    const form = document.getElementById("formulario");
    // Desactiva crear para evitar duplicidad de listeners
    form.removeEventListener("submit", agregarReservacion);

    // Guardamos handler en la propiedad del form para poder removerlo luego
    form._actualizarHandler = async function actualizar(event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.precio = Number(data.precio);
        if (!validarFormulario()) return;

        try {
            await updateReservacion(id, data);
            cargarReservaciones();
            activarModoCreacion(); // restauramos el form a modo crear
        } catch (error) {
            alert("No se pudo actualizar.");
            console.error(error);
        }
    };

    form.addEventListener("submit", form._actualizarHandler);
}

// ============================
// Listeners simplificados
// ============================

function agregarListenersBotones() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm("¿Seguro que deseas eliminar esta reservación?")) return;
            try {
                await deleteReservacion(btn.dataset.id);
                cargarReservaciones();
            } catch (error) {
                alert("No se pudo eliminar.");
                console.error(error);
            }
        });
    });

    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => {
            const fila = btn.closest("tr");
            const valores = Array.from(fila.querySelectorAll("td:not(:last-child)"))
                                .map(td => td.textContent);

            rellenarFormulario(valores);
            activarModoEdicion(btn.dataset.id);
        });
    });
}


// ============================
// Inicialización
// ============================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formulario")
            .addEventListener("submit", agregarReservacion);
    cargarReservaciones();

});



