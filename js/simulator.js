/* Simulator Compliance - AgileVizion */

// ============================================

// DATA: Norms, Sectors, Profiles

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

}

function checkPdfFormValid() {

    var company = document.getElementById('input-company').value.trim();

    var email = document.getElementById('input-email').value.trim();

    var isValid = company.length > 0 && email.length > 0 && email.indexOf('@') !== -1;

    document.getElementById('btn-pdf').disabled = !isValid;

}

function updateQuestionState(select) {

    var group = select.closest('.question-group');

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

    document.getElementById('btn-analyze').disabled = !complete;

}

// ============================================

// CONDITIONAL QUESTIONS

// ============================================

function checkConditionalQuestions() {

    var a = state.answers;

    hideAllConditionals();

    

    if (a.q6_it_services === 'yes' && SECTORS.DORA_FINANCE.indexOf(a.q2_sector) === -1 && a.q5_regulated !== 'yes') {

        showConditional('cond-tic');

    }

    if (a.q2_sector === 'health' || a.q6_it_services === 'yes') {

        showConditional('cond-hds');

    }

    if (a.q6_it_services === 'yes' || a.q2_sector === 'retail') {

        showConditional('cond-pci');

    }

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

// RESET

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

    document.getElementById('results-section').classList.remove('visible');

    document.getElementById('profile-card').classList.remove('visible');

    document.getElementById('btn-analyze').disabled = true;

    document.getElementById('input-company').value = '';

    document.getElementById('input-email').value = '';

    var msgSuccess = document.getElementById('msg-success');

    var msgError = document.getElementById('msg-error');

    if (msgSuccess) msgSuccess.classList.remove('visible');

    if (msgError) msgError.classList.remove('visible');

    document.getElementById('btn-pdf').disabled = true;

    

    window.scrollTo({ top: 0, behavior: 'smooth' });

}

// ============================================

// ANALYZE PROFILE

// ============================================

function analyzeProfile() {

    var a = state.answers;

    state.profile = a.q3_size === 'small' ? 'startup' : a.q3_size === 'medium' ? 'pme' : 'eti';

    displayProfile();

    calculateResults();

    displayResults();

    setTimeout(function() { 

        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' }); 

    }, 100);

}

function displayProfile() {

    var p = PROFILES[state.profile];
    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
    var profileTitle = t('simulator.profiles.' + state.profile + '.title');
    var profileSubtitle = t('simulator.profiles.' + state.profile + '.subtitle');

    var a = state.answers;

    

    document.getElementById('profile-icon').textContent = p.icon;

    document.getElementById('profile-title').textContent = profileTitle;

    document.getElementById('profile-subtitle').innerHTML = profileSubtitle;

    

    var tags = [];

    if (a.q1_location === 'eu') tags.push('🇪🇺 Union Européenne');

    else if (a.q1_location === 'eu_clients') tags.push('🌍 Clients UE');

    if (a.q5_regulated === 'yes') tags.push('📜 Entité régulée');

    if (a.q6_it_services === 'yes') tags.push('☁️ Services IT/Cloud');

    if (a.q10_us_activity === 'yes') tags.push('🇺🇸 Activités US');

    

    document.getElementById('profile-tags').innerHTML = tags.map(function(t) { 

        return '<span class="profile-tag">' + t + '</span>'; 

    }).join('');

    

    document.getElementById('profile-card').classList.add('visible');

}

// ============================================

// CALCULATE RESULTS

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
        var iso22301Why = '';

        if (results.dora && results.nis2) {

            iso22301WhyKey = 'iso22301_dora_nis2';
            iso22301Why = t('simulator.why.iso22301_dora_nis2');

        } else if (results.dora) {

            iso22301WhyKey = 'iso22301_dora';
            iso22301Why = t('simulator.why.iso22301_dora');

        } else if (results.nis2) {

            iso22301WhyKey = 'iso22301_nis2';
            iso22301Why = t('simulator.why.iso22301_nis2');

        } else if (SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1) {

            iso22301WhyKey = 'iso22301_critical_sector';
            iso22301Why = t('simulator.why.iso22301_critical_sector');

        } else {

            iso22301WhyKey = 'iso22301_critical_activity';
            iso22301Why = t('simulator.why.iso22301_critical_activity');

        }

        results.iso22301 = { status: 'recommande', why: iso22301Why, whyKey: iso22301WhyKey };

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

