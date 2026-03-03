(function () {
  "use strict";

  // Prevent double-init
  if (document.querySelector(".kk-widget")) return;

  // ── Read config from script tag ───────────────────────
  var script = document.currentScript;
  var endpoint = script ? script.getAttribute("data-endpoint") : null;
  var companyId = script ? script.getAttribute("data-company") : null;

  // ── Inject CSS ──────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = "/*__KK_CSS__*/";
  document.head.appendChild(style);

  // ── HTML template ───────────────────────────────────────
  var html = [
    '<div class="kk-widget">',

    // FAB – brand icon with "please knock" (default) + "knock knock" (knocking) states
    '  <button class="kk-fab" aria-label="Bewerbung starten">',
    '    <!--__KK_SVG_DEFAULT__-->',
    '    <!--__KK_SVG_KNOCK__-->',
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
    '        <div class="kk-subtitle">Klopfe digital an unsere T\u00fcr und bewirb dich initiativ bei uns.</div>',

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
    '        <div class="kk-contact-label">Vervollst\u00e4ndige deine Kontaktdaten</div>',
    '        <div class="kk-row">',
    '          <input class="kk-input" type="text" name="vorname" placeholder="Vorname*"/>',
    '          <input class="kk-input" type="text" name="nachname" placeholder="Nachname*"/>',
    '        </div>',
    '        <div class="kk-field">',
    '          <input class="kk-input" type="email" name="email" placeholder="E-Mail Adresse*"/>',
    '          <div class="kk-error-msg kk-email-error">Bitte gib eine g\u00fcltige E-Mail Adresse ein.</div>',
    '        </div>',
    '        <div class="kk-field">',
    '          <input class="kk-input" type="text" name="einsatzbereich" placeholder="Dein T\u00e4tigkeitsbereich*"/>',
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
    '        <div class="kk-success-text">Deine Daten sind sicher bei uns angekommen. Bitte pr\u00fcfe dein E-Mail Postfach und <strong class="kk-highlight">best\u00e4tige deine E-Mail-Adresse</strong> \u00fcber den zugesendeten Link. So k\u00f6nnen wir sicherstellen, dass alles korrekt ist.</div>',
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
  var emailValid;
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
