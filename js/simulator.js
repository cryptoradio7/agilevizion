/* ============================================
   AgileVizion 2 — Simulateur de conformité
   Périmètre : RGPD, DORA, NIS 2, ISO 27001, ISO 22301
   ============================================ */

// ============================================
// DATA: Normes analysées (5 uniquement)
// ============================================

var NORMS = {

    rgpd: {
        key: 'rgpd',
        name: 'RGPD',
        fullName: 'Règlement Général sur la Protection des Données',
        source: 'Règlement (UE) 2016/679',
        sanctions: "Jusqu'à 20M€ ou 4% du CA annuel mondial (le montant le plus élevé)",
        deadline: 'En vigueur depuis mai 2018',
        isRegulation: true,
        obligations: [
            "Registre des traitements (Art. 30)",
            "Analyse d'impact (DPIA) pour les traitements à risque (Art. 35)",
            "Désignation d'un DPO si traitement à grande échelle (Art. 37)",
            "Notification de violation à l'autorité sous 72h (Art. 33)",
            "Droits des personnes : accès, rectification, effacement, portabilité"
        ]
    },

    dora: {
        key: 'dora',
        name: 'DORA',
        fullName: 'Digital Operational Resilience Act',
        source: 'Règlement (UE) 2022/2554',
        sanctions: "Astreintes périodiques + retrait d'agrément possible par l'autorité de supervision",
        deadline: 'Applicable depuis le 17 janvier 2025',
        isRegulation: true,
        obligations: [
            "Cadre de gestion des risques TIC (Art. 6-16)",
            "Classification et notification des incidents TIC majeurs (Art. 17-23)",
            "Tests de résilience opérationnelle numérique (Art. 24-27)",
            "Gestion des risques liés aux prestataires TIC tiers (Art. 28-44)",
            "Dispositifs de partage d'informations (Art. 45)"
        ]
    },

    nis2: {
        key: 'nis2',
        name: 'NIS 2',
        fullName: 'Network and Information Security Directive',
        source: 'Directive (UE) 2022/2555',
        sanctions: "Entités Essentielles : jusqu'à 10M€ ou 2% CA | Entités Importantes : jusqu'à 7M€ ou 1,4% CA",
        deadline: 'Transposition nationale depuis octobre 2024',
        isRegulation: true,
        obligations: [
            "10 mesures de sécurité obligatoires (Art. 21) : politiques, analyse de risques, continuité, supply chain",
            "Notification d'incidents : alerte précoce 24h, notification complète 72h (Art. 23)",
            "Responsabilité personnelle des dirigeants : formation obligatoire, sanctions nominatives (Art. 20)",
            "Sécurité de la chaîne d'approvisionnement et des prestataires",
            "MFA, chiffrement, contrôle d'accès, gestion des vulnérabilités"
        ]
    },

    iso27001: {
        key: 'iso27001',
        name: 'ISO 27001',
        fullName: "Système de Management de la Sécurité de l'Information",
        source: 'ISO/IEC 27001:2022',
        sanctions: "Perte de contrats, exclusion des appels d'offres, perte de confiance clients",
        deadline: 'Certification volontaire (cycle 3 ans)',
        isRegulation: false,
        obligations: [
            "Périmètre du SMSI et contexte de l'organisation (clauses 4-5)",
            "Appréciation et traitement des risques (clause 6.1.2 / ISO 27005)",
            "Déclaration d'Applicabilité — 93 contrôles Annexe A (ISO 27002)",
            "Audit interne et revue de direction (clauses 9.1-9.3)",
            "Amélioration continue et certification triennale"
        ]
    },

    iso22301: {
        key: 'iso22301',
        name: 'ISO 22301',
        fullName: "Système de Management de la Continuité d'Activité",
        source: 'ISO 22301:2019',
        sanctions: "Risque d'interruption prolongée, pertes financières, atteinte à la réputation",
        deadline: 'Certification volontaire',
        isRegulation: false,
        obligations: [
            "BIA (Business Impact Analysis) : MTPD, RTO, RPO par activité critique (ISO 22317)",
            "BCP (Business Continuity Plan) : 9 éléments — rôles, activation, procédures dégradées, repli",
            "DRP (Disaster Recovery Plan) : basculement, restauration, retour site principal (ISO 27031)",
            "Tests réguliers : tabletop, test technique DRP, mesure RTO/RPO réels",
            "Revue de direction et amélioration continue"
        ]
    }

};

// Normes analysées — pour affichage dans le rapport
var SCOPE_NORMS = ['RGPD', 'DORA', 'NIS 2', 'ISO 27001', 'ISO 22301'];

var SECTORS = {
    NIS2_ANNEX1: ['energy', 'transport', 'banking', 'financial_infra', 'health', 'water', 'digital_infra', 'ict_b2b', 'public_admin', 'space'],
    NIS2_ANNEX2: ['postal', 'waste', 'chemistry', 'food', 'manufacturing', 'digital_providers', 'research'],
    NIS2_EXTRATERRITORIAL: ['digital_infra', 'ict_b2b', 'digital_providers'],
    DORA_FINANCE: ['banking', 'financial_infra', 'insurance', 'investment', 'crypto', 'crowdfunding', 'rating'],
    CRITICAL: ['energy', 'banking', 'financial_infra', 'health', 'transport', 'water']
};