// DISPLAY RESULTS

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

    document.getElementById('count-mandatory').textContent = mandatory.length;

    document.getElementById('count-recommended').textContent = recommended.length;

    var html = '';

    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
    
    if (mandatory.length > 0) {

        html += '<div class="results-category"><h3 class="mandatory-title"><i class="fa-solid fa-circle-check"></i> ' + t('simulator.mandatory_title') + ' (' + mandatory.length + ')</h3>';

        mandatory.forEach(function(n) { html += buildNormCard(n, 'obligatoire'); });

        html += '</div>';

    }

    

    if (recommended.length > 0) {

        html += '<div class="results-category"><h3 class="recommended-title"><i class="fa-solid fa-lightbulb"></i> ' + t('simulator.recommended_title') + ' (' + recommended.length + ')</h3>';

        recommended.forEach(function(n) { html += buildNormCard(n, 'recommande'); });

        html += '</div>';

    }

    

    if (!mandatory.length && !recommended.length) {

        var noResultsTitle = t('simulator.no_results_title');
        var noResultsText = t('simulator.no_results_text');
        html = '<div class="no-results"><i class="fa-solid fa-clipboard-question"></i><h4>' + noResultsTitle + '</h4><p>' + noResultsText + '</p></div>';

    }

    document.getElementById('results-container').innerHTML = html;

    document.getElementById('results-section').classList.add('visible');

}

function getNormTranslation(norm, property) {
    if (!window.I18n || !window.I18n.t) {
        console.warn('I18n not available, returning original value');
        return String(norm[property] || '');
    }
    var key = 'simulator.norms.' + norm.key + '.' + property;
    var translated = window.I18n.t(key);
    // Ensure we always return a string, not an object
    var result = (translated === key) ? norm[property] : translated;
    // Convert to string explicitly to avoid [object Object]
    return String(result || '');
}

function getWhyTranslation(norm) {
    if (!window.I18n || !window.I18n.t) {
        console.warn('I18n not available, returning original value');
        return String(norm.why || '');
    }
    if (norm.whyKey) {
        var key = 'simulator.why.' + norm.whyKey;
        var translated = window.I18n.t(key);
        var result = (translated === key) ? norm.why : translated;
        // Convert to string explicitly to avoid [object Object]
        return String(result || '');
    }
    return String(norm.why || '');
}

function buildNormCard(norm, status) {

    var isMandatory = status === 'obligatoire';
    var t = window.I18n && window.I18n.t ? function(key) { return window.I18n.t(key); } : function(key) { return key; };
    var sanctionLabel = String(norm.isRegulation ? t('simulator.sanctions') : t('simulator.risks'));
    var sanctionClass = norm.isRegulation ? 'sanction' : 'risk';
    
    // Get translated values
    var fullName = getNormTranslation(norm, 'fullName');
    var why = getWhyTranslation(norm);
    var sanctions = getNormTranslation(norm, 'sanctions');
    var deadline = getNormTranslation(norm, 'deadline');

    

    var noteHtml = '';

    if (norm.key === 'nis2' && norm.extraterritorial) {
        var noteText = String(t('simulator.nis2_extraterritorial_note'));
        var colonIndex = noteText.indexOf(':');
        var noteTitle = colonIndex > 0 ? noteText.substring(0, colonIndex) : '';
        var noteContent = colonIndex > 0 ? noteText.substring(colonIndex + 1).trim() : noteText;
        noteHtml = '<div class="norm-note warning"><i class="fa-solid fa-globe"></i>' + (noteTitle ? ' <strong>' + noteTitle + ':</strong>' : '') + ' ' + noteContent + '</div>';
    }

    

    var appliesText = String(isMandatory ? t('simulator.applies') : t('simulator.recommended_badge'));
    var deadlineText = String(t('simulator.deadline'));
    
    return '<div class="norm-card ' + (isMandatory ? 'mandatory' : 'recommended') + '">' +

        '<div class="norm-header"><div><span class="norm-name">' + String(norm.name || '') + '</span><span class="norm-fullname"> — ' + fullName + '</span></div>' +

        '<span class="norm-badge ' + status + '">' + appliesText + '</span></div>' +

        '<div class="norm-why">' + why + '</div>' +

        '<div class="norm-details">' +

        '<div class="norm-detail ' + sanctionClass + '"><i class="fa-solid fa-triangle-exclamation"></i> <strong>' + sanctionLabel + '</strong> ' + sanctions + '</div>' +

        '<div class="norm-detail deadline"><i class="fa-solid fa-calendar"></i> <strong>' + deadlineText + ' :</strong> ' + deadline + '</div>' +

        '<div class="norm-detail"><i class="fa-solid fa-book"></i> <strong>Réf. :</strong> ' + String(norm.source || '') + '</div></div>' +

        noteHtml +

        '</div>';

}

