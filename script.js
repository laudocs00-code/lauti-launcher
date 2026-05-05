// Scroll reveal animation
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .security-section, .register-section, .download-section, .creator-section, .comparison-section').forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s ease-out";
    observer.observe(el);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// ============================================================
// CONFIGURACION FIREBASE (Pega tu URL aqui)
// ============================================================
const FIREBASE_URL = "https://lautilauncher-default-rtdb.firebaseio.com/";

const regForm = document.getElementById('regForm');
const regStatus = document.getElementById('regStatus');
const authMode = document.getElementById('authMode');
const toggleLoginBtn = document.getElementById('toggleLoginBtn');
const toggleRegBtn = document.getElementById('toggleRegBtn');
const authTitle = document.getElementById('authTitle');
const regBtn = document.getElementById('regBtn');
const loggedInView = document.getElementById('loggedInView');

const navLoginBtn = document.getElementById('navLoginBtn');
const navUserProfile = document.getElementById('navUserProfile');
const navUserName = document.getElementById('navUserName');
const logoutBtn = document.getElementById('logoutBtn');

// Actualizar interfaz segun sesion
function updateSessionUI() {
    const currentUser = localStorage.getItem('webUser');
    if (currentUser) {
        // Logueado
        if (navLoginBtn) navLoginBtn.style.display = 'none';
        if (navUserProfile) navUserProfile.style.display = 'flex';
        if (navUserName) navUserName.textContent = currentUser;
        
        if (regForm) regForm.style.display = 'none';
        if (toggleLoginBtn) toggleLoginBtn.parentElement.style.display = 'none';
        if (loggedInView) loggedInView.style.display = 'block';
        if (authTitle) authTitle.textContent = "Área Personal";
    } else {
        // No logueado
        if (navLoginBtn) navLoginBtn.style.display = 'inline-block';
        if (navUserProfile) navUserProfile.style.display = 'none';
        
        if (regForm) regForm.style.display = 'block';
        if (toggleLoginBtn) toggleLoginBtn.parentElement.style.display = 'flex';
        if (loggedInView) loggedInView.style.display = 'none';
        if (authTitle) authTitle.textContent = authMode && authMode.value === 'login' ? "Iniciar Sesión" : "Únete a la Comunidad";
    }
}

// Cerrar sesion
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('webUser');
        updateSessionUI();
    });
}

// Cambiar entre Login y Registro
if (toggleLoginBtn && toggleRegBtn) {
    toggleLoginBtn.addEventListener('click', () => {
        authMode.value = 'login';
        authTitle.textContent = 'Iniciar Sesión';
        regBtn.textContent = 'Entrar';
        toggleLoginBtn.style.display = 'none';
        toggleRegBtn.style.display = 'inline-block';
        regStatus.textContent = '';
    });

    toggleRegBtn.addEventListener('click', () => {
        authMode.value = 'register';
        authTitle.textContent = 'Únete a la Comunidad';
        regBtn.textContent = 'Registrarme Ahora';
        toggleRegBtn.style.display = 'none';
        toggleLoginBtn.style.display = 'inline-block';
        regStatus.textContent = '';
    });
}

    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (window.location.protocol === 'file:') {
                regStatus.textContent = "Error: No puedes registrarte abriendo el archivo HTML directamente. Debes usar un servidor local (ej. server.js) o Vercel.";
                regStatus.className = "status-msg error";
                return;
            }

            const nameInput = document.getElementById('regName').value.trim().toLowerCase();
        const passInput = document.getElementById('regPass').value;
        const btn = document.getElementById('regBtn');
        const mode = authMode.value;

        if (!nameInput || !passInput) return;

        regStatus.textContent = "Conectando...";
        regStatus.className = "status-msg";
        btn.disabled = true;

        try {
            const endpoint = mode === 'register' ? '/api/register' : '/api/login';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameInput, pass: passInput })
            });

            let result;
            try {
                result = await response.json();
            } catch (e) {
                regStatus.textContent = "Error: El servidor no respondió en formato JSON (Posible 404).";
                regStatus.className = "status-msg error";
                btn.disabled = false;
                return;
            }

            if (response.ok && result.status === 'ok') {
                localStorage.setItem('webUser', nameInput);
                regStatus.textContent = mode === 'register' ? "¡Registro exitoso! Bienvenido." : "¡Has iniciado sesión!";
                regStatus.className = "status-msg success";
                setTimeout(updateSessionUI, 1000);
            } else {
                regStatus.textContent = result.message || "Error en la operación.";
                regStatus.className = "status-msg error";
            }
        } catch (error) {
            regStatus.textContent = "Error de conexión con el servidor.";
            regStatus.className = "status-msg error";
            console.error(error);
        } finally {
            btn.disabled = false;
        }
    });
}

// Inicializar UI
updateSessionUI();
