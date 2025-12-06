document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    // initBackground removed
    initProjectCards();
    initScrollBlur();
    initDocumentation();
});

// --- Theme Management ---
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
        themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        });
    }
}

// --- Background Animation (Simple Particles) ---
function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse repulsion
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const angle = Math.atan2(dy, dx);
                    const force = (150 - distance) / 150;
                    const repulsion = force * 2;
                    this.x -= Math.cos(angle) * repulsion;
                    this.y -= Math.sin(angle) * repulsion;
                }
            }
        }

        draw() {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 30; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

// --- Project Cards Expansion ---
function initProjectCards() {
    const grid = document.querySelector('.project-grid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (!card) return;

        // Toggle expanded state
        const isExpanded = card.classList.contains('expanded');

        // Collapse all others first (optional preference)
        document.querySelectorAll('.project-card.expanded').forEach(c => {
            if (c !== card) c.classList.remove('expanded');
        });

        if (isExpanded) {
            card.classList.remove('expanded');
        } else {
            card.classList.add('expanded');
            // Scroll to card
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
}

// --- Scroll Blur Effect (Home Page) ---
function initScrollBlur() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return; // Only runs on pages with #projects

    window.addEventListener('scroll', () => {
        const rect = projectsSection.getBoundingClientRect();
        // Check if projects section is close to entering or fully in view
        // Using a threshold: when top of projects is near the middle/top of viewport
        if (rect.top <= window.innerHeight / 2) {
            document.body.classList.add('blur-bg');
        } else {
            document.body.classList.remove('blur-bg');
        }
    });
}

// --- Documentation Logic ---
function initDocumentation() {
    const docLinks = document.querySelectorAll('.doc-link');
    const contentArea = document.getElementById('doc-content-area');

    if (!docLinks.length || !contentArea) return;

    // Simple mock content router
    const docs = {
        'intro': `<h1>Introducción</h1><p>Bienvenido a la documentación de mi portafolio. Aquí encontrarás detalles sobre cómo fui construido y mis proyectos.</p>`,
        'api': `<h1>API Reference</h1><p>Aquí se detallarían los endpoints si tuviera backend...</p><pre>GET /api/projects</pre>`,
        'setup': `<h1>Configuración</h1><p>Instrucciones de despliegue y setup local.</p>`
    };

    docLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class
            docLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const key = link.getAttribute('data-doc');
            if (docs[key]) {
                contentArea.innerHTML = docs[key];
            } else {
                contentArea.innerHTML = '<h1>Documento no encontrado</h1>';
            }
        });
    });

    // Load first doc by default
    if (docLinks[0]) {
        docLinks[0].click();
    }
}
