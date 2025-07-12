// Navigation mobile
document.querySelector('.nav-toggle').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active nav links
window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Contact form avec envoi email
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Création du lien mailto
    const subject = `Demande de consultation - ${data.type_mission || 'Non spécifié'}`;
    const body = `Nom: ${data.nom}
Email: ${data.email}
Téléphone: ${data.telephone || 'Non renseigné'}
Entreprise: ${data.entreprise || 'Non renseignée'}
Type de mission: ${data.type_mission || 'Non spécifié'}

Message:
${data.message}`;
    
    const mailtoLink = `mailto:emmanuelgenesteix@yahoo.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    showSuccessMessage();
    this.reset();
});

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = '✅ Votre client mail va s\'ouvrir pour envoyer votre demande.';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Animation des statistiques
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + (target === 95 ? '%' : '+');
        }, 16);
    });
}

// Observer pour les animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats')) {
                animateStats();
            }
            entry.target.classList.add('animate');
        }
    });
});

document.querySelectorAll('.stats, .role-card, .cert-badge, .mission-card, .process-step').forEach(el => {
    observer.observe(el);
});

// Modal téléphone
function showPhoneModal() {
    if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Sur mobile, lancer l'appel direct
        window.location.href = 'tel:00352661780807'; // Affichage : 00352 661 78 08 07
    } else {
        // Sur desktop, afficher le modal comme avant
        document.getElementById('phoneModal').style.display = 'block';
    }
}

document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('phoneModal').style.display = 'none';
});

window.addEventListener('click', function(e) {
    const modal = document.getElementById('phoneModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Navbar transparente
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        navbar.style.backdropFilter = 'none';
    }
}); 

// --- AJOUT/MODIF : Switch langue EN/FR, FR par défaut, bouton EN si FR actif, FR si EN actif ---
function getCurrentLang() {
    return document.documentElement.lang || document.documentElement.getAttribute('data-lang') || 'fr';
}
function setLangSwitchButtons() {
    const lang = getCurrentLang();
    const nextLang = lang === 'fr' ? 'EN' : 'FR';
    if(document.getElementById('lang-switch-mobile'))
        document.getElementById('lang-switch-mobile').textContent = nextLang;
    if(document.getElementById('lang-switch-desktop'))
        document.getElementById('lang-switch-desktop').textContent = nextLang;
}
function switchLang() {
    const lang = getCurrentLang();
    const nextLang = lang === 'fr' ? 'en' : 'fr';
    if (typeof changeLanguageURL === 'function') {
        changeLanguageURL(nextLang);
    }
    document.documentElement.lang = nextLang;
    document.documentElement.setAttribute('data-lang', nextLang);
    setLangSwitchButtons();
    if (typeof translate === 'function') translate(nextLang);
}
// Forcer la langue par défaut à FR au chargement
if (!document.documentElement.lang && !document.documentElement.getAttribute('data-lang')) {
    document.documentElement.lang = 'fr';
    document.documentElement.setAttribute('data-lang', 'fr');
}
if(document.getElementById('lang-switch-mobile'))
    document.getElementById('lang-switch-mobile').addEventListener('click', switchLang);
if(document.getElementById('lang-switch-desktop'))
    document.getElementById('lang-switch-desktop').addEventListener('click', switchLang);
setLangSwitchButtons();
// --- FIN AJOUT/MODIF ---

// Animation du kanban au toucher avec zoom
document.addEventListener('DOMContentLoaded', function() {
    const kanbanSvg = document.querySelector('.kanban-svg');
    
    if (kanbanSvg) {
        // Zoom au toucher
        kanbanSvg.addEventListener('touchstart', function(e) {
            e.preventDefault();
            kanbanSvg.classList.add('zoom');
        });
        
        // Retour à la normale quand on relâche
        kanbanSvg.addEventListener('touchend', function(e) {
            e.preventDefault();
            kanbanSvg.classList.remove('zoom');
        });
        
        // Retour à la normale si on sort du toucher
        kanbanSvg.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            kanbanSvg.classList.remove('zoom');
        });
        
        // Pour desktop, zoom au clic simple
        kanbanSvg.addEventListener('click', function(e) {
            console.log('Click détecté sur kanban'); // Debug
            kanbanSvg.classList.add('zoom');
            setTimeout(() => {
                kanbanSvg.classList.remove('zoom');
            }, 300);
        });
    }
    
    // Zoom sur tous les composants interactifs (mobile uniquement)
    const interactiveElements = document.querySelectorAll('.expertise-card, .role-card, .mission-card, .stat-card, .cert-badge, .process-step, .btn, .btn-primary, .btn-secondary');
    
    interactiveElements.forEach(element => {
        // Zoom au toucher
        element.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('zoom');
        });
        
        // Retour à la normale quand on relâche
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.classList.remove('zoom');
        });
        
        // Retour à la normale si on sort du toucher
        element.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            this.classList.remove('zoom');
        });
    });
}); 