var PROFILES = {
    startup: { icon: '🚀', title: 'Petite structure', subtitle: '<50 employés, CA <10M€, bilan <10M€' },
    pme: { icon: '🏢', title: 'Moyenne entreprise', subtitle: '50-249 employés ou CA 10-50M€' },
    eti: { icon: '🏛️', title: 'Grande entreprise', subtitle: '250+ employés ou CA >50M€' }
};

// ============================================
// SÉCURITÉ — Échappement HTML
// ============================================

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// STATE
// ============================================

var state = {
    answers: {},
    results: null,
    profile: null
};

// ============================================
// EVENT HANDLERS
// ============================================

function handleChange(el) {
    state.answers[el.id] = el.value;
    updateQuestionState(el);
    checkConditionalQuestions();
    checkContinuityNote();
    checkPhase1Complete();
    if (state.results !== null) {
        state.results = null;
        var resultsSection = document.getElementById('results-section');
        var profileCard = document.getElementById('profile-card');
        if (resultsSection) resultsSection.classList.remove('visible');
        if (profileCard) profileCard.classList.remove('visible');
    }
}

function checkPdfFormValid() {
    var companyEl = document.getElementById('input-company');
    var emailEl = document.getElementById('input-email');
    var btnPdf = document.getElementById('btn-pdf');
    if (!companyEl || !emailEl || !btnPdf) return;
    var company = companyEl.value.trim();
    var email = emailEl.value.trim();
    var isValid = company.length > 0 && email.length > 0 && email.indexOf('@') !== -1;
    btnPdf.disabled = !isValid;
}

function updateQuestionState(select) {
    var group = select.closest('.question-group');
    if (!group) return;
    if (select.value) {
        group.classList.add('answered');
        select.classList.add('valid');
    } else {
        group.classList.remove('answered');
        select.classList.remove('valid');
    }
}

function checkPhase1Complete() {
    var required = ['q1_location', 'q2_sector', 'q3_size', 'q4_personal_data', 'q5_regulated', 'q6_it_services', 'q11_continuity'];
    var complete = required.every(function(qId) {
        return state.answers[qId] && state.answers[qId] !== '';
    });
    var btn = document.getElementById('btn-analyze');
    if (btn) btn.disabled = !complete;
}

// ============================================
// QUESTIONS CONDITIONNELLES
// ============================================

function checkConditionalQuestions() {
    var a = state.answers;
    hideAllConditionals();

    // Q7 : Prestataire TIC (si services IT + PAS déjà finance régulée)
    if (a.q6_it_services === 'yes' && SECTORS.DORA_FINANCE.indexOf(a.q2_sector) === -1 && a.q5_regulated !== 'yes') {
        showConditional('cond-tic');
    }

    // Q8 : NIS2 petites entités essentielles (si small + secteur NIS2)
    var isNIS2Sector = SECTORS.NIS2_ANNEX1.concat(SECTORS.NIS2_ANNEX2).indexOf(a.q2_sector) !== -1;
    if (a.q3_size === 'small' && isNIS2Sector) {
        showConditional('cond-nis2-small');
    }
}

function checkContinuityNote() {
    var a = state.answers;
    var noteEl = document.getElementById('note-continuity');
    if (!noteEl) return;

    var isEU = (a.q1_location === 'eu');
    var hasEUClients = (a.q1_location === 'eu_clients');
    var isNIS2Sector = SECTORS.NIS2_ANNEX1.concat(SECTORS.NIS2_ANNEX2).indexOf(a.q2_sector) !== -1;
    var isNIS2Extraterritorial = SECTORS.NIS2_EXTRATERRITORIAL.indexOf(a.q2_sector) !== -1;
    var isTooSmall = (a.q3_size === 'small');
    var isDORAFinance = SECTORS.DORA_FINANCE.indexOf(a.q2_sector) !== -1;

    var willHaveNIS2 = isNIS2Sector && !isTooSmall && (isEU || (hasEUClients && isNIS2Extraterritorial));
    var willHaveDORA = isEU && ((a.q5_regulated === 'yes' && isDORAFinance) || (a.q7_tic_provider === 'yes'));

    if (a.q11_continuity === 'no' && (willHaveNIS2 || willHaveDORA)) {
        noteEl.style.display = 'flex';
    } else {
        noteEl.style.display = 'none';
    }
}

function hideAllConditionals() {
    ['cond-tic', 'cond-nis2-small'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    });
}

function showConditional(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('visible');
}

// ============================================
// RÉINITIALISATION
// ============================================

function resetSimulator() {
    state.answers = {};
    state.results = null;
    state.profile = null;

    document.querySelectorAll('.question-select').forEach(function(s) {
        s.value = '';
        s.classList.remove('valid');
    });

    document.querySelectorAll('.question-group').forEach(function(g) {
        g.classList.remove('answered');
    });

    hideAllConditionals();

    var noteEl = document.getElementById('note-continuity');
    if (noteEl) noteEl.style.display = 'none';

    var resultsSection = document.getElementById('results-section');
    var profileCard = document.getElementById('profile-card');
    var btnAnalyze = document.getElementById('btn-analyze');
    var inputCompany = document.getElementById('input-company');
    var inputEmail = document.getElementById('input-email');
    var msgSuccess = document.getElementById('msg-success');
    var msgError = document.getElementById('msg-error');
    var btnPdf = document.getElementById('btn-pdf');

    if (resultsSection) resultsSection.classList.remove('visible');
    if (profileCard) profileCard.classList.remove('visible');
    if (btnAnalyze) btnAnalyze.disabled = true;
    if (inputCompany) inputCompany.value = '';
    if (inputEmail) inputEmail.value = '';
    if (msgSuccess) msgSuccess.classList.remove('visible');
    if (msgError) msgError.classList.remove('visible');
    if (btnPdf) btnPdf.disabled = true;

    window.scrollTo({ top: document.getElementById('simulator').offsetTop - 80, behavior: 'smooth' });
}

