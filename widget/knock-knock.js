(function () {
  "use strict";

  // Prevent double-init
  if (document.querySelector(".kk-widget")) return;

  // ── Read config from script tag ───────────────────────
  var script = document.currentScript;
  var endpoint = script ? script.getAttribute("data-endpoint") : null;
  var companyId = script ? script.getAttribute("data-company") : null;

  // ── Inject CSS ──────────────────────────────────────────
  var base = script ? script.src.replace(/knock-knock\.js$/, "") : "";
  // Critical styles injected inline to prevent flash of unstyled overlay
  var inlineStyle = document.createElement("style");
  inlineStyle.textContent = ".kk-overlay{opacity:0;pointer-events:none}.kk-hand-fist{opacity:0}.kk-impact{opacity:0}";
  document.head.appendChild(inlineStyle);

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = base + "knock-knock.css";
  document.head.appendChild(link);

  // ── HTML template ───────────────────────────────────────
  var html = [
    '<div class="kk-widget">',

    // FAB – brand icon with open hand + fist states
    '  <button class="kk-fab" aria-label="Bewerbung starten">',
    '    <svg width="75" height="75" viewBox="0 0 75 75" fill="none" xmlns="http://www.w3.org/2000/svg">',
    '      <circle cx="37.5" cy="37.5" r="37.5" fill="#0B56CF"/>',
    // Open hand (default state)
    '      <path class="kk-hand-open" d="M57 46.3572C57 52.2236 52.2324 56.9911 46.3661 56.9911V54.3326C50.7969 54.3326 54.3415 50.788 54.3415 46.3572H57ZM18.0089 28.6339C18.0089 22.7676 22.7764 18 28.6428 18V20.6585C24.212 20.6585 20.6673 24.2031 20.6673 28.6339H18.0089ZM30.4151 23.8841L22.2802 32.0368C16.5733 37.7437 16.5733 47.013 22.2802 52.7198C27.987 58.4267 37.2563 58.4267 42.9632 52.7198L55.4935 40.1541C56.362 39.3211 56.362 37.9209 55.4935 37.0525C54.6251 36.184 53.2249 36.184 52.3565 37.0525L44.5228 44.8862L43.2645 43.6278L54.8555 32.0368C55.7239 31.1684 55.7239 29.7682 54.8555 28.8998C53.987 28.0314 52.5692 28.0314 51.683 28.8998L41.3858 39.2679L40.1629 37.9741L52.3388 25.7628C53.2072 24.8943 53.2072 23.4942 52.3388 22.6258C51.4703 21.7573 50.0702 21.7573 49.2018 22.6258L36.9905 34.8371L35.7321 33.5965L45.4799 23.8841C46.3661 23.0157 46.3661 21.6155 45.4799 20.7471C44.5937 19.8787 43.2113 19.8787 42.3429 20.7471L28.8378 34.2522C31 37.0348 30.805 41.0402 28.2529 43.6101L26.9945 42.3517C29.0682 40.2781 29.0682 36.9107 26.9945 34.8371L26.3742 34.2168L33.5876 27.0034C34.456 26.135 34.456 24.7348 33.5876 23.8664C32.7014 23.0157 31.3013 23.0157 30.4151 23.8841Z" fill="white"/>',
    // Fist (knocking state) — from AdobeStock AI, flipped + outlined
    '      <g class="kk-hand-fist" transform="translate(7.5,67.5) scale(0.8,-0.8)" fill="none" stroke="white" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">',
    '        <path d="M49.57 35.94C49.40 36.11 49.25 36.36 49.20 36.60C48.54 40.25 47.91 43.92 47.25 47.57C46.48 51.87 41.79 53.78 38.41 51.19C37.93 50.81 37.47 50.40 37.01 50.01C34.06 53.43 28.50 52.39 26.89 48.06C25.31 49.16 23.59 49.44 21.79 48.82C20.00 48.21 18.83 46.90 18.30 45.21C17.44 45.42 16.65 45.75 15.85 45.78C12.54 45.94 10.03 43.06 10.57 39.79C11.03 37.03 11.52 34.28 12.02 31.52C12.24 30.27 12.33 28.98 13.06 27.87C13.14 27.74 13.07 27.51 13.05 27.33C12.92 26.37 12.70 25.43 12.66 24.48C12.44 19.50 14.17 15.25 17.64 11.70C17.94 11.39 18.06 11.09 18.06 10.67C18.05 6.95 18.05 7.32 18.06 5.13C18.06 4.51 18.55 4.01 19.17 4.01C19.79 4.01 20.28 4.52 20.28 5.13C20.28 8.11 20.28 7.24 20.29 11.29C20.29 11.93 20.12 12.44 19.63 12.88C19.11 13.36 18.61 13.89 18.17 14.44C15.41 17.82 14.43 21.68 15.04 26.01C17.96 24.97 20.29 25.65 21.95 28.30C24.70 26.11 28.47 26.68 30.42 29.80C30.70 29.56 30.97 29.32 31.23 29.09C30.95 28.79 30.70 28.54 30.46 28.27C29.64 27.37 28.73 26.53 28.03 25.55C27.12 24.27 27.24 22.89 28.28 21.72C28.82 21.11 29.49 20.61 30.15 20.11C30.41 19.90 30.50 19.77 30.39 19.43C30.08 18.41 29.89 17.38 29.82 16.34C29.78 15.70 30.29 15.15 30.94 15.15L30.94 15.15C31.52 15.15 32.01 15.61 32.05 16.20C32.11 17.03 32.26 17.87 32.50 18.72C32.57 18.96 32.58 19.21 32.97 19.22C34.72 19.24 36.32 19.78 37.85 20.59C40.29 21.88 42.45 23.57 44.64 25.22C44.83 25.37 44.96 25.64 45.02 25.88C45.13 26.37 44.94 26.78 44.50 27.03C44.05 27.30 43.62 27.22 43.19 26.91C41.63 25.78 40.09 24.59 38.47 23.55C37.36 22.84 36.15 22.22 34.91 21.77C32.94 21.06 31.24 21.60 30.03 23.07C29.59 23.61 29.56 23.92 29.96 24.48C30.23 24.85 30.52 25.20 30.83 25.51C34.09 28.77 37.35 32.02 40.61 35.27C42.53 37.18 45.16 37.18 47.08 35.27C48.29 34.06 49.50 32.85 50.70 31.63C51.77 30.56 52.88 29.51 53.91 28.38C55.38 26.75 55.37 24.18 53.88 22.68C50.92 19.69 47.94 16.72 44.93 13.78C44.47 13.32 44.29 12.87 44.29 12.24C44.30 7.89 44.29 8.39 44.29 5.15C44.29 4.54 44.77 4.03 45.38 4.01C46.00 4.00 46.51 4.50 46.51 5.12C46.51 8.21 46.51 7.47 46.52 11.62C46.52 11.87 46.61 12.20 46.77 12.36C48.64 14.27 50.53 16.15 52.41 18.04C53.56 19.19 54.77 20.27 55.81 21.51C57.95 24.09 57.62 27.84 55.14 30.34C53.28 32.21 51.42 34.07 49.57 35.94Z"/>',
    '        <path d="M17.93 27.79C16.30 27.48 14.84 28.50 14.52 30.22C13.92 33.49 13.35 36.76 12.78 40.03C12.74 40.23 12.74 40.44 12.73 40.55C12.72 42.17 13.83 43.43 15.32 43.56C16.81 43.69 18.14 42.69 18.41 41.21C19.00 37.90 19.60 34.59 20.17 31.28C20.47 29.59 19.50 28.10 17.93 27.79Z"/>',
    '        <path d="M25.53 29.22C24.01 29.22 22.63 30.31 22.35 31.82C21.66 35.59 20.99 39.35 20.35 43.13C20.04 44.96 21.33 46.59 23.25 46.89C24.89 47.16 26.55 45.87 26.85 44.13C27.50 40.42 28.17 36.70 28.79 32.98C29.13 30.96 27.58 29.20 25.53 29.22Z"/>',
    '        <path d="M37.34 35.13C35.83 33.69 34.38 32.19 32.90 30.71C31.88 31.27 31.25 32.11 31.05 33.22C30.31 37.23 29.60 41.24 28.91 45.26C28.52 47.51 29.86 49.44 31.97 49.76C33.97 50.07 35.82 48.76 36.18 46.74C36.77 43.47 37.30 40.19 37.93 36.93C38.08 36.14 37.90 35.66 37.34 35.13Z"/>',
    '        <path d="M40.04 37.74C39.82 38.98 39.61 40.13 39.40 41.30C39.11 42.94 38.82 44.58 38.54 46.23C38.23 48.10 39.44 49.78 41.30 50.09C43.05 50.37 44.70 49.14 45.02 47.34C45.53 44.44 46.05 41.54 46.56 38.64C46.58 38.57 46.57 38.49 46.58 38.35C44.31 39.28 42.17 39.07 40.04 37.74Z"/>',
    '        <g class="kk-impact">',
    '          <path d="M43.20 59.16C43.83 59.16 44.34 59.67 44.34 60.30L44.34 69.86C44.34 70.49 43.83 71.00 43.20 71.00C42.57 71.00 42.06 70.49 42.06 69.86L42.06 60.30C42.06 59.67 42.57 59.16 43.20 59.16Z"/>',
    '          <path d="M34.68 56.37C35.12 55.92 35.85 55.92 36.29 56.37C36.74 56.81 36.74 57.54 36.29 57.99L29.54 64.74C29.09 65.19 28.37 65.19 27.92 64.74C27.47 64.30 27.47 63.57 27.92 63.12L34.68 56.37Z"/>',
    '          <path d="M50.19 56.37C50.64 55.92 51.37 55.92 51.81 56.37L58.57 63.12C59.01 63.57 59.01 64.30 58.57 64.74C58.12 65.19 57.39 65.19 56.95 64.74L50.19 57.99C49.74 57.54 49.74 56.81 50.19 56.37Z"/>',
    '        </g>',
    '      </g>',
    '    </svg>',
    '  </button>',

    // Overlay
    '  <div class="kk-overlay">',
    '    <div class="kk-card">',

    // Close
    '      <button class="kk-close" aria-label="Schliessen">',
    '        <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">',
    '          <line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/>',
    '        </svg>',
    '      </button>',

    // Form
    '      <div class="kk-form">',
    '        <div class="kk-title">Knock, knock!</div>',
    '        <div class="kk-subtitle">Klopfe jetzt direkt an die T\u00fcr deines Wunschunternehmens und werde in einen exklusiven Bewerberpool aufgenommen.</div>',

    // LinkedIn
    '        <div class="kk-section-label">Teile dein LinkedIn-Profil</div>',
    '        <div class="kk-field">',
    '          <input class="kk-input" type="url" name="linkedin" placeholder="Dein Linked-In Profil Link"/>',
    '        </div>',

    // Divider
    '        <div class="kk-divider">oder</div>',

    // Upload
    '        <div class="kk-upload-label">Lade deinen Lebenslauf hoch</div>',
    '        <button class="kk-upload-link" type="button">',
    '          <svg viewBox="0 0 14 17" xmlns="http://www.w3.org/2000/svg"><path d="M7 1v10M7 1L3 5M7 1l4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 13h12v2H1z" fill="currentColor"/></svg>',
    '          <span>Lebenslauf hochladen</span>',
    '        </button>',
    '        <input type="file" class="kk-file-input" accept=".pdf,.doc,.docx" style="position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none;"/>',
    '        <div class="kk-upload-filename"><span></span><button class="kk-upload-remove" type="button" aria-label="Datei entfernen">\u00d7</button></div>',

    // Contact
    '        <div class="kk-contact-label">Vervollst\u00e4ndige deine Kontaktm\u00f6glichkeiten</div>',
    '        <div class="kk-row">',
    '          <input class="kk-input" type="text" name="vorname" placeholder="Vorname*"/>',
    '          <input class="kk-input" type="text" name="nachname" placeholder="Nachname*"/>',
    '        </div>',
    '        <div class="kk-field">',
    '          <input class="kk-input" type="email" name="email" placeholder="E-Mail Adresse*"/>',
    '          <div class="kk-error-msg kk-email-error">Bitte gib eine g\u00fcltige E-Mail Adresse ein.</div>',
    '        </div>',
    '        <div class="kk-field">',
    '          <input class="kk-input" type="text" name="einsatzbereich" placeholder="Dein Einsatzbereich*"/>',
    '        </div>',

    // Submit
    '        <div class="kk-submit-row">',
    '          <button class="kk-submit" type="button" aria-label="Absenden">',
    '            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    '          </button>',
    '        </div>',
    '      </div>',

    // Success
    '      <div class="kk-success">',
    '        <div class="kk-success-title">Fast geschafft!</div>',
    '        <div class="kk-success-text">Deine Daten sind sicher bei uns angekommen. Bitte pr\u00fcfe dein E-Mail Postfach und best\u00e4tige deine E-Mail-Adresse \u00fcber den zugesendeten Link. So k\u00f6nnen wir sicherstellen, dass alles korrekt ist.</div>',
    '      </div>',

    // Footer
    '      <div class="kk-footer">Powered by <strong>Knock Knock HR</strong></div>',

    '    </div>',
    '  </div>',
    '</div>',
  ].join("\n");

  // ── Inject HTML ─────────────────────────────────────────
  var container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container.firstElementChild);

  // ── References ──────────────────────────────────────────
  var widget = document.querySelector(".kk-widget");
  var fab = widget.querySelector(".kk-fab");
  var overlay = widget.querySelector(".kk-overlay");
  var closeBtn = widget.querySelector(".kk-close");
  var uploadLink = widget.querySelector(".kk-upload-link");
  var fileInput = widget.querySelector(".kk-file-input");
  var fileNameEl = widget.querySelector(".kk-upload-filename");
  var fileNameSpan = fileNameEl.querySelector("span");
  var fileRemoveBtn = fileNameEl.querySelector(".kk-upload-remove");
  var submitBtn = widget.querySelector(".kk-submit");
  var formEl = widget.querySelector(".kk-form");
  var successEl = widget.querySelector(".kk-success");

  // ── Toggle dialog ───────────────────────────────────────
  function toggle() {
    overlay.classList.toggle("kk-open");
  }

  function resetForm() {
    var inputs = widget.querySelectorAll(".kk-input");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = "";
      inputs[i].classList.remove("kk-error");
    }
    fileInput.value = "";
    fileNameSpan.textContent = "";
    fileNameEl.classList.remove("kk-visible");
    uploadLink.style.display = "";
    formEl.classList.remove("kk-hidden");
    successEl.classList.remove("kk-visible");
    submitBtn.disabled = true;
    emailTouched = false;
    var errMsg = widget.querySelector(".kk-email-error");
    if (errMsg) errMsg.classList.remove("kk-visible");
  }

  var knockBusy = false;
  fab.addEventListener("click", function () {
    if (overlay.classList.contains("kk-open")) {
      overlay.classList.remove("kk-open");
      return;
    }
    if (knockBusy) return;
    knockBusy = true;
    resetForm();

    // Step 1: morph hand → fist (0.25s crossfade)
    fab.classList.add("kk-morphed");

    // Step 2: after morph completes, start knocking
    setTimeout(function () {
      fab.classList.remove("kk-knocking");
      void fab.offsetWidth;
      fab.classList.add("kk-knocking");
    }, 280);

    // Step 3: after knock animation ends, open dialog & reset icon
    setTimeout(function () {
      fab.classList.remove("kk-knocking");
      fab.classList.remove("kk-morphed");
      overlay.classList.add("kk-open");
      knockBusy = false;
    }, 800);
  });

  closeBtn.addEventListener("click", function () {
    overlay.classList.remove("kk-open");
  });

  // ── File upload ─────────────────────────────────────────
  uploadLink.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = fileInput.files[0].name;
      fileNameEl.classList.add("kk-visible");
      uploadLink.style.display = "none";
    }
  });

  fileRemoveBtn.addEventListener("click", function () {
    fileInput.value = "";
    fileNameSpan.textContent = "";
    fileNameEl.classList.remove("kk-visible");
    uploadLink.style.display = "";
  });

  // ── Email validation ────────────────────────────────────
  var emailInput = widget.querySelector('input[name="email"]');
  var emailError = widget.querySelector(".kk-email-error");
  var emailValid = false;
  var emailTouched = false;

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateEmail() {
    var val = emailInput.value.trim();
    emailValid = val === "" || isValidEmail(val);
    if (emailTouched && val !== "" && !isValidEmail(val)) {
      emailInput.classList.add("kk-error");
      emailError.classList.add("kk-visible");
    } else {
      emailInput.classList.remove("kk-error");
      emailError.classList.remove("kk-visible");
    }
  }

  emailInput.addEventListener("input", function () {
    validateEmail();
    checkRequired();
  });

  emailInput.addEventListener("blur", function () {
    emailTouched = true;
    validateEmail();
  });

  // ── Required field validation ────────────────────────────
  var requiredInputs = widget.querySelectorAll(
    'input[name="vorname"], input[name="nachname"], input[name="email"], input[name="einsatzbereich"]'
  );

  submitBtn.disabled = true;

  function checkRequired() {
    var allFilled = true;
    for (var i = 0; i < requiredInputs.length; i++) {
      if (!requiredInputs[i].value.trim()) {
        allFilled = false;
        break;
      }
    }
    submitBtn.disabled = !allFilled || !isValidEmail(emailInput.value.trim());
  }

  for (var i = 0; i < requiredInputs.length; i++) {
    requiredInputs[i].addEventListener("input", checkRequired);
  }

  // ── Submit ──────────────────────────────────────────────
  submitBtn.addEventListener("click", function () {
    if (submitBtn.disabled) return;

    var formData = new FormData();
    formData.append("first_name", widget.querySelector('input[name="vorname"]').value.trim());
    formData.append("last_name", widget.querySelector('input[name="nachname"]').value.trim());
    formData.append("email", widget.querySelector('input[name="email"]').value.trim());
    formData.append("area_of_work", widget.querySelector('input[name="einsatzbereich"]').value.trim());
    formData.append("linkedin_url", widget.querySelector('input[name="linkedin"]').value.trim());
    if (companyId) formData.append("tenant", companyId);
    if (fileInput.files.length > 0) {
      formData.append("cv", fileInput.files[0]);
    }

    if (!endpoint) {
      // No endpoint configured — just show success
      formEl.classList.add("kk-hidden");
      successEl.classList.add("kk-visible");
      return;
    }

    submitBtn.disabled = true;

    fetch(endpoint, {
      method: "POST",
      body: formData,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Server error: " + res.status);
        formEl.classList.add("kk-hidden");
        successEl.classList.add("kk-visible");
      })
      .catch(function (err) {
        console.error("Knock Knock submit error:", err);
        submitBtn.disabled = false;
        alert("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
      });
  });

  // ── Keyboard-aware repositioning (mobile) ─────────────
  if (window.visualViewport) {
    var cardEl = widget.querySelector(".kk-card");

    function adjustForKeyboard() {
      var vv = window.visualViewport;
      var keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;

      if (keyboardHeight > 50) {
        overlay.style.bottom = keyboardHeight + 8 + "px";
        cardEl.style.maxHeight = vv.height - 40 + "px";
      } else {
        overlay.style.bottom = "";
        cardEl.style.maxHeight = "";
      }
    }

    window.visualViewport.addEventListener("resize", adjustForKeyboard);
  }

  // ── Scroll focused input into view within card ────────
  var scrollCard = widget.querySelector(".kk-card");
  widget.addEventListener(
    "focus",
    function (e) {
      if (e.target.classList.contains("kk-input")) {
        setTimeout(function () {
          var inputRect = e.target.getBoundingClientRect();
          var cardRect = scrollCard.getBoundingClientRect();
          if (inputRect.bottom > cardRect.bottom - 10) {
            scrollCard.scrollTop += inputRect.bottom - cardRect.bottom + 40;
          }
        }, 350);
      }
    },
    true
  );
})();
