/* ============================================
   AgileVizion 2 — Simulateur de conformité
   Story #4 — Logique métier complète (migrée v1)
   ============================================ */

// ============================================
// DATA: Normes, Secteurs, Profils
// ============================================

var NORMS = {

    rgpd: {
        key: 'rgpd',
        name: 'RGPD',
        fullName: 'Règlement Général sur la Protection des Données',
        source: 'Règlement (UE) 2016/679',
        sanctions: "Jusqu'à 20M€ ou 4% du CA annuel mondial (le montant le plus élevé)",
        deadline: 'En vigueur depuis mai 2018',
        isRegulation: true
    },

    dora: {
        key: 'dora',
        name: 'DORA',
        fullName: 'Digital Operational Resilience Act',
        source: 'Règlement (UE) 2022/2554',
        sanctions: "Astreintes périodiques + retrait d'agrément possible par l'autorité de supervision",
        deadline: 'Applicable depuis le 17 janvier 2025',
        isRegulation: true
    },

    nis2: {
        key: 'nis2',
        name: 'NIS 2',
        fullName: 'Network and Information Security Directive',
        source: 'Directive (UE) 2022/2555',
        sanctions: "Entités Essentielles : jusqu'à 10M€ ou 2% CA | Entités Importantes : jusqu'à 7M€ ou 1,4% CA",
        deadline: 'Transposition nationale depuis octobre 2024',
        isRegulation: true
    },

    pcidss: {
        key: 'pcidss',
        name: 'PCI-DSS',
        fullName: 'Payment Card Industry Data Security Standard',
        source: 'PCI-DSS v4.0 (PCI SSC)',
        sanctions: "5K-10K$/mois (mois 1-3), 25-50K$/mois (mois 4-6), jusqu'à 100K$/mois au-delà + retrait capacité traitement cartes",
        deadline: 'Version 4.0 obligatoire depuis mars 2025',
        isRegulation: true
    },

    hds: {
        key: 'hds',
        name: 'HDS',
        fullName: 'Hébergeur de Données de Santé',
        source: 'Code de la Santé Publique (Art. L1111-8)',
        sanctions: "3 ans prison + 45 000€ (pers. physiques) / 225 000€ (pers. morales) + amendes CNIL jusqu'à 4% CA",
        deadline: 'Certification obligatoire en vigueur',
        isRegulation: true
    },

    iso27001: {
        key: 'iso27001',
        name: 'ISO 27001',
        fullName: "Système de Management de la Sécurité de l'Information",
        source: 'ISO/IEC 27001:2022',
        sanctions: "Perte de contrats, exclusion des appels d'offres, perte de confiance clients",
        deadline: 'Certification volontaire (cycle 3 ans)',
        isRegulation: false
    },

    iso20000: {
        key: 'iso20000',
        name: 'ISO 20000',
        fullName: 'Système de Management des Services IT',
        source: 'ISO/IEC 20000-1:2018',
        sanctions: 'Perte de différenciation commerciale, désavantage concurrentiel',
        deadline: 'Certification volontaire',
        isRegulation: false
    },

    soc2: {
        key: 'soc2',
        name: 'SOC 2',
        fullName: 'Service Organization Control 2',
        source: 'AICPA TSP Section 100',
        sanctions: "Perte de clients US/internationaux, exclusion des processus d'achat Fortune 500",
        deadline: 'Attestation annuelle volontaire',
        isRegulation: false
    },

    iso22301: {
        key: 'iso22301',
        name: 'ISO 22301',
        fullName: "Système de Management de la Continuité d'Activité",
        source: 'ISO 22301:2019',
        sanctions: "Risque d'interruption prolongée, pertes financières, atteinte à la réputation",
        deadline: 'Certification volontaire',
        isRegulation: false
    },

    cmmc: {
        key: 'cmmc',
        name: 'CMMC',
        fullName: 'Cybersecurity Maturity Model Certification',
        source: 'CMMC 2.0 / 32 CFR Part 170',
        sanctions: "Exclusion des marchés DoD + amendes False Claims Act jusqu'à 250K$/violation + triple dommages-intérêts",
        deadline: 'Obligatoire pour contrats DoD (déploiement 2024-2028)',
        isRegulation: true
    }

};

