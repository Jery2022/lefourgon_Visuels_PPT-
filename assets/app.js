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

  const res = await fetch(url);
  const html = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  container.innerHTML = doc.body.innerHTML.trim();
  container.querySelectorAll("script").forEach((script) => script.remove());

  setTimeout(() => {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }, 300);
}

async function togglePresentationMode() {
  const presentationButton = document.getElementById("presentation-toggle");
  const isFullscreen = Boolean(document.fullscreenElement);

  document.body.classList.toggle("presentation-mode", !isFullscreen);

  if (!isFullscreen) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
}

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    loadPage(button.dataset.page, button);
  });
});

document
  .getElementById("presentation-toggle")
  .addEventListener("click", togglePresentationMode);

document.addEventListener("fullscreenchange", () => {
  const presentationButton = document.getElementById("presentation-toggle");
  const isFullscreen = Boolean(document.fullscreenElement);

  document.body.classList.toggle("presentation-mode", isFullscreen);
  presentationButton.setAttribute("aria-pressed", String(isFullscreen));
});

loadPage("ux", document.querySelector('.nav-btn[data-page="ux"]'));