// ============================================
// ANALYSE DU PROFIL
// ============================================

function analyzeProfile() {
    var a = state.answers;
    state.profile = a.q3_size === 'small' ? 'startup' : a.q3_size === 'medium' ? 'pme' : 'eti';
    displayProfile();
    calculateResults();
    displayResults();
    setTimeout(function() {
        var resultsSection = document.getElementById('results-section');
        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function displayProfile() {
    var p = PROFILES[state.profile];
    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
    var profileTitle = t('simulator.profiles.' + state.profile + '.title');
    var profileSubtitle = t('simulator.profiles.' + state.profile + '.subtitle');
    var a = state.answers;

    var iconEl = document.getElementById('profile-icon');
    var titleEl = document.getElementById('profile-title');
    var subtitleEl = document.getElementById('profile-subtitle');
    var tagsEl = document.getElementById('profile-tags');
    var profileCard = document.getElementById('profile-card');

    if (iconEl) iconEl.textContent = p.icon;
    if (titleEl) titleEl.textContent = profileTitle !== ('simulator.profiles.' + state.profile + '.title') ? profileTitle : p.title;
    if (subtitleEl) subtitleEl.innerHTML = profileSubtitle !== ('simulator.profiles.' + state.profile + '.subtitle') ? profileSubtitle : p.subtitle;

    var tags = [];
    if (a.q1_location === 'eu') tags.push('🇪🇺 Union Européenne');
    else if (a.q1_location === 'eu_clients') tags.push('🌍 Clients UE');
    if (a.q5_regulated === 'yes') tags.push('📜 Entité régulée');
    if (a.q6_it_services === 'yes') tags.push('☁️ Services IT/Cloud');

    if (tagsEl) {
        tagsEl.innerHTML = tags.map(function(tag) {
            return '<span class="profile-tag">' + tag + '</span>';
        }).join('');
    }

    if (profileCard) profileCard.classList.add('visible');
}

// ============================================
// CALCUL DES RÉSULTATS
// ============================================

function calculateResults() {
    var a = state.answers;
    var results = {};

    var isEU = (a.q1_location === 'eu');
    var hasEUClients = (a.q1_location === 'eu_clients');
    var isNIS2Sector = SECTORS.NIS2_ANNEX1.concat(SECTORS.NIS2_ANNEX2).indexOf(a.q2_sector) !== -1;
    var isAnnex1 = SECTORS.NIS2_ANNEX1.indexOf(a.q2_sector) !== -1;
    var isNIS2Extraterritorial = SECTORS.NIS2_EXTRATERRITORIAL.indexOf(a.q2_sector) !== -1;
    var isTooSmall = (a.q3_size === 'small');
    var isLarge = (a.q3_size === 'large');
    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };

    // RGPD — obligatoire si données perso + UE/clients UE
    if (a.q4_personal_data === 'yes' && (isEU || hasEUClients)) {
        results.rgpd = {
            status: 'obligatoire',
            why: t('simulator.why.rgpd'),
            whyKey: 'rgpd'
        };
    }

    // DORA — obligatoire si UE + (finance régulée OU prestataire TIC finance)
    if (isEU) {
        if (a.q5_regulated === 'yes' && SECTORS.DORA_FINANCE.indexOf(a.q2_sector) !== -1) {
            results.dora = {
                status: 'obligatoire',
                why: t('simulator.why.dora_regulated'),
                whyKey: 'dora_regulated'
            };
        } else if (a.q7_tic_provider === 'yes') {
            results.dora = {
                status: 'obligatoire',
                why: t('simulator.why.dora_tic'),
                whyKey: 'dora_tic'
            };
        }
    }

    // NIS 2 — obligatoire si secteur NIS2 + taille suffisante + UE/extraterritorial
    // DORA est lex specialis de NIS 2 (Art. 4§2) : les entités soumises à DORA sont exemptées de NIS 2
    // Exception Art. 2§2 : certaines entités essentielles sont NIS2 quelle que soit leur taille
    var isNIS2EssentialSmall = isTooSmall && isNIS2Sector && a.q8_nis2_essential === 'yes';
    if ((isNIS2Sector && !isTooSmall || isNIS2EssentialSmall) && !results.dora) {
        if (isEU) {
            var whyKey;
            if (isNIS2EssentialSmall) {
                whyKey = 'nis2_essential_small';
            } else {
                whyKey = 'nis2_eu_' + (isAnnex1 ? 'annex1' : 'annex2') + '_' + (isLarge ? 'ee' : 'ei');
            }
            results.nis2 = {
                status: 'obligatoire',
                why: t('simulator.why.' + whyKey),
                whyKey: whyKey
            };
        } else if (hasEUClients && isNIS2Extraterritorial) {
            results.nis2 = {
                status: 'obligatoire',
                why: t('simulator.why.nis2_extraterritorial'),
                whyKey: 'nis2_extraterritorial',
                extraterritorial: true
            };
        }
    }

    // ISO 27001 — toujours recommandé (sauf petites structures)
    if (!isTooSmall) {
        results.iso27001 = {
            status: 'recommande',
            why: t('simulator.why.iso27001_recommended'),
            whyKey: 'iso27001_recommended'
        };
    }

    // ISO 22301 — fortement recommandé si DORA ou NIS 2 (continuité exigée par ces normes),
    // recommandé si activités critiques ou secteur critique, absent sinon
    if (results.dora || results.nis2) {
        var iso22301WhyKey = '';
        if (results.dora && results.nis2) {
            iso22301WhyKey = 'iso22301_dora_nis2';
        } else if (results.dora) {
            iso22301WhyKey = 'iso22301_dora';
        } else {
            iso22301WhyKey = 'iso22301_nis2';
        }
        results.iso22301 = {
            status: 'recommande',
            why: t('simulator.why.' + iso22301WhyKey),
            whyKey: iso22301WhyKey
        };
    } else if (a.q11_continuity === 'yes' || SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1) {
        var recWhyKey = SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1 ? 'iso22301_critical_sector' : 'iso22301_critical_activity';
        results.iso22301 = {
            status: 'recommande',
            why: t('simulator.why.' + recWhyKey),
            whyKey: recWhyKey
        };
    }

    state.results = results;
}

// ============================================
// AFFICHAGE DES RÉSULTATS
// ============================================

function displayResults() {
    var mandatory = [], recommended = [];

    Object.keys(state.results).forEach(function(k) {
        var v = state.results[k];
        var norm = {};
        for (var key in NORMS[k]) { norm[key] = NORMS[k][key]; }
        for (var key in v) { norm[key] = v[key]; }
        norm.key = k;
        if (v.status === 'obligatoire') mandatory.push(norm);
        else recommended.push(norm);
    });

    var countMandatory = document.getElementById('count-mandatory');
    var countRecommended = document.getElementById('count-recommended');
    if (countMandatory) countMandatory.textContent = mandatory.length;
    if (countRecommended) countRecommended.textContent = recommended.length;

    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
    var html = '';

    // Bandeau périmètre
    html += '<div class="scope-banner"><i class="fa-solid fa-microscope" aria-hidden="true"></i> ';
    html += '<span>' + t('simulator.scope_text') + '</span></div>';

    if (mandatory.length > 0) {
        html += '<div class="results-category">';
        html += '<h3 class="mandatory-title"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ' + t('simulator.mandatory_title') + ' (' + mandatory.length + ')</h3>';
        mandatory.forEach(function(n) { html += buildNormCard(n, 'obligatoire'); });
        html += '</div>';
    }

    if (recommended.length > 0) {
        html += '<div class="results-category">';
        html += '<h3 class="recommended-title"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i> ' + t('simulator.recommended_title') + ' (' + recommended.length + ')</h3>';
        recommended.forEach(function(n) { html += buildNormCard(n, 'recommande'); });
        html += '</div>';
    }

    if (!mandatory.length && !recommended.length) {
        var noResultsTitle = t('simulator.no_results_title');
        var noResultsText = t('simulator.no_results_text');
        html = '<div class="no-results"><i class="fa-solid fa-clipboard-question" aria-hidden="true"></i><h4>' + noResultsTitle + '</h4><p>' + noResultsText + '</p></div>';
    }

    var container = document.getElementById('results-container');
    if (container) container.innerHTML = html;

    var resultsSection = document.getElementById('results-section');
    if (resultsSection) resultsSection.classList.add('visible');
}

function getNormTranslation(norm, property) {
    if (!window.I18n || !window.I18n.t) return String(norm[property] || '');
    var key = 'simulator.norms.' + norm.key + '.' + property;
    var translated = window.I18n.t(key);
    var result = (translated === key) ? norm[property] : translated;
    return String(result || '');
}

function getWhyTranslation(norm) {
    if (!window.I18n || !window.I18n.t) return String(norm.why || '');
    if (norm.whyKey) {
        var key = 'simulator.why.' + norm.whyKey;
        var translated = window.I18n.t(key);
        var result = (translated === key) ? norm.why : translated;
        return String(result || '');
    }
    return String(norm.why || '');
}

function buildNormCard(norm, status) {
    var isMandatory = status === 'obligatoire';
    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
    var sanctionLabel = String(norm.isRegulation ? t('simulator.sanctions') : t('simulator.risks'));
    var sanctionClass = norm.isRegulation ? 'sanction' : 'risk';

    var fullName = getNormTranslation(norm, 'fullName');
    var why = getWhyTranslation(norm);
    var sanctions = getNormTranslation(norm, 'sanctions');
    var deadline = getNormTranslation(norm, 'deadline');

    var noteHtml = '';
    if (norm.key === 'nis2' && norm.extraterritorial) {
        var noteText = String(t('simulator.nis2_extraterritorial_note'));
        noteHtml = '<div class="norm-note warning"><i class="fa-solid fa-globe" aria-hidden="true"></i> ' + noteText + '</div>';
    }

    var appliesText = String(isMandatory ? t('simulator.applies') : t('simulator.recommended_badge'));
    var deadlineText = String(t('simulator.deadline'));

    // Obligations principales
    var obligationsHtml = '';
    if (norm.obligations && norm.obligations.length > 0) {
        obligationsHtml = '<div class="norm-obligations"><strong>' + t('simulator.obligations_label') + '</strong><ul>';
        norm.obligations.forEach(function(o) {
            obligationsHtml += '<li>' + String(o) + '</li>';
        });
        obligationsHtml += '</ul></div>';
    }

    return '<div class="norm-card ' + (isMandatory ? 'mandatory' : 'recommended') + '">' +
        '<div class="norm-header">' +
        '<div><span class="norm-name">' + String(norm.name || '') + '</span>' +
        '<span class="norm-fullname"> — ' + fullName + '</span></div>' +
        '<span class="norm-badge ' + status + '">' + appliesText + '</span>' +
        '</div>' +
        '<div class="norm-why">' + why + '</div>' +
        obligationsHtml +
        '<div class="norm-details">' +
        '<div class="norm-detail ' + sanctionClass + '"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> <strong>' + sanctionLabel + '</strong> ' + sanctions + '</div>' +
        '<div class="norm-detail deadline"><i class="fa-solid fa-calendar" aria-hidden="true"></i> <strong>' + deadlineText + '</strong> ' + deadline + '</div>' +
        '<div class="norm-detail"><i class="fa-solid fa-book" aria-hidden="true"></i> <strong>' + String(t('simulator.reference')) + '</strong> ' + String(norm.source || '') + '</div>' +
        '</div>' +
        noteHtml +
        '</div>';
}

// ============================================
// GÉNÉRATION PDF
// ============================================

function generatePDF() {
    var companyEl = document.getElementById('input-company');
    var emailEl = document.getElementById('input-email');
    if (!companyEl || !emailEl) return;

    var company = companyEl.value.trim();
    var email = emailEl.value.trim();
    if (!company || !email || email.indexOf('@') === -1) return;

    var btn = document.getElementById('btn-pdf');
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Génération...'; }

    var msgSuccess = document.getElementById('msg-success');
    var msgError = document.getElementById('msg-error');
    if (msgSuccess) msgSuccess.classList.remove('visible');
    if (msgError) msgError.classList.remove('visible');

    try {
        var mandatory = [], recommended = [];
        Object.keys(state.results).forEach(function(k) {
            var v = state.results[k];
            var norm = {};
            for (var key in NORMS[k]) { norm[key] = NORMS[k][key]; }
            for (var key in v) { norm[key] = v[key]; }
            if (v.status === 'obligatoire') mandatory.push(norm);
            else recommended.push(norm);
        });

        var p = PROFILES[state.profile];
        var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
        var profileTitle = t('simulator.profiles.' + state.profile + '.title');
        var currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        var a = state.answers;
        var sectorEl = document.getElementById('q2_sector');
        var sectorLabel = sectorEl ? sectorEl.options[sectorEl.selectedIndex].text : a.q2_sector;
        var sizeEl = document.getElementById('q3_size');
        var sizeLabel = sizeEl ? sizeEl.options[sizeEl.selectedIndex].text : a.q3_size;
        var locationEl = document.getElementById('q1_location');
        var locationLabel = locationEl ? locationEl.options[locationEl.selectedIndex].text : a.q1_location;

        var printHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Diagnostic Compliance — ' + escapeHtml(company) + '</title><style>';
        printHtml += '@media print { @page { margin: 15mm; } body { margin: 0; } .page-break { page-break-before: always; } }';
        printHtml += 'body { font-family: "Segoe UI", Tahoma, sans-serif; color: #1a202c; background: white; padding: 20px; max-width: 210mm; margin: 0 auto; font-size: 10pt; }';
        printHtml += 'h1 { color: #1B2A4A; font-size: 1.8em; margin-bottom: 5px; }';
        printHtml += 'h2 { color: #1B2A4A; font-size: 1.3em; margin: 25px 0 10px; border-bottom: 2px solid #1B2A4A; padding-bottom: 5px; }';
        printHtml += 'h3 { color: #059669; font-size: 1.1em; margin: 20px 0 8px; }';
        printHtml += '.header { border-bottom: 3px solid #D4A843; padding-bottom: 15px; margin-bottom: 20px; }';
        printHtml += '.header-sub { color: #D4A843; font-size: 1.1em; margin: 5px 0 15px; }';
        printHtml += '.scope-box { background: #f0f4ff; padding: 12px 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #1B2A4A; font-size: 0.9em; }';
        printHtml += '.profile-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }';
        printHtml += '.profile-box table { width: 100%; border-collapse: collapse; }';
        printHtml += '.profile-box td { padding: 4px 10px; } .profile-box td:first-child { font-weight: bold; width: 200px; color: #1B2A4A; }';
        printHtml += '.summary-box { display: flex; gap: 20px; margin-bottom: 20px; }';
        printHtml += '.summary-item { flex: 1; padding: 15px; border-radius: 8px; text-align: center; }';
        printHtml += '.summary-mandatory { background: #ecfdf5; border: 2px solid #059669; }';
        printHtml += '.summary-recommended { background: #eef2ff; border: 2px solid #4F46E5; }';
        printHtml += '.summary-number { font-size: 2em; font-weight: bold; }';
        printHtml += '.summary-mandatory .summary-number { color: #059669; }';
        printHtml += '.summary-recommended .summary-number { color: #4F46E5; }';
        printHtml += '.norm-card { padding: 15px; margin: 12px 0; border-left: 4px solid; background: #f8f9fa; border-radius: 0 8px 8px 0; }';
        printHtml += '.norm-mandatory { border-left-color: #059669; }';
        printHtml += '.norm-recommended { border-left-color: #4F46E5; }';
        printHtml += '.norm-title { font-size: 1.1em; font-weight: bold; color: #1B2A4A; margin-bottom: 5px; }';
        printHtml += '.norm-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold; text-transform: uppercase; margin-left: 8px; }';
        printHtml += '.badge-mandatory { background: #059669; color: white; }';
        printHtml += '.badge-recommended { background: #4F46E5; color: white; }';
        printHtml += '.norm-why { margin: 8px 0; font-style: italic; color: #4a5568; }';
        printHtml += '.norm-obligations { margin: 10px 0; } .norm-obligations ul { margin: 5px 0; padding-left: 20px; } .norm-obligations li { margin: 3px 0; font-size: 0.9em; }';
        printHtml += '.norm-sanctions { color: #c53030; margin: 8px 0; } .norm-deadline { color: #4a5568; margin: 4px 0; } .norm-source { color: #718096; font-size: 0.85em; }';
        printHtml += '.cta-section { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #D4A843; }';
        printHtml += '.footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2e8f0; text-align: center; color: #1B2A4A; font-size: 0.85em; }';
        printHtml += '.disclaimer { font-size: 0.8em; color: #888; font-style: italic; margin-top: 8px; }';
        printHtml += '</style></head><body>';

        // EN-TÊTE
        printHtml += '<div class="header">';
        printHtml += '<h1>Diagnostic Compliance</h1>';
        printHtml += '<div class="header-sub">AgileVizion — GRC Cybersecurity &amp; Agentic AI Automation</div>';
        printHtml += '<table style="font-size:0.9em;"><tr><td><strong>Entreprise :</strong> ' + escapeHtml(company) + '</td>';
        printHtml += '<td><strong>Date :</strong> ' + currentDate + '</td></tr></table>';
        printHtml += '</div>';

        // PÉRIMÈTRE D'ANALYSE
        printHtml += '<div class="scope-box">';
        printHtml += '<strong>Périmètre d\'analyse :</strong> ce diagnostic couvre exclusivement les normes suivantes — <strong>' + SCOPE_NORMS.join(', ') + '</strong>. ';
        printHtml += 'D\'autres réglementations (PCI-DSS, HDS, SOC 2, CMMC, etc.) peuvent s\'appliquer selon votre contexte mais ne sont pas évaluées ici.';
        printHtml += '</div>';

        // PROFIL CLIENT
        printHtml += '<h2>Profil de votre organisation</h2>';
        printHtml += '<div class="profile-box"><table>';
        printHtml += '<tr><td>Taille</td><td>' + p.icon + ' ' + escapeHtml(profileTitle !== ('simulator.profiles.' + state.profile + '.title') ? profileTitle : p.title) + '</td></tr>';
        printHtml += '<tr><td>Localisation</td><td>' + escapeHtml(locationLabel) + '</td></tr>';
        printHtml += '<tr><td>Secteur</td><td>' + escapeHtml(sectorLabel) + '</td></tr>';
        printHtml += '<tr><td>Taille détaillée</td><td>' + escapeHtml(sizeLabel) + '</td></tr>';
        printHtml += '<tr><td>Données personnelles</td><td>' + (a.q4_personal_data === 'yes' ? 'Oui' : 'Non') + '</td></tr>';
        printHtml += '<tr><td>Agrément financier</td><td>' + (a.q5_regulated === 'yes' ? 'Oui — Entité régulée' : 'Non') + '</td></tr>';
        printHtml += '<tr><td>Services IT/Cloud</td><td>' + (a.q6_it_services === 'yes' ? 'Oui' : 'Non') + '</td></tr>';
        if (a.q7_tic_provider) {
            printHtml += '<tr><td>Prestataire TIC finance</td><td>' + (a.q7_tic_provider === 'yes' ? 'Oui' : 'Non') + '</td></tr>';
        }
        printHtml += '<tr><td>Activités critiques (continuité)</td><td>' + (a.q11_continuity === 'yes' ? 'Oui' : 'Non') + '</td></tr>';
        printHtml += '</table></div>';

        // RÉSUMÉ
        printHtml += '<div class="summary-box">';
        printHtml += '<div class="summary-item summary-mandatory"><div class="summary-number">' + mandatory.length + '</div><div>Réglementation(s) applicable(s)</div></div>';
        printHtml += '<div class="summary-item summary-recommended"><div class="summary-number">' + recommended.length + '</div><div>Recommandation(s)</div></div>';
        printHtml += '</div>';

        // NORMES OBLIGATOIRES
        if (mandatory.length > 0) {
            printHtml += '<h2>⚖️ Réglementations applicables (' + mandatory.length + ')</h2>';
            mandatory.forEach(function(n) { printHtml += buildPdfNormCard(n, 'mandatory', t); });
        }

        // NORMES RECOMMANDÉES
        if (recommended.length > 0) {
            printHtml += '<h2>💡 Recommandations (' + recommended.length + ')</h2>';
            recommended.forEach(function(n) { printHtml += buildPdfNormCard(n, 'recommended', t); });
        }

        // AUCUN RÉSULTAT
        if (mandatory.length === 0 && recommended.length === 0) {
            printHtml += '<div style="padding:20px;text-align:center;"><p>' + t('simulator.no_results_title') + '</p><p>' + t('simulator.no_results_text') + '</p></div>';
        }

        // CTA
        printHtml += '<div class="cta-section">';
        printHtml += '<h3>Besoin d\'accompagnement ?</h3>';
        printHtml += '<p>Pour mettre en œuvre les normes identifiées dans ce diagnostic, je propose des audits personnalisés adaptés à votre contexte :</p>';
        printHtml += '<ul><li>Audit de conformité (grille 100-160+ points de contrôle)</li>';
        printHtml += '<li>Évaluation des écarts et feuille de route priorisée</li>';
        printHtml += '<li>Accompagnement jusqu\'à la conformité effective</li></ul>';
        printHtml += '<p style="margin-top:10px;"><strong>Contact :</strong> <span style="color:#1B2A4A;">emmanuel.genesteix@agilevizion.com</span></p>';
        printHtml += '</div>';

        // DISCLAIMER + FOOTER
        printHtml += '<p class="disclaimer">Ce document fournit une indication générale basée sur les réponses fournies et ne constitue pas un avis juridique. Seul un audit détaillé permet de confirmer les obligations réglementaires applicables.</p>';
        printHtml += '<div class="footer"><p><strong>AgileVizion</strong> — GRC Cybersecurity &amp; Agentic AI Automation — Luxembourg</p>';
        printHtml += '<p>emmanuel.genesteix@agilevizion.com | agilevizion.com</p></div>';

        printHtml += '</body></html>';

        // Téléchargement HTML + ouverture impression
        var blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'AgileVizion_Diagnostic_' + company.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Stocker le lead pour relance commerciale
        saveLead(company, email, mandatory, recommended);

        var printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printHtml);
            printWindow.document.close();
            setTimeout(function() {
                printWindow.focus();
                setTimeout(function() { printWindow.print(); }, 500);
                if (msgSuccess) {
                    msgSuccess.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>' + t('simulator.pdf_success') + '</span>';
                    msgSuccess.classList.add('visible');
                }
                if (btn) { btn.innerHTML = orig; btn.disabled = false; }
                checkPdfFormValid();
            }, 300);
        } else {
            if (msgError) {
                msgError.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> <span>' + t('simulator.pdf_popup_blocked') + '</span>';
                msgError.classList.add('visible');
            }
            if (btn) { btn.innerHTML = orig; btn.disabled = false; }
            checkPdfFormValid();
        }

    } catch (e) {
        console.error('PDF error:', e);
        if (msgError) {
            var tErr = window.I18n && window.I18n.t ? window.I18n.t('simulator.pdf_error') : 'Erreur, réessayez.';
            msgError.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> <span>' + tErr + '</span>';
            msgError.classList.add('visible');
        }
        if (btn) { btn.innerHTML = orig; }
        checkPdfFormValid();
    }
}