var SECTORS = {
    NIS2_ANNEX1: ['energy', 'transport', 'banking', 'financial_infra', 'health', 'water', 'digital_infra', 'ict_b2b', 'public_admin', 'space'],
    NIS2_ANNEX2: ['postal', 'waste', 'chemistry', 'food', 'manufacturing', 'digital_providers', 'research'],
    NIS2_EXTRATERRITORIAL: ['digital_infra', 'ict_b2b', 'digital_providers'],
    DORA_FINANCE: ['banking', 'financial_infra', 'insurance', 'investment', 'crypto', 'crowdfunding', 'rating'],
    IT_CLOUD: ['digital_infra', 'ict_b2b', 'digital_providers'],
    CRITICAL: ['energy', 'banking', 'financial_infra', 'health', 'transport', 'water']
};

var PROFILES = {
    startup: { icon: '🚀', title: 'Petite structure', subtitle: '<50 employés, CA <10M€, bilan <10M€' },
    pme: { icon: '🏢', title: 'Moyenne entreprise', subtitle: '50-249 employés ou CA 10-50M€' },
    eti: { icon: '🏛️', title: 'Grande entreprise', subtitle: '250+ employés ou CA >50M€' }
};

// ============================================
// STATE
// ============================================

var state = {
    answers: { q10_us_activity: 'no' },
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
    // Reset results si l'utilisateur modifie une réponse après analyse
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

    // Q8 : HDS (si secteur santé ou services IT)
    if (a.q2_sector === 'health' || a.q6_it_services === 'yes') {
        showConditional('cond-hds');
    }

    // Q9 : PCI-DSS (si services IT ou commerce)
    if (a.q6_it_services === 'yes' || a.q2_sector === 'retail') {
        showConditional('cond-pci');
    }

    // Q10a / Q10b : sous-questions US (si activité US)
    if (a.q10_us_activity === 'yes') {
        showConditional('cond-us-certs');
        showConditional('cond-us-dod');
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
    ['cond-tic', 'cond-hds', 'cond-pci', 'cond-us-certs', 'cond-us-dod'].forEach(function(id) {
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
    state = { answers: { q10_us_activity: 'no' }, results: null, profile: null };

    document.querySelectorAll('.question-select').forEach(function(s) {
        if (s.id === 'q10_us_activity') {
            s.value = 'no';
        } else {
            s.value = '';
        }
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
    if (a.q10_us_activity === 'yes') tags.push('🇺🇸 Activités US');

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

    // RGPD
    if (a.q4_personal_data === 'yes' && (isEU || hasEUClients)) {
        results.rgpd = {
            status: 'obligatoire',
            why: t('simulator.why.rgpd'),
            whyKey: 'rgpd'
        };
    }

    // DORA
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

    // NIS 2
    if (isNIS2Sector && !isTooSmall) {
        if (isEU) {
            var whyKey = 'nis2_eu_' + (isAnnex1 ? 'annex1' : 'annex2') + '_' + (isLarge ? 'ee' : 'ei');
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

    // PCI-DSS
    if (a.q9_pci === 'yes') {
        results.pcidss = {
            status: 'obligatoire',
            why: t('simulator.why.pcidss'),
            whyKey: 'pcidss'
        };
    }

    // HDS
    if (a.q8_hds === 'yes' && (isEU || hasEUClients)) {
        results.hds = {
            status: 'obligatoire',
            why: t('simulator.why.hds'),
            whyKey: 'hds'
        };
    }

    // ISO 27001
    if (a.q10a_us_certs === 'iso27001' || a.q10a_us_certs === 'both') {
        results.iso27001 = {
            status: 'obligatoire',
            why: t('simulator.why.iso27001_mandatory'),
            whyKey: 'iso27001_mandatory'
        };
    } else if (!isTooSmall) {
        results.iso27001 = {
            status: 'recommande',
            why: t('simulator.why.iso27001_recommended'),
            whyKey: 'iso27001_recommended'
        };
    }

    // ISO 20000
    if (a.q6_it_services === 'yes') {
        results.iso20000 = {
            status: 'recommande',
            why: t('simulator.why.iso20000'),
            whyKey: 'iso20000'
        };
    }

    // SOC 2
    if (a.q10a_us_certs === 'soc2' || a.q10a_us_certs === 'both') {
        results.soc2 = {
            status: 'obligatoire',
            why: t('simulator.why.soc2_mandatory'),
            whyKey: 'soc2_mandatory'
        };
    } else if (a.q10_us_activity === 'yes' && (SECTORS.IT_CLOUD.indexOf(a.q2_sector) !== -1 || a.q6_it_services === 'yes')) {
        results.soc2 = {
            status: 'recommande',
            why: t('simulator.why.soc2_recommended'),
            whyKey: 'soc2_recommended'
        };
    }

    // ISO 22301
    if (a.q11_continuity === 'yes' || SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1 || results.dora || results.nis2) {
        var iso22301WhyKey = '';
        if (results.dora && results.nis2) {
            iso22301WhyKey = 'iso22301_dora_nis2';
        } else if (results.dora) {
            iso22301WhyKey = 'iso22301_dora';
        } else if (results.nis2) {
            iso22301WhyKey = 'iso22301_nis2';
        } else if (SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1) {
            iso22301WhyKey = 'iso22301_critical_sector';
        } else {
            iso22301WhyKey = 'iso22301_critical_activity';
        }
        results.iso22301 = {
            status: 'recommande',
            why: t('simulator.why.' + iso22301WhyKey),
            whyKey: iso22301WhyKey
        };
    }

    // CMMC
    if (a.q10b_dod === 'yes') {
        results.cmmc = {
            status: 'obligatoire',
            why: t('simulator.why.cmmc'),
            whyKey: 'cmmc'
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

    return '<div class="norm-card ' + (isMandatory ? 'mandatory' : 'recommended') + '">' +
        '<div class="norm-header">' +
        '<div><span class="norm-name">' + String(norm.name || '') + '</span>' +
        '<span class="norm-fullname"> — ' + fullName + '</span></div>' +
        '<span class="norm-badge ' + status + '">' + appliesText + '</span>' +
        '</div>' +
        '<div class="norm-why">' + why + '</div>' +
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
        var reportTitle = t('simulator.pdf_report_title') + ' — ' + company;
        var auditTitle = t('simulator.pdf_audit_section_title');
        var auditText = t('simulator.pdf_audit_section_text');
        var contactLabel = t('simulator.pdf_contact_email');
        var currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        var printHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + reportTitle + '</title><style>';
        printHtml += '@media print { @page { margin: 15mm; } body { margin: 0; } }';
        printHtml += 'body { font-family: "Segoe UI", Tahoma, sans-serif; color: #1a202c; background: white; padding: 20px; max-width: 210mm; margin: 0 auto; }';
        printHtml += 'h1 { color: #4F46E5; font-size: 1.8em; margin-bottom: 10px; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }';
        printHtml += 'h2 { color: #4F46E5; font-size: 1.3em; margin: 25px 0 10px; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; }';
        printHtml += 'h3 { color: #059669; font-size: 1.2em; margin: 20px 0 10px; border-bottom: 2px solid #059669; padding-bottom: 5px; }';
        printHtml += 'h4 { color: #4F46E5; font-size: 1.1em; margin: 15px 0 8px; font-weight: bold; }';
        printHtml += '.header-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }';
        printHtml += '.profile-box { background: #EEF2FF; padding: 15px; border-radius: 8px; margin-bottom: 20px; }';
        printHtml += '.norm-card { padding: 15px; margin: 12px 0; border-left: 4px solid; background: #f8f9fa; border-radius: 0 8px 8px 0; }';
        printHtml += '.norm-mandatory { border-left-color: #10B981; }';
        printHtml += '.norm-recommended { border-left-color: #4F46E5; }';
        printHtml += '.audit-section { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4F46E5; }';
        printHtml += '.footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2e8f0; text-align: center; color: #4F46E5; }';
        printHtml += 'p { margin: 8px 0; line-height: 1.6; } strong { color: #2d3748; } .disclaimer { font-size: 0.85em; color: #666; font-style: italic; margin-top: 10px; }';
        printHtml += '</style></head><body>';

        printHtml += '<div class="header-info">';
        printHtml += '<h1>' + reportTitle + '</h1>';
        printHtml += '<p style="color:#4F46E5;font-size:1.1em;margin:5px 0;"><strong>AgileVizion</strong> — GRC et Cybersécurité</p>';
        printHtml += '<p><strong>Entreprise :</strong> ' + company + '</p>';
        printHtml += '<p><strong>Email :</strong> ' + email + '</p>';
        printHtml += '<p><strong>Date :</strong> ' + currentDate + '</p>';
        printHtml += '<p class="disclaimer">Ce document fournit une indication générale et ne constitue pas un avis juridique.</p>';
        printHtml += '</div>';

        printHtml += '<div class="profile-box">';
        printHtml += '<p><strong>' + p.icon + ' ' + t('simulator.profile_label') + '</strong> ' + (profileTitle !== ('simulator.profiles.' + state.profile + '.title') ? profileTitle : p.title) + '</p>';
        printHtml += '<p><strong>' + t('simulator.result_label') + '</strong> ' + mandatory.length + ' ' + t('simulator.regulations_applicable') + ', ' + recommended.length + ' ' + t('simulator.recommendations_count') + '</p>';
        printHtml += '</div>';

        var pdfHtml = '';
        if (mandatory.length > 0) {
            pdfHtml += '<h3>' + t('simulator.mandatory_title').toUpperCase() + ' (' + mandatory.length + ')</h3>';
            mandatory.forEach(function(n) {
                var label = String(n.isRegulation ? t('simulator.sanctions') : t('simulator.risks'));
                pdfHtml += '<div class="norm-card norm-mandatory"><h4>' + String(n.name || '') + ' — ' + getNormTranslation(n, 'fullName') + '</h4>';
                pdfHtml += '<p>' + getWhyTranslation(n) + '</p>';
                pdfHtml += '<p><strong>' + t('simulator.deadline') + '</strong> ' + getNormTranslation(n, 'deadline') + '</p>';
                pdfHtml += '<p style="color:#c53030;"><strong>' + label + '</strong> ' + getNormTranslation(n, 'sanctions') + '</p></div>';
            });
        }
        if (recommended.length > 0) {
            pdfHtml += '<h2 style="color:#4F46E5;">' + t('simulator.recommended_title').toUpperCase() + ' (' + recommended.length + ')</h2>';
            recommended.forEach(function(n) {
                var label = String(n.isRegulation ? t('simulator.sanctions') : t('simulator.risks'));
                pdfHtml += '<div class="norm-card norm-recommended"><h4>' + String(n.name || '') + ' — ' + getNormTranslation(n, 'fullName') + '</h4>';
                pdfHtml += '<p>' + getWhyTranslation(n) + '</p>';
                pdfHtml += '<p><strong>' + t('simulator.deadline') + '</strong> ' + getNormTranslation(n, 'deadline') + '</p>';
                pdfHtml += '<p><strong>' + label + '</strong> ' + getNormTranslation(n, 'sanctions') + '</p></div>';
            });
        }
        if (mandatory.length === 0 && recommended.length === 0) {
            pdfHtml += '<div style="padding:20px;text-align:center;"><p>' + t('simulator.no_results_title') + '</p><p>' + t('simulator.no_results_text') + '</p></div>';
        }

        pdfHtml += '<div class="audit-section"><h3>' + auditTitle + '</h3><p>' + auditText + '</p>';
        pdfHtml += '<p><strong>' + contactLabel + '</strong> <span style="color:#4F46E5;font-weight:bold;">emmanuel.genesteix@agilevizion.com</span></p></div>';
        pdfHtml += '<div class="footer"><p><strong>AgileVizion</strong> — Conseil GRC et Cybersécurité</p><p>emmanuel.genesteix@agilevizion.com | agilevizion.com</p></div>';

        printHtml += pdfHtml + '</body></html>';

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
            // Popup bloquée : le fichier a été téléchargé, mais la fenêtre impression est bloquée
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

// ============================================
// CALENDLY
// ============================================

function openCalendly() {
    var CALENDLY_URL = 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion';
    if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({ url: CALENDLY_URL });
        return;
    }
    // Fallback : attendre le chargement async (max 3s)
    var attempts = 0;
    var checkCalendly = setInterval(function() {
        attempts++;
        if (typeof Calendly !== 'undefined') {
            clearInterval(checkCalendly);
            Calendly.initPopupWidget({ url: CALENDLY_URL });
        } else if (attempts >= 60) {
            clearInterval(checkCalendly);
            window.open(CALENDLY_URL, '_blank');
        }
    }, 50);
}

// ============================================
// INIT
// ============================================

window.SimulatorApp = {
    init: function() {
        // État initial q10 = 'no' (Non sélectionné par défaut)
        var q10 = document.getElementById('q10_us_activity');
        if (q10) {
            q10.value = 'no';
            state.answers.q10_us_activity = 'no';
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    window.SimulatorApp.init();
});
