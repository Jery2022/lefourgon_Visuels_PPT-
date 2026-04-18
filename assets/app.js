const routes = {
  ux: "pages/ux.html",
  mockups: "pages/mockups.html",
  final: "pages/final.html",
};

async function loadPage(key, btn) {
  const url = routes[key];
  const container = document.getElementById("app-content");
  const overlay = document.getElementById("transition");
  if (!url || !container || !overlay) return;

  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.remove("active");
    b.removeAttribute("aria-current");
  });

  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-current", "page");
  }

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to load ${url}: ${res.status}`);
    }

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    container.innerHTML = doc.body.innerHTML.trim();
    container.querySelectorAll("script").forEach((script) => script.remove());
  } catch (error) {
    container.innerHTML = `
      <div class="page-shell">
        <section class="page-section">
          <div class="page-card">
            <div class="page-card__kicker">Erreur de chargement</div>
            <h2 class="page-card__title">Impossible de charger la page demandée</h2>
            <p class="page-card__text">${error.message}</p>
          </div>
        </section>
      </div>
    `;
  } finally {
    setTimeout(() => {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }, 300);
  }
}

async function togglePresentationMode() {
  const presentationButton = document.getElementById("presentation-toggle");
  const isFullscreen = Boolean(document.fullscreenElement);

  document.body.classList.toggle("presentation-mode", !isFullscreen);

  try {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch (error) {
    document.body.classList.remove("presentation-mode");
    if (presentationButton) {
      presentationButton.setAttribute("aria-pressed", "false");
    }
  }
}

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    loadPage(button.dataset.page, button);
  });
});

const presentationToggle = document.getElementById("presentation-toggle");

if (presentationToggle) {
  presentationToggle.addEventListener("click", togglePresentationMode);
}

document.addEventListener("fullscreenchange", () => {
  const presentationButton = document.getElementById("presentation-toggle");
  const isFullscreen = Boolean(document.fullscreenElement);

  document.body.classList.toggle("presentation-mode", isFullscreen);

  if (presentationButton) {
    presentationButton.setAttribute("aria-pressed", String(isFullscreen));
  }
});

loadPage("ux", document.querySelector('.nav-btn[data-page="ux"]'));
