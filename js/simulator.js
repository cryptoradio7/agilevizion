/**
 * ============================================
 * SIMULATOR V2 - Progressive Compliance Diagnostic
 * Logique métier intelligente basée sur Questionnaire.xlsx
 * ============================================
 */

// ========== NORMS DATABASE ==========
const NORMS = {
    rgpd: {
        id: 'rgpd',
        name: 'RGPD',
        fullName: 'Règlement Général sur la Protection des Données',
        source: 'Règlement (UE) 2016/679',
        articles: 'Art. 2 (Champ matériel), Art. 3 (Champ territorial), Art. 4 (Définitions)',
        sanctions: "Jusqu'à 20M€ ou 4% du CA mondial",
        deadline: 'En vigueur depuis mai 2018',
        note: '~95% des entreprises avec activité UE sont concernées'
    },
    dora: {
        id: 'dora',
        name: 'DORA',
        fullName: 'Digital Operational Resilience Act',
        source: 'Règlement (UE) 2022/2554',
        articles: 'Art. 2 (Champ), Art. 3 (Définitions), Annexe I & II',
        sanctions: 'Sanctions superviseur + retrait agrément possible',
        deadline: '17 janvier 2025',
        note: 'UNIQUEMENT secteur financier RÉGULÉ + prestataires TIC critiques'
    },
    nis2: {
        id: 'nis2',
        name: 'NIS 2',
        fullName: 'Network and Information Security Directive',
        source: 'Directive (UE) 2022/2555',
        articles: 'Art. 2-3 (Champ), Annexe I (Essentiels), Annexe II (Importants)',
        sanctions: "EE: jusqu'à 10M€ ou 2% CA / EI: jusqu'à 7M€ ou 1,4% CA",
        deadline: '17 octobre 2024',
        note: '3 critères CUMULATIFS : Secteur + Taille + UE'
    },
    pcidss: {
        id: 'pcidss',
        name: 'PCI-DSS',
        fullName: 'Payment Card Industry Data Security Standard',
        source: 'PCI-DSS v4.0 (PCI SSC)',
        articles: 'Requirements 1-12, SAQ Eligibility',
        sanctions: 'Amendes réseaux (5K-100K$/mois) + perte traitement cartes',
        deadline: 'v4.0 obligatoire mars 2025',
        note: 'NON applicable si vous utilisez Stripe/PayPal sans voir les PAN'
    },
    hds: {
        id: 'hds',
        name: 'HDS',
        fullName: 'Hébergeur de Données de Santé',
        source: 'Code de la Santé Publique (France)',
        articles: 'Art. L.1111-8, Art. R.1111-8-8 à R.1111-11',
        sanctions: 'Sanctions pénales + amendes CNIL',
        deadline: 'En vigueur',
        note: 'UNIQUEMENT pour hébergement santé pour TIERS (clients)'
    },
    iso27001: {
        id: 'iso27001',
        name: 'ISO 27001',
        fullName: 'Système de Management de la Sécurité de l\'Information',
        source: 'ISO/IEC 27001:2022',
        articles: 'Clause 4.3 (Périmètre), Annexe A (114 contrôles)',
        sanctions: 'Perte de contrats et accès marchés',
        deadline: 'Volontaire (cycle certification 3 ans)',
        note: 'Souvent exigée contractuellement par grands comptes'
    },
    iso20000: {
        id: 'iso20000',
        name: 'ISO 20000',
        fullName: 'Système de Management des Services IT',
        source: 'ISO/IEC 20000-1:2018',
        articles: 'Clause 4.3 (Périmètre), Clause 8 (Exploitation)',
        sanctions: 'Différenciation commerciale',
        deadline: 'Volontaire',
        note: 'Pertinent pour MSP, SaaS, Cloud, infogérance'
    },
    soc2: {
        id: 'soc2',
        name: 'SOC 2',
        fullName: 'Service Organization Control 2',
        source: 'AICPA TSP Section 100',
        articles: 'Trust Services Criteria (5 critères)',
        sanctions: 'Perte clients US/internationaux',
        deadline: 'Volontaire (attestation annuelle)',
        note: 'Équivalent US de ISO 27001 - exigé par Fortune 500'
    },
    iso22301: {
        id: 'iso22301',
        name: 'ISO 22301',
        fullName: 'Système de Management de la Continuité d\'Activité',
        source: 'ISO 22301:2019',
        articles: 'Clause 8.2 (BIA), Clause 8.4 (Plans PCA/PRA)',
        sanctions: 'Risque interruption activité',
        deadline: 'Volontaire',
        note: 'Souvent requis par DORA/NIS 2 (obligations PCA)'
    },
    cmmc: {
        id: 'cmmc',
        name: 'CMMC',
        fullName: 'Cybersecurity Maturity Model Certification',
        source: 'CMMC 2.0 / 32 CFR Part 170',
        articles: 'NIST SP 800-171, DFARS 252.204-7012',
        sanctions: 'Exclusion des marchés DoD',
        deadline: 'Obligatoire pour contrats DoD',
        note: '3 niveaux : L1 (17 pratiques), L2 (110 NIST), L3 (audit gov)'
    }
};