function buildApplicabilityCriteria(normKey) {
    var a = state.answers;
    var criteria = [];

    if (normKey === 'rgpd') {
        criteria.push('✓ Votre organisation traite des données personnelles');
        if (a.q1_location === 'eu') criteria.push('✓ Siège dans l\'Union Européenne');
        else if (a.q1_location === 'eu_clients') criteria.push('✓ Clients dans l\'Union Européenne (Art. 3§2 RGPD)');
        criteria.push('→ Le RGPD s\'applique à toute entité traitant des données de résidents UE');
    } else if (normKey === 'dora') {
        criteria.push('✓ Siège dans l\'Union Européenne');
        if (a.q5_regulated === 'yes' && SECTORS.DORA_FINANCE.indexOf(a.q2_sector) !== -1) {
            criteria.push('✓ Entité financière régulée (secteur soumis à DORA)');
            criteria.push('→ DORA s\'applique directement aux entités financières agréées UE');
        } else if (a.q7_tic_provider === 'yes') {
            criteria.push('✓ Prestataire TIC critique pour des entités financières régulées');
            criteria.push('→ DORA s\'applique aux prestataires TIC tiers des entités financières (Art. 28-44)');
        }
    } else if (normKey === 'nis2') {
        var isAnnex1 = SECTORS.NIS2_ANNEX1.indexOf(a.q2_sector) !== -1;
        if (a.q8_nis2_essential === 'yes' && a.q3_size === 'small') {
            criteria.push('✓ Entité essentielle exemptée du seuil de taille (Art. 2§2)');
        } else {
            criteria.push('✓ Taille ≥ moyenne entreprise (seuil NIS 2)');
        }
        criteria.push('✓ Secteur ' + (isAnnex1 ? 'Annexe I (hautement critique)' : 'Annexe II (critique)'));
        if (a.q1_location === 'eu') {
            criteria.push('✓ Siège dans l\'Union Européenne');
        } else if (a.q1_location === 'eu_clients') {
            criteria.push('✓ Effet extraterritorial : services fournis à des clients UE (Art. 26)');
        }
        var isLarge = (a.q3_size === 'large');
        criteria.push('→ Classification : Entité ' + (isAnnex1 && isLarge ? 'Essentielle (EE)' : 'Importante (EI)'));
    } else if (normKey === 'iso27001') {
        criteria.push('✓ Taille ≥ moyenne entreprise');
        criteria.push('→ La certification ISO 27001 renforce la posture sécurité et la confiance clients');
    } else if (normKey === 'iso22301') {
        if (state.results.dora) criteria.push('✓ DORA exige la continuité d\'activité (Art. 11-12)');
        if (state.results.nis2) criteria.push('✓ NIS 2 exige la continuité d\'activité (Art. 21§2c)');
        if (a.q11_continuity === 'yes') criteria.push('✓ Activités critiques identifiées');
        if (SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1) criteria.push('✓ Secteur critique (infrastructure essentielle)');
        criteria.push('→ ISO 22301 est le cadre de référence pour structurer la continuité');
    }

    return criteria;
}

