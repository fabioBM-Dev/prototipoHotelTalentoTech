// ============================
// Configuración base
// ============================

const API_URL = "http://localhost:80/api/empleados";

// ============================
// Validación de formulario
// ============================

function validarFormulario() 
{
    const documento = document.querySelector('input[name="documento"]').value.trim();
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    const apellido = document.querySelector('input[name="apellido"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const telefono = document.querySelector('input[name="telefono"]').value.trim();
    const cargo = document.querySelector('input[name="cargo"]').value.trim();
    const salario = document.querySelector('input[name="salario"]').value.trim();
    const fechaEntrada = document.querySelector('input[name="fecha_entrada"]').value;
    
    if (!nombre || !apellido || !documento || !email || !telefono || !cargo || !salario || !fechaEntrada) 
    {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    if (isNaN(salario) || salario <= 0) 
    {
        alert("El salario debe ser un número positivo.");
        return false;
    }

    return true;
}

// ============================
// API (fetch)
// ============================

async function getEmpleados() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener empleados");
    return res.json();
}

async function createEmpleados(data) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al crear empleados");
    return res.json();
}

async function updateEmpleados(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al actualizar empleados");
    return res.json();
}

async function deleteEmpleados(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar empleados");
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

function renderFila(empleado) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td data-label="Documento">${empleado.documento}</td>
        <td data-label="Nombre">${empleado.nombre}</td>
        <td data-label="Apellido">${empleado.apellido}</td>
        <td data-label="Email">${empleado.email}</td>
        <td data-label="Teléfono">${empleado.telefono}</td>
        <td data-label="Cargo">${empleado.cargo}</td>
        <td data-label="Salario">$${empleado.salario}</td>
        <td data-label="Entrada">${formatearFecha(empleado.fecha_entrada)}</td>
        <td data-label="Acciones">
            <div class="btn-group">
                <button class="btn-edit" data-id="${empleado._id}">Editar</button>
                <button class="btn-delete" data-id="${empleado._id}">Eliminar</button>
            </div>
        </td>
    `;
    return fila;
}

async function cargarEmpleados() {
    const tbody = document.querySelector("#tabla-contactos tbody");
    tbody.innerHTML = "";
    try {
        const empleados = await getEmpleados();
        empleados.forEach(empleado => tbody.appendChild(renderFila(empleado)));
        agregarListenersBotones();
    } catch (error) {
        alert("No se pudieron cargar los empleados.");
        console.error(error);
    }
}

// ============================
// Manejo de eventos
// ============================

function rellenarFormulario(valores) {
    document.querySelector('input[name="documento"]').value = valores[0];
    document.querySelector('input[name="nombre"]').value = valores[1];
    document.querySelector('input[name="apellido"]').value = valores[2];
    document.querySelector('input[name="email"]').value = valores[3];
    document.querySelector('input[name="telefono"]').value = valores[4];
    document.querySelector('input[name="cargo"]').value = valores[5];
    document.querySelector('input[name="salario"]').value = valores[6].replace("$", "");
    document.querySelector('input[name="fecha_entrada"]').value = desformatearFecha(valores[7]);
}

// ============================
// Funciones Bandera de Activación de Boton según seleccion - Creación - Edición
// ============================

async function agregarEmpleados(event) {
    event.preventDefault();
    if (!validarFormulario()) return;
    const form = document.getElementById("formulario");
    const data = Object.fromEntries(new FormData(form));
    data.salario = Number(data.salario);

    try {
        await createEmpleados(data);
        cargarEmpleados();
        form.reset();
    } catch (error) {
        alert("No se pudo guardar el empleado.");
        console.error(error);
    }
}

function activarModoCreacion() {
    const form = document.getElementById("formulario");
    form.reset();
    if (form._actualizarHandler) {
        form.removeEventListener("submit", form._actualizarHandler);
        form._actualizarHandler = null;
    }
    form.addEventListener("submit", agregarEmpleados);
}

function activarModoEdicion(id) {
    const form = document.getElementById("formulario");
    form.removeEventListener("submit", agregarEmpleados);

    if (form._actualizarHandler) {
        form.removeEventListener("submit", form._actualizarHandler);
    }
    form._actualizarHandler = async function actualizar(event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.salario = Number(data.salario);
        if (!validarFormulario()) return;

        try {
            await updateEmpleados(id, data);
            cargarEmpleados();
            activarModoCreacion();
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
            if (!confirm("¿Seguro que deseas eliminar este empleado?")) return;
            try {
                await deleteEmpleados(btn.dataset.id);
                cargarEmpleados();
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
            .addEventListener("submit", agregarEmpleados);
    cargarEmpleados();

});
