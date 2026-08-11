/* ============================================================
   UNIVERSAL FLOATING ACTION MENU (nav-fab.js)
   Dynamically injects universal navigation FAB across all pages
   ============================================================ */

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // Avoid duplicate injection
    if (document.getElementById("universalFabContainer")) return;

    // Create container
    const fabContainer = document.createElement("div");
    fabContainer.id = "universalFabContainer";
    fabContainer.className = "dash-fab-container";

    fabContainer.innerHTML = `
      <button type="button" id="universalFabMainBtn" class="dash-fab-main" title="Navigate Pages">
        <i class="fa-solid fa-layer-group"></i>
      </button>
      <button type="button" id="demoPlayFabBtn" class="demo-play-fab" title="Play Demo Animation">
        <span class="demo-play-fab-label">Play Demo</span>
        <i class="fa-solid fa-play"></i>
      </button>
      <div class="dash-fab-menu" id="universalFabMenu">
        <a href="index.html" class="dash-fab-item">
          <i class="fa-solid fa-house"></i>
          <span>Customer Portal</span>
        </a>
        <a href="retailer.html" class="dash-fab-item">
          <i class="fa-solid fa-chart-line"></i>
          <span>Full Retailer Dashboard</span>
        </a>
        <a href="retailer-basic.html" class="dash-fab-item">
          <i class="fa-solid fa-store"></i>
          <span>Basic Retailer Dashboard</span>
        </a>
      </div>
    `;

    document.body.appendChild(fabContainer);

    // Toggle menu visibility
    const mainBtn = document.getElementById("universalFabMainBtn");
    const menu = document.getElementById("universalFabMenu");

    if (mainBtn && menu) {
      mainBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (!fabContainer.contains(e.target)) {
          menu.classList.remove("active");
        }
      });
    }

    // Play Demo FAB — triggers animation when popup is ready
    const playBtn = document.getElementById("demoPlayFabBtn");
    if (playBtn) {
      // Poll until window._presentationReady is set by main.js
      const readyCheck = setInterval(() => {
        if (window._presentationReady) {
          clearInterval(readyCheck);
          playBtn.classList.add("pulse-ready");
        }
      }, 300);

      playBtn.addEventListener("click", () => {
        if (!window._presentationReady) return;
        playBtn.classList.remove("pulse-ready");
        if (typeof window.startAutomatedPresentation === "function") {
          window.startAutomatedPresentation();
        }
      });
    }
  });
})();