function buildPdfNormCard(norm, type, t) {
    var isMandatory = (type === 'mandatory');
    var sanctionLabel = norm.isRegulation ? 'Sanctions' : 'Risques';
    var fullName = getNormTranslation(norm, 'fullName');
    var why = getWhyTranslation(norm);
    var sanctions = getNormTranslation(norm, 'sanctions');
    var deadline = getNormTranslation(norm, 'deadline');

    var html = '<div class="norm-card norm-' + type + '">';
    html += '<div class="norm-title">' + String(norm.name || '') + ' — ' + fullName;
    html += ' <span class="norm-badge badge-' + type + '">' + (isMandatory ? 'S\'APPLIQUE' : 'RECOMMANDÉ') + '</span></div>';
    html += '<div class="norm-why">' + why + '</div>';

    // Critères d'applicabilité
    var criteria = buildApplicabilityCriteria(norm.key);
    if (criteria.length > 0) {
        html += '<div style="background:#f0f4ff;padding:8px 12px;border-radius:4px;margin:8px 0;font-size:0.9em;">';
        html += '<strong>Pourquoi cette norme s\'applique à votre organisation :</strong><br>';
        criteria.forEach(function(c) { html += c + '<br>'; });
        html += '</div>';
    }

    // Obligations principales
    if (norm.obligations && norm.obligations.length > 0) {
        html += '<div class="norm-obligations"><strong>Obligations principales :</strong><ul>';
        norm.obligations.forEach(function(o) {
            html += '<li>' + String(o) + '</li>';
        });
        html += '</ul></div>';
    }

    html += '<div class="norm-sanctions"><strong>' + sanctionLabel + ' :</strong> ' + sanctions + '</div>';
    html += '<div class="norm-deadline"><strong>Échéance :</strong> ' + deadline + '</div>';
    html += '<div class="norm-source"><strong>Réf. :</strong> ' + String(norm.source || '') + '</div>';
    html += '</div>';
    return html;
}

