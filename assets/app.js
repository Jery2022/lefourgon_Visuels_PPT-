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
    let html = "";

    if (location.protocol === "file:") {
      const fs = await fetch(`./${url}`).catch(() => null);
      if (!fs || !fs.ok) {
        throw new Error(`Impossible de charger ${url} en file://`);
      }
      html = await fs.text();
    } else {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load ${url}: ${res.status}`);
      }
      html = await res.text();
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    container.innerHTML = doc.body.innerHTML.trim();
    container.querySelectorAll("script").forEach((script) => script.remove());

    wireFinalPageInteractions(container);
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

function wireFinalPageInteractions(root) {
  if (!root) return;

  root.querySelectorAll(".page-fnav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.page;
      const sections = [
        root.querySelector("#page-home"),
        root.querySelector("#page-catalogue"),
        root.querySelector("#page-btob"),
      ].filter(Boolean);

      root.querySelectorAll(".page-fnav-btn").forEach((btn) => {
        btn.classList.remove("on");
        btn.setAttribute("aria-pressed", "false");
      });

      button.classList.add("on");
      button.setAttribute("aria-pressed", "true");

      sections.forEach((section) => {
        section.classList.toggle(
          "page-section--hidden",
          section.id !== `page-${target}`,
        );
      });
    });
  });

  root.querySelectorAll(".d-filter, .m-filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.parentElement;
      if (!group) return;
      group.querySelectorAll(".d-filter, .m-filter-chip").forEach((btn) => {
        btn.classList.remove("on");
        btn.setAttribute("aria-pressed", "false");
      });
      button.classList.add("on");
      button.setAttribute("aria-pressed", "true");
    });
  });

  root
    .querySelectorAll(
      ".js-btocta, .js-btob-devis, .js-btob-login, .js-btob-form, .js-add-to-cart, .m-cta-p, .m-cta-s, .d-hero-btn-p, .d-hero-btn-s, .d-prod-add, .m-prod-add, .d-devis-btn, .m-btob-cta-p, .m-btob-cta-s, .m-btob-form-btn, .d-btob-cta, .d-btob-hero-btn-p, .d-btob-hero-btn-s, .d-form-btn, .m-fiche-cta, .d-fiche-cta2, .d-fiche-wl, .page-fnav-btn",
    )
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        if (button.tagName === "BUTTON" || button.tagName === "A") {
          event.preventDefault();
        }
      });
    });
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

document.addEventListener("DOMContentLoaded", () => {
  const initialButton = document.querySelector('.nav-btn[data-page="ux"]');
  if (initialButton) {
    loadPage("ux", initialButton);
  }
});
