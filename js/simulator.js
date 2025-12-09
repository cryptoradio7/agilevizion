/* Simulator Compliance - AgileVizion */

// ============================================

// DATA: Norms, Sectors, Profiles

// ============================================

var NORMS = {

    rgpd: { 

        name: 'RGPD', 

        fullName: 'Règlement Général sur la Protection des Données', 

        source: 'Règlement (UE) 2016/679', 

        sanctions: "Jusqu'à 20M€ ou 4% du CA annuel mondial (le montant le plus élevé)", 

        deadline: 'En vigueur depuis mai 2018', 

        isRegulation: true 

    },

    dora: { 

        name: 'DORA', 

        fullName: 'Digital Operational Resilience Act', 

        source: 'Règlement (UE) 2022/2554', 

        sanctions: "Astreintes périodiques + retrait d'agrément possible par l'autorité de supervision", 

        deadline: 'Applicable depuis le 17 janvier 2025', 

        isRegulation: true 

    },

    nis2: { 

        name: 'NIS 2', 

        fullName: 'Network and Information Security Directive', 

        source: 'Directive (UE) 2022/2555', 

        sanctions: "Entités Essentielles : jusqu'à 10M€ ou 2% CA | Entités Importantes : jusqu'à 7M€ ou 1,4% CA", 

        deadline: 'Transposition nationale depuis octobre 2024', 

        isRegulation: true 

    },

    pcidss: { 

        name: 'PCI-DSS', 

        fullName: 'Payment Card Industry Data Security Standard', 

        source: 'PCI-DSS v4.0 (PCI SSC)', 

        sanctions: "5K-10K$/mois (mois 1-3), 25-50K$/mois (mois 4-6), jusqu'à 100K$/mois au-delà + retrait capacité traitement cartes", 

        deadline: 'Version 4.0 obligatoire depuis mars 2025', 

        isRegulation: true 

    },

    hds: { 

        name: 'HDS', 

        fullName: 'Hébergeur de Données de Santé', 

        source: 'Code de la Santé Publique (Art. L1111-8)', 

        sanctions: "3 ans prison + 45 000€ (pers. physiques) / 225 000€ (pers. morales) + amendes CNIL jusqu'à 4% CA", 

        deadline: 'Certification obligatoire en vigueur', 

        isRegulation: true 

    },

    iso27001: { 

        name: 'ISO 27001', 

        fullName: "Système de Management de la Sécurité de l'Information", 

        source: 'ISO/IEC 27001:2022', 

        sanctions: "Perte de contrats, exclusion des appels d'offres, perte de confiance clients", 

        deadline: 'Certification volontaire (cycle 3 ans)', 

        isRegulation: false 

    },

    iso20000: { 

        name: 'ISO 20000', 

        fullName: 'Système de Management des Services IT', 

        source: 'ISO/IEC 20000-1:2018', 

        sanctions: 'Perte de différenciation commerciale, désavantage concurrentiel', 

        deadline: 'Certification volontaire', 

        isRegulation: false 

    },

    soc2: { 

        name: 'SOC 2', 

        fullName: 'Service Organization Control 2', 

        source: 'AICPA TSP Section 100', 

        sanctions: "Perte de clients US/internationaux, exclusion des processus d'achat Fortune 500", 

        deadline: 'Attestation annuelle volontaire', 

        isRegulation: false 

    },

    iso22301: { 

        name: 'ISO 22301', 

        fullName: "Système de Management de la Continuité d'Activité", 

        source: 'ISO 22301:2019', 

        sanctions: "Risque d'interruption prolongée, pertes financières, atteinte à la réputation", 

        deadline: 'Certification volontaire', 

        isRegulation: false 

    },

    cmmc: { 

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

    var a = state.answers;

    

    document.getElementById('profile-icon').textContent = p.icon;

    document.getElementById('profile-title').textContent = p.title;

    document.getElementById('profile-subtitle').textContent = p.subtitle;

    

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

    // RGPD

    if (a.q4_personal_data === 'yes' && (isEU || hasEUClients)) {

        results.rgpd = { 

            status: 'obligatoire', 

            why: "Traitement de données personnelles avec activité dans l'UE ou clients/utilisateurs UE" 

        };

    }

    // DORA

    if (isEU) {

        if (a.q5_regulated === 'yes' && SECTORS.DORA_FINANCE.indexOf(a.q2_sector) !== -1) {

            results.dora = { 

                status: 'obligatoire', 

                why: 'Entité financière UE détenant un agrément (AMF, ACPR, CSSF ou équivalent)' 

            };

        } else if (a.q7_tic_provider === 'yes') {

            results.dora = { 

                status: 'obligatoire', 

                why: 'Prestataire TIC critique fournissant des services à des entités financières UE régulées' 

            };

        }

    }

    // NIS 2

    if (isNIS2Sector && !isTooSmall) {

        if (isEU) {

            var cat = isLarge ? 'Entité Essentielle (EE)' : 'Entité Importante (EI)';

            results.nis2 = { 

                status: 'obligatoire', 

                why: 'Secteur ' + (isAnnex1 ? 'Annexe I (hautement critique)' : 'Annexe II (critique)') + ' + Taille suffisante (≥50 employés OU ≥10M€ CA OU ≥10M€ bilan) + Siège UE → Classifié ' + cat 

            };

        } else if (hasEUClients && isNIS2Extraterritorial) {

            results.nis2 = { 

                status: 'obligatoire', 

                why: "Effet extraterritorial NIS 2 (Art. 26) : entité hors UE fournissant des services à des clients/utilisateurs UE. Secteurs concernés : Infrastructure numérique, Services TIC B2B, Fournisseurs numériques.",

                extraterritorial: true

            };

        }

    }

    // PCI-DSS

    if (a.q9_pci === 'yes') {

        results.pcidss = { 

            status: 'obligatoire', 

            why: 'Stockage, traitement ou transmission de numéros de cartes bancaires (PAN)' 

        };

    }

    // HDS

    if (a.q8_hds === 'yes' && (isEU || hasEUClients)) {

        results.hds = { 

            status: 'obligatoire', 

            why: 'Hébergement de données de santé à caractère personnel pour le compte de tiers (clients)' 

        };

    }

    // ISO 27001

    if (a.q10a_us_certs === 'iso27001' || a.q10a_us_certs === 'both') {

        results.iso27001 = { 

            status: 'obligatoire', 

            why: 'Certification exigée contractuellement par vos clients' 

        };

    } else if (!isTooSmall) {

        results.iso27001 = { 

            status: 'recommande', 

            why: "Standard international de référence pour la sécurité de l'information — valorisé par les grands comptes" 

        };

    }

    // ISO 20000

    if (a.q6_it_services === 'yes') {

        results.iso20000 = { 

            status: 'recommande', 

            why: 'Prestataire de services IT/Cloud — certification différenciante pour la gestion des services' 

        };

    }

    // SOC 2

    if (a.q10a_us_certs === 'soc2' || a.q10a_us_certs === 'both') {

        results.soc2 = { 

            status: 'obligatoire', 

            why: 'Attestation exigée par vos clients US' 

        };

    } else if (a.q10_us_activity === 'yes' && (SECTORS.IT_CLOUD.indexOf(a.q2_sector) !== -1 || a.q6_it_services === 'yes')) {

        results.soc2 = { 

            status: 'recommande', 

            why: 'Standard attendu par les clients américains pour les fournisseurs SaaS/Cloud' 

        };

    }

    // ISO 22301

    if (a.q11_continuity === 'yes' || SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1 || results.dora || results.nis2) {

        var iso22301Why = '';

        if (results.dora && results.nis2) {

            iso22301Why = "Exigence réglementaire DORA + NIS 2 (Art. 21) — un plan de continuité d'activité est obligatoire";

        } else if (results.dora) {

            iso22301Why = "Exigence réglementaire DORA — un plan de continuité d'activité est obligatoire";

        } else if (results.nis2) {

            iso22301Why = "Exigence réglementaire NIS 2 (Art. 21) — un plan de continuité d'activité est obligatoire";

        } else if (SECTORS.CRITICAL.indexOf(a.q2_sector) !== -1) {

            iso22301Why = "Secteur critique — plan de continuité fortement recommandé";

        } else {

            iso22301Why = "Activités critiques identifiées — plan de continuité recommandé";

        }

        results.iso22301 = { status: 'recommande', why: iso22301Why };

    }

    // CMMC

    if (a.q10b_dod === 'yes') {

        results.cmmc = { 

            status: 'obligatoire', 

            why: 'Contrats directs ou sous-traitance avec le Département de la Défense US (DoD)' 

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

    

    var t = window.I18n && window.I18n.t ? window.I18n.t.bind(window.I18n) : function(key) { return key; };
    
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

        html = '<div class="no-results"><i class="fa-solid fa-clipboard-question"></i><h4>Aucune réglementation spécifique identifiée</h4><p>Sur la base de vos réponses, nous n\'avons pas identifié de réglementation obligatoire, si l\'on se réfère à notre liste non exhaustive de référence.</p></div>';

    }

    document.getElementById('results-container').innerHTML = html;

    document.getElementById('results-section').classList.add('visible');

}

function buildNormCard(norm, status) {

    var isMandatory = status === 'obligatoire';
    var t = window.I18n && window.I18n.t ? window.I18n.t.bind(window.I18n) : function(key) { return key; };
    var sanctionLabel = norm.isRegulation ? t('simulator.sanctions') : t('simulator.risks');
    var sanctionClass = norm.isRegulation ? 'sanction' : 'risk';

    

    var noteHtml = '';

    if (norm.key === 'nis2' && norm.extraterritorial) {

        noteHtml = '<div class="norm-note warning"><i class="fa-solid fa-globe"></i> <strong>Secteurs concernés par l\'effet extraterritorial NIS 2 :</strong> (1) Infrastructure numérique (IXP, DNS, TLD, datacenters), (2) Services TIC B2B (MSP, MSSP, infogérance), (3) Fournisseurs numériques (marketplaces, moteurs de recherche, réseaux sociaux). Les autres secteurs hors UE avec clients UE ne sont PAS soumis à NIS 2. Obligation de désigner un représentant dans l\'UE.</div>';

    }

    

    return '<div class="norm-card ' + (isMandatory ? 'mandatory' : 'recommended') + '">' +

        '<div class="norm-header"><div><span class="norm-name">' + norm.name + '</span><span class="norm-fullname"> — ' + norm.fullName + '</span></div>' +

        '<span class="norm-badge ' + status + '">' + (isMandatory ? "S'APPLIQUE" : 'RECOMMANDÉ') + '</span></div>' +

        '<div class="norm-why"><i class="fa-solid fa-check"></i> ' + norm.why + '</div>' +

        '<div class="norm-details">' +

        '<div class="norm-detail ' + sanctionClass + '"><i class="fa-solid fa-triangle-exclamation"></i> <strong>' + sanctionLabel + ' :</strong> ' + norm.sanctions + '</div>' +

        '<div class="norm-detail deadline"><i class="fa-solid fa-calendar"></i> <strong>Échéance :</strong> ' + norm.deadline + '</div>' +

        '<div class="norm-detail"><i class="fa-solid fa-book"></i> <strong>Réf. :</strong> ' + norm.source + '</div></div>' +

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

        var t = window.I18n && window.I18n.t ? window.I18n.t.bind(window.I18n) : function(key) { return key; };
        var profileLabel = t('simulator.profile_label');
        var resultLabel = t('simulator.result_label');
        var regsText = mandatory.length + ' ' + t('simulator.regulations_applicable');
        var recsText = recommended.length + ' ' + t('simulator.recommendations_count');
        var pdfHtml = '<div class="pdf-profile" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #1a202c; font-size: 1em;"><strong style="color: #1a202c;">' + p.icon + ' ' + profileLabel + '</strong> <span style="color: #1a202c;">' + p.title + '</span><br><strong style="color: #1a202c;">' + resultLabel + '</strong> <span style="color: #1a202c;">' + regsText + ', ' + recsText + '</span></div>';

        if (mandatory.length > 0) {

            pdfHtml += '<h3 style="color:#27ae60;margin:20px 0 10px;border-bottom:2px solid #27ae60;padding-bottom:5px;">' + t('simulator.mandatory_title').toUpperCase() + ' (' + mandatory.length + ')</h3>';

            mandatory.forEach(function(n) {

                var label = n.isRegulation ? t('simulator.sanctions') : t('simulator.risks');
                var whyText = t('simulator.why');
                var deadlineText = t('simulator.deadline');

                pdfHtml += '<div class="pdf-norm mandatory" style="padding: 15px; margin: 12px 0; border-left: 4px solid #27ae60; background: #f8f9fa; border-radius: 0 8px 8px 0; color: #1a202c;"><h4 style="color: #1e8449; margin: 0 0 8px; font-size: 1.1em; font-weight: bold;">' + n.name + ' — ' + n.fullName + '</h4><p style="color: #2d3748; margin: 5px 0; font-size: 0.95em;"><strong style="color: #2d3748;">' + whyText + ' :</strong> <span style="color: #2d3748;">' + n.why + '</span></p><p style="color: #2d3748; margin: 5px 0; font-size: 0.95em;"><strong style="color: #2d3748;">' + deadlineText + ' :</strong> <span style="color: #2d3748;">' + n.deadline + '</span></p><p style="color: #c53030; margin: 5px 0; font-size: 0.95em;"><strong style="color: #c53030;">' + label + ' :</strong> <span style="color: #c53030;">' + n.sanctions + '</span></p></div>';

            });

        }

        

        if (recommended.length > 0) {

            pdfHtml += '<h3 style="color:#2563eb;margin:20px 0 10px;border-bottom:2px solid #2563eb;padding-bottom:5px;">' + t('simulator.recommended_title').toUpperCase() + ' (' + recommended.length + ')</h3>';

            recommended.forEach(function(n) {

                var whyText = t('simulator.why');

                pdfHtml += '<div class="pdf-norm recommended" style="padding: 15px; margin: 12px 0; border-left: 4px solid #2563eb; background: #f8f9fa; border-radius: 0 8px 8px 0; color: #1a202c;"><h4 style="color: #2563eb; margin: 0 0 8px; font-size: 1.1em; font-weight: bold;">' + n.name + ' — ' + n.fullName + '</h4><p style="color: #2d3748; margin: 5px 0; font-size: 0.95em;"><strong style="color: #2d3748;">' + whyText + ' :</strong> <span style="color: #2d3748;">' + n.why + '</span></p></div>';

            });

        }

        document.getElementById('pdf-company').textContent = company;

        document.getElementById('pdf-email').textContent = email;

        document.getElementById('pdf-date').textContent = new Date().toLocaleDateString('fr-FR');

        document.getElementById('pdf-results').innerHTML = pdfHtml;

        var pdfEl = document.getElementById('pdf-template');
        
        // Verify content is injected
        var resultsDiv = document.getElementById('pdf-results');
        if (!resultsDiv || !resultsDiv.innerHTML || resultsDiv.innerHTML.trim() === '') {
            console.error('PDF content is empty!');
            if (msgError) msgError.classList.add('visible');
            btn.innerHTML = orig;
            return;
        }

        // Make template visible but off-screen
        var originalDisplay = pdfEl.style.display;
        var originalPosition = pdfEl.style.position;
        var originalLeft = pdfEl.style.left;
        var originalTop = pdfEl.style.top;
        var originalZIndex = pdfEl.style.zIndex;
        
        pdfEl.style.display = 'block';
        pdfEl.style.position = 'absolute';
        pdfEl.style.left = '-10000px';
        pdfEl.style.top = '0';
        pdfEl.style.width = '794px'; // A4 width in pixels
        pdfEl.style.backgroundColor = '#ffffff';
        pdfEl.style.color = '#1a202c';
        pdfEl.style.zIndex = '10000';

        // Force reflow
        var height = pdfEl.offsetHeight;
        console.log('PDF template height:', height);
        console.log('PDF results content length:', resultsDiv.innerHTML.length);
        
        // Wait for rendering
        setTimeout(function() {
            html2pdf().set({ 

            margin: 10, 

            filename: 'AgileVizion_Diagnostic_' + company.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf', 

            image: { type: 'jpeg', quality: 0.98 }, 

            html2canvas: { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: true,
                letterRendering: true,
                allowTaint: false
            }, 

            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 

            }).from(pdfEl).save().then(function() {
                // Restore original styles
                pdfEl.style.display = originalDisplay;
                pdfEl.style.position = originalPosition;
                pdfEl.style.left = originalLeft;
                pdfEl.style.top = originalTop;
                pdfEl.style.zIndex = originalZIndex;

                if (msgSuccess) msgSuccess.classList.add('visible');

                btn.innerHTML = orig;

                checkPdfFormValid();

            }).catch(function(err) {
                console.error('PDF error:', err);
                console.error('Error details:', err.message, err.stack);
                
                // Restore original styles
                pdfEl.style.display = originalDisplay;
                pdfEl.style.position = originalPosition;
                pdfEl.style.left = originalLeft;
                pdfEl.style.top = originalTop;
                pdfEl.style.zIndex = originalZIndex;

                if (msgError) msgError.classList.add('visible');

                btn.innerHTML = orig;

                checkPdfFormValid();

            });
        }, 300); // Delay to ensure DOM is fully updated

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

    if (typeof Calendly !== 'undefined') {

        Calendly.initPopupWidget({ url: 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion' });

    }

}