// ============================================
// LEADS — stockage local pour relance commerciale
// ============================================

var LEADS_KEY = 'agilevizion_leads';

function saveLead(company, email, mandatory, recommended) {
    var a = state.answers;
    var sectorEl = document.getElementById('q2_sector');
    var sectorLabel = sectorEl ? sectorEl.options[sectorEl.selectedIndex].text : a.q2_sector;
    var sizeEl = document.getElementById('q3_size');
    var sizeLabel = sizeEl ? sizeEl.options[sizeEl.selectedIndex].text : a.q3_size;
    var locationEl = document.getElementById('q1_location');
    var locationLabel = locationEl ? locationEl.options[locationEl.selectedIndex].text : a.q1_location;

    var normsObligatoires = mandatory.map(function(n) { return n.name || n.key; }).join('; ');
    var normsRecommandees = recommended.map(function(n) { return n.name || n.key; }).join('; ');

    var lead = {
        date: new Date().toISOString(),
        entreprise: company,
        email: email,
        localisation: locationLabel,
        secteur: sectorLabel,
        taille: sizeLabel,
        donnees_perso: a.q4_personal_data || '',
        agrement_financier: a.q5_regulated || '',
        services_it: a.q6_it_services || '',
        prestataire_tic: a.q7_tic_provider || '',
        continuite: a.q11_continuity || '',
        normes_obligatoires: normsObligatoires,
        normes_recommandees: normsRecommandees
    };

    var leads = [];
    try { leads = JSON.parse(localStorage.getItem(LEADS_KEY)) || []; } catch(e) {}
    leads.push(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

function exportLeadsCsv() {
    var leads = [];
    try { leads = JSON.parse(localStorage.getItem(LEADS_KEY)) || []; } catch(e) {}
    if (!leads.length) { alert('Aucun lead enregistré.'); return; }

    var headers = ['Date', 'Entreprise', 'Email', 'Localisation', 'Secteur', 'Taille',
        'Données perso', 'Agrément financier', 'Services IT', 'Prestataire TIC',
        'Continuité', 'Normes obligatoires', 'Normes recommandées'];
    var keys = ['date', 'entreprise', 'email', 'localisation', 'secteur', 'taille',
        'donnees_perso', 'agrement_financier', 'services_it', 'prestataire_tic',
        'continuite', 'normes_obligatoires', 'normes_recommandees'];

    var csv = '\uFEFF' + headers.join(';') + '\n';
    leads.forEach(function(l) {
        csv += keys.map(function(k) {
            var v = String(l[k] || '').replace(/"/g, '""');
            return '"' + v + '"';
        }).join(';') + '\n';
    });

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'AgileVizion_Leads_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Accès admin : ?admin=1 affiche le bouton export CSV
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.search.indexOf('admin=1') !== -1) {
        var pdfSection = document.querySelector('.pdf-section');
        if (pdfSection) {
            var adminBtn = document.createElement('button');
            adminBtn.className = 'btn btn-outline';
            adminBtn.style.marginTop = '12px';
            adminBtn.innerHTML = '<i class="fa-solid fa-file-csv"></i> Exporter leads CSV';
            adminBtn.onclick = exportLeadsCsv;
            pdfSection.appendChild(adminBtn);
        }
    }
});

// ============================================
// INIT
// ============================================

window.SimulatorApp = {
    init: function() {},
    getState: function() { return state; }
};

document.addEventListener('DOMContentLoaded', function() {
    window.SimulatorApp.init();
});

// ============================================
// EXPORTS WINDOW (inline onclick HTML + tests JSDOM)
// ============================================
window.handleChange = handleChange;
window.checkPdfFormValid = checkPdfFormValid;
window.generatePDF = generatePDF;
window.resetSimulator = resetSimulator;
window.analyzeProfile = analyzeProfile;
