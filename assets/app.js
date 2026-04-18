const pages = {
  ux: "pages/ux.html",
  mockups: "pages/mockups.html",
  final: "pages/final.html",
};

const pageHost = document.getElementById("page-host");
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const transition = document.getElementById("transition");
const presentationToggle = document.getElementById("presentation-toggle");

async function loadPage(pageKey) {
  if (!pageHost || !pages[pageKey]) return;

  transition?.classList.add("on");
  transition?.setAttribute("aria-hidden", "false");

  try {
    const response = await fetch(pages[pageKey], { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    pageHost.innerHTML = doc.body ? doc.body.innerHTML : html;
    pageHost.scrollTop = 0;
  } catch (error) {
    pageHost.innerHTML =
      '<section class="page-error"><h2>Impossible de charger la page</h2><p>Vérifiez que les maquettes sont disponibles dans le dossier <code>pages/</code>.</p></section>';
    console.error("Erreur de chargement de page:", error);
  } finally {
    transition?.classList.remove("on");
    transition?.setAttribute("aria-hidden", "true");
  }
}

function setActiveButton(pageKey) {
  navButtons.forEach((button) => {
    const isActive = button.dataset.page === pageKey;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const pageKey = button.dataset.page;
    setActiveButton(pageKey);
    loadPage(pageKey);
  });
});

presentationToggle?.addEventListener("click", () => {
  const isPressed = presentationToggle.getAttribute("aria-pressed") === "true";
  presentationToggle.setAttribute("aria-pressed", String(!isPressed));
  document.body.classList.toggle("presentation-mode", !isPressed);
  presentationToggle.textContent = !isPressed
    ? "Quitter le mode présentation"
    : "Mode présentation plein écran";
});

const initialPage =
  document.querySelector(".nav-btn.active")?.dataset.page || "ux";
setActiveButton(initialPage);
loadPage(initialPage);
