// js/form-script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors (bovenaan voor duidelijkheid) ---
    const menuToggleForm = document.querySelector('header#mainHeader .menu-toggle');
    const mainNavForm = document.querySelector('header#mainHeader nav#mainNavMenuForm');
    const duurBouwMaandenInput = document.getElementById('duurBouwMaanden');
    const formElement = document.getElementById('carOfferteForm');
    const progressBar = document.getElementById('progressBar');
    const progressLine = document.getElementById('progressLine');
    const steps = Array.from(document.querySelectorAll('.form-step')); // Gevuld bij DOM load
    const stepIndicators = []; // Wordt gevuld door initializeProgressBar
    let currentStep = 0; // Default start step

    // Console logs voor initiële staat
    console.log('DOMContentLoaded: Initial currentStep:', currentStep);
    console.log('DOMContentLoaded: Number of steps found:', steps.length);
    console.log('DOMContentLoaded: progressBar element:', progressBar);
    console.log('DOMContentLoaded: progressLine element:', progressLine);


    // --- Mobile Menu ---
    if (menuToggleForm && mainNavForm) {
        menuToggleForm.addEventListener('click', () => {
            const isOpen = mainNavForm.classList.toggle('menu-open');
            menuToggleForm.classList.toggle('active');
            menuToggleForm.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('menu-is-open', isOpen);
        });

        const navLinksMobileForm = mainNavForm.querySelectorAll('a');
        navLinksMobileForm.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNavForm.classList.contains('menu-open')) {
                    mainNavForm.classList.remove('menu-open');
                    menuToggleForm.classList.remove('active');
                    menuToggleForm.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('menu-is-open');
                }
            });
        });
    }

    // --- BTW Field Toggle ---
    function toggleBtwField(aanvragerType) {
        const btwField = document.getElementById('btwField');
        if (btwField) {
            const btwRadios = btwField.querySelectorAll('input[name="btw"]');
            if (aanvragerType === 'zakelijk') {
                btwField.style.display = 'block';
                btwRadios.forEach(rb => rb.required = true);
            } else if (aanvragerType === 'particulier') {
                btwField.style.display = 'none';
                btwRadios.forEach(rb => {
                    rb.checked = false;
                    rb.required = false;
                });
            } else {
                btwField.style.display = 'block'; // Default to show
                btwRadios.forEach(rb => rb.required = (btwField.style.display === 'block'));
            }
        }
    }

    // Event listener voor aanvragerType is prima hier, want toggleAanvragerType handelt de rest af.
    document.querySelectorAll('input[name="aanvragerType"]').forEach(radio => {
        radio.addEventListener('change', function () {
            // toggleBtwField(this.value); // Wordt nu aangeroepen vanuit toggleAanvragerType
            toggleAanvragerType(this.value);
        });
    });

    // --- Duur Bouw Waarschuwing ---
    if (duurBouwMaandenInput) {
        duurBouwMaandenInput.addEventListener('input', function () {
            const waarschuwing = document.querySelector('.duurBouwWaarschuwing');
            if (waarschuwing) {
                waarschuwing.style.display = parseInt(this.value, 10) > 12 ? 'block' : 'none';
            }
        });
    }

    // --- FUNCTIES VOOR STAP 1 & UBO ---
    window.toggleAanvragerType = function(type) {
        console.log('toggleAanvragerType CALLED with type:', type);
        const zakelijkContainer = document.getElementById('zakelijkFieldsContainer');
        const particulierContainer = document.getElementById('particulierFieldsContainer');
        
        const zakelijkFieldsQuery = zakelijkContainer ? zakelijkContainer.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea') : [];
        const particulierFieldsQuery = particulierContainer ? particulierContainer.querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea') : [];

        if (type === 'zakelijk') {
            if(zakelijkContainer) zakelijkContainer.style.display = 'block';
            if(particulierContainer) particulierContainer.style.display = 'none';
            setFieldsRequired(zakelijkFieldsQuery, true, zakelijkContainer);
            setFieldsRequired(particulierFieldsQuery, false, particulierContainer);
            checkRechtsvormForUbo();
        } else if (type === 'particulier') {
            if(zakelijkContainer) zakelijkContainer.style.display = 'none';
            if(particulierContainer) particulierContainer.style.display = 'block';
            setFieldsRequired(zakelijkFieldsQuery, false, zakelijkContainer);
            setFieldsRequired(particulierFieldsQuery, true, particulierContainer);
            
            const uboSectieStap1 = document.getElementById('uboSectieStap1');
            if (uboSectieStap1) uboSectieStap1.style.display = 'none';
            setFieldsRequiredForUBOSectie(false);
        } else {
            if(zakelijkContainer) zakelijkContainer.style.display = 'none';
            if(particulierContainer) particulierContainer.style.display = 'none';
            const uboSectieStap1 = document.getElementById('uboSectieStap1');
            if (uboSectieStap1) uboSectieStap1.style.display = 'none';
            setFieldsRequired(zakelijkFieldsQuery, false, zakelijkContainer);
            setFieldsRequired(particulierFieldsQuery, false, particulierContainer);
            setFieldsRequiredForUBOSectie(false);
        }
        toggleBtwField(type); // Ensure BTW field is also updated
    }

    window.checkRechtsvormForUbo = function() {
        const rechtsvormSelect = document.getElementById('rechtsvorm');
        const uboSectieStap1 = document.getElementById('uboSectieStap1');
        const aanvragerParticulierChecked = document.getElementById('aanvragerTypeParticulier')?.checked;
        console.log('checkRechtsvormForUbo CALLED. Rechtsvorm value:', rechtsvormSelect ? rechtsvormSelect.value : 'N/A', 'Particulier checked:', aanvragerParticulierChecked);

        if (!rechtsvormSelect || !uboSectieStap1 || aanvragerParticulierChecked) {
            if (uboSectieStap1) uboSectieStap1.style.display = 'none';
            setFieldsRequiredForUBOSectie(false);
            console.log('UBO section hidden (no select, no section, or particulier).');
            return;
        }
        const gekozenRechtsvorm = rechtsvormSelect.value;
        const uboPlichtigeRechtsvormen = ['bv', 'vof', 'nv', 'cv', 'maatschap', 'stichting', 'vereniging', 'anders']; 
        if (uboPlichtigeRechtsvormen.includes(gekozenRechtsvorm)) {
            uboSectieStap1.style.display = 'block';
            setFieldsRequiredForUBOSectie(true);
            console.log('UBO section SHOWN for rechtsvorm:', gekozenRechtsvorm);
        } else {
            uboSectieStap1.style.display = 'none';
            setFieldsRequiredForUBOSectie(false);
            console.log('UBO section HIDDEN for rechtsvorm:', gekozenRechtsvorm);
        }
    }

    function setFieldsRequired(fields, shouldBeActive, container) {
        if (!container || !fields) return;
        fields.forEach(field => {
            const isContainerVisible = container.style.display === 'block';
            field.disabled = !isContainerVisible || !shouldBeActive; // Disable if container hidden OR not supposed to be active
            let isMarkedAsRequired = false;
            const label = field.closest('.form-group')?.querySelector(`label[for="${field.id}"]`) || document.querySelector(`label[for="${field.id}"]`);
            if (label && label.querySelector('.asterisk')) isMarkedAsRequired = true;
            if (field.type === 'radio') {
                const radioGroup = field.closest('.form-group');
                const groupLabel = radioGroup?.querySelector('label:not(.radio-label)');
                if (groupLabel && groupLabel.querySelector('.asterisk')) isMarkedAsRequired = true;
            }
            field.required = isContainerVisible && shouldBeActive && isMarkedAsRequired;
        });
    }

    function setFieldsRequiredForUBOSectie(makeRequired) {
        const uboContainer = document.getElementById('ubo-forms-container');
        if (!uboContainer) return;
        const uboSectieStap1 = document.getElementById('uboSectieStap1');
        const isUboSectionVisible = uboSectieStap1 && uboSectieStap1.style.display === 'block';
        const uboVelden = uboContainer.querySelectorAll('input:not([type="button"]), select, textarea');
        uboVelden.forEach(field => {
            field.disabled = !isUboSectionVisible;
            let isMarkedAsRequired = false;
            const label = field.closest('.form-group, .form-row')?.querySelector(`label[for="${field.id}"]`);
            if (label && label.querySelector('.asterisk')) isMarkedAsRequired = true;
            if (field.type === 'radio' && field.name.startsWith('ubo') && field.name.endsWith('_type')) isMarkedAsRequired = true; 
            field.required = isUboSectionVisible && makeRequired && isMarkedAsRequired;
            if (!isUboSectionVisible || !makeRequired) { // Clear if section becomes hidden or fields not required
                if (field.type === 'radio' || field.type === 'checkbox') field.checked = false;
                else if (field.tagName === 'SELECT') field.selectedIndex = 0;
                else if (field.type !== 'button') field.value = '';
            }
        });
    }

    window.UBOtoevoegen = function() {
        const uboSectieStap1 = document.getElementById('uboSectieStap1');
        if (!uboSectieStap1 || uboSectieStap1.style.display === 'none') return;
        const uboContainer = document.getElementById('ubo-forms-container');
        if (!uboContainer) return;
        const existingUbos = uboContainer.querySelectorAll('.ubo-section');
        const nextUboNumber = existingUbos.length + 1;
        if (nextUboNumber > 10) { alert("U kunt maximaal 10 UBO-secties toevoegen."); return; }
        const templateHtml = `<div class="ubo-section" data-ubo-index="${nextUboNumber}"><h4>UBO ${nextUboNumber} / Statutair Bestuurder ${nextUboNumber}</h4><div class="form-row"><div class="form-group"><label for="ubo${nextUboNumber}_voornamen">Volledige voornamen<span class="asterisk"></span></label><input type="text" id="ubo${nextUboNumber}_voornamen" name="ubo${nextUboNumber}_voornamen"></div><div class="form-group" style="flex: 0.5;"><label for="ubo${nextUboNumber}_tussenvoegsel">Tussenvoegsel(s)</label><input type="text" id="ubo${nextUboNumber}_tussenvoegsel" name="ubo${nextUboNumber}_tussenvoegsel"></div></div><div class="form-group"><label for="ubo${nextUboNumber}_achternaam">Eigen achternaam<span class="asterisk"></span></label><input type="text" id="ubo${nextUboNumber}_achternaam" name="ubo${nextUboNumber}_achternaam"></div><div class="form-row"><div class="form-group"><label for="ubo${nextUboNumber}_geboortedatum">Geboortedatum<span class="asterisk"></span></label><input type="date" id="ubo${nextUboNumber}_geboortedatum" name="ubo${nextUboNumber}_geboortedatum"></div><div class="form-group"><label for="ubo${nextUboNumber}_woonland">Woonland<span class="asterisk"></span></label><input type="text" id="ubo${nextUboNumber}_woonland" name="ubo${nextUboNumber}_woonland"></div></div><div class="form-group"><label>Type UBO<span class="asterisk">*</span></label><div class="radio-group"><div><input type="radio" id="ubo${nextUboNumber}_type_eigendom" name="ubo${nextUboNumber}_type" value="eigendom"><label for="ubo${nextUboNumber}_type_eigendom" class="radio-label">Op basis van eigendom</label></div><div><input type="radio" id="ubo${nextUboNumber}_type_zeggenschap" name="ubo${nextUboNumber}_type" value="zeggenschap"><label for="ubo${nextUboNumber}_type_zeggenschap" class="radio-label">Op basis van zeggenschap</label></div><div><input type="radio" id="ubo${nextUboNumber}_type_statutair" name="ubo${nextUboNumber}_type" value="statutair"><label for="ubo${nextUboNumber}_type_statutair" class="radio-label">Op basis van (statutair) bestuur</label></div></div></div><div class="form-group"><label for="ubo${nextUboNumber}_adres">Volledige adres<span class="asterisk">*</span></label><input type="text" id="ubo${nextUboNumber}_adres" name="ubo${nextUboNumber}_adres" placeholder="Straatnaam Huisnr, Postcode Plaats"></div><button type="button" onclick="verwijderUBO(this)" class="remove-ubo-button">Verwijder UBO ${nextUboNumber}</button></div>`;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = templateHtml.trim(); 
        const newUboElement = tempDiv.firstElementChild;
        if (nextUboNumber > 1) { 
            const hrSeparator = document.createElement('hr');
            hrSeparator.style.margin = '25px 0'; hrSeparator.style.borderColor = '#eee'; hrSeparator.classList.add('ubo-separator');
            uboContainer.appendChild(hrSeparator);
        }
        uboContainer.appendChild(newUboElement);
        setFieldsRequiredForUBOSectie(true);
        newUboElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const firstInput = newUboElement.querySelector('input[type="text"], input[type="date"]');
        if (firstInput) firstInput.focus();
    }

    window.verwijderUBO = function(buttonElement) {
        const uboSection = buttonElement.closest('.ubo-section');
        if (uboSection && confirm('Weet je zeker dat je deze UBO wilt verwijderen?')) {
            const prevElement = uboSection.previousElementSibling;
            uboSection.remove();
            if (prevElement && prevElement.tagName === 'HR' && prevElement.classList.contains('ubo-separator')) {
                prevElement.remove();
            }
            hernummerUbos();
        }
    }

    function hernummerUbos() {
        const uboContainer = document.getElementById('ubo-forms-container');
        if (!uboContainer) return;
        const existingUbos = uboContainer.querySelectorAll('.ubo-section');
        existingUbos.forEach((uboElement, index) => {
            const currentNumber = index + 1;
            uboElement.dataset.uboIndex = currentNumber; 
            const h4 = uboElement.querySelector('h4');
            if (h4) h4.textContent = `UBO ${currentNumber} / Statutair Bestuurder ${currentNumber}`;
            const fields = uboElement.querySelectorAll('[id*="ubo"], [name*="ubo"], [for*="ubo"]');
            const oldPrefixRegex = new RegExp(`ubo\\d+_`, 'g');
            const oldIdNumRegex = new RegExp(`ubo\\d+(_type_eigendom|_type_zeggenschap|_type_statutair)`, 'g');
            const newPrefix = `ubo${currentNumber}_`;
            fields.forEach(field => {
                if (field.id)   field.id = field.id.replace(oldPrefixRegex, newPrefix).replace(oldIdNumRegex, `ubo${currentNumber}$1`);
                if (field.name) field.name = field.name.replace(oldPrefixRegex, newPrefix);
                if (field.htmlFor) field.htmlFor = field.htmlFor.replace(oldPrefixRegex, newPrefix).replace(oldIdNumRegex, `ubo${currentNumber}$1`);
            });
            const removeButton = uboElement.querySelector('.remove-ubo-button');
            if (removeButton) removeButton.textContent = `Verwijder UBO ${currentNumber}`;
        });
        const uboSectieStap1 = document.getElementById('uboSectieStap1');
        if (uboSectieStap1 && uboSectieStap1.style.display === 'block') {
             setFieldsRequiredForUBOSectie(true);
        }
    }

    // --- Aannemer Functies ---
    let aannemerCount = 1; 
    window.AannemerToevoegen = function() {
        const container = document.getElementById('aannemer-forms-container');
        if (!container) return;
        const existingAannemers = container.querySelectorAll('.aannemer-section');
        aannemerCount = existingAannemers.length + 1;
        if (aannemerCount > 5) { alert("U kunt maximaal 5 aannemers opgeven."); return; }
        const newIdPrefix = `aannemer${aannemerCount}_`;
        const newAvbDetailsId = `${newIdPrefix}avbDetails`;
        const newSection = document.createElement('div');
        newSection.classList.add('aannemer-section');
        newSection.dataset.aannemerIndex = aannemerCount; 
        newSection.innerHTML = `<h4>Aannemer ${aannemerCount}</h4><div class="form-group"><label for="${newIdPrefix}naam">Naam van de aannemer<span class="asterisk">*</span></label><input type="text" id="${newIdPrefix}naam" name="${newIdPrefix}naam"></div><div class="form-group"><label for="${newIdPrefix}adres">Adresgegevens aannemer<span class="asterisk">*</span></label><input type="text" id="${newIdPrefix}adres" name="${newIdPrefix}adres" placeholder="Straat Huisnr, Postcode Plaats"></div><div class="form-group"><label for="${newIdPrefix}telefoon">Telefoonnummer aannemer</label><input type="tel" id="${newIdPrefix}telefoon" name="${newIdPrefix}telefoon"></div><div class="form-group"><label>Heeft deze aannemer een Bedrijfsaansprakelijkheidsverzekering (AVB)?<span class="asterisk">*</span></label><div class="radio-group"><div><input type="radio" id="${newIdPrefix}avb_ja" name="${newIdPrefix}avb" value="ja" onclick="toggleConditional('${newAvbDetailsId}', true)"><label for="${newIdPrefix}avb_ja" class="radio-label">Ja</label></div><div><input type="radio" id="${newIdPrefix}avb_nee" name="${newIdPrefix}avb" value="nee" onclick="toggleConditional('${newAvbDetailsId}', false)" checked><label for="${newIdPrefix}avb_nee" class="radio-label">Nee</label></div></div></div><div id="${newAvbDetailsId}" class="conditional-section"><div class="form-group"><label for="${newIdPrefix}avb_maatschappij">Bij welke maatschappij?</label><input type="text" id="${newIdPrefix}avb_maatschappij" name="${newIdPrefix}avb_maatschappij"></div><div class="form-group"><label for="${newIdPrefix}avb_polisnr">Polisnummer</label><input type="text" id="${newIdPrefix}avb_polisnr" name="${newIdPrefix}avb_polisnr"></div><div class="form-row"><div class="form-group"><label for="${newIdPrefix}avb_bedrag">Verzekerd bedrag</label><div class="input-group"><span class="currency-symbol">€</span><input type="number" id="${newIdPrefix}avb_bedrag" name="${newIdPrefix}avb_bedrag" step="any"></div></div><div class="form-group"><label for="${newIdPrefix}avb_eigenrisico">Eigen risico p.g.</label><div class="input-group"><span class="currency-symbol">€</span><input type="number" id="${newIdPrefix}avb_eigenrisico" name="${newIdPrefix}avb_eigenrisico" step="any"></div></div></div></div><button type="button" class="remove-aannemer-button" onclick="verwijderAannemer(this)">Verwijder Aannemer ${aannemerCount}</button>`;
        container.appendChild(newSection);
        toggleConditional(newAvbDetailsId, false);
        const aannemerContainer = document.getElementById('aannemerDetailsContainer');
        setRequiredForAannemerSection(newSection, aannemerContainer && aannemerContainer.style.display === 'block');
        const firstInput = newSection.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
        newSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    window.verwijderAannemer = function(buttonElement) {
        const sectionToRemove = buttonElement.closest('.aannemer-section');
        if (sectionToRemove) { sectionToRemove.remove(); hernummerAannemers(); }
    }
    function hernummerAannemers() {
        const container = document.getElementById('aannemer-forms-container');
        if (!container) return;
        const sections = container.querySelectorAll('.aannemer-section');
        aannemerCount = sections.length;
        sections.forEach((section, index) => {
            const newNumber = index + 1;
            const oldPrefixRegex = /aannemer\d+_/g;
            const newPrefix = `aannemer${newNumber}_`;
            const newAvbDetailsId = `${newPrefix}avbDetails`;
            section.dataset.aannemerIndex = newNumber;
            const h4 = section.querySelector('h4');
            if (h4) h4.textContent = `Aannemer ${newNumber}`;
            section.querySelectorAll('[id], [name], [for]').forEach(el => {
                if (el.id && el.id.match(oldPrefixRegex)) el.id = el.id.replace(oldPrefixRegex, newPrefix);
                if (el.name && el.name.match(oldPrefixRegex)) el.name = el.name.replace(oldPrefixRegex, newPrefix);
                if (el.htmlFor && el.htmlFor.match(oldPrefixRegex)) el.htmlFor = el.htmlFor.replace(oldPrefixRegex, newPrefix);
            });
            const avbJaRadio = section.querySelector(`input[id^="${newPrefix}avb_ja"]`);
            if (avbJaRadio) avbJaRadio.setAttribute('onclick', `toggleConditional('${newAvbDetailsId}', true)`);
            const avbNeeRadio = section.querySelector(`input[id^="${newPrefix}avb_nee"]`);
            if (avbNeeRadio) avbNeeRadio.setAttribute('onclick', `toggleConditional('${newAvbDetailsId}', false)`);
            const removeButton = section.querySelector('.remove-aannemer-button');
            if (removeButton) removeButton.textContent = `Verwijder Aannemer ${newNumber}`;
        });
        if (sections.length === 0 && document.getElementById('aannemerDetailsContainer')?.style.display === 'block') {
             AannemerToevoegen(); 
        }
    }
    function setRequiredForAannemerSection(sectionElement, required) {
        const inputs = sectionElement.querySelectorAll('input[name^="aannemer"], select[name^="aannemer"], textarea[name^="aannemer"]');
        const isAannemerContainerVisible = document.getElementById('aannemerDetailsContainer')?.style.display === 'block';
        inputs.forEach(input => {
            input.disabled = !isAannemerContainerVisible || !required; // Disable if main container hidden OR section not meant to be active
            const label = sectionElement.querySelector(`label[for="${input.id}"]`);
            let isMarkedAsRequired = label && label.querySelector('.asterisk');
            if (input.name.endsWith('_avb') && isAannemerContainerVisible) isMarkedAsRequired = true; 
            input.required = isAannemerContainerVisible && required && isMarkedAsRequired;
        });
    }

    // --- Multi-Step Form Logic ---
    function initializeProgressBar() {
        console.log('initializeProgressBar CALLED');
        if (!progressBar || steps.length === 0) {
            console.warn('Progress bar of stappen niet gevonden voor initialisatie.');
            return;
        }
        // Verwijder bestaande stappen uit DOM en array voordat opnieuw wordt geïnitialiseerd
        while (stepIndicators.length > 0) {
            const indicator = stepIndicators.pop();
            if (indicator.parentNode) { // Alleen verwijderen als het nog in de DOM is
                indicator.parentNode.removeChild(indicator);
            }
        }
        // Verwijder ook direct uit DOM voor het geval ze niet in de array zaten
        const existingStepDivs = progressBar.querySelectorAll('.progress-step');
        existingStepDivs.forEach(div => div.remove());

        steps.forEach((step, index) => {
            const stepIndicator = document.createElement('div');
            stepIndicator.classList.add('progress-step');
            const stepNumberSpan = document.createElement('span');
            stepNumberSpan.classList.add('step-number');
            stepNumberSpan.textContent = index + 1;
            stepIndicator.appendChild(stepNumberSpan);
            const stepName = step.dataset.stepName || `Stap ${index + 1}`;
            const tooltip = document.createElement('span');
            tooltip.classList.add('tooltip-text');
            tooltip.textContent = stepName;
            stepIndicator.appendChild(tooltip);
            console.log('Appending stepIndicator:', stepIndicator, 'to progressBar:', progressBar);
            progressBar.appendChild(stepIndicator); // progressBar moet hier bestaan
            stepIndicators.push(stepIndicator);
        });
        updateProgressBar();
    }

    function updateProgressBar() {
        console.log('updateProgressBar CALLED. currentStep:', currentStep, 'stepIndicators count:', stepIndicators.length);
        if (!progressBar || stepIndicators.length === 0) {
            console.warn('updateProgressBar: progressBar niet gevonden of geen stepIndicators.');
            return;
        }
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            const stepNumberElement = indicator.querySelector('.step-number');
            if (stepNumberElement) stepNumberElement.style.display = 'inline-block';
            indicator.style.backgroundColor = ''; // Laat CSS de default afhandelen
            if (index === currentStep) indicator.classList.add('active');
            if (index < currentStep) {
                indicator.classList.add('completed');
                if (stepNumberElement) stepNumberElement.style.display = 'none';
            }
        });
        const progressPercentage = (steps.length > 1) ? (currentStep / (steps.length - 1)) * 100 : 0;
        console.log('Progress percentage:', progressPercentage);
        if(progressLine) {
            progressLine.style.width = `${progressPercentage}%`;
        } else {
            console.warn('progressLine niet gevonden in updateProgressBar');
        }
    }

    function showStep(stepIndex) {
        console.log('showStep CALLED for stepIndex:', stepIndex);
        if (stepIndex < 0 || stepIndex >= steps.length) {
            console.warn('Ongeldige stepIndex voor showStep:', stepIndex);
            return;
        }
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        if (progressBar) {
             const headerHeight = document.getElementById('mainHeader')?.offsetHeight || 60; // Fallback hoogte
             window.scrollTo({ top: progressBar.offsetTop - headerHeight - 10, behavior: 'smooth' }); // 10px extra marge
        }
        updateProgressBar();
    }
    
    function isFieldEffectivelyVisible(field) {
        if (field.disabled) return false;
        const conditionalParent = field.closest('.conditional-section');
        if (conditionalParent && window.getComputedStyle(conditionalParent).display === 'none') return false;
        const mainContainersIds = ['zakelijkFieldsContainer', 'particulierFieldsContainer', 'uboSectieStap1', 'aannemerDetailsContainer'];
        for (const id of mainContainersIds) {
            const container = document.getElementById(id);
            if (container && container.contains(field) && window.getComputedStyle(container).display === 'none') return false;
        }
        if (field.classList.contains('inline-text-input') && !field.classList.contains('visible')) return false;
        const parentInputGroup = field.parentElement;
        if (parentInputGroup && parentInputGroup.classList.contains('input-group') && parentInputGroup.id && parentInputGroup.id.startsWith('anders_') && parentInputGroup.id.endsWith('_input')) {
            if (window.getComputedStyle(parentInputGroup).display === 'none') return false;
        }
        let currentElementForDomWalk = field.parentElement;
        while (currentElementForDomWalk && !currentElementForDomWalk.classList.contains('form-step')) {
            if (window.getComputedStyle(currentElementForDomWalk).display === 'none') return false;
            currentElementForDomWalk = currentElementForDomWalk.parentElement;
        }
        return true;
    }

    function validateCurrentStep() {
        if (currentStep < 0 || currentStep >= steps.length) return true;
        const currentFieldsInStep = steps[currentStep].querySelectorAll('input:not([type="button"]):not([type="submit"]), select, textarea');
        let allValid = true;
        let firstInvalidFieldToFocus = null;
        currentFieldsInStep.forEach(field => {
            if (!isFieldEffectivelyVisible(field)) {
                field.style.borderColor = ''; field.style.boxShadow = '';
                const groupElem = field.closest('.radio-group, .checkbox-group, .form-group');
                if (groupElem && groupElem.style.getPropertyValue('border').includes('var(--danger-color)')) {
                    groupElem.style.border = ''; groupElem.style.padding = '';
                }
                return;
            }
            let currentFieldIsValid = true;
            const groupElement = field.closest('.radio-group') || field.closest('.checkbox-group') || field.closest('.form-group');
            if ((field.type === 'radio' || field.type === 'checkbox') && field.required) {
                if (field.type === 'radio') {
                    const name = field.name;
                    if (!document.querySelector(`input[name="${name}"]:checked`)) currentFieldIsValid = false;
                } else {
                    if (!field.checked) currentFieldIsValid = false;
                }
            } else {
                currentFieldIsValid = field.checkValidity();
            }
            if (!currentFieldIsValid) {
                allValid = false;
                if (!firstInvalidFieldToFocus) firstInvalidFieldToFocus = field;
                if (groupElement && (field.type === 'radio' || field.type === 'checkbox') && field.required) { 
                    groupElement.style.setProperty('border', '1px solid var(--danger-color)', 'important');
                    groupElement.style.padding = '5px'; groupElement.style.borderRadius = '4px';
                } else if (field.type !== 'radio' && field.type !== 'checkbox') { 
                    field.style.borderColor = 'var(--danger-color)';
                    field.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.25)';
                }
            } else {
                if (groupElement && (field.type === 'radio' || field.type === 'checkbox') && field.required) {
                    let groupNowValid = false;
                    if(field.type === 'radio' && document.querySelector(`input[name="${field.name}"]:checked`)) groupNowValid = true;
                    if(field.type === 'checkbox' && field.checked) groupNowValid = true;
                    if(groupNowValid){ groupElement.style.border = ''; groupElement.style.padding = ''; }
                } else if (field.type !== 'radio' && field.type !== 'checkbox') {
                    field.style.borderColor = '';
                    if (document.activeElement === field) field.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                    else field.style.boxShadow = '';
                }
            }
        });
        if (!allValid && firstInvalidFieldToFocus) {
            firstInvalidFieldToFocus.focus({ preventScroll: true });
            firstInvalidFieldToFocus.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }
        return allValid;
    }

    window.nextStep = function() {
        if (!validateCurrentStep()) {
             alert('Vul alstublieft alle verplichte velden (*) correct in en zorg dat de waarden het juiste formaat hebben.');
            return;
        }
        if (currentStep < steps.length - 1) {
            currentStep++;
            showStep(currentStep);
        }
    }

    window.prevStep = function() {
        if (currentStep > 0) {
            const currentStepErrorFields = steps[currentStep].querySelectorAll('[style*="border-color: var(--danger-color)"], [style*="box-shadow: rgb(220, 38, 38)"]');
            currentStepErrorFields.forEach(field => {
                field.style.borderColor = '';
                if (document.activeElement === field) field.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                else field.style.boxShadow = '';
            });
            const currentStepErrorGroups = steps[currentStep].querySelectorAll('.form-group[style*="border: 1px solid var(--danger-color)"], .radio-group[style*="border: 1px solid var(--danger-color)"], .checkbox-group[style*="border: 1px solid var(--danger-color)"]');
            currentStepErrorGroups.forEach(group => { group.style.border = ''; group.style.padding = ''; });
            currentStep--;
            showStep(currentStep);
        }
    }

    window.showLinkedText = function(elementId) {
        const element = document.getElementById(elementId);
        if(element) { element.classList.add('visible'); element.required = true; element.disabled = false; }
    }
    window.hideLinkedText = function(elementId) {
         const element = document.getElementById(elementId);
        if(element) { element.classList.remove('visible'); element.value = ''; element.required = false; element.disabled = true; }
    }
    
    window.toggleConditional = function(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
            const childInputs = element.querySelectorAll('input:not([type="button"]), select, textarea, button');
            childInputs.forEach(input => {
                let isMarkedAsRequired = false;
                const label = input.closest('.form-group')?.querySelector(`label[for="${input.id}"]`);
                if (label && label.querySelector('.asterisk')) isMarkedAsRequired = true;
                if (input.type === 'radio') {
                    const groupLabel = input.closest('.form-group')?.querySelector('label:not(.radio-label):not(.checkbox-label)');
                    if (groupLabel && groupLabel.querySelector('.asterisk')) isMarkedAsRequired = true;
                }
                if (input.name && input.name.includes('_avb') && input.closest('.aannemer-section')) {
                     const aannemerSec = input.closest('.aannemer-section');
                     const aannemerContainer = document.getElementById('aannemerDetailsContainer');
                     if(aannemerSec && aannemerContainer && aannemerContainer.style.display === 'block') isMarkedAsRequired = true; 
                }
                if (!show) {
                    if (input.type === 'radio' || input.type === 'checkbox') input.checked = false;
                    else if (input.tagName === 'SELECT') {
                        input.selectedIndex = 0;
                        if (input.getAttribute('onchange') && input.getAttribute('onchange').includes('toonAndersVeld')) {
                            const targetIdMatch = input.getAttribute('onchange').match(/toonAndersVeld\s*\(\s*this\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/);
                            if (targetIdMatch && targetIdMatch[1] && targetIdMatch[2]) {
                                const andersInputVeld = document.getElementById(targetIdMatch[1]);
                                const andersMessageVeld = document.getElementById(targetIdMatch[2]);
                                if (andersInputVeld) {
                                    andersInputVeld.style.display = 'none';
                                    const inputFieldInside = andersInputVeld.querySelector('input');
                                    if (inputFieldInside) { inputFieldInside.value = ''; inputFieldInside.disabled = true; inputFieldInside.required = false; }
                                }
                                if (andersMessageVeld) andersMessageVeld.style.display = 'none';
                            }
                        }
                    } else if (input.tagName.toLowerCase() !== 'button') input.value = '';
                    input.required = false; input.disabled = true;
                    const onclickAttr = input.getAttribute('onclick');
                    if (onclickAttr) {
                        if (onclickAttr.includes('toggleConditional')) {
                            const match = onclickAttr.match(/toggleConditional\s*\(\s*['"]([^'"]+)['"]/);
                            if (match && match[1]) toggleConditional(match[1], false);
                        }
                        if (onclickAttr.includes('showLinkedText')) {
                             const match = onclickAttr.match(/showLinkedText\s*\(\s*['"]([^'"]+)['"]/);
                             if(match && match[1]) hideLinkedText(match[1]);
                        }
                        if (input.id === 'ookOpPalen_nee' && onclickAttr.includes("showLinkedText('andereFunderingswijze')")) hideLinkedText('andereFunderingswijze'); 
                    }
                } else {
                    input.disabled = false;
                    if (isMarkedAsRequired) input.required = true;
                    if ((input.type === 'radio' || input.type === 'checkbox') && input.checked && input.getAttribute('onclick')) {
                        const onclickAttr = input.getAttribute('onclick');
                         if (onclickAttr.includes('toggleConditional')) {
                            const match = onclickAttr.match(/toggleConditional\s*\(\s*['"]([^'"]+)['"]\s*,\s*(true|false)\s*\)/);
                            if (match && match[1] && match[2]) { if(match[1] !== elementId) toggleConditional(match[1], match[2] === 'true'); }
                        }
                        if (onclickAttr.includes('showLinkedText')) {
                            const match = onclickAttr.match(/showLinkedText\s*\(\s*['"]([^'"]+)['"]/);
                            if(match && match[1]) showLinkedText(match[1]);
                        }
                    }
                }
            });
        }
    }
    
    function setupRedenLateStartToggle() {
        const ingangsdatumInput = document.getElementById('ingangsdatumVerzekering');
        const gekozenDatumwerkzaamhedenInput = document.getElementById('startWerkzaamheden');
        const redenContainer = document.getElementById('redenLateStartContainer');
        const redenTextarea = document.getElementById('redenLateStart');
        if (!ingangsdatumInput || !gekozenDatumwerkzaamhedenInput || !redenContainer || !redenTextarea) { console.warn("Een of meer elementen voor 'Reden Late Start' zijn niet gevonden."); return; }
        function toggleRedenLateStartVisibility() {
            const gekozenDatumString = ingangsdatumInput.value;
            const gekozenDatumwerkzaamhedenString = gekozenDatumwerkzaamhedenInput.value;
            if (!gekozenDatumString || !gekozenDatumwerkzaamhedenString) { redenContainer.style.display = 'none'; redenTextarea.required = false; redenTextarea.disabled = true; return; }
            const gekozenDatum = new Date(gekozenDatumString); const datumWerkzaamheden = new Date(gekozenDatumwerkzaamhedenString);
            gekozenDatum.setHours(0,0,0,0); datumWerkzaamheden.setHours(0,0,0,0);
            if (datumWerkzaamheden < gekozenDatum) { redenContainer.style.display = 'block'; redenTextarea.required = true; redenTextarea.disabled = false; }
            else { redenContainer.style.display = 'none'; redenTextarea.required = false; redenTextarea.disabled = true; redenTextarea.value = ''; }
        }
        ingangsdatumInput.addEventListener('change', toggleRedenLateStartVisibility);
        ingangsdatumInput.addEventListener('input', toggleRedenLateStartVisibility);
        gekozenDatumwerkzaamhedenInput.addEventListener('change', toggleRedenLateStartVisibility);
        gekozenDatumwerkzaamhedenInput.addEventListener('input', toggleRedenLateStartVisibility);
        toggleRedenLateStartVisibility();
    }
    
    const FORM_STORAGE_KEY = 'carOfferteFormData';
    function saveFormData() {
        if (!formElement) return;
        const formData = new FormData(formElement); const data = {}; let maxUboIndex = 0; let maxAannemerIndex = 0;
        formData.forEach((value, key) => {
            if (key.endsWith('[]')) { const realKey = key.slice(0, -2); if (!data[realKey]) data[realKey] = []; data[realKey].push(value); }
            else data[key] = value;
            if (key.startsWith('ubo') && key.includes('_voornamen')) { const match = key.match(/^ubo(\d+)_/); if (match && parseInt(match[1]) > maxUboIndex) maxUboIndex = parseInt(match[1]); }
            if (key.startsWith('aannemer') && key.includes('_naam')) { const match = key.match(/^aannemer(\d+)_/); if (match && parseInt(match[1]) > maxAannemerIndex) maxAannemerIndex = parseInt(match[1]); }
        });
        data._maxUboIndex = maxUboIndex > 0 ? maxUboIndex : (document.querySelectorAll('#ubo-forms-container .ubo-section').length);
        data._maxAannemerIndex = maxAannemerIndex > 0 ? maxAannemerIndex : (document.querySelectorAll('#aannemer-forms-container .aannemer-section').length);
        data._currentStep = currentStep; 
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data)); console.log('Form data saved.', data);
    }

    window.handleSaveButtonClick = function(buttonElement) {
        saveFormData(); 
        const originalText = buttonElement.textContent; buttonElement.disabled = true; buttonElement.textContent = 'Opgeslagen!'; buttonElement.style.backgroundColor = '#28a745';
        alert('Uw voortgang is opgeslagen in uw browser. U kunt dit venster sluiten en later op hetzelfde apparaat terugkeren om verder te gaan.');
        setTimeout(() => { buttonElement.textContent = originalText; buttonElement.disabled = false; buttonElement.style.backgroundColor = ''; }, 3000);
    }

    function loadFormData() {
        const savedData = localStorage.getItem(FORM_STORAGE_KEY); if (!savedData || !formElement) return;
        const data = JSON.parse(savedData); console.log('Loading form data:', data);
        if (data._currentStep !== undefined) currentStep = parseInt(data._currentStep, 10) || 0;
        if (data.aanvragerType) {
            const typeRadio = document.getElementById(`aanvragerType${data.aanvragerType.charAt(0).toUpperCase() + data.aanvragerType.slice(1)}`);
            if (typeRadio) { typeRadio.checked = true; /* toggleAanvragerType will be called by reapplyInitialConditionals */ }
        }
        if (data.rechtsvorm && document.getElementById('aanvragerTypeZakelijk')?.checked) { // Only if zakelijk was chosen
            const rechtsvormSelect = document.getElementById('rechtsvorm');
            if (rechtsvormSelect) { rechtsvormSelect.value = data.rechtsvorm; /* checkRechtsvormForUbo will be called by reapplyInitialConditionals */ }
        }
        // DOM modifications (UBO/Aannemer) need to happen BEFORE populating their fields
        if (data._maxUboIndex > 0) { // Check if UBOs were present
            // The initial UBO section (1) is already in HTML.
            // Add UBOs from index 2 up to _maxUboIndex
            for (let i = 1; i < data._maxUboIndex; i++) { // Start from 1 because UBO 2 is the first to add
                UBOtoevoegen(); 
            }
        }
        if (data._maxAannemerIndex > 0) { // Check if Aannemers were present
            // Initial Aannemer (1) is in HTML. Add from 2 up to _maxAannemerIndex
            for (let i = 1; i < data._maxAannemerIndex; i++) {
                AannemerToevoegen(); 
            }
        }

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (key === '_maxUboIndex' || key === '_maxAannemerIndex' || key === '_currentStep' || key === 'aanvragerType' || key === 'rechtsvorm') continue;
                const elements = formElement.elements[key];
                if (elements) {
                    if (elements.type === 'radio' || (elements.length && elements[0] && elements[0].type === 'radio')) { 
                         const radioToSelect = Array.from(elements.length ? elements : [elements]).find(rb => rb.value === data[key]);
                        if (radioToSelect) radioToSelect.checked = true;
                    } else if (elements.type === 'checkbox') {
                        elements.checked = (data[key] === 'on' || data[key] === true || data[key] === elements.value);
                    } else if (elements.length && elements[0] && elements[0].type === 'checkbox' && key.endsWith('[]')) { 
                         const savedArray = data[key.slice(0,-2)] || data[key];
                         if (Array.isArray(savedArray)) {
                            Array.from(elements).forEach(checkbox => { if (savedArray.includes(checkbox.value)) checkbox.checked = true; });
                         }
                    }
                    else elements.value = data[key];
                } else {
                    const checkboxGroup = formElement.querySelectorAll(`input[name="${key}[]"]`);
                    if (checkboxGroup.length > 0 && Array.isArray(data[key])) {
                        checkboxGroup.forEach(checkbox => { if (data[key].includes(checkbox.value)) checkbox.checked = true; });
                    }
                }
            }
        }
        // Re-apply conditionals AFTER all data is loaded and UBOs/Aannemers potentially added
        reapplyInitialConditionals(); 
        // showStep will be called at the end of DOMContentLoaded initial setup
    }

    function clearSavedFormData() { localStorage.removeItem(FORM_STORAGE_KEY); console.log('Saved form data cleared.'); }
    
    window.toonAndersVeld = function(selectElement, targetInputElementId, targetMessageElementId) {
        var selectedValue = selectElement.value;
        var targetInputElement = document.getElementById(targetInputElementId);
        var targetMessageElement = document.getElementById(targetMessageElementId); 
        if (targetInputElement && targetMessageElement) { 
            const inputInside = targetInputElement.querySelector('input[type="number"], input[type="text"]');
            if (selectedValue && selectedValue.toLowerCase() === 'anders') {
                targetInputElement.style.display = 'flex'; targetMessageElement.style.display = 'block'; 
                if (inputInside) { inputInside.disabled = false; inputInside.required = true; }
            } else {
                targetInputElement.style.display = 'none'; targetMessageElement.style.display = 'none'; 
                if (inputInside) { inputInside.value = ''; inputInside.disabled = true; inputInside.required = false; }
            }
        }
    }
    
    function reapplyInitialConditionals() {
        console.log("reapplyInitialConditionals CALLED");
        const aanvragerTypeChecked = document.querySelector('input[name="aanvragerType"]:checked');
        if (aanvragerTypeChecked) toggleAanvragerType(aanvragerTypeChecked.value); 
        else toggleAanvragerType(null); // This also calls checkRechtsvormForUbo

        function setupSimpleConditional(triggerName, detailsId, subTriggerName, subDetailsId) {
            const mainControl = document.querySelector(`input[name="${triggerName}"]:checked:not(:disabled)`) || document.getElementById(triggerName + '_ja');
            let showMainDetails = false;
            if (mainControl) {
                if (mainControl.type === 'radio') showMainDetails = mainControl.value === 'ja';
                else if (mainControl.type === 'checkbox') showMainDetails = mainControl.checked;
            }
            toggleConditional(detailsId, showMainDetails);
            if (subTriggerName && subDetailsId && showMainDetails) {
                const subControl = document.querySelector(`input[name="${subTriggerName}"]:checked:not(:disabled)`);
                let showSubDetails = false;
                if (subControl && subControl.value === 'ja') showSubDetails = true;
                toggleConditional(subDetailsId, showSubDetails);
            } else if (subDetailsId) toggleConditional(subDetailsId, false);
        }
        setupSimpleConditional('onderhoudstermijnOvereen', 'onderhoudstermijnOvereenDetails', 'onderhoudstermijnMeeVerzekeren', 'onderhoudstermijnDuurDetails');
        const werkAndersCheckbox = document.getElementById('werk_anders_ja');
        if(werkAndersCheckbox) toggleConditional('werkAndersSpecificatieContainer', werkAndersCheckbox.checked && !werkAndersCheckbox.disabled);
        setupSimpleConditional('bedrijfsschade_meeverzekeren', 'bedrijfsschadeDetails');
        setupSimpleConditional('sloopwerk', 'sloopwerkDetails'); 
        setupSimpleConditional('bemaling', 'bemalingDetails');
        setupSimpleConditional('gravenNabijFundering', 'gravenNabijFunderingDetails');
        setupSimpleConditional('paalfundering', 'paalfunderingDetails');
        const paalfunderingDetailsEl = document.getElementById('paalfunderingDetails');
        if (paalfunderingDetailsEl && paalfunderingDetailsEl.style.display === 'block') {
            setupSimpleConditional('bouwwerkenBinnen15m', 'bouwwerkenBinnen15mDetails');
            const bouwwerkenDetailsEl = document.getElementById('bouwwerkenBinnen15mDetails');
            if (bouwwerkenDetailsEl && bouwwerkenDetailsEl.style.display === 'block') {
                const ookOpPalenNeeRadio = document.getElementById('ookOpPalen_nee');
                const showAndereFunderingswijze = ookOpPalenNeeRadio && ookOpPalenNeeRadio.checked && !ookOpPalenNeeRadio.disabled;
                toggleConditional('andereFunderingswijzeDetails', showAndereFunderingswijze);
                if (showAndereFunderingswijze) showLinkedText('andereFunderingswijze');
                else hideLinkedText('andereFunderingswijze');
            } else { toggleConditional('andereFunderingswijzeDetails', false); hideLinkedText('andereFunderingswijze'); }
        } else { toggleConditional('bouwwerkenBinnen15mDetails', false); toggleConditional('andereFunderingswijzeDetails', false); hideLinkedText('andereFunderingswijze'); }
        setupSimpleConditional('grondkering', 'grondkeringDetails');
        setupSimpleConditional('arbeidsloon_meeverzekeren', 'arbeidsloonDetails');
        const werkDoorAannemerChecked = document.querySelector('input[name="werkDoorAannemer"]:checked:not(:disabled)');
        if(werkDoorAannemerChecked){
            const showAannemerMainContainer = werkDoorAannemerChecked.value === 'geheel' || werkDoorAannemerChecked.value === 'gedeeltelijk';
            toggleConditional('aannemerDetailsContainer', showAannemerMainContainer); 
            toggleConditional('aannemerDetailopmerking', werkDoorAannemerChecked.value === 'nee');
            document.querySelectorAll('.aannemer-section').forEach(section => {
                setRequiredForAannemerSection(section, showAannemerMainContainer);
                if (showAannemerMainContainer) {
                    const index = section.dataset.aannemerIndex;
                    const avbRadioCheckedJa = section.querySelector(`input[name="aannemer${index}_avb"][value="ja"]:checked:not(:disabled)`);
                    toggleConditional(`aannemer${index}_avbDetails`, !!avbRadioCheckedJa);
                } else { const index = section.dataset.aannemerIndex; toggleConditional(`aannemer${index}_avbDetails`, false); }
            });
        } else {
            toggleConditional('aannemerDetailsContainer', false); toggleConditional('aannemerDetailopmerking', false);
            document.querySelectorAll('.aannemer-section').forEach(section => {
                 setRequiredForAannemerSection(section, false);
                 const index = section.dataset.aannemerIndex; toggleConditional(`aannemer${index}_avbDetails`, false);
            });
        }
        setupSimpleConditional('elders_ondergebracht', 'eldersOndergebrachtDetails');
        document.querySelectorAll('.inline-text-input').forEach(textField => {
            if (textField.disabled && textField.id !== 'aardGebouwAndersText' && textField.id !== 'andereFunderingswijze') return; 
            const radioId = textField.id.replace('Text', 'Radio'); const linkedRadio = document.getElementById(radioId);
            if (linkedRadio && linkedRadio.checked && !linkedRadio.disabled) showLinkedText(textField.id);
            else { if (textField.id === 'aardGebouwAndersText' && (!linkedRadio || !linkedRadio.checked || linkedRadio.disabled) ) hideLinkedText(textField.id); }
        });
        document.querySelectorAll('select[onchange*="toonAndersVeld"]').forEach(selectElement => {
            if (selectElement.disabled) return; 
            const targetIdMatch = selectElement.getAttribute('onchange').match(/toonAndersVeld\s*\(\s*this\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/);
            if (targetIdMatch && targetIdMatch[1] && targetIdMatch[2]) toonAndersVeld(selectElement, targetIdMatch[1], targetIdMatch[2]);
        });
        const duurBouwInputJS = document.getElementById('duurBouwMaanden'); // Renamed to avoid conflict with global
        if (duurBouwInputJS && !duurBouwInputJS.disabled) { const event = new Event('input', { bubbles: true }); duurBouwInputJS.dispatchEvent(event); }
    }

    function autoFillFormForTesting() {
        function _toggleConditional(elementId, show) { if (typeof toggleConditional === "function") toggleConditional(elementId, show); }
        function _toonAndersVeld(selectElementOrId, targetInputElementId, targetMessageElementId) { if (typeof toonAndersVeld === "function") { let el = typeof selectElementOrId === 'string' ? document.getElementById(selectElementOrId) : selectElementOrId; if (el) toonAndersVeld(el, targetInputElementId, targetMessageElementId); } }
        function _showLinkedText(elementId) { if (typeof showLinkedText === "function") showLinkedText(elementId); }
        function _hideLinkedText(elementId) { if (typeof hideLinkedText === "function") hideLinkedText(elementId); }
        function _toggleAanvragerType(type) { if (typeof toggleAanvragerType === "function") toggleAanvragerType(type); }
        function _checkRechtsvormForUbo() { if (typeof checkRechtsvormForUbo === "function") checkRechtsvormForUbo(); }
        function _UBOtoevoegen() { if (typeof UBOtoevoegen === "function") UBOtoevoegen(); }
        document.getElementById('aanvragerTypeZakelijk').checked = true; _toggleAanvragerType('zakelijk'); document.getElementById('kvkNummer').value = '87654321'; document.getElementById('bedrijfsnaamZakelijk').value = 'Autofill Solutions BV'; document.getElementById('handelsnaamZakelijk').value = 'AS BV'; document.getElementById('rechtsvorm').value = 'bv'; _checkRechtsvormForUbo(); if (document.getElementById('uboSectieStap1')?.style.display === 'block') { document.getElementById('ubo1_voornamen').value = 'Udo B. Owner'; document.getElementById('ubo1_achternaam').value = 'Voorbeeld'; document.getElementById('ubo1_geboortedatum').value = '1980-01-01'; document.getElementById('ubo1_woonland').value = 'Nederland'; const ubo1Type = document.getElementById('ubo1_type_eigendom'); if (ubo1Type) ubo1Type.checked = true; document.getElementById('ubo1_adres').value = 'Ubolaan 10, 9876 UB Ubostad'; } document.getElementById('straatHuisnrZakelijk').value = 'Testlaan 100'; document.getElementById('postcodeZakelijkApart').value = '1234AB'; document.getElementById('plaatsZakelijk').value = 'Testdorp'; document.getElementById('telefoonnummerZakelijk').value = '0612345678'; document.getElementById('emailadresZakelijk').value = 'info@autofillsolutions.test'; const vandaag = new Date(); const startWerkzaamhedenDatum = new Date(vandaag); startWerkzaamhedenDatum.setDate(vandaag.getDate() - 2); document.getElementById('startWerkzaamheden').value = startWerkzaamhedenDatum.toISOString().split('T')[0]; const ingangsdatumVerzekeringDatum = new Date(vandaag); document.getElementById('ingangsdatumVerzekering').value = ingangsdatumVerzekeringDatum.toISOString().split('T')[0]; ['startWerkzaamheden', 'ingangsdatumVerzekering'].forEach(id => { const el = document.getElementById(id); if(el) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }}); const redenLateStartContainer = document.getElementById('redenLateStartContainer'); if (redenLateStartContainer && redenLateStartContainer.style.display === 'block') document.getElementById('redenLateStart').value = 'Autofill test: werkzaamheden reeds gestart.'; document.getElementById('duurBouwMaanden').value = '13'; document.getElementById('duurBouwMaanden').dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('werk_nieuwbouw_woning_ja').checked = true; document.getElementById('werk_verbouw_bedrijf_ja').checked = true; document.getElementById('werk_anders_ja').checked = true; _toggleConditional('werkAndersSpecificatieContainer', true); if(document.getElementById('werk_anders_specificatie')) document.getElementById('werk_anders_specificatie').value = "Speciale testwerkzaamheden"; document.getElementById('onderhoudstermijnOvereen_ja').checked = true; _toggleConditional('onderhoudstermijnOvereenDetails', true); document.getElementById('onderhoudstermijnMeeVerzekeren_ja').checked = true; _toggleConditional('onderhoudstermijnDuurDetails', true); document.getElementById('duurOnderhoud_12').checked = true; document.getElementById('aanneemsom').value = '1250000'; document.getElementById('btw_exclusief').checked = true; document.getElementById('inc_toezicht').checked = true; const aansprakelijkheidSelect = document.querySelector('select[name="aansprakelijkheid_som"]'); if (aansprakelijkheidSelect) aansprakelijkheidSelect.value = '2500000'; document.getElementById('bestaande_eigendommen_som').value = 'Anders'; _toonAndersVeld(document.getElementById('bestaande_eigendommen_som'), 'anders_bestaand_eigendommen_input', 'anders_bestaand_eigendommen_message'); const andersBestaandEigendom = document.querySelector('input[name="bestaande_eigendommen_som_anders_val"]'); if(andersBestaandEigendom) andersBestaandEigendom.value = "300000"; document.getElementById('Hulpmateriaal').value = '125000'; _toonAndersVeld(document.getElementById('Hulpmateriaal'), 'anders_Hulpmateriaal_input', 'anders_Hulpmateriaal_message'); document.getElementById('Eigen_risico').value = '5000'; _toonAndersVeld(document.getElementById('Eigen_risico'), 'anders_Eigen_risico_input', 'anders_Eigen_risico_message'); document.getElementById('bedrijfsschade_ja').checked = true; _toggleConditional('bedrijfsschadeDetails', true); if(document.getElementById('bedrijfsschade_belang')) document.getElementById('bedrijfsschade_belang').value = "150000"; if(document.getElementById('bedrijfsschade_uitkeringstermijn')) document.getElementById('bedrijfsschade_uitkeringstermijn').value = "26"; document.getElementById('locatieWerk').value = 'Industrieterrein Noord, Teststad'; document.getElementById('aardGebouw_steen').checked = true; _hideLinkedText('aardGebouwAndersText'); document.getElementById('sloopwerk_ja').checked = true; _toggleConditional('sloopwerkDetails', true); if(document.getElementById('sloopwerk_constructies')) document.getElementById('sloopwerk_constructies').value = "Dragende binnenmuur en deel van gevel."; const sloopadviesJa = document.querySelector('input[name="sloopadvies"][value="ja"]'); if(sloopadviesJa) sloopadviesJa.checked = true; document.getElementById('bemaling_ja').checked = true; _toggleConditional('bemalingDetails', true); const bemalingsadviesJa = document.querySelector('input[name="bemalingsadvies"][value="ja"]'); if(bemalingsadviesJa) bemalingsadviesJa.checked = true; document.getElementById('gravenNabijFundering_ja').checked = true; _toggleConditional('gravenNabijFunderingDetails', true); const uitvoeringsplanGravenJa = document.querySelector('input[name="uitvoeringsplanGraven"][value="ja"]'); if(uitvoeringsplanGravenJa) uitvoeringsplanGravenJa.checked = true; document.getElementById('kelderZwembad_ja').checked = true; document.getElementById('paalfundering_ja').checked = true; _toggleConditional('paalfunderingDetails', true); const funderingsadviesPaalJa = document.querySelector('input[name="funderingsadviesPaal"][value="ja"]'); if (funderingsadviesPaalJa) funderingsadviesPaalJa.checked = true; const paalsysteemGedrukt = document.querySelector('input[name="paalsysteem"][value="gedrukt"]'); if (paalsysteemGedrukt) paalsysteemGedrukt.checked = true; document.getElementById('bouwwerkenBinnen15m_ja').checked = true; _toggleConditional('bouwwerkenBinnen15mDetails', true); const eigenaarAnderen = document.querySelector('input[name="eigenaarBouwwerk"][value="anderen"]'); if (eigenaarAnderen) eigenaarAnderen.checked = true; document.getElementById('afstandDichtstbijzijndeBouwwerk').value = '5.5'; document.getElementById('ookOpPalen_nee').checked = true; _toggleConditional('andereFunderingswijzeDetails', true); _showLinkedText('andereFunderingswijze'); if(document.getElementById('andereFunderingswijze')) document.getElementById('andereFunderingswijze').value = "Op staal gefundeerd"; document.getElementById('grondkering_ja').checked = true; _toggleConditional('grondkeringDetails', true); const adviesGrondkeringJa = document.querySelector('input[name="adviesGrondkering"][value="ja"]'); if(adviesGrondkeringJa) adviesGrondkeringJa.checked = true; document.getElementById('funderingsherstel_ja').checked = true; document.getElementById('arbeidsloon_ja').checked = true; _toggleConditional('arbeidsloonDetails', true); if(document.getElementById('arbeidsloon_som')) document.getElementById('arbeidsloon_som').value = "50000"; document.getElementById('werkDoorAannemer_gedeeltelijk').checked = true; _toggleConditional('aannemerDetailsContainer', true); _toggleConditional('aannemerDetailopmerking', false); document.getElementById('aannemer1_naam').value = 'TopBouw Nederland'; document.getElementById('aannemer1_adres').value = 'Constructieweg 10, 7890 CD Bouwdorp'; document.getElementById('aannemer1_telefoon').value = '0501234567'; document.getElementById('aannemer1_avb_ja').checked = true; _toggleConditional('aannemer1_avbDetails', true); document.getElementById('aannemer1_avb_maatschappij').value = 'GarantVerzekeringen'; document.getElementById('aannemer1_avb_polisnr').value = 'GV-AVB-998877'; document.getElementById('aannemer1_avb_bedrag').value = '2500000'; document.getElementById('aannemer1_avb_eigenrisico').value = '1000'; document.getElementById('overige_opmerkingen_beoordeling').value = 'Autofill test - complexe situatie.'; document.getElementById('elders_ondergebracht_ja').checked = true; _toggleConditional('eldersOndergebrachtDetails', true); if(document.getElementById('vorige_maatschappij')) document.getElementById('vorige_maatschappij').value = "Oude Polis NV"; if(document.getElementById('vorige_polisnummer')) document.getElementById('vorige_polisnummer').value = "OP-12345"; if(document.getElementById('vorige_afloopdatum')) { const afloopDatum = new Date(); afloopDatum.setDate(afloopDatum.getDate() - 30); document.getElementById('vorige_afloopdatum').value = afloopDatum.toISOString().split('T')[0]; }
        if (typeof saveFormData === "function") saveFormData();
        if (typeof reapplyInitialConditionals === "function") reapplyInitialConditionals();
        if (typeof showStep === "function" && typeof currentStep !== "undefined") showStep(currentStep);
        console.log("Formulier automatisch ingevuld voor testen (Zakelijk met UBO).");
        alert("Formulier is automatisch ingevuld (Zakelijk met UBO) en opgeslagen in localStorage. Ververs de pagina om te zien of de data geladen wordt, of ga naar de volgende stap en terug om de conditionals te zien.");
    }

    // --- Belangrijk: Initialisatie aan het einde van DOMContentLoaded ---
    if (formElement) {
        loadFormData(); // Laadt data en kan currentStep en DOM aanpassen

        const rechtsvormSelect = document.getElementById('rechtsvorm');
        if (rechtsvormSelect) {
            rechtsvormSelect.addEventListener('change', checkRechtsvormForUbo);
        }
        setupRedenLateStartToggle();

        // Initialize progress bar NA loadFormData en reapplyInitialConditionals (die binnen loadFormData wordt aangeroepen)
        // omdat de `steps` array dan definitief is.
        if (progressBar && steps.length > 0) {
            initializeProgressBar();
        } else {
            console.warn("Progress bar NIET geïnitialiseerd (progressBar element of stappen ontbreken).");
        }
        
        // Toon de juiste stap (kan zijn gewijzigd door loadFormData)
        showStep(currentStep); 
    } else {
        console.error("Formulier element (#carOfferteForm) niet gevonden!");
    }

    // Autofill check (na alle andere initialisaties)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autofill') === 'true') {
        setTimeout(function() {
            try { autoFillFormForTesting(); }
            catch (e) { console.error("Fout bij automatisch invullen:", e); alert("Fout bij autofill. Check console."); }
        }, 500); 
    }

}); // End DOMContentLoaded