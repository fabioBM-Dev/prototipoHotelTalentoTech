// ============================
// Configuración base
// ============================

const API_URL = "https://underseahotel.ddns.net:4033/api/inventarios";

// ============================
// Validación de formulario
// ============================

function validarFormulario() 
{
    const codigoarticulo = document.querySelector('input[name="codigoarticulo"]').value.trim();
    const articulo = document.querySelector('input[name="articulo"]').value.trim();
    const categoria = document.querySelector('input[name="categoria"]').value.trim();
    const existencias = document.querySelector('input[name="existencias"]').value.trim();
    const precio = document.querySelector('input[name="precio"]').value.trim();
        
    if (!codigoarticulo || !articulo || !categoria || !existencias || !precio) 
    {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    if (isNaN(precio) || precio <= 0) 
    {
        alert("El artículo debe tener un precio de compra.");
        return false;
    }

    return true;
}

// ============================
// API (fetch)
// ============================

async function getInventarios() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener empleados");
    return res.json();
}

async function createInventarios(data) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al crear empleados");
    return res.json();
}

async function updateInventarios(id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Error al actualizar empleados");
    return res.json();
}

async function deleteInventarios(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar empleados");
}

// ============================
// UI Helpers
// ============================

function renderFila(inventario) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td data-label="ID Art.">${inventario.codigoarticulo}</td>
        <td data-label="Artículo">${inventario.articulo}</td>
        <td data-label="Categoría">${inventario.categoria}</td>
        <td data-label="Existencias">${inventario.existencias}</td>
        <td data-label="Valor unitario">${inventario.precio}</td>
        <td data-label="Acciones">
            <div class="btn-group">
                <button class="btn-edit" data-id="${inventario._id}">Editar</button>
                <button class="btn-delete" data-id="${inventario._id}">Eliminar</button>
            </div>
        </td>
    `;
    return fila;
}

async function cargarInventarios() {
    const tbody = document.querySelector("#tabla-contactos tbody");
    tbody.innerHTML = "";
    try {
        const inventarios = await getInventarios();
        inventarios.forEach(inventario => tbody.appendChild(renderFila(inventario)));
        agregarListenersBotones();
    } catch (error) {
        alert("No se pudieron cargar los inventarios.");
        console.error(error);
    }
}

// ============================
// Manejo de eventos
// ============================

function rellenarFormulario(valores) {
    document.querySelector('input[name="codigoarticulo"]').value = valores[0];
    document.querySelector('input[name="articulo"]').value = valores[1];
    document.querySelector('input[name="categoria"]').value = valores[2];
    document.querySelector('input[name="existencias"]').value = valores[3];
    document.querySelector('input[name="precio"]').value = valores[4];
}

// ============================
// Funciones Bandera de Activación de Boton según seleccion - Creación - Edición
// ============================

async function agregarInventarios(event) {
    event.preventDefault();
    if (!validarFormulario()) return;
    const form = document.getElementById("formulario");
    const data = Object.fromEntries(new FormData(form));
    data.salario = Number(data.salario);

    try {
        await createInventarios(data);
        cargarInventarios();
        form.reset();
    } catch (error) {
        alert("No se pudo guardar el item de inventario.");
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
    form.addEventListener("submit", agregarInventarios);
}

function activarModoEdicion(id) {
    const form = document.getElementById("formulario");
    form.removeEventListener("submit", agregarInventarios);

    if (form._actualizarHandler) {
        form.removeEventListener("submit", form._actualizarHandler);
    }
    form._actualizarHandler = async function actualizar(event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        data.precio = Number(data.precio);
        if (!validarFormulario()) return;

        try {
            await updateInventarios(id, data);
            cargarInventarios();
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
            if (!confirm("¿Seguro que deseas eliminar este artículo?")) return;
            try {
                await deleteInventarios(btn.dataset.id);
                cargarInventarios();
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
            .addEventListener("submit", agregarInventarios);
    cargarInventarios();

});



