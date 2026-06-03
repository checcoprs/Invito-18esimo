const CONFIG = {
  FORMSPREE_ENDPOINT: "https://formspree.io/f/YOUR_FORM_ID",
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby_ZKZcmjkExuNhjTxrCcYV1GXFTzBPxlDyseMq4KzkxgsOuIyzRmNmPew-RaNVA3fXEA/exec",
  USE_GOOGLE_SHEETS: true,
};

function initApp() {
  const choiceSection = document.getElementById("choiceSection");
  const blueMessage = document.getElementById("blueMessage");
  const formSection = document.getElementById("formSection");
  const successMessage = document.getElementById("successMessage");
  const pillRed = document.getElementById("pillRed");
  const pillBlue = document.getElementById("pillBlue");
  const btnRetry = document.getElementById("btnRetry");
  const rsvpForm = document.getElementById("rsvpForm");
  const hasIntolleranze = document.getElementById("hasIntolleranze");
  const intolleranzeField = document.getElementById("intolleranzeField");
  const btnSubmit = document.getElementById("btnSubmit");

  if (!choiceSection || !formSection || !successMessage || !pillRed || !pillBlue || !rsvpForm || !btnSubmit) {
    console.warn("Elemento richiesto non trovato. Assicurati che il DOM sia caricato correttamente.");
    return;
  }

  function showChoice() {
    choiceSection.classList.remove("hidden");
    blueMessage.classList.add("hidden");
    formSection.classList.add("hidden");
    successMessage.classList.add("hidden");
  }

  function showBlueMessage() {
    choiceSection.classList.add("hidden");
    blueMessage.classList.remove("hidden");
    formSection.classList.add("hidden");
  }

  function showForm() {
    choiceSection.classList.add("hidden");
    blueMessage.classList.add("hidden");
    formSection.classList.remove("hidden");
    successMessage.classList.add("hidden");
    document.getElementById("nome").focus();
  }

  function showSuccess() {
    choiceSection.classList.add("hidden");
    formSection.classList.add("hidden");
    successMessage.classList.remove("hidden");
  }

  pillRed.addEventListener("click", showForm);
  pillBlue.addEventListener("click", showBlueMessage);
  btnRetry.addEventListener("click", showChoice);

  hasIntolleranze.addEventListener("change", () => {
    if (hasIntolleranze.checked) {
      intolleranzeField.classList.remove("hidden");
    } else {
      intolleranzeField.classList.add("hidden");
      document.getElementById("intolleranze").value = "";
    }
  });

  function validateForm() {
    const nome = document.getElementById("nome");
    const cognome = document.getElementById("cognome");
    const intolleranze = document.getElementById("intolleranze");
    let valid = true;

    [nome, cognome].forEach((field) => {
      if (!field.value.trim()) {
        field.classList.add("invalid");
        valid = false;
      } else {
        field.classList.remove("invalid");
      }
    });

    if (hasIntolleranze.checked) {
      if (!intolleranze.value.trim()) {
        intolleranze.classList.add("invalid");
        valid = false;
      } else {
        intolleranze.classList.remove("invalid");
      }
    }

    return valid;
  }

  document.querySelectorAll("#nome, #cognome, #intolleranze").forEach((el) => {
    el.addEventListener("input", () => el.classList.remove("invalid"));
  });

  async function submitToFormspree(data) {
    const response = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        nome: data.nome,
        cognome: data.cognome,
        intolleranze: data.intolleranze,
        _subject: `RSVP Matrix 18 — ${data.nome} ${data.cognome}`,
      }),
    });
    return response.ok;
  }

  async function submitToGoogleSheets(data) {
    const formData = new FormData();
    formData.append("nome", data.nome);
    formData.append("cognome", data.cognome);
    formData.append("intolleranze", data.intolleranze);
    formData.append("timestamp", new Date().toISOString());

    await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
    return true;
  }

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const btnText = btnSubmit.querySelector(".btn-text");
    const btnLoading = btnSubmit.querySelector(".btn-loading");

    const data = {
      nome: document.getElementById("nome").value.trim(),
      cognome: document.getElementById("cognome").value.trim(),
      intolleranze: hasIntolleranze.checked
        ? document.getElementById("intolleranze").value.trim() || "Sì (non specificato)"
        : "Nessuna",
    };

    btnSubmit.disabled = true;
    btnText.classList.add("hidden");
    btnLoading.classList.remove("hidden");

    try {
      let ok = false;

      if (CONFIG.USE_GOOGLE_SHEETS && CONFIG.GOOGLE_SCRIPT_URL) {
        ok = await submitToGoogleSheets(data);
      } else if (
        CONFIG.FORMSPREE_ENDPOINT &&
        !CONFIG.FORMSPREE_ENDPOINT.includes("YOUR_FORM_ID")
      ) {
        ok = await submitToFormspree(data);
      } else {
        console.warn(
          "Configura FORMSPREE_ENDPOINT o GOOGLE_SCRIPT_URL in script.js"
        );
        ok = true;
      }

      if (ok) {
        showSuccess();
        rsvpForm.reset();
        intolleranzeField.classList.add("hidden");
      } else {
        alert("Errore di trasmissione. Riprova tra qualche secondo.");
      }
    } catch (err) {
      console.error(err);
      alert("Connessione al mainframe fallita. Controlla la rete e riprova.");
    } finally {
      btnSubmit.disabled = false;
      btnText.classList.remove("hidden");
      btnLoading.classList.add("hidden");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