// ========== SECTOR CLASSIFICATIONS ==========
const SECTORS = {
    // NIS 2 Annexe I - Hautement critiques
    NIS2_ANNEX1: ['energy', 'transport', 'banking', 'financial_infra', 'health', 'water', 'digital_infra', 'ict_b2b', 'public_admin', 'space'],
    // NIS 2 Annexe II - Critiques
    NIS2_ANNEX2: ['postal', 'waste', 'chemistry', 'food', 'manufacturing', 'digital_providers', 'research'],
    // DORA - Secteur financier régulé
    DORA_FINANCE: ['banking', 'financial_infra', 'insurance', 'investment', 'crypto', 'crowdfunding', 'rating'],
    // Secteurs sensibles pour ISO 27001 recommandé
    SENSITIVE: ['banking', 'financial_infra', 'insurance', 'investment', 'health', 'digital_infra', 'ict_b2b'],
    // Secteurs IT/Cloud pour SOC 2 recommandé
    IT_CLOUD: ['digital_infra', 'ict_b2b', 'digital_providers'],
    // Secteurs critiques pour ISO 22301
    CRITICAL: ['energy', 'banking', 'financial_infra', 'health', 'transport', 'water']
};

// ========== PROFILE DEFINITIONS ==========
const PROFILES = {
    startup: {
        icon: '🚀',
        title: 'Startup / TPE',
        subtitle: 'Moins de 50 employés',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    pme: {
        icon: '🏢',
        title: 'PME',
        subtitle: '50 à 249 employés',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    eti: {
        icon: '🏛️',
        title: 'ETI / Grande Entreprise',
        subtitle: '250+ employés ou CA > 50M€',
        gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'
    }
};

// ========== STATE ==========
let state = {
    phase: 1,
    answers: {},
    results: null,
    profile: null
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initPhase1();
    updatePhaseIndicator();
});

function initPhase1() {
    // Attach change listeners to all Phase 1 questions
    const phase1Questions = ['q1_location', 'q2_sector', 'q3_size', 'q4_personal_data', 'q5_regulated', 'q6_it_services'];
    phase1Questions.forEach(qId => {
        const el = document.getElementById(qId);
        if (el) {
            el.addEventListener('change', function() {
                state.answers[qId] = this.value;
                updateQuestionState(this);
                checkPhase1Complete();
            });
        }
    });
}

function updateQuestionState(select) {
    const group = select.closest('.question-group');
    if (select.value) {
        group.classList.add('answered');
        group.classList.remove('error');
        select.classList.add('valid');
        select.classList.remove('error');
    } else {
        group.classList.remove('answered');
        select.classList.remove('valid');
    }
}

function checkPhase1Complete() {
    const required = ['q1_location', 'q2_sector', 'q3_size', 'q4_personal_data', 'q5_regulated', 'q6_it_services'];
    const allAnswered = required.every(qId => state.answers[qId]);
    
    const btn = document.getElementById('btn-phase1');
    if (btn) {
        btn.disabled = !allAnswered;
    }
}

// ========== PHASE INDICATOR ==========
function updatePhaseIndicator() {
    document.querySelectorAll('.phase-step').forEach((step, idx) => {
        step.classList.remove('active', 'completed');
        if (idx + 1 === state.phase) {
            step.classList.add('active');
        } else if (idx + 1 < state.phase) {
            step.classList.add('completed');
        }
    });
}

// ========== PHASE 1: ANALYZE ==========
function analyzePhase1() {
    // Validate all required
    const required = ['q1_location', 'q2_sector', 'q3_size', 'q4_personal_data', 'q5_regulated', 'q6_it_services'];
    let valid = true;
    let firstError = null;
    
    required.forEach(qId => {
        const el = document.getElementById(qId);
        const group = el.closest('.question-group');
        if (!state.answers[qId]) {
            valid = false;
            group.classList.add('error');
            el.classList.add('error');
            if (!firstError) firstError = el;
        }
    });
    
    if (!valid) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // Determine profile
    determineProfile();
    
    // Show conditional questions based on answers
    showConditionalQuestions();
    
    // Calculate preliminary results
    calculateResults();
    
    // Show results
    displayResults();
    
    // Update phase
    state.phase = 2;
    updatePhaseIndicator();
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// ========== PROFILE DETERMINATION ==========
function determineProfile() {
    const size = state.answers.q3_size;
    
    if (size === 'small') {
        state.profile = 'startup';
    } else if (size === 'medium') {
        state.profile = 'pme';
    } else {
        state.profile = 'eti';
    }
    
    // Build profile tags
    const tags = [];
    
    // Location
    const loc = state.answers.q1_location;
    if (loc === 'eu') tags.push('🇪🇺 Siège UE');
    else if (loc === 'eu_clients') tags.push('🌍 Clients UE');
    else tags.push('🌐 Hors UE');
    
    // Sector
    const sector = state.answers.q2_sector;
    const sectorLabels = {
        'energy': '⚡ Énergie', 'transport': '🚆 Transport', 'banking': '🏦 Banque',
        'financial_infra': '📈 Infrastructures financières', 'health': '🏥 Santé',
        'insurance': '🛡️ Assurance', 'investment': '💼 Investissement',
        'digital_infra': '🌐 Infrastructure numérique', 'ict_b2b': '💻 Services IT (MSP)',
        'retail': '🛒 Commerce', 'services': '📊 Services', 'other': '🔹 Autre'
    };
    tags.push(sectorLabels[sector] || sector);
    
    // Regulated
    if (state.answers.q5_regulated === 'yes') {
        tags.push('📜 Entité régulée');
    }
    
    // IT Services
    if (state.answers.q6_it_services === 'yes') {
        tags.push('☁️ Prestataire IT/Cloud');
    }
    
    // Display profile card
    const profileCard = document.getElementById('profile-card');
    const profileDef = PROFILES[state.profile];
    
    profileCard.style.background = profileDef.gradient;
    document.getElementById('profile-icon').textContent = profileDef.icon;
    document.getElementById('profile-title').textContent = profileDef.title;
    document.getElementById('profile-subtitle').textContent = profileDef.subtitle;
    
    const tagsContainer = document.getElementById('profile-tags');
    tagsContainer.innerHTML = tags.map(t => `<span class="profile-tag">${t}</span>`).join('');
    
    profileCard.classList.add('visible');
}

// ========== CONDITIONAL QUESTIONS ==========
function showConditionalQuestions() {
    const a = state.answers;
    
    // Q7: TIC Provider for financial entities
    // Show if: IT services = Yes AND sector is NOT already DORA finance AND not regulated
    if (a.q6_it_services === 'yes' && !SECTORS.DORA_FINANCE.includes(a.q2_sector) && a.q5_regulated !== 'yes') {
        showConditional('cond-tic');
    }
    
    // Q8: Health data hosting
    // Show if: Sector = health OR IT services = yes
    if (a.q2_sector === 'health' || a.q6_it_services === 'yes') {
        showConditional('cond-hds');
    }
    
    // Q9: PCI-DSS (card data)
    // Show if: IT services = yes OR sector is retail/ecommerce
    if (a.q6_it_services === 'yes' || a.q2_sector === 'retail') {
        showConditional('cond-pci');
    }
    
    // Q10: Client certifications (ISO 27001 / SOC 2)
    // Show if: IT services = yes
    if (a.q6_it_services === 'yes') {
        showConditional('cond-certs');
    }
    
    // Q11: DoD contracts
    // Show if: Sector = defense OR manufacturing OR IT services with US
    if (a.q2_sector === 'manufacturing' || a.q6_it_services === 'yes') {
        showConditional('cond-dod');
    }
    
    // Q12: Critical activities (ISO 22301)
    // Show always as optional
    showConditional('cond-continuity');
    
    // Add listeners to conditional questions
    document.querySelectorAll('.conditional-group select').forEach(select => {
        select.addEventListener('change', function() {
            state.answers[this.id] = this.value;
            updateQuestionState(this);
            // Recalculate on change
            calculateResults();
            displayResults();
        });
    });
}

function showConditional(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('visible');
        // Show the Phase 2 card container
        document.getElementById('phase2-card').style.display = 'block';
    }
}

// ========== CALCULATION ENGINE ==========
function calculateResults() {
    const a = state.answers;
    const results = {};
    
    // Helper: is EU presence
    const isEU = (a.q1_location === 'eu' || a.q1_location === 'eu_clients');
    
    // Helper: is NIS2 sector
    const isNIS2Sector = [...SECTORS.NIS2_ANNEX1, ...SECTORS.NIS2_ANNEX2].includes(a.q2_sector);
    const isAnnex1 = SECTORS.NIS2_ANNEX1.includes(a.q2_sector);
    
    // Helper: size thresholds
    const isTooSmall = (a.q3_size === 'small'); // <50 AND <10M
    const isMedium = (a.q3_size === 'medium');  // 50-249 OR 10-50M
    const isLarge = (a.q3_size === 'large');    // 250+ OR >50M
    
    // ===== 1. RGPD =====
    // Formula: Données perso = Oui ET (Siège UE OU Clients UE)
    if (a.q4_personal_data === 'yes' && isEU) {
        results.rgpd = {
            status: 'obligatoire',
            why: 'Vous traitez des données personnelles de personnes dans l\'UE'
        };
    }
    
    // ===== 2. DORA =====
    // Formula: Agrément AMF/ACPR = Oui OU Prestataire TIC financier = Oui
    if (a.q5_regulated === 'yes' && SECTORS.DORA_FINANCE.includes(a.q2_sector)) {
        results.dora = {
            status: 'obligatoire',
            why: 'Vous êtes une entité financière régulée (agrément AMF/ACPR/CSSF)'
        };
    } else if (a.q7_tic_provider === 'yes') {
        results.dora = {
            status: 'obligatoire',
            why: 'Vous êtes prestataire TIC critique pour des entités financières régulées'
        };
    }
    
    // ===== 3. NIS 2 =====
    // Formula: Secteur Annexe I/II ET (≥50 sal OU ≥10M€) ET UE
    // 3 critères CUMULATIFS
    if (isNIS2Sector && !isTooSmall && isEU) {
        let entityType = isLarge ? 'Entité Essentielle' : 'Entité Importante';
        let annexType = isAnnex1 ? 'Annexe I (hautement critique)' : 'Annexe II (critique)';
        
        results.nis2 = {
            status: 'obligatoire',
            why: `3 critères cumulatifs remplis : Secteur ${annexType} + Taille ≥50 sal ou ≥10M€ (${entityType}) + Présence UE`
        };
    }
    
    // ===== 4. PCI-DSS =====
    // Formula: Stocke/traite PAN = Oui (pas si Stripe/PayPal)
    if (a.q9_pci && a.q9_pci.startsWith('yes_')) {
        const levels = {
            'yes_level1': 'Niveau 1 (>6M tx) - Audit QSA obligatoire',
            'yes_level2': 'Niveau 2 (1-6M tx) - SAQ + ASV',
            'yes_level3': 'Niveau 3 (20K-1M tx) - SAQ',
            'yes_level4': 'Niveau 4 (<20K tx) - SAQ simplifié'
        };
        results.pcidss = {
            status: 'obligatoire',
            why: `Vous stockez/traitez des données cartes (PAN) - ${levels[a.q9_pci] || ''}`
        };
    }
    
    // ===== 5. HDS =====
    // Formula: Héberge santé pour TIERS = Oui
    if (a.q8_hds === 'yes') {
        results.hds = {
            status: 'obligatoire',
            why: 'Vous hébergez des données de santé pour le compte de clients (tiers)'
        };
    }
    
    // ===== 6. ISO 27001 =====
    // Formula: Exigé clients = Oui → EXIGÉ / Secteur sensible → RECOMMANDÉ
    if (a.q10_certs === 'iso27001' || a.q10_certs === 'both') {
        results.iso27001 = {
            status: 'obligatoire',
            why: 'Certification exigée contractuellement par vos clients'
        };
    } else if (SECTORS.SENSITIVE.includes(a.q2_sector) || a.q6_it_services === 'yes' || results.dora) {
        results.iso27001 = {
            status: 'recommande',
            why: 'Fortement recommandée pour votre secteur (finance, santé, IT) et différenciation commerciale'
        };
    }
    
    // ===== 7. ISO 20000 =====
    // Formula: Services IT clients = Oui → RECOMMANDÉ
    if (a.q6_it_services === 'yes') {
        results.iso20000 = {
            status: 'recommande',
            why: 'Prestataire de services IT/Cloud - différenciation commerciale'
        };
    }
    
    // ===== 8. SOC 2 =====
    // Formula: Clients US exigent = Oui → EXIGÉ / SaaS-Cloud → RECOMMANDÉ
    if (a.q10_certs === 'soc2' || a.q10_certs === 'both') {
        results.soc2 = {
            status: 'obligatoire',
            why: 'Attestation exigée par vos clients (US/internationaux)'
        };
    } else if (SECTORS.IT_CLOUD.includes(a.q2_sector) || a.q6_it_services === 'yes') {
        results.soc2 = {
            status: 'recommande',
            why: 'SaaS/Cloud provider - souvent requis par clients internationaux et Fortune 500'
        };
    }
    
    // ===== 9. ISO 22301 =====
    // Formula: Activités critiques = Oui → RECO / Secteur critique → RECO
    if (a.q12_continuity === 'yes') {
        results.iso22301 = {
            status: 'recommande',
            why: 'Activités critiques identifiées nécessitant un PCA/PRA'
        };
    } else if (SECTORS.CRITICAL.includes(a.q2_sector) || results.dora || results.nis2) {
        results.iso22301 = {
            status: 'recommande',
            why: 'Secteur critique - DORA et NIS 2 incluent des obligations de continuité (PCA)'
        };
    }
    
    // ===== 10. CMMC =====
    // Formula: DoD = Oui → OBLIGATOIRE
    if (a.q11_dod === 'yes') {
        results.cmmc = {
            status: 'obligatoire',
            why: 'Travail avec le Département de la Défense US - CMMC requis pour les contrats'
        };
    }
    
    state.results = results;
    return results;
}

// ========== DISPLAY RESULTS ==========
function displayResults() {
    const results = state.results;
    
    // Separate mandatory vs recommended
    const mandatory = [];
    const recommended = [];
    
    Object.entries(results).forEach(([key, val]) => {
        const norm = { ...NORMS[key], ...val };
        if (val.status === 'obligatoire') {
            mandatory.push(norm);
        } else {
            recommended.push(norm);
        }
    });
    
    // Update counters
    document.getElementById('count-mandatory').textContent = mandatory.length;
    document.getElementById('count-recommended').textContent = recommended.length;
    
    // Build HTML
    let html = '';
    
    if (mandatory.length > 0) {
        html += `<div class="results-category">
            <h3 class="mandatory-title"><i class="fa-solid fa-circle-exclamation"></i> Réglementations qui s'appliquent à vous (${mandatory.length})</h3>`;
        mandatory.forEach(n => {
            html += buildNormCard(n, 'obligatoire');
        });
        html += `</div>`;
    }
    
    if (recommended.length > 0) {
        html += `<div class="results-category">
            <h3 class="recommended-title"><i class="fa-solid fa-lightbulb"></i> Recommandations (${recommended.length})</h3>`;
        recommended.forEach(n => {
            html += buildNormCard(n, 'recommande');
        });
        html += `</div>`;
    }
    
    if (mandatory.length === 0 && recommended.length === 0) {
        html = `<div class="no-results">
            <i class="fa-solid fa-circle-check"></i>
            <h4>Bonne nouvelle !</h4>
            <p>Selon vos réponses, aucune réglementation cyber spécifique ne semble s'appliquer à votre organisation.</p>
            <p style="margin-top:10px;color:var(--gray-500);">Cependant, les bonnes pratiques de sécurité (hygiène RGPD, principes ISO 27001) restent toujours recommandées.</p>
        </div>`;
    }
    
    document.getElementById('results-container').innerHTML = html;
    document.getElementById('results-section').classList.add('visible');
}

function buildNormCard(norm, status) {
    const badgeClass = status === 'obligatoire' ? 'obligatoire' : 'recommande';
    const badgeLabel = status === 'obligatoire' ? 'S\'APPLIQUE' : 'RECOMMANDÉ';
    const cardClass = status === 'obligatoire' ? 'mandatory' : 'recommended';
    
    return `<div class="norm-card ${cardClass}">
        <div class="norm-header">
            <div>
                <span class="norm-name">${norm.name}</span>
                <span class="norm-fullname"> — ${norm.fullName}</span>
            </div>
            <span class="norm-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="norm-why"><i class="fa-solid fa-check"></i> ${norm.why}</div>
        <div class="norm-details">
            <div class="norm-detail sanction"><i class="fa-solid fa-triangle-exclamation"></i> <strong>Sanctions :</strong> ${norm.sanctions}</div>
            <div class="norm-detail deadline"><i class="fa-solid fa-calendar"></i> <strong>Échéance :</strong> ${norm.deadline}</div>
            <div class="norm-detail"><i class="fa-solid fa-book"></i> <strong>Réf. :</strong> ${norm.source}</div>
        </div>
        ${norm.note ? `<div class="norm-note"><i class="fa-solid fa-info-circle"></i> ${norm.note}</div>` : ''}
    </div>`;
}

// ========== PDF GENERATION ==========
async function generatePDF() {
    const company = document.getElementById('input-company').value.trim();
    const email = document.getElementById('input-email').value.trim();
    
    if (!company) {
        alert('Veuillez entrer le nom de votre entreprise');
        document.getElementById('input-company').focus();
        return;
    }
    if (!email || !email.includes('@')) {
        alert('Veuillez entrer un email valide');
        document.getElementById('input-email').focus();
        return;
    }
    
    const btn = document.getElementById('btn-pdf');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Génération...';
    
    document.getElementById('msg-success').classList.remove('visible');
    document.getElementById('msg-error').classList.remove('visible');
    
    try {
        // Build PDF content
        const mandatory = [];
        const recommended = [];
        
        Object.entries(state.results).forEach(([key, val]) => {
            const norm = { ...NORMS[key], ...val };
            if (val.status === 'obligatoire') mandatory.push(norm);
            else recommended.push(norm);
        });
        
        // Profile info
        const profileDef = PROFILES[state.profile];
        
        let pdfHtml = `
            <div class="pdf-profile">
                <strong>${profileDef.icon} Profil :</strong> ${profileDef.title} (${profileDef.subtitle})<br>
                <strong>📊 Résultat :</strong> ${mandatory.length} réglementation(s) applicable(s), ${recommended.length} recommandation(s)
            </div>
        `;
        
        if (mandatory.length > 0) {
            pdfHtml += `<h3 style="color:#c53030;margin:20px 0 10px;border-bottom:2px solid #c53030;padding-bottom:5px;">🔴 RÉGLEMENTATIONS APPLICABLES (${mandatory.length})</h3>`;
            mandatory.forEach(n => {
                pdfHtml += `<div class="pdf-norm mandatory">
                    <h4 style="color:#c53030;margin:0 0 8px;">${n.name} — ${n.fullName}</h4>
                    <p><strong>Source :</strong> ${n.source}</p>
                    <p style="color:#27ae60;"><strong>✓ Pourquoi :</strong> ${n.why}</p>
                    <p><strong>📅 Échéance :</strong> ${n.deadline}</p>
                    <p style="color:#c53030;"><strong>⚠ Sanctions :</strong> ${n.sanctions}</p>
                </div>`;
            });
        }
        
        if (recommended.length > 0) {
            pdfHtml += `<h3 style="color:#2980b9;margin:20px 0 10px;border-bottom:2px solid #2980b9;padding-bottom:5px;">🔵 RECOMMANDATIONS (${recommended.length})</h3>`;
            recommended.forEach(n => {
                pdfHtml += `<div class="pdf-norm recommended">
                    <h4 style="color:#2980b9;margin:0 0 8px;">${n.name} — ${n.fullName}</h4>
                    <p><strong>Source :</strong> ${n.source}</p>
                    <p style="color:#d69e2e;"><strong>💡 Pourquoi :</strong> ${n.why}</p>
                    <p><strong>📅 :</strong> ${n.deadline}</p>
                </div>`;
            });
        }
        
        if (mandatory.length === 0 && recommended.length === 0) {
            pdfHtml = `<p style="text-align:center;padding:30px;color:#27ae60;"><strong>✓ Aucune réglementation spécifique identifiée.</strong></p>`;
        }
        
        // Set PDF content
        document.getElementById('pdf-company').textContent = company;
        document.getElementById('pdf-email').textContent = email;
        document.getElementById('pdf-date').textContent = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        document.getElementById('pdf-results').innerHTML = pdfHtml;
        
        const pdfEl = document.getElementById('pdf-template');
        pdfEl.style.display = 'block';
        
        await html2pdf().set({
            margin: 10,
            filename: `AgileVizion_Diagnostic_${company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(pdfEl).save();
        
        pdfEl.style.display = 'none';
        
        document.getElementById('msg-success').classList.add('visible');
        
    } catch (error) {
        console.error('PDF error:', error);
        document.getElementById('msg-error').classList.add('visible');
    }
    
    btn.innerHTML = originalHtml;
    btn.disabled = false;
}

// ========== CALENDLY ==========
function openCalendly() {
    if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({ url: 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion' });
    }
    return false;
}

