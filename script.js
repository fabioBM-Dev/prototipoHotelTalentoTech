document.querySelectorAll('nav ul li a').forEach(link => {
     // 1. Verifica si el 'href' comienza con '#' (enlace interno)
    const href = link.getAttribute('href');
     if (href && href.startsWith('#')) {
        
        // 2. Si es un enlace interno, aplica el desplazamiento suave    
        link.addEventListener('click', function (e) {
        e.preventDefault(); // Evita la navegación estándar

        const targetId = this.getAttribute('href').substring(1);// Elimina el '#'
        const targetSection = document.getElementById(targetId); 

        if (targetSection) {
            window.scrollTo({
            top: targetSection.offsetTop - 60, // Compensa la altura del header fijo
            behavior: 'smooth'
             });
        }
        
    });
    // 3. Si el 'href' NO empieza con '#', el script no hace nada. 
    //    El navegador ejecutará la acción por defecto (abrir la URL)
};
});