// ============================================

// PDF GENERATION

// ============================================

function generatePDF() {

    var company = document.getElementById('input-company').value.trim();

    var email = document.getElementById('input-email').value.trim();

    if (!company || !email || email.indexOf('@') === -1) return;

    var btn = document.getElementById('btn-pdf');

    var orig = btn.innerHTML;

    btn.disabled = true;

    btn.innerHTML = '<span class="spinner"></span> Génération...';

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
        var profileLabel = t('simulator.profile_label');
        var resultLabel = t('simulator.result_label');
        var regsText = mandatory.length + ' ' + t('simulator.regulations_applicable');
        var recsText = recommended.length + ' ' + t('simulator.recommendations_count');
        var profileTitle = t('simulator.profiles.' + state.profile + '.title');
        var baseTitle = t('simulator.pdf_report_title');
        var reportTitle = baseTitle + ' — ' + company;
        var auditTitle = t('simulator.pdf_audit_section_title');
        var auditText = t('simulator.pdf_audit_section_text');
        var contactLabel = t('simulator.pdf_contact_email');
        var currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
        
        // Build complete HTML page for printing
        var printHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + reportTitle + '</title><style>';
        printHtml += '@media print { @page { margin: 15mm; } body { margin: 0; } }';
        printHtml += 'body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; color: #1a202c; background: white; padding: 20px; max-width: 210mm; margin: 0 auto; }';
        printHtml += 'h1 { color: #2563eb; font-size: 1.8em; margin-bottom: 10px; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }';
        printHtml += 'h2 { color: #2563eb; font-size: 1.3em; margin: 25px 0 10px; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }';
        printHtml += 'h3 { color: #27ae60; font-size: 1.2em; margin: 20px 0 10px; border-bottom: 2px solid #27ae60; padding-bottom: 5px; }';
        printHtml += 'h4 { color: #2563eb; font-size: 1.1em; margin: 15px 0 8px; font-weight: bold; }';
        printHtml += '.header-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }';
        printHtml += '.profile-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }';
        printHtml += '.norm-card { padding: 15px; margin: 12px 0; border-left: 4px solid; background: #f8f9fa; border-radius: 0 8px 8px 0; }';
        printHtml += '.norm-mandatory { border-left-color: #27ae60; }';
        printHtml += '.norm-recommended { border-left-color: #2563eb; }';
        printHtml += '.audit-section { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2563eb; }';
        printHtml += '.footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e2e8f0; text-align: center; color: #2563eb; }';
        printHtml += 'p { margin: 8px 0; line-height: 1.6; }';
        printHtml += 'strong { color: #2d3748; }';
        printHtml += '.disclaimer { font-size: 0.85em; color: #666; font-style: italic; margin-top: 10px; }';
        printHtml += '</style></head><body>';
        
        // Header
        printHtml += '<div class="header-info">';
        printHtml += '<h1>' + reportTitle + '</h1>';
        printHtml += '<p style="color: #2563eb; font-size: 1.1em; margin: 5px 0;"><strong>AgileVizion</strong> — GRC et Cybersécurité</p>';
        printHtml += '<p><strong>Entreprise :</strong> ' + company + '</p>';
        printHtml += '<p><strong>Email :</strong> ' + email + '</p>';
        printHtml += '<p><strong>Date :</strong> ' + currentDate + '</p>';
        printHtml += '<p class="disclaimer">Ce document fournit une indication générale et ne constitue pas un avis juridique.</p>';
        printHtml += '</div>';
        
        // Profile
        printHtml += '<div class="profile-box">';
        printHtml += '<p><strong>' + p.icon + ' ' + profileLabel + '</strong> ' + profileTitle + '</p>';
        printHtml += '<p><strong>' + resultLabel + '</strong> ' + regsText + ', ' + recsText + '</p>';
        printHtml += '</div>';
        
        var pdfHtml = '';

        if (mandatory.length > 0) {

            pdfHtml += '<h3>' + t('simulator.mandatory_title').toUpperCase() + ' (' + mandatory.length + ')</h3>';

            mandatory.forEach(function(n) {

                var label = String(n.isRegulation ? t('simulator.sanctions') : t('simulator.risks'));
                var whyText = String(t('simulator.why'));
                var deadlineText = String(t('simulator.deadline'));
                var fullName = getNormTranslation(n, 'fullName');
                var why = getWhyTranslation(n);
                var sanctions = getNormTranslation(n, 'sanctions');
                var deadline = getNormTranslation(n, 'deadline');

                pdfHtml += '<div class="norm-card norm-mandatory"><h4>' + String(n.name || '') + ' — ' + fullName + '</h4><p><strong>' + whyText + ' :</strong> ' + why + '</p><p><strong>' + deadlineText + ' :</strong> ' + deadline + '</p><p style="color: #c53030;"><strong>' + label + '</strong> ' + sanctions + '</p></div>';

            });

        }

        

        if (recommended.length > 0) {

            pdfHtml += '<h2 style="color:#2563eb;">' + t('simulator.recommended_title').toUpperCase() + ' (' + recommended.length + ')</h2>';

            recommended.forEach(function(n) {

                var whyText = String(t('simulator.why'));
                var deadlineText = String(t('simulator.deadline'));
                var fullName = getNormTranslation(n, 'fullName');
                var why = getWhyTranslation(n);
                var deadline = getNormTranslation(n, 'deadline');
                var label = String(n.isRegulation ? t('simulator.sanctions') : t('simulator.risks'));
                var sanctions = getNormTranslation(n, 'sanctions');

                pdfHtml += '<div class="norm-card norm-recommended"><h4>' + String(n.name || '') + ' — ' + fullName + '</h4><p><strong>' + whyText + ' :</strong> ' + why + '</p><p><strong>' + deadlineText + ' :</strong> ' + deadline + '</p><p><strong>' + label + '</strong> ' + sanctions + '</p></div>';

            });

        }
        
        // Add message if no results
        if (mandatory.length === 0 && recommended.length === 0) {
            pdfHtml += '<div style="padding: 20px; text-align: center; color: #2d3748;"><p style="font-size: 1.1em; margin: 10px 0;">' + t('simulator.no_results_title') + '</p><p style="font-size: 0.95em; margin: 10px 0;">' + t('simulator.no_results_text') + '</p></div>';
        }
        
        // Add audit section
        pdfHtml += '<div class="audit-section">';
        pdfHtml += '<h3>' + auditTitle + '</h3>';
        pdfHtml += '<p>' + auditText + '</p>';
        pdfHtml += '<p><strong>' + contactLabel + '</strong> <span style="color: #2563eb; font-weight: bold;">emmanuel.genesteix@agilevizion.com</span></p>';
        pdfHtml += '</div>';
        
        // Footer
        pdfHtml += '<div class="footer">';
        pdfHtml += '<p><strong>AgileVizion</strong> — Conseil GRC et Cybersécurité</p>';
        pdfHtml += '<p>emmanuel.genesteix@agilevizion.com | agilevizion.com</p>';
        pdfHtml += '</div>';
        
        // Close HTML
        printHtml += pdfHtml;
        printHtml += '</body></html>';
        
        // Create download link for HTML file
        var blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'AgileVizion_Diagnostic_' + company.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Also open print window for easy PDF save
        var printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printHtml);
            printWindow.document.close();
            
            // Wait for content to load, then trigger print
            setTimeout(function() {
                printWindow.focus();
                
                // Auto-trigger print
                setTimeout(function() {
                    printWindow.print();
                }, 500);
                
                // Show success message
                if (msgSuccess) {
                    msgSuccess.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>' + t('simulator.pdf_success') + ' <strong>Fichier HTML téléchargé !</strong> Utilisez Ctrl+P pour sauvegarder en PDF.</span>';
                    msgSuccess.classList.add('visible');
                }
                btn.innerHTML = orig;
                btn.disabled = false;
                checkPdfFormValid();
            }, 300);
        } else {
            // If popup blocked, still allow download
            if (msgSuccess) {
                msgSuccess.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>' + t('simulator.pdf_success') + ' <strong>Fichier HTML téléchargé !</strong> Ouvrez-le et utilisez Ctrl+P pour sauvegarder en PDF.</span>';
                msgSuccess.classList.add('visible');
            }
            btn.innerHTML = orig;
            btn.disabled = false;
            checkPdfFormValid();
        }

    } catch (e) {

        console.error('PDF error:', e);

        if (msgError) msgError.classList.add('visible');

        btn.innerHTML = orig;

        checkPdfFormValid();

    }

}

// ============================================

// CALENDLY

// ============================================

function openCalendly() {
    // Ensure Calendly is loaded, wait if necessary
    if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({ url: 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion' });
    } else {
        // If not loaded yet, wait and retry
        var checkCalendly = setInterval(function() {
            if (typeof Calendly !== 'undefined') {
                clearInterval(checkCalendly);
                Calendly.initPopupWidget({ url: 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion' });
            }
        }, 50);
        // Timeout after 3 seconds
        setTimeout(function() {
            clearInterval(checkCalendly);
        }, 3000);

    }

}
